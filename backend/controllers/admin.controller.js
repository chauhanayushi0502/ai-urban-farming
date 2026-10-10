import { Cart, Category, ContactMessage, Order, Product, Setting, User } from "../models/index.js";
import { randomBytes } from "node:crypto";
import { asyncHandler } from "../middleware/async-handler.js";
import { settingsDefaults } from "../config/app-config.js";
import { productImagePath, formatCatalogImage } from "../middleware/uploads.js";
import { createNotification } from "../services/notification.service.js";

export const getSummary = asyncHandler(async (_req, res) => {
  const [users, products, orders, categories, revenue] = await Promise.all([
    User.countDocuments(), Product.countDocuments(), Order.countDocuments(), Category.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
  ]);
  res.json({ users, products, orders, categories, revenue: revenue[0]?.total || 0 });
});

export const listOrders = asyncHandler(async (_req, res) => {
  res.json(await Order.find().populate("user", "fullName email").sort({ createdAt: -1 }).lean());
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const nextStatus = String(req.body.status || "");
  const transitions = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (nextStatus === order.status) return res.json(order);
  if (!transitions[order.status]?.includes(nextStatus)) return res.status(409).json({ message: `Order cannot move from ${order.status} to ${nextStatus}.` });

  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, note: `Order ${nextStatus} by nursery staff` });
  if (nextStatus === "shipped" && !order.trackingNumber) order.trackingNumber = `GL-${randomBytes(4).toString("hex").toUpperCase()}`;
  if (nextStatus === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
  await order.save();

  if (nextStatus === "cancelled") {
    await Promise.all(order.items.map((item) => item.product && Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })));
  }
  await createNotification({
    user: order.user,
    type: "order",
    title: `Order ${nextStatus}`,
    message: `Your order ${order._id.toString().slice(-7).toUpperCase()} is now ${nextStatus}${order.trackingNumber ? `. Tracking: ${order.trackingNumber}` : ""}.`,
    link: "/orders",
  });
  res.json(order);
});

const BOTANICAL_DICTIONARY = {
  "indoor plants": { gu: "ઇન્ડોર છોડ", hi: "इनडोर पौधे", en: "Indoor Plants" },
  "indoor plant": { gu: "ઇન્ડોર છોડ", hi: "इनडोर पौधे", en: "Indoor Plants" },
  "outdoor plants": { gu: "આઉટડોર છોડ", hi: "आउटडोर पौधे", en: "Outdoor Plants" },
  "outdoor plant": { gu: "આઉટડોર છોડ", hi: "आउटडोर पौधे", en: "Outdoor Plants" },
  "flowering plants": { gu: "ફૂલોના છોડ", hi: "फूलों वाले पौधे", en: "Flowering Plants" },
  "flowering plant": { gu: "ફૂલોના છોડ", hi: "फूलों वाले पौधे", en: "Flowering Plants" },
  "plant care": { gu: "છોડની સંભાળ અને રક્ષણ", hi: "पौधों की देखभाल और सुरक्षा", en: "Plant Care & Protection" },
  "pots & planters": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "pots & planter": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "seeds & tools": { gu: "બીજ અને ઓજારો", hi: "बीज और उपकरण", en: "Seeds & Tools" },
  "seeds & tool": { gu: "બીજ અને ઓજારો", hi: "बीज और उपकरण", en: "Seeds & Tools" },
  "money plant": { gu: "મની પ્લાન્ટ", hi: "मनी प्लांट", en: "Money Plant" },
  "snake plant": { gu: "સ્નેક પ્લાન્ટ", hi: "स्नेक प्लांट", en: "Snake Plant" },
  "peace lily": { gu: "પીસ લીલી", hi: "पीस लिली", en: "Peace Lily" },
  "zz plant": { gu: "ZZ પ્લાન્ટ", hi: "ZZ प्लांट", en: "ZZ Plant" },
  "areca palm": { gu: "એરેકા પામ", hi: "एरेका पाम", en: "Areca Palm" },
  "tulsi": { gu: "તુલસીનો છોડ", hi: "तुलसी का पौधा", en: "Tulsi (Holy Basil)" },
  "rose": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "aloe": { gu: "એલોવેરા (કુંવારપાઠું)", hi: "एलोवेरा", en: "Aloe Vera" },
  "mint": { gu: "ફુદીનો", hi: "पुदीना", en: "Mint Plant" },
  "pudina": { gu: "ફુદીનો", hi: "पुदीना", en: "Mint Plant" },
  "jasmine": { gu: "ચમેલી / મોગરો", hi: "चमेली / मोगरा", en: "Jasmine Plant" },
  "mogra": { gu: "મોગરો", hi: "मोगरा", en: "Mogra Plant" },
  "hibiscus": { gu: "જાસૂદ (ગુડહલ)", hi: "गुड़हल", en: "Hibiscus" },
  "marigold": { gu: "ગલગોટો (હજારી ગલ)", hi: "गेंदा", en: "Marigold" },
  "bougainvillea": { gu: "બોગનવેલ", hi: "बोगनवेलिया", en: "Bougainvillea" },
  "jade": { gu: "જેડ પ્લાન્ટ", hi: "जेड प्लांट", en: "Jade Plant" },
  "cactus": { gu: "થોર / કેક્ટસ", hi: "कैक्टस", en: "Cactus" },
  "succulent": { gu: "સુક્યુલન્ટ છોડ", hi: "सक्यूलेंट पौधा", en: "Succulent" },
  "rubber plant": { gu: "રબર પ્લાન્ટ", hi: "रबर का पौधा", en: "Rubber Plant" },
  "curry leaf": { gu: "મીઠો લીમડો (કઢી પત્તા)", hi: "कढ़ी पत्ता", en: "Curry Leaf Plant" },
  "curry leaves": { gu: "મીઠો લીમડો (કઢી પત્તા)", hi: "कढ़ी पत्ता", en: "Curry Leaf Plant" },
  "tomato": { gu: "ટામેટાનો છોડ", hi: "टमाटर का पौधा", en: "Tomato Plant" },
  "lemon": { gu: "લીંબુનો છોડ", hi: "नींबू का पौधा", en: "Lemon Plant" },
  "mango": { gu: "આંબાનો કલમી છોડ", hi: "आम का कलमी पौधा", en: "Mango Plant" },
  "neem oil": { gu: "શુદ્ધ લીમડાનું તેલ", hi: "शुद्ध नीम तेल", en: "Neem Oil Spray" },
  "vermicompost": { gu: "ઓર્ગેનિક વર્મીકમ્પોસ્ટ", hi: "जैविक वर्मीकंपोस्ट", en: "Organic Vermicompost" },
  "cocopeat": { gu: "કોકોપીટ બ્લોક", hi: "कोकोपीट ब्लॉक", en: "Cocopeat Block" },
  "perlite": { gu: "પરલાઇટ સોઇલ કન્ડીશનર", hi: "परलाइट मिट्टी कंडीशनर", en: "Horticultural Perlite" },
  "planter": { gu: "કુંડું / પ્લાન્ટર", hi: "गमला / प्लांटर", en: "Planter Pot" },
  "pot": { gu: "કુંડું", hi: "गमला", en: "Pot / Planter" },
  "shears": { gu: "ગાર્ડનિંગ કાતર", hi: "बागवानी कैंची", en: "Garden Shears" },
  "jashmin": { gu: "ચમેલી / મોગરો", hi: "चमेली / मोगरा", en: "Jasmine Plant" },
  "glazed pots": { gu: "ગ્લેઝ્ડ કુંડાં", hi: "ग्लेज्ड गमले", en: "Glazed Pots" },
  "glazed pot": { gu: "ગ્લેઝ્ડ કુંડું", hi: "ग्लेज्ड गमला", en: "Glazed Pot" },
  "glazed": { gu: "ગ્લેઝ્ડ સિરામિક", hi: "ग्लेज्ड सिरेमिक", en: "Glazed Ceramic" },
  "erodium": { gu: "ઇરોડિયમ (હંસરાજ ફૂલ)", hi: "इरोडियम", en: "Erodium" },
  "plumeria": { gu: "ચંપો (પ્લુમેરિયા)", hi: "चंपा (प्लूमेरिया)", en: "Plumeria (Champa)" },
  "agribloom": { gu: "એગ્રીબ્લૂમ બૂસ્ટર", hi: "एग्रीब्लूम बूस्टर", en: "AgriBloom Plant Food" },
  "gardening tools": { gu: "ગાર્ડનિંગ ઓજારો", hi: "बागवानी उपकरण", en: "Gardening Tools" },
  "gardening tool": { gu: "ગાર્ડનિંગ ઓજાર", hi: "बागवानी उपकरण", en: "Gardening Tool" },
  "potting mix": { gu: "પોટિંગ મિક્સ માટી", hi: "पोटिंग मिक्स मिट्टी", en: "Potting Mix Soil" },
  "sunflower": { gu: "સૂર્યમુખી", hi: "सूरजमुखी", en: "Sunflower" },
  "गुलाब का पौधा": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "गुलाब": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "धनिया": { gu: "ધાણા / કોથમીર", hi: "धनिया", en: "Coriander" },
  "टमाटर": { gu: "ટામેટાં", hi: "टमाटर", en: "Tomato" },
  "सूरजमुखी": { gu: "સૂર્યમુખી", hi: "सूरजमुखी", en: "Sunflower" },
  "चंपा": { gu: "ચંપો", hi: "चंपा", en: "Plumeria (Champa)" },
  "चमेली": { gu: "ચમેલી", hi: "चमेली", en: "Jasmine" },
  "मोगरा": { gu: "મોગરો", hi: "मोगरा", en: "Mogra" },
  "तुलसी": { gu: "તુલસીનો છોડ", hi: "तुलसी का पौधा", en: "Tulsi (Holy Basil)" },
  "गमले": { gu: "કુંડાં", hi: "गमले", en: "Pots & Planters" },
  "बागवानी उपकरण": { gu: "ગાર્ડનિંગ ઓજારો", hi: "बागवानी उपकरण", en: "Gardening Tools" },
  "ગુલાબનો છોડ": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "કોથમીર": { gu: "કોથમીર / ધાણા", hi: "धनिया", en: "Coriander" },
  "ધાણા": { gu: "કોથમીર / ધાણા", hi: "धनिया", en: "Coriander" },
  "ટામેટાં": { gu: "ટામેટાં", hi: "टमाटर", en: "Tomato" },
  "સૂર્યમુખી": { gu: "સૂર્યમુખી", hi: "सूरजमुखी", en: "Sunflower" },
  "ચંપો": { gu: "ચંપો", hi: "चंपा", en: "Plumeria (Champa)" },
  "મોગરો": { gu: "મોગરો", hi: "मोगरा", en: "Mogra" },
  "કુંડાં": { gu: "કુંડાં", hi: "गमલે", en: "Pots & Planters" },
  "ઓજારો": { gu: "ગાર્ડનિંગ ઓજારો", hi: "बागवानी उपकरण", en: "Gardening Tools" },
};

function resolveTranslations(rawName, gu, hi, en) {
  const clean = String(rawName || "").trim();
  let resolvedGu = String(gu || "").trim();
  let resolvedHi = String(hi || "").trim();
  let resolvedEn = String(en || "").trim();

  const lower = clean.toLowerCase();
  for (const [key, map] of Object.entries(BOTANICAL_DICTIONARY)) {
    if (lower.includes(key) || key.includes(lower)) {
      if (!resolvedGu) resolvedGu = map.gu;
      if (!resolvedHi) resolvedHi = map.hi;
      if (!resolvedEn) resolvedEn = map.en;
      break;
    }
  }

  // Fallbacks if still empty
  if (!resolvedGu) resolvedGu = resolvedHi || resolvedEn || clean;
  if (!resolvedHi) resolvedHi = resolvedGu || resolvedEn || clean;
  if (!resolvedEn) resolvedEn = clean || resolvedGu || resolvedHi;

  return {
    name: clean || resolvedEn || resolvedGu || resolvedHi,
    name_gu: resolvedGu,
    name_hi: resolvedHi,
    name_en: resolvedEn,
  };
}

export const createCategory = asyncHandler(async (req, res) => {
  const rawName = String(req.body.name || req.body.name_en || req.body.name_gu || req.body.name_hi || "").trim();
  if (!rawName) return res.status(400).json({ message: "Category name is required." });
  const names = resolveTranslations(rawName, req.body.name_gu, req.body.name_hi, req.body.name_en);
  const image = formatCatalogImage(req.file) || "";
  const category = await Category.create({ ...names, image });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const rawName = String(req.body.name || req.body.name_en || req.body.name_gu || req.body.name_hi || "").trim();
  const names = resolveTranslations(rawName, req.body.name_gu, req.body.name_hi, req.body.name_en);
  const update = { ...names };
  if (req.file) update.image = formatCatalogImage(req.file);
  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ message: "Category not found." });
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) return res.status(409).json({ message: "Move or remove this category's products before deleting it." });
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found." });
  res.json({ message: "Category deleted." });
});

export const createProduct = asyncHandler(async (req, res) => {
  const rawName = String(req.body.name || req.body.name_en || req.body.name_gu || req.body.name_hi || "").trim();
  if (!rawName) return res.status(400).json({ message: "Product name is required." });
  const names = resolveTranslations(rawName, req.body.name_gu, req.body.name_hi, req.body.name_en);
  const desc = String(req.body.description || "").trim();
  const desc_gu = String(req.body.description_gu || "").trim() || desc;
  const desc_hi = String(req.body.description_hi || "").trim() || desc;
  const desc_en = String(req.body.description_en || "").trim() || desc;

  const product = await Product.create({
    ...names,
    description: desc,
    description_gu: desc_gu,
    description_hi: desc_hi,
    description_en: desc_en,
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    category: req.body.category,
    image: productImagePath(req.file) || "",
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const rawName = String(req.body.name || req.body.name_en || req.body.name_gu || req.body.name_hi || "").trim();
  const names = resolveTranslations(rawName, req.body.name_gu, req.body.name_hi, req.body.name_en);
  const desc = String(req.body.description || "").trim();
  const desc_gu = String(req.body.description_gu || "").trim() || desc;
  const desc_hi = String(req.body.description_hi || "").trim() || desc;
  const desc_en = String(req.body.description_en || "").trim() || desc;

  const update = {
    ...names,
    description: desc,
    description_gu: desc_gu,
    description_hi: desc_hi,
    description_en: desc_en,
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    category: req.body.category,
  };
  if (req.file) update.image = productImagePath(req.file);
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  await Promise.all([
    Cart.updateMany({}, { $pull: { items: { product: product._id } } }),
    User.updateMany({}, { $pull: { wishlist: product._id } }),
  ]);
  res.json({ message: "Product deleted." });
});

export const updateStock = asyncHandler(async (req, res) => {
  const stock = Number(req.body.stock);
  if (!Number.isInteger(stock) || stock < 0) return res.status(400).json({ message: "Stock must be a non-negative whole number." });
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json(product);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const updates = Object.entries(req.body).filter(([key]) => Object.hasOwn(settingsDefaults, key));
  await Promise.all(updates.map(([key, value]) => Setting.findOneAndUpdate({ key }, { value: String(value) }, { upsert: true })));
  const settings = { ...settingsDefaults };
  for (const setting of await Setting.find().lean()) settings[setting.key] = setting.value;
  res.json(settings);
});

export const listMessages = asyncHandler(async (_req, res) => {
  res.json(await ContactMessage.find().sort({ createdAt: -1 }).limit(100).lean());
});
import { Cart, Category, ContactMessage, Order, Product, Setting, User } from "../models/index.js";
import { randomBytes } from "node:crypto";
import { asyncHandler } from "../middleware/async-handler.js";
import { settingsDefaults } from "../config/app-config.js";
import { productImagePath } from "../middleware/uploads.js";
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

export const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ message: "Category name is required." });
  const category = await Category.create({ name, image: req.file ? `categories/${req.file.filename}` : "" });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const update = { name: String(req.body.name || "").trim() };
  if (req.file) update.image = `categories/${req.file.filename}`;
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
  const product = await Product.create({
    name: String(req.body.name || "").trim(),
    description: req.body.description || "",
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    category: req.body.category,
    image: productImagePath(req.file) || "",
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const update = {
    name: String(req.body.name || "").trim(),
    description: req.body.description || "",
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
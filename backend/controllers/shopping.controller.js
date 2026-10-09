import { randomBytes } from "node:crypto";
import { Cart, Order, Product, User } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { Setting } from "../models/index.js";
import { createNotification } from "../services/notification.service.js";
import { settingsDefaults } from "../config/app-config.js";

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.auth.id }).populate("items.product", "name price image stock").lean();
  res.json(cart || { items: [] });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const quantity = Math.max(1, Math.floor(Number(req.body.quantity) || 1));
  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).json({ message: "Product not found." });
  if (product.stock < quantity) return res.status(409).json({ message: "There is not enough stock for that quantity." });
  const cart = await Cart.findOneAndUpdate({ user: req.auth.id }, { $setOnInsert: { user: req.auth.id } }, { upsert: true, new: true });
  const item = cart.items.find((entry) => entry.product.equals(product._id));
  if (item) {
    if (item.quantity + quantity > product.stock) return res.status(409).json({ message: "There is not enough stock for that quantity." });
    item.quantity += quantity;
  } else cart.items.push({ product: product._id, quantity });
  await cart.save();
  res.json(await Cart.findById(cart._id).populate("items.product", "name price image stock").lean());
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const quantity = Math.floor(Number(req.body.quantity));
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: "Quantity must be at least one." });
  const cart = await Cart.findOne({ user: req.auth.id });
  const item = cart?.items.find((entry) => entry.product.equals(req.params.productId));
  if (!item) return res.status(404).json({ message: "Cart item not found." });
  const product = await Product.findById(req.params.productId).select("stock");
  if (!product || quantity > product.stock) return res.status(409).json({ message: "Quantity exceeds available stock." });
  item.quantity = quantity;
  await cart.save();
  res.json(await Cart.findById(cart._id).populate("items.product", "name price image stock").lean());
});

export const removeCartItem = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.auth.id }, { $pull: { items: { product: req.params.productId } } });
  const cart = await Cart.findOne({ user: req.auth.id }).populate("items.product", "name price image stock").lean();
  res.json(cart || { items: [] });
});

export const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.auth.id });
  if (!cart?.items.length) return res.status(400).json({ message: "Your cart is empty." });
  const shippingAddress = {
    fullName: String(req.body.shippingAddress?.fullName || "").trim(),
    phone: String(req.body.shippingAddress?.phone || "").trim(),
    addressLine: String(req.body.shippingAddress?.addressLine || "").trim(),
    city: String(req.body.shippingAddress?.city || "").trim(),
    state: String(req.body.shippingAddress?.state || "").trim(),
    postalCode: String(req.body.shippingAddress?.postalCode || "").trim(),
  };
  if (Object.values(shippingAddress).some((value) => !value)) {
    return res.status(400).json({ message: "Complete all delivery address fields before placing your order." });
  }
  if (String(req.body.paymentMethod || "cod") !== "cod") return res.status(400).json({ message: "Cash on delivery is the only available payment method." });

  const settings = await Setting.find({ key: { $in: ["shipping_charge", "tax_rate"] } }).lean();
  const settingValues = {
    shipping_charge: Number(settingsDefaults.shipping_charge),
    tax_rate: Number(settingsDefaults.tax_rate),
    ...Object.fromEntries(settings.map((entry) => [entry.key, Number(entry.value)])),
  };
  const shippingAmount = Math.max(0, settingValues.shipping_charge || 0);
  const taxRate = Math.max(0, settingValues.tax_rate || 0);
  const decremented = [];
  let createdOrder;
  try {
    const items = [];
    let subtotal = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findOneAndUpdate(
        { _id: cartItem.product, stock: { $gte: cartItem.quantity } },
        { $inc: { stock: -cartItem.quantity } },
        { new: true },
      );
      if (!product) throw new Error("Stock changed while checking out. Review your cart and try again.");
      decremented.push({ id: product._id, quantity: cartItem.quantity });
      items.push({ product: product._id, name: product.name, image: product.image, quantity: cartItem.quantity, price: product.price });
      subtotal += product.price * cartItem.quantity;
    }
    subtotal = roundMoney(subtotal);
    const taxAmount = roundMoney(subtotal * taxRate / 100);
    const shipping = subtotal === 0 ? 0 : roundMoney(shippingAmount);
    const totalAmount = roundMoney(subtotal + shipping + taxAmount);
    [createdOrder] = await Order.create([{
      user: req.auth.id,
      items,
      shippingAddress,
      paymentMethod: "cod",
      paymentStatus: "pending",
      subtotal,
      shippingAmount: shipping,
      taxAmount,
      totalAmount,
      status: "pending",
      statusHistory: [{ status: "pending", note: "Order received" }],
    }]);
    cart.items = [];
    await cart.save();
    await createNotification({
      user: req.auth.id,
      type: "order",
      title: "Order received",
      message: `Your order ${createdOrder._id.toString().slice(-7).toUpperCase()} is confirmed for cash on delivery.`,
      link: "/orders",
    });
    res.status(201).json(createdOrder);
  } catch (error) {
    if (createdOrder) await Order.findByIdAndDelete(createdOrder._id);
    await Promise.all(decremented.map(({ id, quantity }) => Product.updateOne({ _id: id }, { $inc: { stock: quantity } })));
    throw error;
  }
});

export const listMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.auth.id }).sort({ createdAt: -1 }).lean());
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.id).populate("wishlist").lean();
  res.json(user?.wishlist || []);
});

export const addWishlistItem = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select("_id");
  if (!product) return res.status(404).json({ message: "Product not found." });
  await User.updateOne({ _id: req.auth.id }, { $addToSet: { wishlist: product._id } });
  res.json({ message: "Added to your wishlist." });
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.auth.id }, { $pull: { wishlist: req.params.productId } });
  res.json({ message: "Removed from your wishlist." });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.auth.id, status: "pending" },
    { $set: { status: "cancelled" }, $push: { statusHistory: { status: "cancelled", note: "Cancelled by customer" } } },
    { new: true },
  );
  if (!order) {
    const existing = await Order.findOne({ _id: req.params.id, user: req.auth.id }).select("status");
    if (!existing) return res.status(404).json({ message: "Order not found." });
    return res.status(409).json({ message: "Only pending orders can be cancelled." });
  }
  await Promise.all(order.items.map((item) => item.product && Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })));
  await createNotification({
    user: req.auth.id,
    type: "order",
    title: "Order cancelled",
    message: `Your order ${order._id.toString().slice(-7).toUpperCase()} was cancelled and stock was returned.`,
    link: "/orders",
  });
  res.json(order);
});
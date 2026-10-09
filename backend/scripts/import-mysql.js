import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { Cart, Category, Order, Product, Review, Setting, User } from "../models/index.js";

const legacyMongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/plant_nursery";
const numericId = (value) => Number(value);
const asDate = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : new Date();

async function readTable(connection, name) {
  try {
    const [rows] = await connection.query(`SELECT * FROM \`${name}\``);
    return rows;
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.log(`Skipping missing legacy table: ${name}`);
      return [];
    }
    throw error;
  }
}

async function importData() {
  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "plant_nursery",
  });
  await mongoose.connect(legacyMongoUri);

  try {
    const tables = Object.fromEntries(await Promise.all(
      ["users", "categories", "products", "cart", "wishlist", "orders", "order_items", "reviews", "settings"]
        .map(async (name) => [name, await readTable(mysqlConnection, name)]),
    ));
    const usersById = new Map();
    const categoriesById = new Map();
    const productsById = new Map();
    const ordersById = new Map();

    for (const row of tables.users) {
      const legacyId = numericId(row.user_id);
      const email = String(row.email || "").trim().toLowerCase();
      if (!legacyId || !email) continue;
      let user = await User.findOne({ $or: [{ legacyId }, { email }] }).select("+password");
      if (!user) {
        const initialHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
        user = await User.create({
          legacyId,
          fullName: row.full_name || "Plant Nursery Customer",
          email,
          password: initialHash,
          role: String(row.user_role).toLowerCase() === "admin" ? "admin" : "user",
          phone: row.phone || "",
          address: row.address || "",
        });
        const legacyPassword = String(row.password || "");
        const preservedHash = /^\$2[aby]\$/.test(legacyPassword) ? legacyPassword.replace(/^\$2y\$/, "$2b$") : await bcrypt.hash(legacyPassword, 12);
        await User.updateOne({ _id: user._id }, { $set: { password: preservedHash } });
      }
      usersById.set(legacyId, user);
    }

    for (const row of tables.categories) {
      const legacyId = numericId(row.category_id);
      if (!legacyId) continue;
      let category = await Category.findOne({ legacyId });
      if (!category) category = await Category.create({ legacyId, name: row.category_name || `Category ${legacyId}`, image: row.image || "" });
      categoriesById.set(legacyId, category);
    }

    const fallbackCategory = categoriesById.values().next().value || await Category.findOne();
    for (const row of tables.products) {
      const legacyId = numericId(row.product_id);
      if (!legacyId || !fallbackCategory) continue;
      let product = await Product.findOne({ legacyId });
      const category = categoriesById.get(numericId(row.category_id)) || fallbackCategory;
      if (!product) {
        product = await Product.create({
          legacyId,
          name: row.product_name || `Product ${legacyId}`,
          description: row.description || "",
          price: Number(row.price) || 0,
          stock: Math.max(0, Number(row.stock) || 0),
          image: row.image || "",
          category: category._id,
        });
      }
      productsById.set(legacyId, product);
    }

    const orderItemsById = new Map();
    for (const row of tables.order_items) {
      const orderId = numericId(row.order_id);
      if (!orderItemsById.has(orderId)) orderItemsById.set(orderId, []);
      const product = productsById.get(numericId(row.product_id));
      orderItemsById.get(orderId).push({
        product: product?._id,
        name: product?.name || `Product ${row.product_id}`,
        image: product?.image || "",
        quantity: Math.max(1, Number(row.quantity) || 1),
        price: Number(row.price) || 0,
      });
    }

    for (const row of tables.orders) {
      const legacyId = numericId(row.order_id);
      const user = usersById.get(numericId(row.user_id));
      if (!legacyId || !user) continue;
      let order = await Order.findOne({ legacyId });
      if (!order) {
        order = await Order.create({
          legacyId,
          user: user._id,
          items: orderItemsById.get(legacyId) || [],
          totalAmount: Number(row.total_amount) || 0,
          status: row.order_status || "pending",
          createdAt: asDate(row.order_date),
          updatedAt: asDate(row.order_date),
        });
      }
      ordersById.set(legacyId, order);
    }

    const cartItemsByUser = new Map();
    for (const row of tables.cart) {
      const userId = numericId(row.user_id);
      const product = productsById.get(numericId(row.product_id));
      if (!usersById.has(userId) || !product) continue;
      if (!cartItemsByUser.has(userId)) cartItemsByUser.set(userId, []);
      const items = cartItemsByUser.get(userId);
      const existing = items.find((item) => item.product.equals(product._id));
      if (existing) existing.quantity += Math.max(1, Number(row.qty) || 1);
      else items.push({ product: product._id, quantity: Math.max(1, Number(row.qty) || 1) });
    }
    for (const [userId, items] of cartItemsByUser) {
      await Cart.updateOne({ user: usersById.get(userId)._id }, { $set: { items } }, { upsert: true });
    }

    for (const row of tables.wishlist) {
      const user = usersById.get(numericId(row.user_id));
      const product = productsById.get(numericId(row.product_id));
      if (user && product) await User.updateOne({ _id: user._id }, { $addToSet: { wishlist: product._id } });
    }

    for (const row of tables.reviews) {
      const legacyId = numericId(row.review_id);
      const user = usersById.get(numericId(row.user_id));
      const product = productsById.get(numericId(row.product_id));
      if (!legacyId || !user || !product) continue;
      if (await Review.exists({ legacyId })) continue;
      await Review.create({
        legacyId, user: user._id, product: product._id, reviewer: user.fullName,
        rating: Math.min(5, Math.max(1, Number(row.rating) || 1)), comment: row.comment || "",
        createdAt: asDate(row.created_at), updatedAt: asDate(row.created_at),
      });
    }

    for (const row of tables.settings) {
      if (row.setting_key) await Setting.updateOne({ key: row.setting_key }, { $set: { value: String(row.setting_value || "") } }, { upsert: true });
    }

    console.log(`Import complete: ${usersById.size} users, ${categoriesById.size} categories, ${productsById.size} products, ${ordersById.size} orders.`);
  } finally {
    await mysqlConnection.end();
    await mongoose.disconnect();
  }
}

importData().catch((error) => {
  console.error("Legacy import failed:", error.message);
  process.exitCode = 1;
});
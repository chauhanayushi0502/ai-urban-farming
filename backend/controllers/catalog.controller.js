import { Category, Order, Product, Review } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);
  const productsByCategory = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  res.json(categories.map((category) => ({ ...category, productCount: productsByCategory.get(String(category._id)) || 0 })));
});

export const listProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) {
    const query = new RegExp(escapeRegex(String(req.query.q).slice(0, 100)), "i");
    filter.$or = [{ name: query }, { description: query }];
  }
  const sortOptions = { low: { price: 1 }, high: { price: -1 }, name: { name: 1 }, newest: { createdAt: -1 } };
  const sort = sortOptions[req.query.sort] || sortOptions.newest;
  const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 100);
  res.json(await Product.find(filter).populate("category", "name").sort(sort).limit(limit).lean());
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name").lean();
  if (!product) return res.status(404).json({ message: "Product not found." });
  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).lean();
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const alreadyReviewed = req.auth ? await Review.exists({ user: req.auth.id, product: product._id }) : false;
  const hasPurchased = req.auth ? await Order.exists({ user: req.auth.id, "items.product": product._id }) : false;
  res.json({
    ...product,
    reviews,
    averageRating: Number(average.toFixed(1)),
    reviewCount: reviews.length,
    alreadyReviewed: Boolean(alreadyReviewed),
    hasPurchased: Boolean(hasPurchased),
  });
});
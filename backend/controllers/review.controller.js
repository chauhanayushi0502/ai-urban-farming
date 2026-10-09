import { Order, PlantCareReview, Product, Review, User } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { isValidPlantImage } from "../middleware/uploads.js";

export const submitProductReview = asyncHandler(async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return res.status(400).json({ message: "Choose a rating and write a comment." });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  const purchased = await Order.exists({ user: req.auth.id, "items.product": product._id });
  const existing = await Review.findOne({ user: req.auth.id, product: product._id });
  if (!purchased && !existing) return res.status(403).json({ message: "You can only review products you have purchased." });
  const user = await User.findById(req.auth.id).select("fullName");
  await Review.findOneAndUpdate(
    { user: req.auth.id, product: product._id },
    { user: req.auth.id, product: product._id, reviewer: user.fullName, rating, comment },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ message: "Thank you for your review." });
});

export const reviewPlantPhoto = asyncHandler(async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return res.status(503).json({ message: "Plant review is not configured. Set GEMINI_API_KEY on the server." });
  if (!req.file || !isValidPlantImage(req.file.buffer)) return res.status(400).json({ message: "Please upload a valid JPG, PNG, or WebP image." });
  const plantName = String(req.body.plant_name || "").trim().slice(0, 80);
  const context = plantName ? `The user calls this plant: ${plantName}.` : "The plant name is unknown.";
  const prompt = `Review this plant photo. ${context} Write a concise, practical report in plain text only; do not use Markdown, asterisks, or hash symbols. Use these labels on separate lines: Likely identification and confidence; Visible symptoms; Possible causes; Immediate care; Water and light; What to monitor; Seek expert help if. Use complete sentences. Do not claim certainty from one image or recommend dangerous chemicals. If this is not a plant, say so clearly.`;
  const requestModel = async (modelName) => fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      model: modelName,
      input: [{ type: "text", text: prompt }, { type: "image", data: req.file.buffer.toString("base64"), mime_type: req.file.mimetype }],
      generation_config: { thinking_level: "low", max_output_tokens: 1400 },
      store: false,
    }),
    signal: AbortSignal.timeout(60000),
  });
  let response = await requestModel("gemini-3.8-flash");
  let result = await response.json();
  if (response.status === 503 || /high demand/i.test(result.error?.message || "")) {
    response = await requestModel("gemini-3.5-flash-lite");
    result = await response.json();
  }
  let review = String(result.output_text || "").trim();
  if (!review) {
    review = (result.steps || [])
      .filter((step) => step.type === "model_output")
      .flatMap((step) => step.content || [])
      .filter((part) => part.type === "text")
      .map((part) => part.text || "")
      .join("\n")
      .trim();
  }
  if (!response.ok || !review || result.status === "incomplete") {
    const message = response.status === 429 ? "Gemini quota or rate limit reached. Try again later." : response.status === 401 || response.status === 403 ? "The Gemini API key was rejected or lacks permission." : "Plant review could not be completed. Please try again.";
    return res.status(response.status === 429 ? 429 : 502).json({ message });
  }
  await PlantCareReview.create({ user: req.auth.id, plantName, review });
  res.json({ review });
});

export const listPlantReviewHistory = asyncHandler(async (req, res) => {
  res.json(await PlantCareReview.find({ user: req.auth.id }).sort({ createdAt: -1 }).limit(30).lean());
});
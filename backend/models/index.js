import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.checkPassword = function checkPassword(value) {
  const hash = this.password.replace(/^\$2y\$/, "$2b$");
  return bcrypt.compare(value, hash);
};

const categorySchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

const productSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, min: 1, required: true },
      },
    ],
  },
  { timestamps: true },
);

const orderSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      addressLine: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    paymentMethod: { type: String, enum: ["cod"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    subtotal: { type: Number, min: 0, default: 0 },
    shippingAmount: { type: Number, min: 0, default: 0 },
    taxAmount: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, trim: true, default: "pending" },
    trackingNumber: { type: String, trim: true, default: "" },
    statusHistory: [{
      status: { type: String, required: true },
      note: { type: String, default: "" },
      changedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);

const reviewSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    reviewer: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true },
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const settingSchema = new Schema({ key: { type: String, unique: true }, value: { type: String, default: "" } });
const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, maxlength: 3000 },
  },
  { timestamps: true },
);

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const plantCareReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plantName: { type: String, trim: true, maxlength: 80, default: "" },
    review: { type: String, required: true, maxlength: 12000 },
  },
  { timestamps: true },
);

const gardenPlantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    species: { type: String, required: true, trim: true, default: "Tomato" },
    originalName: { type: String, default: "" },
    location: { type: String, enum: ["balcony", "indoor", "terrace", "garden_bed"], default: "balcony" },
    potSize: { type: String, default: "Medium (8-10 inch)" },
    soilType: { type: String, default: "Potting Mix with Compost" },
    healthStatus: { type: String, enum: ["healthy", "needs_attention", "diseased", "recovering"], default: "healthy" },
    currentDisease: { type: String, default: "" },
    wateringIntervalDays: { type: Number, min: 1, max: 30, default: 2 },
    lastWateredAt: { type: Date, default: Date.now },
    nextWateringDue: { type: Date, default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    waterQuantityMl: { type: String, default: "250ml - 350ml" },
    waterScheduleAdvice: { type: String, default: "" },
    nutrientAdvice: { type: String, default: "" },
    sunlightAdvice: { type: String, default: "" },
    protectionAdvice: { type: String, default: "" },
    fertilizingIntervalDays: { type: Number, default: 14 },
    lastFertilizedAt: { type: Date, default: null },
    nextFertilizingDue: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    notes: { type: String, default: "", maxlength: 2000 },
    image: { type: String, default: "" },
    telemetry: {
      soilMoisturePercent: { type: Number, min: 0, max: 100, default: null },
      ambientTemperatureC: { type: Number, default: null },
      ambientHumidityPercent: { type: Number, default: null },
      lastReadingAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

const plantDiagnosisSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    gardenPlant: { type: Schema.Types.ObjectId, ref: "GardenPlant", index: true },
    plantName: { type: String, default: "" },
    plantSpecies: { type: String, default: "" },
    diseaseName: { type: String, required: true },
    isHealthy: { type: Boolean, default: false },
    confidence: { type: Number, default: 90 },
    severity: { type: String, enum: ["None", "Mild", "Moderate", "Severe"], default: "Mild" },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    organicTreatment: [{ type: String }],
    chemicalTreatment: [{ type: String }],
    preventiveCare: [{ type: String }],
    wateringAdvice: { type: String, default: "" },
    smartFarmingInsight: { type: String, default: "" },
    rawReport: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
export const Category = model("Category", categorySchema);
export const Product = model("Product", productSchema);
export const Cart = model("Cart", cartSchema);
export const Order = model("Order", orderSchema);
export const Review = model("Review", reviewSchema);
export const Setting = model("Setting", settingSchema);
export const ContactMessage = model("ContactMessage", contactSchema);
export const Notification = model("Notification", notificationSchema);
export const PlantCareReview = model("PlantCareReview", plantCareReviewSchema);
export const GardenPlant = model("GardenPlant", gardenPlantSchema);
export const PlantDiagnosis = model("PlantDiagnosis", plantDiagnosisSchema);
import { Coupon } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }
  return roundMoney(Math.min(subtotal, Math.max(0, discount)));
}

export const validateCoupon = asyncHandler(async (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  const subtotal = Number(req.body.subtotal) || 0;

  if (!code) {
    return res.status(400).json({ message: "Please enter a promo code." });
  }

  const coupon = await Coupon.findOne({ code, isActive: true }).lean();
  if (!coupon) {
    return res.status(404).json({ message: "Invalid or expired coupon code." });
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return res.status(400).json({ message: "This coupon code has expired." });
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      message: `This coupon requires a minimum cart total of ₹${coupon.minOrderAmount}.`,
    });
  }

  const discountAmount = calculateCouponDiscount(coupon, subtotal);

  res.json({
    valid: true,
    code: coupon.code,
    discountAmount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    description: coupon.description || (coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`),
  });
});

export const listPublicCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find({ isActive: true }).select("code discountType discountValue minOrderAmount maxDiscountAmount description").limit(10).lean();
  res.json(coupons);
});

export const listAdminCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json(coupons);
});

export const createAdminCoupon = asyncHandler(async (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  const discountType = req.body.discountType === "fixed" ? "fixed" : "percentage";
  const discountValue = Number(req.body.discountValue);
  const minOrderAmount = Math.max(0, Number(req.body.minOrderAmount) || 0);
  const maxDiscountAmount = Math.max(0, Number(req.body.maxDiscountAmount) || 0);
  const validUntil = req.body.validUntil ? new Date(req.body.validUntil) : null;
  const description = String(req.body.description || "").trim();

  if (!code) return res.status(400).json({ message: "Coupon code is required." });
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return res.status(400).json({ message: "Discount value must be greater than 0." });
  }
  if (discountType === "percentage" && discountValue > 100) {
    return res.status(400).json({ message: "Percentage discount cannot exceed 100%." });
  }

  const existing = await Coupon.findOne({ code });
  if (existing) return res.status(409).json({ message: `Coupon with code "${code}" already exists.` });

  const created = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    validUntil,
    description,
    isActive: true,
  });

  res.status(201).json(created);
});

export const updateAdminCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found." });

  if (req.body.isActive !== undefined) coupon.isActive = Boolean(req.body.isActive);
  if (req.body.description !== undefined) coupon.description = String(req.body.description).trim();
  if (req.body.discountValue !== undefined) coupon.discountValue = Number(req.body.discountValue);
  if (req.body.minOrderAmount !== undefined) coupon.minOrderAmount = Number(req.body.minOrderAmount);
  if (req.body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(req.body.maxDiscountAmount);
  if (req.body.validUntil !== undefined) coupon.validUntil = req.body.validUntil ? new Date(req.body.validUntil) : null;

  await coupon.save();
  res.json(coupon);
});

export const deleteAdminCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found." });
  res.json({ message: "Coupon deleted successfully." });
});

import { createHash, randomBytes } from "node:crypto";
import { User } from "../models/index.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { clearAuthCookie, setAuthCookie, userPayload } from "../auth/token.js";
import { emailConfigured, sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";
import { createNotification } from "../services/notification.service.js";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const verificationExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

export const register = asyncHandler(async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!fullName || !email || !password) return res.status(400).json({ message: "Name, email, and password are required." });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
  if (await User.exists({ email })) return res.status(409).json({ message: "An account with that email already exists." });
  const verifyEmail = emailConfigured() && process.env.REQUIRE_EMAIL_VERIFICATION !== "false";
  const user = await User.create({
    fullName,
    email,
    password,
    phone: req.body.phone || "",
    address: req.body.address || "",
    language: ["gu", "en", "hi"].includes(req.body.language) ? req.body.language : "gu",
    emailVerifiedAt: verifyEmail ? null : new Date(),
  });
  if (verifyEmail) {
    const token = randomBytes(32).toString("hex");
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpiresAt = verificationExpiry();
    await user.save();
    try {
      await sendVerificationEmail(user, token);
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
    return res.status(201).json({ verificationRequired: true, message: "Check your email for an account verification link." });
  }
  setAuthCookie(res, user);
  res.status(201).json({ user: userPayload(user) });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = await User.findOne({ email }).select("+password +emailVerificationTokenHash");
  if (!user || !(await user.checkPassword(password))) return res.status(401).json({ message: "Invalid email or password." });
  if (emailConfigured() && !user.emailVerifiedAt && user.emailVerificationTokenHash) {
    return res.status(403).json({ message: "Please verify your email before signing in." });
  }
  if (!user.emailVerifiedAt && !user.emailVerificationTokenHash) {
    user.emailVerifiedAt = new Date();
    await user.save();
  }
  setAuthCookie(res, user);
  res.json({ user: userPayload(user) });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = String(req.body.token || "");
  if (!token) return res.status(400).json({ message: "Verification token is required." });
  const user = await User.findOne({
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");
  if (!user) return res.status(400).json({ message: "This verification link is invalid or has expired." });
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();
  await createNotification({ user: user._id, type: "account", title: "Email verified", message: "Your email address is verified.", link: "/profile" });
  res.json({ message: "Email verified. You can now sign in." });
});

export const resendVerification = asyncHandler(async (req, res) => {
  if (!emailConfigured()) return res.status(503).json({ message: "Email delivery is not configured on the server." });
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user && !user.emailVerifiedAt) {
    const token = randomBytes(32).toString("hex");
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpiresAt = verificationExpiry();
    await user.save();
    await sendVerificationEmail(user, token);
  }
  res.json({ message: "If the account needs verification, a new link has been sent." });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  if (!emailConfigured()) return res.status(503).json({ message: "Password reset email is not configured on the server." });
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) {
    const token = randomBytes(32).toString("hex");
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordResetEmail(user, token);
  }
  res.json({ message: "If an account exists for that email, a password reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpiresAt");
  if (!user) return res.status(400).json({ message: "This password reset link is invalid or has expired." });
  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  clearAuthCookie(res);
  res.json({ message: "Password updated. You can now sign in." });
});

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ message: "Signed out." });
}

export const currentUser = asyncHandler(async (req, res) => {
  if (!req.auth) return res.json({ user: null });
  const user = await User.findById(req.auth.id);
  if (!user) {
    clearAuthCookie(res);
    return res.json({ user: null });
  }
  res.json({ user: userPayload(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.fullName !== undefined) {
    const fullName = String(req.body.fullName || "").trim();
    if (!fullName) return res.status(400).json({ message: "Full name is required." });
    updates.fullName = fullName;
  }
  if (req.body.phone !== undefined) updates.phone = String(req.body.phone || "").trim();
  if (req.body.address !== undefined) updates.address = String(req.body.address || "").trim();
  if (req.body.language !== undefined) {
    const lang = String(req.body.language).trim();
    if (["gu", "en", "hi"].includes(lang)) {
      updates.language = lang;
    }
  }

  const user = await User.findByIdAndUpdate(req.auth.id, updates, { new: true, runValidators: true });
  res.json({ user: userPayload(user) });
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const lang = String(req.body.language || "").trim();
  if (!["gu", "en", "hi"].includes(lang)) {
    return res.status(400).json({ message: "Invalid language. Allowed: gu, en, hi." });
  }
  const user = await User.findByIdAndUpdate(req.auth.id, { language: lang }, { new: true });
  res.json({ user: userPayload(user) });
});
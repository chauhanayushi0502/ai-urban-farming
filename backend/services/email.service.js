import nodemailer from "nodemailer";

let transporter;

export function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function getTransporter() {
  if (!emailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    const hasAuth = Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: hasAuth ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

async function sendActionEmail({ user, subject, action, url, expiresIn }) {
  const mailer = getTransporter();
  if (!mailer) return false;
  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject,
    text: `Hello ${user.fullName},\n\n${action}\n\n${url}\n\nThis link expires in ${expiresIn}. If you did not request this, you can ignore this email.`,
  });
  return true;
}

export function sendVerificationEmail(user, token) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const url = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  return sendActionEmail({ user, subject: "Verify your Green Leaf account", action: "Verify your email address:", url, expiresIn: "24 hours" });
}

export function sendPasswordResetEmail(user, token) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const url = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return sendActionEmail({ user, subject: "Reset your Green Leaf password", action: "Reset your password:", url, expiresIn: "1 hour" });
}
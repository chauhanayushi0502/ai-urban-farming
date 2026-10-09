import multer from "multer";

export function errorHandler(error, _req, res, _next) {
  const status = error instanceof multer.MulterError ? 400 : error.code === 11000 ? 409 : error.name === "CastError" ? 404 : error.status || 500;
  const message = status >= 500 ? "Something went wrong. Please try again." : error.code === 11000 ? "That value already exists." : error.message;
  if (status >= 500) console.error(error);
  res.status(status).json({ message });
}
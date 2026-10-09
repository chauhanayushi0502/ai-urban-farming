const catalogBase = "/assets/images/catalog/";

export function imageSource(image) {
  return image ? `${catalogBase}${image.split("/").map(encodeURIComponent).join("/")}` : `${catalogBase}bg.png`;
}

export function money(value, currency = "₹") {
  return `${currency}${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
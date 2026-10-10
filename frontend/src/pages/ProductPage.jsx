import { useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  ShoppingBag,
  Sprout,
  Star,
  Truck,
  Printer,
  FileText,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  X,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Loading, Notice } from "../components/Feedback.jsx";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money, formatNameByLanguage, formatDescriptionByLanguage } from "../lib/format.js";
import PrintableCareGuide from "../components/PrintableCareGuide.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const { user, settings, syncCart } = useApp();
  const { t, language } = useLanguage();
  const { data: product, loading, error, reload } = useLoad(`/products/${id}`, null);
  const notify = useToast();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [showCareSheet, setShowCareSheet] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  if (loading) return <Loading />;
  if (error || !product) {
    return (
      <main className="page">
        <Notice title={t("product_not_found", "Plant not found")} text={error || t("product_not_found_desc", "This item may have been removed.")} />
      </main>
    );
  }

  async function add() {
    if (!user) return notify(t("signed_in_cart_err", "Sign in to add items to your cart."), "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: id, quantity } });
      await syncCart();
      notify(t("added_to_cart_msg", "Added to your cart."), "success");
    } catch (reason) {
      notify(reason.message, "error");
    }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function submitReview(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const form = new FormData();
      form.set("rating", rating);
      form.set("comment", comment);
      if (photoFile) {
        form.set("image", photoFile);
      }
      await api(`/products/${id}/review`, { method: "PUT", body: form });
      notify(t("review_submitted_success", "Thank you! Your photo review has been published."), "success");
      clearPhoto();
      setComment("");
      reload();
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
    }
  }

  // Calculate rating stars breakdown
  const reviews = product.reviews || [];
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  return (
    <main className="page product-detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft size={16} /> {t("back_to_shop", "Back to shop")}
      </Link>
      <div className="product-detail">
        <div className="detail-photo">
          <img src={imageSource(product.image)} alt={formatNameByLanguage(product, language)} loading="lazy" decoding="async" />
        </div>
        <section className="detail-copy">
          <p className="eyebrow">{product.category ? formatNameByLanguage(product.category, language) : "Green Leaf collection"}</p>
          <h1>{formatNameByLanguage(product, language)}</h1>
          <div className="rating-line">
            <span className="stars">
              <Star size={17} fill="currentColor" /> {product.averageRating || t("new_tag", "New")}
            </span>
            <a href="#reviews">
              {product.reviewCount} {product.reviewCount === 1 ? t("review_single", "review") : t("review_plural", "reviews")}
            </a>
          </div>
          <p className="detail-price">{money(product.price, settings.currency)}</p>
          <p className={`stock-label ${product.stock > 0 && product.stock <= 5 ? "low-stock" : ""}`}>
            {product.stock > 0
              ? product.stock <= 5
                ? `${t("stock_only", "Only")} ${product.stock} ${t("stock_left", "left")}`
                : t("stock_in_stock", "In stock and ready to grow")
              : t("stock_out", "Currently out of stock")}
          </p>
          <p className="detail-description">
            {formatDescriptionByLanguage(product, language) ||
              t("product_default_desc", "A thoughtful addition to your indoor garden. Give it a little care and room to grow.")}
          </p>

          <div style={{ margin: "14px 0" }}>
            <button
              type="button"
              className="button button-outline button-small"
              onClick={() => setShowCareSheet(true)}
              style={{ fontSize: "13px", padding: "6px 12px" }}
            >
              <FileText size={15} /> {t("view_print_care_sheet", "View & Print Botanical Care Sheet")}
            </button>
          </div>

          {product.stock > 0 && (
            <div className="buy-row">
              <label>
                {t("quantity", "Qty")}{" "}
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.max(1, Math.min(product.stock, Number(event.target.value) || 1)))
                  }
                />
              </label>
              <button className="button" onClick={add}>
                <ShoppingBag size={17} /> {t("add_to_cart", "Add to cart")}
              </button>
            </div>
          )}

          <div className="detail-promises">
            <span>
              <Truck size={17} /> {t("nursery_delivery", "Nursery-packed delivery")}
            </span>
            <span>
              <Sprout size={17} /> {t("care_guide_included", "Growing guidance included")}
            </span>
          </div>
        </section>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("reviews_eyebrow", "From our plant community")}</p>
            <h2>{t("customer_reviews_photos", "Customer Reviews & Photos")}</h2>
          </div>
          <span className="review-summary">
            <Star size={17} fill="currentColor" /> {product.averageRating || "—"} · {product.reviewCount} {product.reviewCount === 1 ? t("review_single", "review") : t("review_plural", "reviews")}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        {reviews.length > 0 && (
          <div className="reviews-breakdown-box">
            <div className="breakdown-overall">
              <span className="big-rating">{product.averageRating || 5.0}</span>
              <div className="stars-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.round(product.averageRating || 5) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs muted">{t("based_on_reviews", "Based on {count} reviews").replace("{count}", reviews.length)}</span>
            </div>

            <div className="breakdown-bars">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star] || 0;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="rating-bar-row">
                    <span className="star-label">{star} ★</span>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List with Photos */}
        <div className="review-list">
          {reviews.length ? (
            reviews.map((review) => (
              <article className="review-row" key={review._id}>
                <div className="review-author-bar">
                  <div>
                    <strong>{review.reviewer}</strong>
                    <div className="review-meta-pills">
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.verifiedPurchase && (
                        <span className="verified-badge">
                          <CheckCircle size={12} /> {t("verified_buyer", "Verified Buyer")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="review-text">{review.comment}</p>

                {/* Review Photo Attachment */}
                {review.image && (
                  <div className="review-photo-box">
                    <img
                      src={imageSource(review.image)}
                      alt="Customer grown plant"
                      className="review-thumbnail"
                      onClick={() => setEnlargedPhoto(imageSource(review.image))}
                    />
                    <span className="text-xs muted">{t("click_to_enlarge", "Click photo to enlarge")}</span>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="muted">{t("no_reviews_yet", "No reviews yet. Your photo and experience will help another plant parent!")}</p>
          )}
        </div>

        {/* Write / Update Review Form */}
        {user && (product.hasPurchased || product.alreadyReviewed) ? (
          <form className="review-form" onSubmit={submitReview}>
            <h3>{product.alreadyReviewed ? t("update_review_photo", "Update your review & photo") : t("share_review_photo", "Share your plant review & growth photo")}</h3>

            <div className="form-group">
              <label>{t("rating_label", "Rating")}</label>
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option value={value} key={value}>
                    {value === 5 ? t("rating_5", "5 ★ (Loved it!)") : value === 4 ? t("rating_4", "4 ★ (Very Good)") : value === 3 ? t("rating_3", "3 ★ (Average)") : value === 2 ? t("rating_2", "2 ★ (Needs Care)") : t("rating_1", "1 ★ (Poor)")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t("your_experience_label", "Your experience & growth progress")}</label>
              <textarea
                required
                maxLength="2000"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("review_placeholder", "How is your plant growing? Mention lighting, new leaf shoots, or potting setup…")}
              />
            </div>

            <div className="form-group">
              <label>{t("upload_plant_photo", "Upload a photo of your plant (Optional)")}</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="file-input"
              />
              {preview && (
                <div className="photo-preview-wrap">
                  <img src={preview} alt="Upload preview" className="photo-preview-thumb" />
                  <button type="button" className="icon-button" onClick={clearPhoto}>
                    <X size={14} /> {t("remove_photo", "Remove photo")}
                  </button>
                </div>
              )}
            </div>

            <button className="button" disabled={busy}>
              {busy ? t("saving_review", "Saving review…") : t("submit_review_photo", "Submit Review & Photo")} <ArrowRight size={17} />
            </button>
          </form>
        ) : !user ? (
          <p className="muted">{t("signin_to_review", "Sign in to share a photo review after purchasing this plant.")}</p>
        ) : (
          <p className="muted">{t("review_after_purchase", "Verified photo reviews become available once you have purchased this plant.")}</p>
        )}
      </section>

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div className="image-modal-overlay" onClick={() => setEnlargedPhoto(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={enlargedPhoto} alt="Customer plant full view" />
            <button className="icon-button close-modal-btn" onClick={() => setEnlargedPhoto(null)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {showCareSheet && (
        <PrintableCareGuide
          plant={product}
          settings={settings}
          onClose={() => setShowCareSheet(false)}
        />
      )}
    </main>
  );
}
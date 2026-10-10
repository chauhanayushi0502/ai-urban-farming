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
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";
import PrintableCareGuide from "../components/PrintableCareGuide.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const { user, settings, syncCart } = useApp();
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
        <Notice title="Plant not found" text={error || "This item may have been removed."} />
      </main>
    );
  }

  async function add() {
    if (!user) return notify("Sign in to add items to your cart.", "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: id, quantity } });
      await syncCart();
      notify("Added to your cart.", "success");
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
      notify("Thank you! Your photo review has been published.", "success");
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
        <ArrowLeft size={16} /> Back to shop
      </Link>
      <div className="product-detail">
        <div className="detail-photo">
          <img src={imageSource(product.image)} alt={product.name} loading="lazy" decoding="async" />
        </div>
        <section className="detail-copy">
          <p className="eyebrow">{product.category?.name || "Green Leaf collection"}</p>
          <h1>{product.name}</h1>
          <div className="rating-line">
            <span className="stars">
              <Star size={17} fill="currentColor" /> {product.averageRating || "New"}
            </span>
            <a href="#reviews">
              {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
            </a>
          </div>
          <p className="detail-price">{money(product.price, settings.currency)}</p>
          <p className={`stock-label ${product.stock > 0 && product.stock <= 5 ? "low-stock" : ""}`}>
            {product.stock > 0
              ? product.stock <= 5
                ? `Only ${product.stock} left`
                : "In stock and ready to grow"
              : "Currently out of stock"}
          </p>
          <p className="detail-description">
            {product.description ||
              "A thoughtful addition to your indoor garden. Give it a little care and room to grow."}
          </p>

          <div style={{ margin: "14px 0" }}>
            <button
              type="button"
              className="button button-outline button-small"
              onClick={() => setShowCareSheet(true)}
              style={{ fontSize: "13px", padding: "6px 12px" }}
            >
              <FileText size={15} /> View & Print Botanical Care Sheet
            </button>
          </div>

          {product.stock > 0 && (
            <div className="buy-row">
              <label>
                Qty{" "}
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
                <ShoppingBag size={17} /> Add to cart
              </button>
            </div>
          )}

          <div className="detail-promises">
            <span>
              <Truck size={17} /> Nursery-packed delivery
            </span>
            <span>
              <Sprout size={17} /> Growing guidance included
            </span>
          </div>
        </section>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <div>
            <p className="eyebrow">From our plant community</p>
            <h2>Customer Reviews & Photos</h2>
          </div>
          <span className="review-summary">
            <Star size={17} fill="currentColor" /> {product.averageRating || "—"} · {product.reviewCount} reviews
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
              <span className="text-xs muted">Based on {reviews.length} reviews</span>
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
                          <CheckCircle size={12} /> Verified Buyer
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
                    <span className="text-xs muted">Click photo to enlarge</span>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="muted">No reviews yet. Your photo and experience will help another plant parent!</p>
          )}
        </div>

        {/* Write / Update Review Form */}
        {user && (product.hasPurchased || product.alreadyReviewed) ? (
          <form className="review-form" onSubmit={submitReview}>
            <h3>{product.alreadyReviewed ? "Update your review & photo" : "Share your plant review & growth photo"}</h3>

            <div className="form-group">
              <label>Rating</label>
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option value={value} key={value}>
                    {value} ★ {value === 5 ? "(Loved it!)" : value === 4 ? "(Very Good)" : value === 3 ? "(Average)" : "(Needs Care)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Your experience & growth progress</label>
              <textarea
                required
                maxLength="2000"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="How is your plant growing? Mention lighting, new leaf shoots, or potting setup…"
              />
            </div>

            <div className="form-group">
              <label>Upload a photo of your plant (Optional)</label>
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
                    <X size={14} /> Remove photo
                  </button>
                </div>
              )}
            </div>

            <button className="button" disabled={busy}>
              {busy ? "Saving review…" : "Submit Review & Photo"} <ArrowRight size={17} />
            </button>
          </form>
        ) : !user ? (
          <p className="muted">Sign in to share a photo review after purchasing this plant.</p>
        ) : (
          <p className="muted">Verified photo reviews become available once you have purchased this plant.</p>
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
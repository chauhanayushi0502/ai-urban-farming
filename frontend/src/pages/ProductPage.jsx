import { useState } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, ShoppingBag, Sprout, Star, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Loading, Notice } from "../components/Feedback.jsx";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export default function ProductPage() {
  const { id } = useParams();
  const { user, settings, syncCart } = useApp();
  const { t } = useLanguage();
  const { data: product, loading, error } = useLoad(`/products/${id}`, null);
  const notify = useToast();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error || !product) {
    return (
      <main className="page">
        <Notice title={t("product_not_found", "Plant not found")} text={error || t("product_not_found_desc", "This item may have been removed.")} />
      </main>
    );
  }

  async function add() {
    if (!user) return notify(t("toast_signin_cart", "Please sign in to add items to your cart."), "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: id, quantity } });
      await syncCart();
      notify(t("toast_added_cart", "Added to your cart!"));
    } catch (reason) { 
      notify(reason.message, "error"); 
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api(`/products/${id}/review`, { method: "PUT", body: { rating, comment } });
      notify(t("toast_review_saved", "Your review has been saved."));
      window.location.reload();
    } catch (reason) { 
      notify(reason.message, "error"); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <main className="page product-detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft size={16} /> {t("back_to_shop", "Back to shop")}
      </Link>
      
      <div className="product-detail">
        <div className="detail-photo">
          <img src={imageSource(product.image)} alt={product.name} />
        </div>
        <section className="detail-copy">
          <p className="eyebrow">{product.category?.name || t("green_leaf_collection", "Green Leaf Collection")}</p>
          <h1>{product.name}</h1>
          
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
                : t("stock_in_stock", "In stock & ready to grow")
              : t("stock_out", "Currently out of stock")}
          </p>

          <p className="detail-description">
            {product.description || t("product_default_desc", "A thoughtful addition to your indoor garden. Give it a little care and space to grow.")}
          </p>

          {product.stock > 0 && (
            <div className="buy-row">
              <label>
                {t("quantity", "Quantity")}{" "}
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock} 
                  value={quantity} 
                  onChange={(event) => setQuantity(Math.max(1, Math.min(product.stock, Number(event.target.value) || 1)))} 
                />
              </label>
              <button className="button" onClick={add}>
                <ShoppingBag size={17} /> {t("add_to_cart", "Add to cart")}
              </button>
            </div>
          )}

          <div className="detail-promises">
            <span><Truck size={17} /> {t("nursery_delivery", "Nursery-packed delivery")}</span>
            <span><Sprout size={17} /> {t("care_guide_included", "Care guidance included")}</span>
          </div>
        </section>
      </div>

      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("reviews_eyebrow", "From our plant lovers")}</p>
            <h2>{t("customer_reviews", "Customer Reviews")}</h2>
          </div>
          <span className="review-summary">
            <Star size={17} fill="currentColor" /> {product.averageRating || "—"} · {product.reviewCount} {t("reviews_word", "reviews")}
          </span>
        </div>

        <div className="review-list">
          {product.reviews?.length ? (
            product.reviews.map((review) => (
              <article className="review-row" key={review._id}>
                <div>
                  <strong>{review.reviewer}</strong>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <p>{review.comment}</p>
              </article>
            ))
          ) : (
            <p className="muted">{t("no_reviews_yet", "No reviews yet. Your experience will help fellow plant lovers.")}</p>
          )}
        </div>

        {user && (product.hasPurchased || product.alreadyReviewed) ? (
          <form className="review-form" onSubmit={submitReview}>
            <h3>{product.alreadyReviewed ? t("update_review", "Update your review") : t("write_review", "Write a review")}</h3>
            <label>
              {t("rating", "Rating")}
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option value={value} key={value}>{value} {t("stars_label", "Stars")}</option>
                ))}
              </select>
            </label>
            <label>
              {t("your_experience", "Your experience")}
              <textarea 
                required 
                maxLength="2000" 
                value={comment} 
                onChange={(event) => setComment(event.target.value)} 
                placeholder={t("review_placeholder", "How is your plant growing?")} 
              />
            </label>
            <button className="button" disabled={busy}>
              {t("submit_review", "Submit review")} <ArrowRight size={17} />
            </button>
          </form>
        ) : !user ? (
          <p className="muted">{t("signin_to_review", "Sign in to share a review after purchase.")}</p>
        ) : (
          <p className="muted">{t("review_after_purchase", "Reviews available after purchasing this plant.")}</p>
        )}
      </section>
    </main>
  );
}
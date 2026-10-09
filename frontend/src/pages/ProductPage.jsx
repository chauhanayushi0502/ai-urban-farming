import { useState } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, ShoppingBag, Sprout, Star, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Loading, Notice } from "../components/Feedback.jsx";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export default function ProductPage() {
  const { id } = useParams();
  const { user, settings, syncCart } = useApp();
  const { data: product, loading, error } = useLoad(`/products/${id}`, null);
  const notify = useToast();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (error || !product) return <main className="page"><Notice title="Plant not found" text={error || "This item may have been removed."} /></main>;

  async function add() {
    if (!user) return notify("Sign in to add items to your cart.", "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: id, quantity } });
      await syncCart();
      notify("Added to your cart.");
    } catch (reason) { notify(reason.message, "error"); }
  }

  async function submitReview(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api(`/products/${id}/review`, { method: "PUT", body: { rating, comment } });
      notify("Your review has been saved.");
      window.location.reload();
    } catch (reason) { notify(reason.message, "error"); }
    finally { setBusy(false); }
  }

  return <main className="page product-detail-page"><Link className="back-link" to="/shop"><ArrowLeft size={16} /> Back to shop</Link><div className="product-detail"><div className="detail-photo"><img src={imageSource(product.image)} alt={product.name} /></div><section className="detail-copy"><p className="eyebrow">{product.category?.name || "Green Leaf collection"}</p><h1>{product.name}</h1><div className="rating-line"><span className="stars"><Star size={17} fill="currentColor" /> {product.averageRating || "New"}</span><a href="#reviews">{product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}</a></div><p className="detail-price">{money(product.price, settings.currency)}</p><p className={`stock-label ${product.stock > 0 && product.stock <= 5 ? "low-stock" : ""}`}>{product.stock > 0 ? product.stock <= 5 ? `Only ${product.stock} left` : "In stock and ready to grow" : "Currently out of stock"}</p><p className="detail-description">{product.description || "A thoughtful addition to your indoor garden. Give it a little care and room to grow."}</p>{product.stock > 0 && <div className="buy-row"><label>Qty <input type="number" min="1" max={product.stock} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(product.stock, Number(event.target.value) || 1)))} /></label><button className="button" onClick={add}><ShoppingBag size={17} /> Add to cart</button></div>}<div className="detail-promises"><span><Truck size={17} /> Nursery-packed delivery</span><span><Sprout size={17} /> Growing guidance included</span></div></section></div><section className="reviews-section" id="reviews"><div className="section-heading"><div><p className="eyebrow">From our plant people</p><h2>Customer reviews</h2></div><span className="review-summary"><Star size={17} fill="currentColor" /> {product.averageRating || "—"} · {product.reviewCount} reviews</span></div><div className="review-list">{product.reviews?.length ? product.reviews.map((review) => <article className="review-row" key={review._id}><div><strong>{review.reviewer}</strong><span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span></div><span className="stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><p>{review.comment}</p></article>) : <p className="muted">No reviews yet. Your experience can help another plant parent.</p>}</div>{user && (product.hasPurchased || product.alreadyReviewed) ? <form className="review-form" onSubmit={submitReview}><h3>{product.alreadyReviewed ? "Update your review" : "Write a review"}</h3><label>Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} stars</option>)}</select></label><label>Your experience<textarea required maxLength="2000" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="How is your plant settling in?" /></label><button className="button" disabled={busy}>Submit review <ArrowRight size={17} /></button></form> : !user ? <p className="muted">Sign in to share a review after a purchase.</p> : <p className="muted">Reviews are available after you have purchased this plant.</p>}</section></main>;
}
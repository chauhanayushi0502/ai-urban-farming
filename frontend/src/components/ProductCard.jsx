import { Link } from "react-router-dom";
import { Heart, Plus, Sprout } from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export function ProductGrid({ products }) {
  if (!products.length) return <div className="empty-inline"><Sprout size={24} /><h3>No plants found just yet.</h3><p>Try another category or search term.</p></div>;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>;
}

export default function ProductCard({ product }) {
  const { user, settings, syncCart, refreshUser } = useApp();
  const notify = useToast();
  const saved = user?.wishlist?.some((id) => String(id) === product._id);

  async function addToCart() {
    if (!user) return notify("Sign in to add items to your cart.", "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: product._id, quantity: 1 } });
      await syncCart();
      notify(`${product.name} added to your cart.`);
    } catch (error) { notify(error.message, "error"); }
  }

  async function toggleWishlist() {
    if (!user) return notify("Sign in to save plants to your wishlist.", "error");
    try {
      await api(`/wishlist/${product._id}`, { method: saved ? "DELETE" : "PUT" });
      await refreshUser();
      notify(saved ? "Removed from your wishlist." : "Saved to your wishlist.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <article className="product-card"><div className="product-image-wrap"><Link to={`/products/${product._id}`}><img className="product-image" src={imageSource(product.image)} alt={product.name} /></Link><button className={`favorite-button ${saved ? "is-saved" : ""}`} onClick={toggleWishlist} title={saved ? "Remove from wishlist" : "Add to wishlist"} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>{product.stock <= 0 && <span className="stock-ribbon">Out of stock</span>}</div><div className="product-copy"><p className="product-category">{product.category?.name || "Nursery favorite"}</p><Link to={`/products/${product._id}`} className="product-name">{product.name}</Link><div className="product-bottom"><strong>{money(product.price, settings.currency)}</strong>{product.stock > 0 ? <button className="add-button" onClick={addToCart} aria-label={`Add ${product.name} to cart`}><Plus size={19} /></button> : <span className="muted tiny">Unavailable</span>}</div></div></article>;
}
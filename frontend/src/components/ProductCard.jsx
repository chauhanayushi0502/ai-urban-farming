import { Link } from "react-router-dom";
import { Heart, Plus, Sprout } from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export function ProductGrid({ products }) {
  if (!products.length) return <div className="empty-inline"><Sprout size={24} /><h3>હજુ સુધી કોઈ છોડ મળ્યા નથી.</h3><p>બીજી કેટેગરી અથવા શોધ શબ્દ અજમાવો.</p></div>;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>;
}

export default function ProductCard({ product }) {
  const { user, settings, syncCart, refreshUser } = useApp();
  const notify = useToast();
  const saved = user?.wishlist?.some((id) => String(id) === product._id);

  async function addToCart() {
    if (!user) return notify("તમારા કાર્ટમાં વસ્તુઓ ઉમેરવા માટે સાઇન ઇન કરો.", "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: product._id, quantity: 1 } });
      await syncCart();
      notify(`${product.name} તમારા કાર્ટમાં ઉમેરાયું.`);
    } catch (error) { notify(error.message, "error"); }
  }

  async function toggleWishlist() {
    if (!user) return notify("તમારી ઇચ્છાસૂચિમાં છોડ સાચવવા સાઇન ઇન કરો.", "error");
    try {
      await api(`/wishlist/${product._id}`, { method: saved ? "DELETE" : "PUT" });
      await refreshUser();
      notify(saved ? "તમારી ઇચ્છાસૂચિમાંથી દૂર કર્યું." : "તમારી ઇચ્છાસૂચિમાં સાચવ્યું.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <article className="product-card"><div className="product-image-wrap"><Link to={`/products/${product._id}`}><img className="product-image" src={imageSource(product.image)} alt={product.name} /></Link><button className={`favorite-button ${saved ? "is-saved" : ""}`} onClick={toggleWishlist} title={saved ? "ઇચ્છાસૂચિમાંથી દૂર કરો" : "ઇચ્છાસૂચિમાં ઉમેરો"} aria-label={saved ? "ઇચ્છાસૂચિમાંથી દૂર કરો" : "ઇચ્છાસૂચિમાં ઉમેરો"}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>{product.stock <= 0 && <span className="stock-ribbon">સ્ટોકમાં નથી</span>}</div><div className="product-copy"><p className="product-category">{product.category?.name || "નર્સરી પ્રિય"}</p><Link to={`/products/${product._id}`} className="product-name">{product.name}</Link><div className="product-bottom"><strong>{money(product.price, settings.currency)}</strong>{product.stock > 0 ? <button className="add-button" onClick={addToCart} aria-label={`${product.name} કાર્ટમાં ઉમેરો`}><Plus size={19} /></button> : <span className="muted tiny">અનઉપલબ્ધ</span>}</div></div></article>;
}
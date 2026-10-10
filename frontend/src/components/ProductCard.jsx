import { Link } from "react-router-dom";
import { Heart, Plus, Sprout } from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money, formatNameByLanguage } from "../lib/format.js";

export function ProductGrid({ products }) {
  const { t } = useLanguage();
  if (!products.length) {
    return (
      <div className="empty-inline">
        <Sprout size={24} />
        <h3>{t("no_plants_found", "No plants found just yet.")}</h3>
        <p>{t("try_another_cat", "Try another category or search term.")}</p>
      </div>
    );
  }
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { user, settings, syncCart, refreshUser } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();
  const saved = user?.wishlist?.some((id) => String(id) === product._id);

  const formattedCat = product.category
    ? formatNameByLanguage(product.category, language)
    : t("nursery_favorite", "Nursery favorite");
  const formattedName = formatNameByLanguage(product, language);

  async function addToCart() {
    if (!user) return notify(t("signed_in_cart_err", "Sign in to add items to your cart."), "error");
    try {
      await api("/cart/items", { method: "POST", body: { productId: product._id, quantity: 1 } });
      await syncCart();
      notify(`${formattedName} ${t("added_to_cart_msg", "added to your cart.")}`);
    } catch (error) { 
      notify(error.message, "error"); 
    }
  }

  async function toggleWishlist() {
    if (!user) return notify(t("signed_in_wishlist_err", "Sign in to save plants to your wishlist."), "error");
    try {
      await api(`/wishlist/${product._id}`, { method: saved ? "DELETE" : "PUT" });
      await refreshUser();
      notify(saved ? t("removed_wishlist_msg", "Removed from your wishlist.") : t("saved_wishlist_msg", "Saved to your wishlist."));
    } catch (error) { 
      notify(error.message, "error"); 
    }
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/products/${product._id}`}>
          <img className="product-image" src={imageSource(product.image)} alt={formattedName} />
        </Link>
        <button 
          className={`favorite-button ${saved ? "is-saved" : ""}`} 
          onClick={toggleWishlist} 
          title={saved ? t("remove_wishlist", "Remove from wishlist") : t("add_wishlist", "Add to wishlist")} 
          aria-label={saved ? t("remove_wishlist", "Remove from wishlist") : t("add_wishlist", "Add to wishlist")}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        {product.stock <= 0 && <span className="stock-ribbon">{t("out_of_stock", "Out of stock")}</span>}
      </div>

      <div className="product-copy">
        <p className="product-category">{formattedCat}</p>
        <Link to={`/products/${product._id}`} className="product-name">{formattedName}</Link>
        <div className="product-bottom">
          <strong>{money(product.price, settings.currency)}</strong>
          {product.stock > 0 ? (
            <button className="add-button" onClick={addToCart} aria-label={`${formattedName} ${t("add_to_cart", "Add to cart")}`}>
              <Plus size={19} />
            </button>
          ) : (
            <span className="muted tiny">{t("unavailable", "Unavailable")}</span>
          )}
        </div>
      </div>
    </article>
  );
}
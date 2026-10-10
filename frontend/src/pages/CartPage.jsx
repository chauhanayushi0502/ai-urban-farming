import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money, formatNameByLanguage } from "../lib/format.js";

export default function CartPage() {
  const { data: cart, loading, setData: setCart } = useLoad("/cart", { items: [] });
  const { settings, syncCart } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();

  if (loading) return <main className="page"><Loading /></main>;
  
  const items = (cart.items || []).filter((item) => item.product);
  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  async function update(id, quantity) {
    try {
      setCart(await api(`/cart/items/${id}`, { method: "PATCH", body: { quantity: Number(quantity) } }));
      await syncCart();
    } catch (error) { 
      notify(error.message, "error"); 
    }
  }

  async function remove(id) {
    try {
      setCart(await api(`/cart/items/${id}`, { method: "DELETE" }));
      await syncCart();
      notify(t("toast_removed_cart", "Item removed from your cart."));
    } catch (error) { 
      notify(error.message, "error"); 
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("cart_eyebrow", "Your growing list")}</p>
          <h1>{t("cart_title", "Shopping Cart")}</h1>
        </div>
        <Link className="text-link" to="/shop">
          <ArrowLeft size={16} /> {t("continue_browsing", "Continue browsing")}
        </Link>
      </div>

      {!items.length ? (
        <div className="empty-state">
          <ShoppingBag size={27} />
          <h2>{t("cart_empty_title", "Your cart is ready for plants.")}</h2>
          <p>{t("cart_empty_desc", "Find the right plants for your home.")}</p>
          <Link className="button" to="/shop">
            {t("browse_plants", "Browse plants")} <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {items.map(({ product, quantity }) => (
              <article className="cart-row" key={product._id}>
                <Link to={`/products/${product._id}`}>
                  <img src={imageSource(product.image)} alt={formatNameByLanguage(product.name, language)} />
                </Link>
                <div className="cart-item-copy">
                  <Link to={`/products/${product._id}`} className="product-name">{formatNameByLanguage(product.name, language)}</Link>
                  <span className="muted">{t("each_word", "each")} {money(product.price, settings.currency)}</span>
                  <span className="stock-hint">{product.stock} {t("available_word", "available")}</span>
                </div>
                <label className="quantity-input">
                  {t("quantity", "Quantity")}
                  <input 
                    type="number" 
                    min="1" 
                    max={product.stock} 
                    value={quantity} 
                    onChange={(event) => update(product._id, event.target.value)} 
                  />
                </label>
                <strong>{money(product.price * quantity, settings.currency)}</strong>
                <button 
                  className="icon-button subtle" 
                  onClick={() => remove(product._id)} 
                  aria-label={`${product.name} ${t("remove_word", "remove")}`} 
                  title={t("remove_item", "Remove item")}
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </section>

          <aside className="summary-panel">
            <h2>{t("order_summary", "Order Summary")}</h2>
            <div>
              <span>{t("subtotal", "Subtotal")}</span>
              <strong>{money(total, settings.currency)}</strong>
            </div>
            <div>
              <span>{t("shipping", "Shipping")}</span>
              <span>{t("calculated_at_checkout", "Calculated at checkout")}</span>
            </div>
            <hr />
            <div className="summary-total">
              <span>{t("subtotal", "Subtotal")}</span>
              <strong>{money(total, settings.currency)}</strong>
            </div>
            <Link className="button full-button" to="/checkout">
              {t("proceed_to_checkout", "Proceed to checkout")} <ArrowRight size={17} />
            </Link>
            <p className="muted tiny">{t("checkout_note", "Shipping and taxes estimated before confirming order.")}</p>
          </aside>
        </div>
      )}
    </main>
  );
}
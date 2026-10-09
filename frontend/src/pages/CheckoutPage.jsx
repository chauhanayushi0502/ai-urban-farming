import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Loading } from "../components/Feedback.jsx";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

export default function CheckoutPage() {
  const { user, settings, syncCart } = useApp();
  const { t } = useLanguage();
  const { data: cart, loading } = useLoad("/cart", { items: [] });
  const notify = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    addressLine: user.address || "",
    city: "",
    state: "",
    postalCode: "",
  });

  const items = (cart.items || []).filter((item) => item.product);
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.product.price, 0));
  const shipping = subtotal ? Math.max(0, Number(settings.shipping_charge) || 0) : 0;
  const tax = roundMoney(subtotal * Math.max(0, Number(settings.tax_rate) || 0) / 100);
  const total = roundMoney(subtotal + shipping + tax);

  function update(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const order = await api("/checkout", { method: "POST", body: { shippingAddress: address, paymentMethod: "cod" } });
      await syncCart();
      notify(`${t("order_confirmed_msg", "Order confirmed! Pay on delivery:")} ${money(order.totalAmount, settings.currency)}`);
      navigate("/orders");
    } catch (error) { 
      notify(error.message, "error"); 
    } finally { 
      setBusy(false); 
    }
  }

  if (loading) return <main className="page"><Loading /></main>;
  if (!items.length) {
    return (
      <main className="page">
        <section className="empty-state">
          <Truck size={26} />
          <h1>{t("cart_empty_title", "Your cart is empty.")}</h1>
          <p>{t("add_plants_before_checkout", "Add plants before checking out.")}</p>
          <Link className="button" to="/shop">
            {t("browse_plants", "Browse plants")} <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page checkout-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("almost_there", "Almost there")}</p>
          <h1>{t("delivery_payment", "Delivery & Payment")}</h1>
        </div>
        <Link to="/cart" className="text-link">
          <ArrowLeft size={16} /> {t("back_to_cart", "Back to cart")}
        </Link>
      </div>

      <form className="checkout-layout" onSubmit={submit}>
        <section className="checkout-form">
          <div className="checkout-section-title">
            <MapPin size={18} />
            <div>
              <h2>{t("shipping_address", "Shipping Address")}</h2>
              <p className="muted">{t("where_to_send", "Where should we send your plants?")}</p>
            </div>
          </div>

          <div className="checkout-fields">
            <label>
              {t("full_name", "Full Name")}
              <input autoComplete="name" required maxLength="100" value={address.fullName} onChange={(event) => update("fullName", event.target.value)} />
            </label>
            <label>
              {t("phone_number", "Phone Number")}
              <input autoComplete="tel" type="tel" required maxLength="30" value={address.phone} onChange={(event) => update("phone", event.target.value)} />
            </label>
            <label className="wide-field">
              {t("street_address", "Street Address / House No.")}
              <input autoComplete="street-address" required maxLength="200" value={address.addressLine} onChange={(event) => update("addressLine", event.target.value)} />
            </label>
            <label>
              {t("city", "City")}
              <input autoComplete="address-level2" required maxLength="80" value={address.city} onChange={(event) => update("city", event.target.value)} />
            </label>
            <label>
              {t("state_region", "State / Region")}
              <input autoComplete="address-level1" required maxLength="80" value={address.state} onChange={(event) => update("state", event.target.value)} />
            </label>
            <label>
              {t("postal_code", "Postal Code")}
              <input autoComplete="postal-code" required maxLength="20" value={address.postalCode} onChange={(event) => update("postalCode", event.target.value)} />
            </label>
          </div>

          <div className="checkout-section-title payment-title">
            <Truck size={18} />
            <div>
              <h2>{t("payment_method", "Payment Method")}</h2>
              <p className="muted">{t("pay_on_delivery_desc", "Pay when your order arrives.")}</p>
            </div>
          </div>

          <label className="payment-option">
            <input type="radio" name="payment" checked readOnly />
            <span>
              <strong>{t("cod", "Cash on Delivery")}</strong>
              <small>{t("cod_desc", "Pay cash to the delivery partner when your plants arrive.")}</small>
            </span>
            <strong>{money(total, settings.currency)}</strong>
          </label>

          <button className="button checkout-submit" disabled={busy}>
            {busy ? t("placing_order", "Placing order…") : t("confirm_order", "Confirm order")}
            <ArrowRight size={17} />
          </button>
        </section>

        <aside className="summary-panel checkout-summary">
          <h2>{t("order_summary", "Order Summary")}</h2>
          {items.map(({ product, quantity }) => (
            <div className="checkout-item" key={product._id}>
              <img src={imageSource(product.image)} alt={product.name} />
              <span>{product.name} <small>× {quantity}</small></span>
              <strong>{money(product.price * quantity, settings.currency)}</strong>
            </div>
          ))}
          <div>
            <span>{t("subtotal", "Subtotal")}</span>
            <strong>{money(subtotal, settings.currency)}</strong>
          </div>
          <div>
            <span>{t("shipping", "Shipping")}</span>
            <strong>{money(shipping, settings.currency)}</strong>
          </div>
          <div>
            <span>{t("tax", "Tax")} ({Number(settings.tax_rate) || 0}%)</span>
            <strong>{money(tax, settings.currency)}</strong>
          </div>
          <hr />
          <div className="summary-total">
            <span>{t("total_on_delivery", "Total Due on Delivery")}</span>
            <strong>{money(total, settings.currency)}</strong>
          </div>
        </aside>
      </form>
    </main>
  );
}
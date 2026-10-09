import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Loading } from "../components/Feedback.jsx";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

export default function CheckoutPage() {
  const { user, settings, syncCart } = useApp();
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
      notify(`Order confirmed. Pay ${money(order.totalAmount, settings.currency)} on delivery.`);
      navigate("/orders");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="page"><Loading /></main>;
  if (!items.length) return <main className="page"><section className="empty-state"><Truck size={26} /><h1>Your cart is empty.</h1><p>Add a plant before checking out.</p><Link className="button" to="/shop">Browse plants <ArrowRight size={17} /></Link></section></main>;

  return <main className="page checkout-page"><div className="page-heading"><div><p className="eyebrow">Almost home</p><h1>Delivery & payment</h1></div><Link to="/cart" className="text-link"><ArrowLeft size={16} /> Back to cart</Link></div><form className="checkout-layout" onSubmit={submit}><section className="checkout-form"><div className="checkout-section-title"><MapPin size={18} /><div><h2>Delivery address</h2><p className="muted">Where should we send your plants?</p></div></div><div className="checkout-fields"><label>Full name<input autoComplete="name" required maxLength="100" value={address.fullName} onChange={(event) => update("fullName", event.target.value)} /></label><label>Phone number<input autoComplete="tel" type="tel" required maxLength="30" value={address.phone} onChange={(event) => update("phone", event.target.value)} /></label><label className="wide-field">Street address<input autoComplete="street-address" required maxLength="200" value={address.addressLine} onChange={(event) => update("addressLine", event.target.value)} /></label><label>City<input autoComplete="address-level2" required maxLength="80" value={address.city} onChange={(event) => update("city", event.target.value)} /></label><label>State / region<input autoComplete="address-level1" required maxLength="80" value={address.state} onChange={(event) => update("state", event.target.value)} /></label><label>Postal code<input autoComplete="postal-code" required maxLength="20" value={address.postalCode} onChange={(event) => update("postalCode", event.target.value)} /></label></div><div className="checkout-section-title payment-title"><Truck size={18} /><div><h2>Payment method</h2><p className="muted">Pay when your order arrives.</p></div></div><label className="payment-option"><input type="radio" name="payment" checked readOnly /><span><strong>Cash on delivery</strong><small>Pay the order total to the delivery partner.</small></span><strong>{money(total, settings.currency)}</strong></label><button className="button checkout-submit" disabled={busy}>{busy ? "Placing order…" : "Confirm order"}<ArrowRight size={17} /></button></section><aside className="summary-panel checkout-summary"><h2>Order summary</h2>{items.map(({ product, quantity }) => <div className="checkout-item" key={product._id}><img src={imageSource(product.image)} alt="" /><span>{product.name} <small>× {quantity}</small></span><strong>{money(product.price * quantity, settings.currency)}</strong></div>)}<div><span>Subtotal</span><strong>{money(subtotal, settings.currency)}</strong></div><div><span>Shipping</span><strong>{money(shipping, settings.currency)}</strong></div><div><span>Tax ({Number(settings.tax_rate) || 0}%)</span><strong>{money(tax, settings.currency)}</strong></div><hr /><div className="summary-total"><span>Total due on delivery</span><strong>{money(total, settings.currency)}</strong></div></aside></form></main>;
}
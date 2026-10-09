import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export default function CartPage() {
  const { data: cart, loading, setData: setCart } = useLoad("/cart", { items: [] });
  const { settings, syncCart } = useApp();
  const notify = useToast();
  if (loading) return <main className="page"><Loading /></main>;
  const items = (cart.items || []).filter((item) => item.product);
  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  async function update(id, quantity) {
    try {
      setCart(await api(`/cart/items/${id}`, { method: "PATCH", body: { quantity: Number(quantity) } }));
      await syncCart();
    } catch (error) { notify(error.message, "error"); }
  }

  async function remove(id) {
    try {
      setCart(await api(`/cart/items/${id}`, { method: "DELETE" }));
      await syncCart();
      notify("Item removed from your cart.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <main className="page"><div className="page-heading"><div><p className="eyebrow">Your growing list</p><h1>Shopping cart</h1></div><Link className="text-link" to="/shop"><ArrowLeft size={16} /> Keep browsing</Link></div>{!items.length ? <div className="empty-state"><ShoppingBag size={27} /><h2>Your cart is ready for a little green.</h2><p>Find a plant that feels at home in your space.</p><Link className="button" to="/shop">Browse plants <ArrowRight size={17} /></Link></div> : <div className="cart-layout"><section className="cart-items">{items.map(({ product, quantity }) => <article className="cart-row" key={product._id}><Link to={`/products/${product._id}`}><img src={imageSource(product.image)} alt={product.name} /></Link><div className="cart-item-copy"><Link to={`/products/${product._id}`} className="product-name">{product.name}</Link><span className="muted">{money(product.price, settings.currency)} each</span><span className="stock-hint">{product.stock} available</span></div><label className="quantity-input">Qty<input type="number" min="1" max={product.stock} value={quantity} onChange={(event) => update(product._id, event.target.value)} /></label><strong>{money(product.price * quantity, settings.currency)}</strong><button className="icon-button subtle" onClick={() => remove(product._id)} aria-label={`Remove ${product.name}`} title="Remove item"><Trash2 size={18} /></button></article>)}</section><aside className="summary-panel"><h2>Order summary</h2><div><span>Subtotal</span><strong>{money(total, settings.currency)}</strong></div><div><span>Shipping</span><span>Calculated at checkout</span></div><hr /><div className="summary-total"><span>Subtotal</span><strong>{money(total, settings.currency)}</strong></div><Link className="button full-button" to="/checkout">Continue to checkout <ArrowRight size={17} /></Link><p className="muted tiny">Delivery and tax are calculated before you confirm your order.</p></aside></div>}</main>;
}
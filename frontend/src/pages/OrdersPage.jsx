import { ArrowRight, ArrowUpRight, Package, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export default function OrdersPage() {
  const { data: orders, loading, setData } = useLoad("/orders/mine", []);
  const { settings } = useApp();
  const notify = useToast();

  async function cancelOrder(order) {
    if (!window.confirm("Cancel this pending order? The items will be returned to inventory.")) return;
    try {
      const updated = await api(`/orders/${order._id}/cancel`, { method: "POST" });
      setData(orders.map((item) => item._id === order._id ? updated : item));
      notify("Order cancelled. Inventory has been restored.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <main className="page"><div className="page-heading"><div><p className="eyebrow">The growing history</p><h1>My orders</h1></div></div>{loading ? <Loading /> : !orders.length ? <div className="empty-state"><Package size={27} /><h2>No orders yet.</h2><p>Your next plant might be waiting in the nursery.</p><Link to="/shop" className="button">Start shopping <ArrowRight size={17} /></Link></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-head"><div><span className="eyebrow">Order {order.legacyId ? `#${order.legacyId}` : `#${order._id.slice(-7).toUpperCase()}`}</span><h2>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</h2></div><span className={`status-pill status-${order.status}`}>{order.status}</span><strong>{money(order.totalAmount, settings.currency)}</strong></div><div className="order-summary-details"><span>Payment: <strong>Cash on delivery</strong> ({order.paymentStatus || "pending"})</span>{order.trackingNumber && <span>Tracking: <strong>{order.trackingNumber}</strong></span>}</div>{order.shippingAddress?.addressLine && <p className="order-address">Delivering to: {order.shippingAddress.fullName}, {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>}<ol className="order-timeline">{(order.statusHistory?.length ? order.statusHistory : [{ status: order.status, note: "Order status" }]).map((entry, index) => <li key={`${entry.status}-${index}`}><span className="timeline-dot" /><div><strong>{entry.status}</strong><span>{entry.note}</span><time>{new Date(entry.changedAt || order.createdAt).toLocaleString()}</time></div></li>)}</ol><div className="order-products">{order.items.map((item, index) => <div className="order-product" key={`${item.product}-${index}`}><img src={imageSource(item.image)} alt={item.name} /><div><strong>{item.name}</strong><span className="muted">Qty {item.quantity} · {money(item.price, settings.currency)} each</span></div>{item.product && <Link className="text-link" to={`/products/${item.product}#reviews`}>Review <ArrowUpRight size={15} /></Link>}</div>)}</div>{order.status === "pending" && <button className="button button-outline cancel-order" onClick={() => cancelOrder(order)}><XCircle size={16} /> Cancel pending order</button>}</article>)}</div>}</main>;
}
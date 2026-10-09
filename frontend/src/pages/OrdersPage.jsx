import { ArrowRight, ArrowUpRight, Package, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

export default function OrdersPage() {
  const { data: orders, loading, setData } = useLoad("/orders/mine", []);
  const { settings } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();

  const langCodeMap = {
    gu: "gu-IN",
    hi: "hi-IN",
    en: "en-US"
  };

  async function cancelOrder(order) {
    if (!window.confirm(t("confirm_cancel_order", "Cancel this pending order? Items will be returned to inventory."))) return;
    try {
      const updated = await api(`/orders/${order._id}/cancel`, { method: "POST" });
      setData(orders.map((item) => item._id === order._id ? updated : item));
      notify(t("order_cancelled_msg", "Order cancelled. Inventory restored."));
    } catch (error) { 
      notify(error.message, "error"); 
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return t("status_pending", "Pending");
      case "processing": return t("status_processing", "Processing");
      case "shipped": return t("status_shipped", "Shipped");
      case "delivered": return t("status_delivered", "Delivered");
      case "cancelled": return t("status_cancelled", "Cancelled");
      default: return status;
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("growing_history", "Growing History")}</p>
          <h1>{t("nav_orders", "My Orders")}</h1>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : !orders.length ? (
        <div className="empty-state">
          <Package size={27} />
          <h2>{t("no_orders_yet", "No orders yet.")}</h2>
          <p>{t("next_plant_waiting", "Your next plant is waiting in the nursery.")}</p>
          <Link to="/shop" className="button">
            {t("start_shopping", "Start shopping")} <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-head">
                <div>
                  <span className="eyebrow">
                    {t("order_word", "Order")} {order.legacyId ? `#${order.legacyId}` : `#${order._id.slice(-7).toUpperCase()}`}
                  </span>
                  <h2>
                    {new Date(order.createdAt).toLocaleDateString(langCodeMap[language] || "en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </h2>
                </div>
                <span className={`status-pill status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
                <strong>{money(order.totalAmount, settings.currency)}</strong>
              </div>

              <div className="order-summary-details">
                <span>
                  {t("payment", "Payment")}: <strong>{t("cod", "Cash on Delivery")}</strong> ({getStatusLabel(order.paymentStatus || "pending")})
                </span>
                {order.trackingNumber && (
                  <span>{t("tracking", "Tracking")}: <strong>{order.trackingNumber}</strong></span>
                )}
              </div>

              {order.shippingAddress?.addressLine && (
                <p className="order-address">
                  {t("delivery_address_label", "Delivery Address")}: {order.shippingAddress.fullName}, {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
              )}

              <ol className="order-timeline">
                {(order.statusHistory?.length ? order.statusHistory : [{ status: order.status, note: "Order Status" }]).map((entry, index) => (
                  <li key={`${entry.status}-${index}`}>
                    <span className="timeline-dot" />
                    <div>
                      <strong>{getStatusLabel(entry.status)}</strong>
                      <span>{entry.note}</span>
                      <time>{new Date(entry.changedAt || order.createdAt).toLocaleString()}</time>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="order-products">
                {order.items.map((item, index) => (
                  <div className="order-product" key={`${item.product}-${index}`}>
                    <img src={imageSource(item.image)} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <span className="muted">
                        {t("quantity", "Qty")} {item.quantity} · {t("each_word", "each")} {money(item.price, settings.currency)}
                      </span>
                    </div>
                    {item.product && (
                      <Link className="text-link" to={`/products/${item.product}#reviews`}>
                        {t("write_review", "Review")} <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {order.status === "pending" && (
                <button className="button button-outline cancel-order" onClick={() => cancelOrder(order)}>
                  <XCircle size={16} /> {t("cancel_pending_order", "Cancel Pending Order")}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Package, XCircle, FileText, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { Loading } from "../components/Feedback.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money, formatNameByLanguage } from "../lib/format.js";
import InvoiceModal from "../components/InvoiceModal.jsx";

export default function OrdersPage() {
  const { data: orders, loading, setData } = useLoad("/orders/mine", []);
  const { settings } = useApp();
  const { t, language } = useLanguage();
  const notify = useToast();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  async function cancelOrder(order) {
    if (!window.confirm(t("cancel_order_confirm", "Cancel this pending order? The items will be returned to inventory."))) return;
    try {
      const updated = await api(`/orders/${order._id}/cancel`, { method: "POST" });
      setData(orders.map((item) => (item._id === order._id ? updated : item)));
      notify(t("order_cancelled_success", "Order cancelled. Inventory has been restored."), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "pending": return t("order_pending", "Pending");
      case "confirmed": return t("order_confirmed", "Confirmed");
      case "shipped": return t("order_shipped", "Shipped");
      case "delivered": return t("order_delivered", "Delivered");
      case "cancelled": return t("order_cancelled", "Cancelled");
      default: return status;
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("orders_eyebrow", "The growing history")}</p>
          <h1>{t("orders_h1", "My Orders & Invoices")}</h1>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : !orders.length ? (
        <div className="empty-state">
          <Package size={27} />
          <h2>{t("no_orders_yet", "No orders yet.")}</h2>
          <p>{t("no_orders_desc", "Your next plant might be waiting in the nursery.")}</p>
          <Link to="/shop" className="button">
            {t("start_shopping", "Start shopping")} <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isPrepaid = ["upi", "card", "netbanking"].includes(order.paymentMethod);
            return (
              <article className="order-card" key={order._id}>
                <div className="order-head">
                  <div>
                    <span className="eyebrow">
                      {t("order_label", "Order")} {order.legacyId ? `#${order.legacyId}` : `#${order._id.slice(-7).toUpperCase()}`}
                    </span>
                    <h2>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </h2>
                  </div>
                  <div className="order-head-right">
                    <span className={`status-pill status-${order.status}`}>{getStatusLabel(order.status)}</span>
                    <button
                      type="button"
                      className="button-subtle-pill"
                      onClick={() => setSelectedInvoiceOrder(order)}
                    >
                      <FileText size={14} /> {t("tax_invoice_btn", "Tax Invoice")}
                    </button>
                  </div>
                  <strong>{money(order.totalAmount, settings.currency)}</strong>
                </div>

                <div className="order-summary-details">
                  <span>
                    {t("payment", "Payment")}:{" "}
                    <strong>
                      {order.paymentMethod ? order.paymentMethod.toUpperCase() : t("cod", "COD")}
                    </strong>{" "}
                    ({getStatusLabel(order.paymentStatus || (isPrepaid ? "paid" : "pending"))})
                  </span>
                  {order.discountAmount > 0 && (
                    <span className="order-discount-pill">
                      {t("saved_label", "Saved")}: <strong>{money(order.discountAmount, settings.currency)}</strong> ({order.couponCode})
                    </span>
                  )}
                  {order.trackingNumber && (
                    <span>
                      {t("tracking", "Tracking")}: <strong>{order.trackingNumber}</strong>
                    </span>
                  )}
                </div>

                {order.shippingAddress?.addressLine && (
                  <p className="order-address">
                    {t("delivery_address_label", "Delivering to")}: {order.shippingAddress.fullName}, {order.shippingAddress.addressLine},{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                )}

                <ol className="order-timeline">
                  {(order.statusHistory?.length
                    ? order.statusHistory
                    : [{ status: order.status, note: "Order status" }]
                  ).map((entry, index) => (
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
                      <img src={imageSource(item.image)} alt={formatNameByLanguage(item.name, language)} />
                      <div>
                        <strong>{formatNameByLanguage(item.name, language)}</strong>
                        <span className="muted">
                          {t("quantity", "Qty")} {item.quantity} · {money(item.price, settings.currency)} {t("each_word", "each")}
                        </span>
                      </div>
                      {item.product && (
                        <Link className="text-link" to={`/products/${item.product}#reviews`}>
                          {t("write_review", "Review with photo")} <ArrowUpRight size={15} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                <div className="order-card-actions">
                  <button
                    type="button"
                    className="button-secondary button-sm"
                    onClick={() => setSelectedInvoiceOrder(order)}
                  >
                    <Printer size={15} /> {t("print_invoice_btn", "Print Invoice")}
                  </button>

                  {order.status === "pending" && (
                    <button
                      className="button button-outline cancel-order"
                      onClick={() => cancelOrder(order)}
                    >
                      <XCircle size={16} /> {t("cancel_pending_order", "Cancel Pending Order")}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </main>
  );
}
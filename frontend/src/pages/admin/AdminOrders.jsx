import { useState } from "react";
import { FileText, Printer } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";
import InvoiceModal from "../../components/InvoiceModal.jsx";

const nextStatuses = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const statusLabels = {
  pending: { gu: "પેન્ડિંગ (Pending)", hi: "लंबित (Pending)", en: "Pending" },
  processing: { gu: "પ્રોસેસિંગ (Processing)", hi: "प्रसंस्करण (Processing)", en: "Processing" },
  shipped: { gu: "શિપ થઈ ગયું (Shipped)", hi: "भेज दिया गया (Shipped)", en: "Shipped" },
  delivered: { gu: "ડિલિવર થઈ ગયું (Delivered)", hi: "डिलीवर हो गया (Delivered)", en: "Delivered" },
  cancelled: { gu: "રદ કરેલ (Cancelled)", hi: "रद्द (Cancelled)", en: "Cancelled" },
};

export default function AdminOrders() {
  const { data: orders, loading, setData } = useLoad("/admin/orders", []);
  const { t, language } = useLanguage();
  const notify = useToast();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  async function update(order, status) {
    try {
      const updated = await api(`/admin/orders/${order._id}`, { method: "PATCH", body: { status } });
      setData(orders.map((item) => (item._id === order._id ? { ...item, ...updated } : item)));
      notify(t("order_status_updated", "Order status updated."), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <AdminShell current="/admin/orders">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">{t("customer_activity", "Customer Activity")}</p>
          <h1>{t("admin_orders", "Orders & Dispatch")}</h1>
          <p className="muted">{t("admin_orders_sub", "Manage order fulfillment, delivery status, and view customer tax invoices.")}</p>
        </div>
      </div>

      <DataTable loading={loading} empty={t("no_orders_yet", "No orders have been placed yet.")}>
        <table>
          <thead>
            <tr>
              <th>{t("order_label", "Order")}</th>
              <th>{t("customer_label", "Customer")}</th>
              <th>{t("date_label", "Date")}</th>
              <th>{t("payment", "Payment")}</th>
              <th>{t("tracking", "Tracking")}</th>
              <th>{t("total_label", "Total")}</th>
              <th>{t("status_label", "Status")}</th>
              <th>{t("invoice_label", "Invoice")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <strong>#{order.legacyId || order._id.slice(-7).toUpperCase()}</strong>
                </td>
                <td>
                  <strong>{order.user?.fullName || t("customer_label", "Customer")}</strong>
                  <small className="table-subline">{order.user?.email}</small>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className="badge-pill">
                    {order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}
                  </span>
                </td>
                <td>{order.trackingNumber || "—"}</td>
                <td>
                  <strong>{money(order.totalAmount)}</strong>
                </td>
                <td>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(event) => update(order, event.target.value)}
                  >
                    {[order.status, ...(nextStatuses[order.status] || [])].map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]?.[language] || statusLabels[status]?.["en"] || status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className="button-subtle-pill"
                    onClick={() => setSelectedInvoiceOrder(order)}
                  >
                    <FileText size={14} /> {t("view_btn", "View")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </AdminShell>
  );
}
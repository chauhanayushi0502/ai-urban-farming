import { useState } from "react";
import { FileText, Printer } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
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

export default function AdminOrders() {
  const { data: orders, loading, setData } = useLoad("/admin/orders", []);
  const notify = useToast();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  async function update(order, status) {
    try {
      const updated = await api(`/admin/orders/${order._id}`, { method: "PATCH", body: { status } });
      setData(orders.map((item) => (item._id === order._id ? { ...item, ...updated } : item)));
      notify("Order status updated.", "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <AdminShell current="/admin/orders">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Customer Activity</p>
          <h1>Orders & Dispatch</h1>
          <p className="muted">Manage order fulfillment, delivery status, and view customer tax invoices.</p>
        </div>
      </div>

      <DataTable loading={loading} empty="No orders have been placed yet.">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Tracking</th>
              <th>Total</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <strong>#{order.legacyId || order._id.slice(-7).toUpperCase()}</strong>
                </td>
                <td>
                  <strong>{order.user?.fullName || "Customer"}</strong>
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
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className="button-subtle-pill"
                    onClick={() => setSelectedInvoiceOrder(order)}
                  >
                    <FileText size={14} /> View
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
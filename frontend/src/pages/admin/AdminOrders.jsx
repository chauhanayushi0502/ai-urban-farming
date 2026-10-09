import { useToast } from "../../context/AppContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

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

  async function update(order, status) {
    try {
      const updated = await api(`/admin/orders/${order._id}`, { method: "PATCH", body: { status } });
      setData(orders.map((item) => item._id === order._id ? { ...item, ...updated } : item));
      notify("Order status updated.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">Customer activity</p><h1>Orders</h1></div></div><DataTable loading={loading} empty="No orders have been placed yet."><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Tracking</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{order.legacyId || order._id.slice(-7).toUpperCase()}</td><td>{order.user?.fullName || "Customer"}<small className="table-subline">{order.user?.email}</small></td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{order.trackingNumber || "—"}</td><td>{money(order.totalAmount)}</td><td><select className="status-select" value={order.status} onChange={(event) => update(order, event.target.value)}>{[order.status, ...(nextStatuses[order.status] || [])].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></DataTable></div>;
}
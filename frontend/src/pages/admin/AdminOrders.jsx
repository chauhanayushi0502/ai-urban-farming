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

const statusLabels = {
  pending: "પેન્ડિંગ",
  processing: "પ્રોસેસિંગ",
  shipped: "મોકલાયેલ",
  delivered: "ડિલિવર થયેલ",
  cancelled: "રદ થયેલ",
};

export default function AdminOrders() {
  const { data: orders, loading, setData } = useLoad("/admin/orders", []);
  const notify = useToast();

  async function update(order, status) {
    try {
      const updated = await api(`/admin/orders/${order._id}`, { method: "PATCH", body: { status } });
      setData(orders.map((item) => item._id === order._id ? { ...item, ...updated } : item));
      notify("ઓર્ડર સ્થિતિ અપડેટ થઈ.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">ગ્રાહક પ્રવૃત્તિ</p><h1>ઓર્ડર્સ</h1></div></div><DataTable loading={loading} empty="હજુ સુધી કોઈ ઓર્ડર આપવામાં આવ્યા નથી."><table><thead><tr><th>ઓર્ડર</th><th>ગ્રાહક</th><th>તારીખ</th><th>ટ્રેકિંગ</th><th>કુલ</th><th>સ્થિતિ</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{order.legacyId || order._id.slice(-7).toUpperCase()}</td><td>{order.user?.fullName || "ગ્રાહક"}<small className="table-subline">{order.user?.email}</small></td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{order.trackingNumber || "—"}</td><td>{money(order.totalAmount)}</td><td><select className="status-select" value={order.status} onChange={(event) => update(order, event.target.value)}>{[order.status, ...(nextStatuses[order.status] || [])].map((status) => <option key={status} value={status}>{statusLabels[status] || status}</option>)}</select></td></tr>)}</tbody></table></DataTable></div>;
}
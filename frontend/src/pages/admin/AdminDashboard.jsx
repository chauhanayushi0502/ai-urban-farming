import { Link } from "react-router-dom";
import { Mail, Package, Plus, ShoppingBag, Sprout, Tags, Truck, UserRound, ArrowRight } from "lucide-react";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { money } from "../../lib/format.js";

export default function AdminDashboard() {
  const { data: summary, loading } = useLoad("/admin/summary", {});
  const tiles = [["Customers", summary.users, UserRound], ["Products", summary.products, ShoppingBag], ["Orders", summary.orders, Truck], ["Categories", summary.categories, Tags]];
  if (loading) return <div className="admin-page"><Loading /></div>;
  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">Store overview</p><h1>Dashboard</h1></div></div><div className="metric-grid">{tiles.map(([label, value, Icon]) => <article className="metric" key={label}><div><span>{label}</span><strong>{value ?? 0}</strong></div><Icon size={20} /></article>)}</div><section className="admin-revenue"><div><p className="eyebrow">Order value</p><h2>{money(summary.revenue)}</h2></div><Link to="/admin/orders" className="text-link">Review orders <ArrowRight size={16} /></Link></section><div className="admin-shortcuts"><Link to="/admin/products"><Plus size={18} /> Add a product</Link><Link to="/admin/inventory"><Sprout size={18} /> Update stock</Link><Link to="/admin/messages"><Mail size={18} /> Read messages</Link></div></div>;
}
import { Link } from "react-router-dom";
import { Mail, Package, Plus, ShoppingBag, Sprout, Tags, Truck, UserRound, ArrowRight } from "lucide-react";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { money } from "../../lib/format.js";

export default function AdminDashboard() {
  const { data: summary, loading } = useLoad("/admin/summary", {});
  const tiles = [["ગ્રાહકો", summary.users, UserRound], ["પ્રોડક્ટ્સ", summary.products, ShoppingBag], ["ઓર્ડર્સ", summary.orders, Truck], ["કેટેગરીઝ", summary.categories, Tags]];
  if (loading) return <div className="admin-page"><Loading /></div>;
  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">સ્ટોર ઓવરવ્યૂ</p><h1>ડેશબોર્ડ</h1></div></div><div className="metric-grid">{tiles.map(([label, value, Icon]) => <article className="metric" key={label}><div><span>{label}</span><strong>{value ?? 0}</strong></div><Icon size={20} /></article>)}</div><section className="admin-revenue"><div><p className="eyebrow">ઓર્ડર મૂલ્ય</p><h2>{money(summary.revenue)}</h2></div><Link to="/admin/orders" className="text-link">ઓર્ડર્સ જુઓ <ArrowRight size={16} /></Link></section><div className="admin-shortcuts"><Link to="/admin/products"><Plus size={18} /> પ્રોડક્ટ ઉમેરો</Link><Link to="/admin/inventory"><Sprout size={18} /> સ્ટોક અપડેટ કરો</Link><Link to="/admin/messages"><Mail size={18} /> સંદેશાઓ વાંચો</Link></div></div>;
}
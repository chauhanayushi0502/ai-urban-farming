import { ArrowLeft, Mail, Package, Settings, ShoppingBag, Sprout, Tags, Truck } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const sections = [
  ["/admin", "ઓવરવ્યૂ", Package], ["/admin/products", "પ્રોડક્ટ્સ", ShoppingBag], ["/admin/categories", "કેટેગરીઝ", Tags],
  ["/admin/orders", "ઓર્ડર્સ", Truck], ["/admin/inventory", "ઇન્વેન્ટરી", Sprout], ["/admin/messages", "સંદેશાઓ", Mail], ["/admin/settings", "સેટિંગ્સ", Settings],
];

export default function AdminShell({ children }) {
  return <div className="admin-layout"><aside className="admin-sidebar"><p className="eyebrow">ગ્રીન લીફ</p><h2>નર્સરી એડમિન</h2><nav>{sections.map(([path, title, Icon]) => <NavLink end={path === "/admin"} to={path} key={path}><Icon size={17} />{title}</NavLink>)}</nav><Link to="/" className="admin-store-link"><ArrowLeft size={16} /> સ્ટોર પર પાછા ફરો</Link></aside><div className="admin-content">{children}</div></div>;
}
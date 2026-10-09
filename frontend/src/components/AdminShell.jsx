import { ArrowLeft, Mail, Package, Settings, ShoppingBag, Sprout, Tags, Truck } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const sections = [
  ["/admin", "Overview", Package], ["/admin/products", "Products", ShoppingBag], ["/admin/categories", "Categories", Tags],
  ["/admin/orders", "Orders", Truck], ["/admin/inventory", "Inventory", Sprout], ["/admin/messages", "Messages", Mail], ["/admin/settings", "Settings", Settings],
];

export default function AdminShell({ children }) {
  return <div className="admin-layout"><aside className="admin-sidebar"><p className="eyebrow">Green Leaf</p><h2>Nursery admin</h2><nav>{sections.map(([path, title, Icon]) => <NavLink end={path === "/admin"} to={path} key={path}><Icon size={17} />{title}</NavLink>)}</nav><Link to="/" className="admin-store-link"><ArrowLeft size={16} /> Back to store</Link></aside><div className="admin-content">{children}</div></div>;
}
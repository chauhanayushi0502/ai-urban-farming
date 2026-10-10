import { Link } from "react-router-dom";
import { Mail, Package, Plus, ShoppingBag, Sprout, Tags, Truck, UserRound, ArrowRight, Tag, Settings } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { money } from "../../lib/format.js";

export default function AdminDashboard() {
  const { data: summary, loading } = useLoad("/admin/summary", {});
  const { t } = useLanguage();

  const tiles = [
    [t("admin_customers", "Customers"), summary.users, UserRound, "/admin"],
    [t("admin_products", "Plants & Products"), summary.products, ShoppingBag, "/admin/products"],
    [t("admin_orders", "Orders & Dispatch"), summary.orders, Truck, "/admin/orders"],
    [t("admin_categories", "Categories"), summary.categories, Tags, "/admin/categories"],
  ];

  if (loading) return <AdminShell current="/admin"><Loading /></AdminShell>;

  return (
    <AdminShell current="/admin">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">
            <Package size={15} /> {t("store_overview", "Store Overview")}
          </p>
          <h1>{t("admin_dashboard", "Admin Dashboard")}</h1>
          <p className="muted">
            {t("admin_dashboard_sub", "Real-time summary of nursery inventory, orders, revenue, and customer interactions.")}
          </p>
        </div>
      </div>

      <div className="metric-grid">
        {tiles.map(([label, value, Icon, link]) => (
          <Link to={link} key={label} style={{ textDecoration: "none" }}>
            <article className="metric" style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}>
              <div>
                <span>{label}</span>
                <strong>{value ?? 0}</strong>
              </div>
              <Icon size={22} />
            </article>
          </Link>
        ))}
      </div>

      <section className="admin-revenue" style={{ borderRadius: "8px", marginTop: "24px" }}>
        <div>
          <p className="eyebrow">{t("order_revenue", "Total Order Revenue")}</p>
          <h2>{money(summary.revenue)}</h2>
        </div>
        <Link to="/admin/orders" className="text-link" style={{ fontWeight: 600 }}>
          {t("view_orders", "Manage All Orders")} <ArrowRight size={16} />
        </Link>
      </section>

      <div className="admin-shortcuts" style={{ marginTop: "24px" }}>
        <Link to="/admin/products">
          <Plus size={18} /> {t("add_product", "Add Plant / Product")}
        </Link>
        <Link to="/admin/inventory">
          <Sprout size={18} /> {t("update_stock", "Audit Live Stock")}
        </Link>
        <Link to="/admin/coupons">
          <Tag size={18} /> {t("admin_coupons", "Manage Promo Coupons")}
        </Link>
        <Link to="/admin/messages">
          <Mail size={18} /> {t("read_messages", "Customer Inquiries")}
        </Link>
        <Link to="/admin/settings">
          <Settings size={18} /> {t("admin_settings", "Store Settings")}
        </Link>
      </div>
    </AdminShell>
  );
}
import { Link } from "react-router-dom";
import { Mail, Package, Plus, ShoppingBag, Sprout, Tags, Truck, UserRound, ArrowRight } from "lucide-react";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { money } from "../../lib/format.js";

export default function AdminDashboard() {
  const { data: summary, loading } = useLoad("/admin/summary", {});
  const { t } = useLanguage();

  const tiles = [
    [t("admin_customers", "Customers"), summary.users, UserRound],
    [t("admin_products", "Products"), summary.products, ShoppingBag],
    [t("admin_orders", "Orders"), summary.orders, Truck],
    [t("admin_categories", "Categories"), summary.categories, Tags]
  ];

  if (loading) return <div className="admin-page"><Loading /></div>;

  return (
    <div className="admin-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("store_overview", "Store Overview")}</p>
          <h1>{t("admin_dashboard", "Dashboard")}</h1>
        </div>
      </div>

      <div className="metric-grid">
        {tiles.map(([label, value, Icon]) => (
          <article className="metric" key={label}>
            <div>
              <span>{label}</span>
              <strong>{value ?? 0}</strong>
            </div>
            <Icon size={20} />
          </article>
        ))}
      </div>

      <section className="admin-revenue">
        <div>
          <p className="eyebrow">{t("order_revenue", "Order Revenue")}</p>
          <h2>{money(summary.revenue)}</h2>
        </div>
        <Link to="/admin/orders" className="text-link">
          {t("view_orders", "View orders")} <ArrowRight size={16} />
        </Link>
      </section>

      <div className="admin-shortcuts">
        <Link to="/admin/products"><Plus size={18} /> {t("add_product", "Add product")}</Link>
        <Link to="/admin/inventory"><Sprout size={18} /> {t("update_stock", "Update stock")}</Link>
        <Link to="/admin/messages"><Mail size={18} /> {t("read_messages", "Read messages")}</Link>
      </div>
    </div>
  );
}
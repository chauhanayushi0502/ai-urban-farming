import { ArrowLeft, Mail, Package, Settings, ShoppingBag, Sprout, Tags, Tag, Truck, Globe } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function AdminShell({ children }) {
  const { t, language, setLanguage, LANGUAGES } = useLanguage();

  const sections = [
    ["/admin", t("admin_overview", "Overview"), Package],
    ["/admin/products", t("admin_products", "Products"), ShoppingBag],
    ["/admin/categories", t("admin_categories", "Categories"), Tags],
    ["/admin/orders", t("admin_orders", "Orders"), Truck],
    ["/admin/coupons", t("admin_coupons", "Coupons"), Tag],
    ["/admin/inventory", t("admin_inventory", "Inventory"), Sprout],
    ["/admin/messages", t("admin_messages", "Messages"), Mail],
    ["/admin/settings", t("admin_settings", "Settings"), Settings],
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="eyebrow">{t("site_name", "Green Leaf")}</p>
        <h2>{t("admin_title", "Nursery Admin")}</h2>

        {/* Dedicated Admin Language Switcher */}
        <div className="admin-lang-box">
          <div className="admin-lang-label">
            <Globe size={13} />
            <span>{language === "gu" ? "એડમિન ભાષા" : language === "hi" ? "एडमिन भाषा" : "Admin Language"}</span>
          </div>
          <div className="admin-lang-pills">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`admin-lang-pill ${language === l.code ? "active" : ""}`}
                onClick={() => setLanguage(l.code)}
                title={l.label}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <nav>
          {sections.map(([path, title, Icon]) => (
            <NavLink end={path === "/admin"} to={path} key={path}>
              <Icon size={17} />
              {title}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="admin-store-link">
          <ArrowLeft size={16} /> {t("back_to_store", "Back to store")}
        </Link>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}

export { AdminShell };

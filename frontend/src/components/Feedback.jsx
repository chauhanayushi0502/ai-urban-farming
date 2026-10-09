import { CircleAlert, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function Loading() {
  const { t } = useLanguage();
  return (
    <div className="loading-state">
      <span className="loader" />
      <span>{t("loading_page", "Loading your page...")}</span>
    </div>
  );
}

export function Notice({ title, text }) {
  const { t } = useLanguage();
  return (
    <section className="empty-state">
      <CircleAlert size={25} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button button-outline" to="/">
        {t("back_to_store", "Back to store")}
      </Link>
    </section>
  );
}

export function DataTable({ loading, empty, children }) {
  if (loading) return <div className="table-shell"><Loading /></div>;
  function hasRows(node) {
    if (Array.isArray(node)) return node.some(hasRows);
    if (!node || typeof node !== "object") return false;
    if (node.type === "tbody") return Array.isArray(node.props.children) ? node.props.children.length > 0 : Boolean(node.props.children);
    if (node.type === "article") return true;
    return hasRows(node.props.children);
  }
  return <div className="table-shell">{children}{!hasRows(children) && <p className="table-empty">{empty}</p>}</div>;
}

export function NotFound() {
  const { t } = useLanguage();
  return (
    <main className="page">
      <section className="empty-state">
        <Sprout size={26} />
        <h1>{t("page_not_found", "This page is not available.")}</h1>
        <Link className="button" to="/">
          {t("back_to_nursery", "Back to nursery")}
        </Link>
      </section>
    </main>
  );
}
import { CircleAlert, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export function Loading() {
  return <div className="loading-state"><span className="loader" /><span>તમારું પૃષ્ઠ લોડ થઈ રહ્યું છે...</span></div>;
}

export function Notice({ title, text }) {
  return <section className="empty-state"><CircleAlert size={25} /><h2>{title}</h2><p>{text}</p><Link className="button button-outline" to="/">સ્ટોર પર પાછા ફરો</Link></section>;
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
  return <main className="page"><section className="empty-state"><Sprout size={26} /><h1>આ પૃષ્ઠ ઉપલબ્ધ નથી.</h1><Link className="button" to="/">નર્સરી પર પાછા ફરો</Link></section></main>;
}
import { ArrowRight, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { Loading, Notice } from "./Feedback.jsx";
import AdminShell from "./AdminShell.jsx";

export function Protected({ children }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user) return <NavigateToLogin path={location.pathname} />;
  return children;
}

export function AdminProtected({ children }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user) return <NavigateToLogin path={location.pathname} />;
  if (user.role !== "admin") return <main className="page"><Notice title="Administrator access required" text="Sign in with an administrator account to open this page." /></main>;
  return <AdminShell>{children}</AdminShell>;
}

function NavigateToLogin({ path }) {
  return <main className="page"><section className="empty-state"><UserRound size={25} /><h1>Sign in to continue</h1><p>Your account keeps your cart, orders, and saved plants together.</p><Link className="button" to={`/login?redirect=${encodeURIComponent(path)}`}>Sign in <ArrowRight size={17} /></Link></section></main>;
}
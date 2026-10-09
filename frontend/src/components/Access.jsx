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
  if (user.role !== "admin") return <main className="page"><Notice title="એડમિનિસ્ટ્રેટર એક્સેસ જરૂરી છે" text="આ પેજ ખોલવા માટે એડમિનિસ્ટ્રેટર એકાઉન્ટ વડે સાઇન ઇન કરો." /></main>;
  return <AdminShell>{children}</AdminShell>;
}

function NavigateToLogin({ path }) {
  return <main className="page"><section className="empty-state"><UserRound size={25} /><h1>આગળ વધવા સાઇન ઇન કરો</h1><p>તમારું એકાઉન્ટ તમારું કાર્ટ, ઓર્ડર અને સાચવેલા છોડ એકસાથે રાખે છે.</p><Link className="button" to={`/login?redirect=${encodeURIComponent(path)}`}>સાઇન ઇન કરો <ArrowRight size={17} /></Link></section></main>;
}
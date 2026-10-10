import { ArrowRight, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Loading, Notice } from "./Feedback.jsx";

export function Protected({ children }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user) return <NavigateToLogin path={location.pathname} />;
  return children;
}

export function AdminProtected({ children }) {
  const { user, ready } = useApp();
  const { t } = useLanguage();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user) return <NavigateToLogin path={location.pathname} />;
  if (user.role !== "admin") {
    return (
      <main className="page">
        <Notice 
          title={t("admin_access_required", "Administrator Access Required")} 
          text={t("admin_access_desc", "Sign in with an administrator account to view this page.")} 
        />
      </main>
    );
  }
  return children;
}

function NavigateToLogin({ path }) {
  const { t } = useLanguage();
  return (
    <main className="page">
      <section className="empty-state">
        <UserRound size={25} />
        <h1>{t("signin_to_continue", "Sign in to continue")}</h1>
        <p>{t("account_keeps_together", "Your account keeps your cart, orders, and saved plants together.")}</p>
        <Link className="button" to={`/login?redirect=${encodeURIComponent(path)}`}>
          {t("nav_signin", "Sign in")} <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
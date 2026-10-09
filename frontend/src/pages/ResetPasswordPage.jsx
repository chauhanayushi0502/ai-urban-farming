import { useState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      await api("/auth/reset-password", { method: "POST", body: { token: params.get("token"), password } });
      navigate("/login?reset=complete");
    } catch (reason) { 
      setError(reason.message); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-image">
        <div>
          <p className="eyebrow">{t("account_help", "Account Help")}</p>
          <h1>{t("fresh_start_1", "Fresh")}<br /><em>{t("fresh_start_2", "start.")}</em></h1>
        </div>
      </section>
      <section className="auth-panel">
        <p className="eyebrow">{t("brand_sub", "PLANT NURSERY")}</p>
        <h2>{t("choose_new_password", "Choose a new password")}</h2>
        <p className="muted">{t("min_8_chars", "Use at least eight characters.")}</p>

        {error && <div className="form-error"><CircleAlert size={17} />{error}</div>}

        <form className="form-stack" onSubmit={submit}>
          <label>
            {t("new_password", "New Password")}
            <input name="password" type="password" autoComplete="new-password" minLength="8" required />
          </label>
          <button className="button" disabled={busy}>
            {busy ? t("updating_word", "Updating…") : t("update_password", "Update password")}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/login">{t("back_to_login", "Back to sign in")}</Link>
        </p>
      </section>
    </main>
  );
}
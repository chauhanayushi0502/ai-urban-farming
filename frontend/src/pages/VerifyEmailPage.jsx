import { useEffect, useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const [state, setState] = useState({ loading: true, message: "", error: "" });

  useEffect(() => {
    let active = true;
    api("/auth/verify-email", { method: "POST", body: { token: params.get("token") } })
      .then((result) => active && setState({ loading: false, message: result.message, error: "" }))
      .catch((reason) => active && setState({ loading: false, message: "", error: reason.message }))
      .catch(() => {});
    return () => { active = false; };
  }, [params]);

  return (
    <main className="page">
      <section className="empty-state">
        {state.loading ? <span className="loader" /> : state.error ? <CircleAlert size={25} /> : <Check size={25} />}
        <h1>
          {state.loading 
            ? t("verifying_email", "Verifying email…") 
            : state.error 
              ? t("verification_link_invalid", "Verification link unavailable") 
              : t("email_verified", "Email verified")}
        </h1>
        {!state.loading && <p>{state.error || state.message}</p>}
        {!state.loading && (
          <Link className="button" to="/login">{t("proceed_to_signin", "Proceed to sign in")}</Link>
        )}
      </section>
    </main>
  );
}
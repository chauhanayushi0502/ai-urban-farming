import { useState } from "react";
import { ArrowRight, Check, CircleAlert, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, setUser, ready, notify } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetComplete = params.get("reset") === "complete";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  if (ready && user) {
    return (
      <main className="page">
        <section className="empty-state">
          <Check size={25} />
          <h1>{t("already_signed_in", "You are already signed in.")}</h1>
          <Link className="button" to="/profile">{t("go_to_profile", "Go to your profile")}</Link>
        </section>
      </main>
    );
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const result = await api(`/auth/${isRegister ? "register" : "login"}`, { method: "POST", body: payload });
      if (result.verificationRequired) {
        setVerificationEmail(payload.email);
        return;
      }
      setUser(result.user);
      notify(isRegister ? t("welcome_to_nursery", "Welcome to Green Leaf Nursery.") : `${t("welcome_back", "Welcome back")}, ${result.user.fullName.split(" ")[0]}.`);
      const redirect = params.get("redirect");
      navigate(redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : result.user.role === "admin" ? "/admin" : "/");
    } catch (reason) { 
      setError(reason.message); 
    } finally { 
      setBusy(false); 
    }
  }

  async function resendVerification() {
    try {
      const result = await api("/auth/resend-verification", { method: "POST", body: { email: verificationEmail } });
      notify(result.message);
    } catch (reason) { 
      setError(reason.message); 
    }
  }

  if (verificationEmail) {
    return (
      <main className="auth-page">
        <section className="auth-image">
          <div>
            <p className="eyebrow">{t("final_step", "Final Step")}</p>
            <h1>{t("check_inbox", "Check your inbox.")}</h1>
          </div>
        </section>
        <section className="auth-panel">
          <Mail size={24} />
          <h2>{t("verify_email", "Verify Your Email")}</h2>
          <p className="muted">{t("verify_email_sent", "We sent a verification link to")} {verificationEmail}. {t("verify_email_follow", "Follow it before signing in.")}</p>
          {error && <div className="form-error"><CircleAlert size={17} />{error}</div>}
          <button className="button button-outline" onClick={resendVerification}>{t("resend_link", "Resend verification link")}</button>
          <p className="auth-switch"><Link to="/login">{t("back_to_login", "Back to sign in")}</Link></p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-image">
        <div>
          <p className="eyebrow">{t("green_welcome", "Green Welcome")}</p>
          <h1>{t("hero_h1_line1", "Bring a little")}<br /><em>{t("hero_h1_line2", "green home.")}</em></h1>
        </div>
      </section>
      
      <section className="auth-panel">
        <p className="eyebrow">{t("brand_sub", "PLANT NURSERY")}</p>
        <h2>{isRegister ? t("create_account_title", "Create your account") : t("welcome_back_title", "Welcome back")}</h2>
        <p className="muted">
          {isRegister 
            ? t("create_account_desc", "Your next favorite plant is right around the corner.") 
            : t("welcome_back_desc", "Sign in to continue caring for your garden.")}
        </p>

        {resetComplete && <div className="form-success">{t("password_updated", "Password updated. Sign in with your new password.")}</div>}
        {error && <div className="form-error"><CircleAlert size={17} />{error}</div>}

        <form onSubmit={submit} className="form-stack">
          {isRegister && (
            <label>
              {t("full_name", "Full Name")}
              <input name="fullName" autoComplete="name" required maxLength="100" />
            </label>
          )}

          <label>
            {t("email_address", "Email Address")}
            <input name="email" type={isRegister ? "email" : "text"} inputMode="email" autoComplete="email" required />
          </label>

          <label>
            {t("password", "Password")}
            <input 
              name="password" 
              type="password" 
              autoComplete={isRegister ? "new-password" : "current-password"} 
              minLength={isRegister ? 8 : undefined} 
              required 
            />
          </label>

          {isRegister && (
            <>
              <label>
                {t("phone_number", "Phone")} <span className="optional">{t("optional", "optional")}</span>
                <input name="phone" autoComplete="tel" />
              </label>
              <label>
                {t("street_address", "Address")} <span className="optional">{t("optional", "optional")}</span>
                <textarea name="address" autoComplete="street-address" rows="2" />
              </label>
            </>
          )}

          <button className="button auth-submit" disabled={busy}>
            {busy ? t("please_wait", "Please wait…") : isRegister ? t("create_account_btn", "Create account") : t("signin_btn", "Sign in")}
            <ArrowRight size={17} />
          </button>
        </form>

        {!isRegister && (
          <p className="auth-switch">
            <Link to="/forgot-password">{t("forgot_password", "Forgot password?")}</Link>
          </p>
        )}

        <p className="auth-switch">
          {isRegister ? t("already_have_account", "Already have an account?") : t("new_to_nursery", "New to the nursery?")}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? t("signin_btn", "Sign in") : t("create_account_btn", "Create account")}
          </Link>
        </p>
      </section>
    </main>
  );
}
import { useState } from "react";
import { ArrowRight, Check, CircleAlert, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, setUser, ready, notify } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetComplete = params.get("reset") === "complete";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  if (ready && user) return <main className="page"><section className="empty-state"><Check size={25} /><h1>You’re already signed in.</h1><Link className="button" to="/profile">Go to your profile</Link></section></main>;

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
      notify(isRegister ? "Welcome to Green Leaf." : `Welcome back, ${result.user.fullName.split(" ")[0]}.`);
      const redirect = params.get("redirect");
      navigate(redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : result.user.role === "admin" ? "/admin" : "/");
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }

  async function resendVerification() {
    try {
      const result = await api("/auth/resend-verification", { method: "POST", body: { email: verificationEmail } });
      notify(result.message);
    } catch (reason) { setError(reason.message); }
  }

  if (verificationEmail) return <main className="auth-page"><section className="auth-image"><div><p className="eyebrow">One last step</p><h1>Check your<br /><em>inbox.</em></h1></div></section><section className="auth-panel"><Mail size={24} /><h2>Verify your email</h2><p className="muted">We sent an account verification link to {verificationEmail}. Follow it before signing in.</p>{error && <div className="form-error"><CircleAlert size={17} />{error}</div>}<button className="button button-outline" onClick={resendVerification}>Resend verification email</button><p className="auth-switch"><Link to="/login">Return to sign in</Link></p></section></main>;

  return <main className="auth-page"><section className="auth-image"><div><p className="eyebrow">A growing kind of welcome</p><h1>Make room<br />for <em>green.</em></h1></div></section><section className="auth-panel"><p className="eyebrow">Green Leaf Plant Nursery</p><h2>{isRegister ? "Create your account" : "Welcome back"}</h2><p className="muted">{isRegister ? "Your next favorite plant is just around the corner." : "Sign in to pick up where your garden left off."}</p>{resetComplete && <div className="form-success">Your password was updated. Sign in with your new password.</div>}{error && <div className="form-error"><CircleAlert size={17} />{error}</div>}<form onSubmit={submit} className="form-stack">{isRegister && <label>Full name<input name="fullName" autoComplete="name" required maxLength="100" /></label>}<label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} required /></label>{isRegister && <><label>Phone <span className="optional">Optional</span><input name="phone" autoComplete="tel" /></label><label>Address <span className="optional">Optional</span><textarea name="address" autoComplete="street-address" rows="2" /></label></>}<button className="button auth-submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}<ArrowRight size={17} /></button></form>{!isRegister && <p className="auth-switch"><Link to="/forgot-password">Forgot password?</Link></p>}<p className="auth-switch">{isRegister ? "Already have an account?" : "New to the nursery?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p></section></main>;
}
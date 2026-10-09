import { useState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const email = new FormData(event.currentTarget).get("email");
    try { const result = await api("/auth/forgot-password", { method: "POST", body: { email } }); setMessage(result.message); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-image"><div><p className="eyebrow">Account help</p><h1>Find your<br /><em>way back.</em></h1></div></section><section className="auth-panel"><p className="eyebrow">Green Leaf Plant Nursery</p><h2>Reset your password</h2><p className="muted">Enter your account email and we’ll send a reset link.</p>{error && <div className="form-error"><CircleAlert size={17} />{error}</div>}{message ? <div className="form-success">{message}</div> : <form className="form-stack" onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" required /></label><button className="button" disabled={busy}>{busy ? "Sending…" : "Send reset link"}<ArrowRight size={17} /></button></form>}<p className="auth-switch"><Link to="/login">Back to sign in</Link></p></section></main>;
}
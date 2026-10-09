import { useState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
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
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-image"><div><p className="eyebrow">Account help</p><h1>Start<br /><em>fresh.</em></h1></div></section><section className="auth-panel"><p className="eyebrow">Green Leaf Plant Nursery</p><h2>Choose a new password</h2><p className="muted">Use at least eight characters.</p>{error && <div className="form-error"><CircleAlert size={17} />{error}</div>}<form className="form-stack" onSubmit={submit}><label>New password<input name="password" type="password" autoComplete="new-password" minLength="8" required /></label><button className="button" disabled={busy}>{busy ? "Updating…" : "Update password"}<ArrowRight size={17} /></button></form><p className="auth-switch"><Link to="/login">Back to sign in</Link></p></section></main>;
}
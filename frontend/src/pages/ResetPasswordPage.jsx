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

  return <main className="auth-page"><section className="auth-image"><div><p className="eyebrow">એકાઉન્ટ મદદ</p><h1>નવી<br /><em>શરૂઆત.</em></h1></div></section><section className="auth-panel"><p className="eyebrow">ગ્રીન લીફ પ્લાન્ટ નર્સરી</p><h2>નવો પાસવર્ડ પસંદ કરો</h2><p className="muted">ઓછામાં ઓછા આઠ અક્ષરોનો ઉપયોગ કરો.</p>{error && <div className="form-error"><CircleAlert size={17} />{error}</div>}<form className="form-stack" onSubmit={submit}><label>નવો પાસવર્ડ<input name="password" type="password" autoComplete="new-password" minLength="8" required /></label><button className="button" disabled={busy}>{busy ? "અપડેટ થઈ રહ્યું છે…" : "પાસવર્ડ અપડેટ કરો"}<ArrowRight size={17} /></button></form><p className="auth-switch"><Link to="/login">સાઇન ઇન પર પાછા ફરો</Link></p></section></main>;
}
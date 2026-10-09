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

  return <main className="auth-page"><section className="auth-image"><div><p className="eyebrow">એકાઉન્ટ મદદ</p><h1>તમારો રસ્તો<br /><em>શોધો.</em></h1></div></section><section className="auth-panel"><p className="eyebrow">ગ્રીન લીફ પ્લાન્ટ નર્સરી</p><h2>પાસવર્ડ રીસેટ કરો</h2><p className="muted">તમારું એકાઉન્ટ ઇમેઇલ દાખલ કરો અને અમે રીસેટ લિંક મોકલીશું.</p>{error && <div className="form-error"><CircleAlert size={17} />{error}</div>}{message ? <div className="form-success">{message}</div> : <form className="form-stack" onSubmit={submit}><label>ઇમેઇલ સરનામું<input name="email" type="email" autoComplete="email" required /></label><button className="button" disabled={busy}>{busy ? "મોકલાઈ રહ્યું છે…" : "રીસેટ લિંક મોકલો"}<ArrowRight size={17} /></button></form>}<p className="auth-switch"><Link to="/login">સાઇન ઇન પર પાછા ફરો</Link></p></section></main>;
}
import { useState } from "react";
import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

export default function ContactPage() {
  const { settings } = useApp();
  const notify = useToast();
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { await api("/contact", { method: "POST", body: values }); event.currentTarget.reset(); notify("આભાર. તમારો સંદેશ મળી ગયો છે."); }
    catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  return <main className="page contact-page"><div className="page-heading"><div><p className="eyebrow">અમે મદદ માટે તૈયાર છીએ</p><h1>અમારી સાથે છોડ વિશે વાત કરો.</h1><p className="muted">ઓર્ડર વિશે અથવા યોગ્ય છોડ પસંદ કરવા અંગે પ્રશ્નો છે? અમને સંદેશ મોકલો.</p></div></div><div className="contact-layout"><section className="contact-details"><p><MapPin size={18} /><span><strong>મુલાકાત લો</strong>{settings.address}</span></p><p><Mail size={18} /><span><strong>ઇમેઇલ</strong><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></span></p><p><Phone size={18} /><span><strong>ફોન કરો</strong><a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a></span></p><p><Clock3 size={18} /><span><strong>સમય</strong>સવારે 9 થી સાંજે 7, સોમવાર થી શનિવાર</span></p></section><form className="contact-form form-stack" onSubmit={submit}><label>તમારું નામ<input name="name" required maxLength="100" /></label><label>ઇમેઇલ સરનામું<input name="email" type="email" required /></label><label>અમે કેવી રીતે મદદ કરી શકીએ?<textarea name="message" rows="5" required maxLength="3000" /></label><button className="button" disabled={busy}>સંદેશ મોકલો <ArrowRight size={17} /></button></form></div></main>;
}
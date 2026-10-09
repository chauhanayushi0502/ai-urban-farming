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
    try { await api("/contact", { method: "POST", body: values }); event.currentTarget.reset(); notify("Thanks. Your message has been received."); }
    catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  return <main className="page contact-page"><div className="page-heading"><div><p className="eyebrow">We’re here to help</p><h1>Talk plants with us.</h1><p className="muted">Questions about an order or choosing the right plant? Send us a note.</p></div></div><div className="contact-layout"><section className="contact-details"><p><MapPin size={18} /><span><strong>Visit</strong>{settings.address}</span></p><p><Mail size={18} /><span><strong>Email</strong><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></span></p><p><Phone size={18} /><span><strong>Call</strong><a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a></span></p><p><Clock3 size={18} /><span><strong>Hours</strong>9 AM – 7 PM, Monday to Saturday</span></p></section><form className="contact-form form-stack" onSubmit={submit}><label>Your name<input name="name" required maxLength="100" /></label><label>Email address<input name="email" type="email" required /></label><label>How can we help?<textarea name="message" rows="5" required maxLength="3000" /></label><button className="button" disabled={busy}>Send message <ArrowRight size={17} /></button></form></div></main>;
}
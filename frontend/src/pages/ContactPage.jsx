import { useState } from "react";
import { ArrowRight, Clock3, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

export default function ContactPage() {
  const { user, settings } = useApp();
  const notify = useToast();
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!user) {
      return notify("Please sign in to send a message.", "error");
    }
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api("/contact", { method: "POST", body: values });
      event.currentTarget.reset();
      notify("Thanks. Your message has been received.");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page contact-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">We’re here to help</p>
          <h1>Talk plants with us.</h1>
          <p className="muted">Questions about an order or choosing the right plant? Send us a note.</p>
        </div>
      </div>
      <div className="contact-layout">
        <section className="contact-details">
          <p><MapPin size={18} /><span><strong>Visit</strong>{settings.address}</span></p>
          <p><Mail size={18} /><span><strong>Email</strong><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></span></p>
          <p><Phone size={18} /><span><strong>Call</strong><a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a></span></p>
          <p><Clock3 size={18} /><span><strong>Hours</strong>9 AM – 7 PM, Monday to Saturday</span></p>
        </section>
        {user ? (
          <form className="contact-form form-stack" onSubmit={submit}>
            <label>Your name<input name="name" defaultValue={user.fullName || ""} required maxLength="100" /></label>
            <label>Email address<input name="email" type="email" defaultValue={user.email || ""} required /></label>
            <label>How can we help?<textarea name="message" rows="5" required maxLength="3000" placeholder="Write your inquiry or question..." /></label>
            <button className="button" disabled={busy}>Send message <ArrowRight size={17} /></button>
          </form>
        ) : (
          <div className="contact-form form-stack" style={{ background: "white", padding: "28px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <UserRound size={32} color="var(--green)" />
            <h3 style={{ margin: "10px 0 6px" }}>Sign in to send a message</h3>
            <p className="muted" style={{ fontSize: "14px", margin: "0 0 16px" }}>
              You can view our nursery contact info anytime. To send an inquiry to our expert gardening team, please sign in to your account.
            </p>
            <Link to="/login?redirect=/contact" className="button" style={{ display: "inline-flex", width: "fit-content" }}>
              Sign in to send message <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
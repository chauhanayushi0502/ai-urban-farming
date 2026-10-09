import { useState } from "react";
import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function ContactPage() {
  const { settings } = useApp();
  const { t } = useLanguage();
  const notify = useToast();
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { 
      await api("/contact", { method: "POST", body: values }); 
      event.currentTarget.reset(); 
      notify(t("contact_success_msg", "Thank you. Your message has been received.")); 
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
          <p className="eyebrow">{t("contact_eyebrow", "We're here to help")}</p>
          <h1>{t("contact_h1", "Talk plants with us.")}</h1>
          <p className="muted">{t("contact_desc", "Have questions about an order or choosing the right plant? Send us a message.")}</p>
        </div>
      </div>

      <div className="contact-layout">
        <section className="contact-details">
          <p>
            <MapPin size={18} />
            <span>
              <strong>{t("visit_us", "Visit us")}</strong>
              {settings.address || "Green Leaf Nursery, Main Road"}
            </span>
          </p>
          <p>
            <Mail size={18} />
            <span>
              <strong>{t("email_us", "Email us")}</strong>
              <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
            </span>
          </p>
          <p>
            <Phone size={18} />
            <span>
              <strong>{t("call_us", "Call us")}</strong>
              <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>
            </span>
          </p>
          <p>
            <Clock3 size={18} />
            <span>
              <strong>{t("hours_label", "Hours")}</strong>
              {t("working_hours", "9:00 AM - 7:00 PM, Mon to Sat")}
            </span>
          </p>
        </section>

        <form className="contact-form form-stack" onSubmit={submit}>
          <label>
            {t("your_name", "Your name")}
            <input name="name" required maxLength="100" />
          </label>
          <label>
            {t("email_address", "Email address")}
            <input name="email" type="email" required />
          </label>
          <label>
            {t("how_can_we_help", "How can we help?")}
            <textarea name="message" rows="5" required maxLength="3000" />
          </label>
          <button className="button" disabled={busy}>
            {t("send_message", "Send message")} <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </main>
  );
}
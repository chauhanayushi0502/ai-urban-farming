import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { Loading } from "../../components/Feedback.jsx";

export default function AdminMessages() {
  const { data: messages, loading } = useLoad("/admin/messages", []);
  const { t } = useLanguage();

  return (
    <AdminShell current="/admin/messages">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">
            <Mail size={15} /> {t("customer_inquiries", "Customer Inquiries")}
          </p>
          <h1>{t("admin_messages", "Contact Messages")}</h1>
          <p className="muted">
            {t("admin_messages_sub", "Questions, custom nursery requests, and feedback submitted by visitors.")}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : !messages.length ? (
        <section className="empty-state">
          <h2>{t("no_messages_yet", "No messages received yet.")}</h2>
          <p>{t("no_messages_sub", "Messages submitted through the store contact form will appear here.")}</p>
          <Link className="button button-outline" to="/">
            {t("back_to_store", "Back to store")}
          </Link>
        </section>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <article key={message._id}>
              <div>
                <strong>{message.name}</strong>
                <a href={`mailto:${message.email}`}>{message.email}</a>
                <time>{new Date(message.createdAt).toLocaleString()}</time>
              </div>
              <p>{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
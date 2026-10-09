import { useState } from "react";
import { ArrowRight, Heart, MapPin, Package, Pencil, Phone, Sprout, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";

export default function ProfilePage() {
  const { user, refreshUser, notify } = useApp();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || "", address: user.address || "" });

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try { 
      await api("/auth/profile", { method: "PATCH", body: form }); 
      await refreshUser(); 
      setEditing(false); 
      notify(t("profile_updated", "Profile updated.")); 
    } catch (error) { 
      notify(error.message, "error"); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("your_account", "Your account")}</p>
          <h1>{t("nav_profile", "My Profile")}</h1>
        </div>
        <button className="button button-outline" onClick={() => setEditing(!editing)}>
          <Pencil size={16} />
          {editing ? t("cancel_edit", "Cancel edit") : t("edit_profile", "Edit profile")}
        </button>
      </div>

      <div className="profile-layout">
        <section className="profile-panel">
          <div className="profile-avatar">
            {user.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
          </div>

          {editing ? (
            <form onSubmit={save} className="form-stack">
              <label>
                {t("full_name", "Full Name")}
                <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
              </label>
              <label>
                {t("email_address", "Email")}
                <input value={user.email} disabled />
              </label>
              <label>
                {t("phone_number", "Phone")}
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label>
                {t("street_address", "Address")}
                <textarea rows="3" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </label>
              <button className="button" disabled={busy}>
                {t("save_changes", "Save changes")}
              </button>
            </form>
          ) : (
            <>
              <h2>{user.fullName}</h2>
              <p className="muted">{user.email}</p>

              <div className="profile-details">
                <p><Phone size={16} />{user.phone || t("no_phone_added", "No phone number added")}</p>
                <p><MapPin size={16} />{user.address || t("no_address_added", "No address added")}</p>
                <p><UserRound size={16} />{user.role === "admin" ? t("administrator", "Administrator") : t("customer_account", "Customer Account")}</p>
              </div>

              <div className="profile-links">
                <Link to="/orders"><Package size={18} /> {t("order_history", "Order history")} <ArrowRight size={16} /></Link>
                <Link to="/wishlist"><Heart size={18} /> {t("saved_plants", "Saved plants")} <ArrowRight size={16} /></Link>
              </div>
            </>
          )}
        </section>

        <section className="profile-aside">
          <Sprout size={22} />
          <p className="eyebrow">{t("plant_notes", "Plant notes")}</p>
          <h3>{t("care_goes_long_way", "A little care goes a long way.")}</h3>
          <p className="muted">{t("plant_notes_desc", "Use our AI Garden Doctor for quick diagnosis and care routines whenever a leaf looks off.")}</p>
          <Link to="/garden" className="text-link">
            {t("ai_banner_btn", "Open AI Garden Doctor")} <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
import { Settings } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useApp, useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";

const fields = [
  ["site_name", "Store / Nursery Name", "સાઇટનું નામ", "स्टोर / नर्सरी का नाम"],
  ["contact_email", "Support & Contact Email", "સંપર્ક ઇમેઇલ", "संपर्क एवं सहायता ईमेल"],
  ["contact_phone", "Helpline Phone Number", "ફોન નંબર", "हेल्पलाइन फ़ोन नंबर"],
  ["address", "Nursery Physical Address", "સરનામું", "नर्सरी का पता"],
  ["currency", "Currency Symbol", "ચલણ પ્રતીક", "मुद्रा प्रतीक"],
  ["shipping_charge", "Standard Shipping Charge (₹)", "શિપિંગ ચાર્જ (₹)", "शिपिंग शुल्क (₹)"],
  ["tax_rate", "GST / Tax Rate (%)", "ટેક્સ દર (%)", "जीएसटी / टैक्स दर (%)"],
  ["facebook", "Facebook Page URL", "ફેસબુક URL", "फेसबुक पेज URL"],
  ["instagram", "Instagram Profile URL", "ઇન્સ્ટાગ્રામ URL", "इंस्टाग्राम प्रोफ़ाइल URL"],
  ["twitter", "Twitter/X URL", "ટ્વિટર URL", "ट्विटर/X URL"],
  ["gemini_api_key", "Google Gemini AI API Key (AI Plant Doctor)", "Google Gemini AI API Key", "Google Gemini AI API Key"],
];

export default function AdminSettings() {
  const { setSettings } = useApp();
  const { data: settings, loading } = useLoad("/settings", {});
  const { t, language } = useLanguage();
  const notify = useToast();

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const saved = await api("/admin/settings", { method: "PUT", body: values });
      setSettings(saved);
      notify(t("settings_saved", "Store settings saved successfully."), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <AdminShell current="/admin/settings">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">
            <Settings size={15} /> {t("store_configuration", "Store Configuration")}
          </p>
          <h1>{t("admin_settings", "Settings & Preferences")}</h1>
          <p className="muted">
            {t("admin_settings_sub", "Manage nursery contact info, AI vision API keys, shipping rates, and social handles.")}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <form className="admin-form settings-form" onSubmit={submit} style={{ maxWidth: "860px" }}>
          <div className="admin-form-grid">
            {fields.map(([key, labelEn, labelGu, labelHi]) => (
              <label key={key} className={key === "address" || key === "gemini_api_key" ? "wide-field" : ""}>
                {language === "gu" ? labelGu : language === "hi" ? labelHi : labelEn}
                <input
                  name={key}
                  defaultValue={settings[key] || ""}
                  placeholder={key === "gemini_api_key" ? "AIzaSy..." : undefined}
                  type={
                    key === "gemini_api_key"
                      ? "password"
                      : key.includes("email")
                      ? "email"
                      : key.includes("url")
                      ? "url"
                      : key.includes("charge") || key.includes("rate")
                      ? "number"
                      : "text"
                  }
                  step={key.includes("charge") || key.includes("rate") ? "0.01" : undefined}
                />
              </label>
            ))}
          </div>
          <div style={{ marginTop: "20px" }}>
            <button className="button">{t("save_settings_btn", "Save Store Settings")}</button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
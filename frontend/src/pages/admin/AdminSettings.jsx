import { useApp, useToast } from "../../context/AppContext.jsx";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";

const fields = [["site_name", "Site name"], ["contact_email", "Contact email"], ["contact_phone", "Phone"], ["address", "Address"], ["facebook", "Facebook URL"], ["instagram", "Instagram URL"], ["twitter", "Twitter URL"], ["currency", "Currency symbol"], ["shipping_charge", "Shipping charge"], ["tax_rate", "Tax rate (%)"]];

export default function AdminSettings() {
  const { setSettings } = useApp();
  const { data: settings, loading } = useLoad("/settings", {});
  const notify = useToast();

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const saved = await api("/admin/settings", { method: "PUT", body: values });
      setSettings(saved);
      notify("Settings saved.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">Store preferences</p><h1>Settings</h1></div></div>{loading ? <Loading /> : <form className="admin-form settings-form" onSubmit={submit}><div className="admin-form-grid">{fields.map(([key, label]) => <label key={key} className={key === "address" ? "wide-field" : ""}>{label}<input name={key} defaultValue={settings[key] || ""} type={key.includes("email") ? "email" : key.includes("url") ? "url" : key.includes("charge") || key.includes("rate") ? "number" : "text"} step={key.includes("charge") || key.includes("rate") ? "0.01" : undefined} /></label>)}</div><button className="button">Save settings</button></form>}</div>;
}
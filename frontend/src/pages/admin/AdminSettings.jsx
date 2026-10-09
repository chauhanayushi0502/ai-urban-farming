import { useApp, useToast } from "../../context/AppContext.jsx";
import { Loading } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";

const fields = [
  ["site_name", "સાઇટનું નામ"], ["contact_email", "સંપર્ક ઇમેઇલ"], ["contact_phone", "ફોન"],
  ["address", "સરનામું"], ["facebook", "ફેસબુક URL"], ["instagram", "ઇન્સ્ટાગ્રામ URL"],
  ["twitter", "ટ્વિટર URL"], ["currency", "ચલણ પ્રતીક"], ["shipping_charge", "શિપિંગ ચાર્જ"], ["tax_rate", "ટેક્સ દર (%)"]
];

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
      notify("સેટિંગ્સ સાચવવામાં આવ્યા.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">સ્ટોર પસંદગીઓ</p><h1>સેટિંગ્સ</h1></div></div>{loading ? <Loading /> : <form className="admin-form settings-form" onSubmit={submit}><div className="admin-form-grid">{fields.map(([key, label]) => <label key={key} className={key === "address" ? "wide-field" : ""}>{label}<input name={key} defaultValue={settings[key] || ""} type={key.includes("email") ? "email" : key.includes("url") ? "url" : key.includes("charge") || key.includes("rate") ? "number" : "text"} step={key.includes("charge") || key.includes("rate") ? "0.01" : undefined} /></label>)}</div><button className="button">સેટિંગ્સ સાચવો</button></form>}</div>;
}
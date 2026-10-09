import { useEffect, useState } from "react";
import { CircleAlert, Leaf, ArrowRight, Sprout } from "lucide-react";
import { useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";

export default function PlantReviewPage() {
  const notify = useToast();
  const [file, setFile] = useState(null);
  const [plantName, setPlantName] = useState("");
  const [preview, setPreview] = useState("");
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: history, setData: setHistory } = useLoad("/plant-review/history", []);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event) {
    event.preventDefault();
    if (!file) return notify("પ્રથમ છોડનો ફોટો પસંદ કરો.", "error");
    const form = new FormData();
    form.set("plant_name", plantName);
    form.set("plant_image", file);
    setBusy(true);
    setReview("");
    try {
      const result = await api("/plant-review", { method: "POST", body: form });
      setReview(result.review);
      setHistory(await api("/plant-review/history"));
    }
    catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  return <main className="page care-page"><div className="page-heading"><div><p className="eyebrow"><Sprout size={15} /> છોડની સંભાળ આસિસ્ટન્ટ</p><h1>છોડના સ્વાસ્થ્યની સમીક્ષા</h1><p className="muted">AI-સંચાલિત સંભાળ સમીક્ષા માટે સ્પષ્ટ ફોટો અપલોડ કરો. આ માર્ગદર્શન છે, ગેરંટીકૃત નિદાન નથી.</p></div></div><div className="care-layout"><form className="care-form" onSubmit={submit}><label>છોડનું નામ <span className="optional">વૈકલ્પિક</span><input value={plantName} onChange={(event) => setPlantName(event.target.value)} maxLength="80" placeholder="દા.ત. જાસૂદ (Hibiscus)" /></label><label>છોડનો ફોટો <span className="optional">JPG, PNG, WebP · 8 MB સુધી</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} required /></label>{preview && <img className="review-preview" src={preview} alt="પસંદ કરેલ છોડ" />}<button className="button" disabled={busy}>{busy ? "ફોટો સમીક્ષા થઈ રહ્યો છે…" : "છોડની સમીક્ષા કરો"}<ArrowRight size={17} /></button></form><aside className="care-aside"><div className="care-icon"><Leaf /></div><p className="eyebrow">એક મદદરૂપ શરૂઆત</p><h2>જુઓ, સમજો, ઉછેરો.</h2><p>પરિણામોમાં સંભવિત ઓળખ, દૃશ્યમાન લક્ષણો, સંભવિત કારણો, ત્વરિત સંભાળ, પાણી અને પ્રકાશ માર્ગદર્શન અને શું ધ્યાન રાખવું તેનો સમાવેશ થાય છે.</p><div className="care-disclaimer"><CircleAlert size={17} /><span>ગંભીર લક્ષણો માટે, નિદાનની પુષ્ટિ કરવા માટે સ્થાનિક નર્સરી વ્યાવસાયિકને પૂછો.</span></div></aside></div>{review && <section className="review-result"><p className="eyebrow">તમારા છોડની સમીક્ષા</p><h2>અજમાવવા માટેની કેટલીક વસ્તુઓ</h2><div>{review}</div></section>}<section className="care-history"><div className="section-heading"><div><p className="eyebrow">તમારા સાચવેલા રિપોર્ટ</p><h2>છોડ સમીક્ષા ઇતિહાસ</h2></div></div>{history.length ? <div className="care-history-list">{history.map((entry) => <button key={entry._id} className="care-history-item" onClick={() => { setPlantName(entry.plantName); setReview(entry.review); }}><span><strong>{entry.plantName || "અનામી છોડ"}</strong><small>{new Date(entry.createdAt).toLocaleString()}</small></span><span>રિપોર્ટ જુઓ <ArrowRight size={15} /></span></button>)}</div> : <p className="muted">તમારી પૂર્ણ થયેલી છોડની સમીક્ષાઓ અહીં દેખાશે.</p>}</section></main>;
}
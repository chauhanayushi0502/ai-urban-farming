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
    if (!file) return notify("Choose a plant photo first.", "error");
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

  return <main className="page care-page"><div className="page-heading"><div><p className="eyebrow"><Sprout size={15} /> Plant care assistant</p><h1>Plant health review</h1><p className="muted">Upload a clear photo for an AI-assisted care review. This is guidance, not a guaranteed diagnosis.</p></div></div><div className="care-layout"><form className="care-form" onSubmit={submit}><label>Plant name <span className="optional">Optional</span><input value={plantName} onChange={(event) => setPlantName(event.target.value)} maxLength="80" placeholder="e.g. Hibiscus" /></label><label>Plant photo <span className="optional">JPG, PNG, WebP · up to 8 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} required /></label>{preview && <img className="review-preview" src={preview} alt="Selected plant" />}<button className="button" disabled={busy}>{busy ? "Reviewing photo…" : "Review plant"}<ArrowRight size={17} /></button></form><aside className="care-aside"><div className="care-icon"><Leaf /></div><p className="eyebrow">A helpful starting point</p><h2>Notice, understand, nurture.</h2><p>Results include likely identification, visible symptoms, possible causes, immediate care, water and light guidance, and what to monitor.</p><div className="care-disclaimer"><CircleAlert size={17} /><span>For serious symptoms, ask a local nursery professional to confirm the diagnosis.</span></div></aside></div>{review && <section className="review-result"><p className="eyebrow">Your plant review</p><h2>A few things to try</h2><div>{review}</div></section>}<section className="care-history"><div className="section-heading"><div><p className="eyebrow">Your saved reports</p><h2>Plant review history</h2></div></div>{history.length ? <div className="care-history-list">{history.map((entry) => <button key={entry._id} className="care-history-item" onClick={() => { setPlantName(entry.plantName); setReview(entry.review); }}><span><strong>{entry.plantName || "Unnamed plant"}</strong><small>{new Date(entry.createdAt).toLocaleString()}</small></span><span>View report <ArrowRight size={15} /></span></button>)}</div> : <p className="muted">Your completed plant reviews will appear here.</p>}</section></main>;
}
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../context/AppContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { imageSource } from "../../lib/format.js";

export default function AdminCategories() {
  const { data: categories, loading, setData } = useLoad("/categories", []);
  const [editing, setEditing] = useState(null);
  const notify = useToast();

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(editing ? `/admin/categories/${editing._id}` : "/admin/categories", { method: editing ? "PATCH" : "POST", body: form });
      setEditing(null);
      event.currentTarget.reset();
      setData(await api("/categories"));
      notify("કેટેગરી સાચવવામાં આવી.");
    } catch (error) { notify(error.message, "error"); }
  }

  async function remove(category) {
    if (!window.confirm(`${category.name} કાઢી નાખવું છે?`)) return;
    try {
      await api(`/admin/categories/${category._id}`, { method: "DELETE" });
      setData(categories.filter((item) => item._id !== category._id));
      notify("કેટેગરી કાઢી નાખવામાં આવી.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">બ્રાઉઝ માળખું</p><h1>કેટેગરીઝ</h1></div></div><form className="admin-form compact-form" onSubmit={submit} key={editing?._id || "new"}><h2>{editing ? "કેટેગરીમાં ફેરફાર કરો" : "કેટેગરી ઉમેરો"}</h2><div className="admin-form-grid"><label>કેટેગરીનું નામ<input name="name" defaultValue={editing?.name || ""} required /></label><label>કેટેગરીની ઇમેજ<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label></div><div className="form-actions"><button className="button">{editing ? "કેટેગરી સાચવો" : "કેટેગરી ઉમેરો"}</button>{editing && <button type="button" className="button button-outline" onClick={() => setEditing(null)}>રદ કરો</button>}</div></form><DataTable loading={loading} empty="હજુ સુધી કોઈ કેટેગરી ઉમેરવામાં આવી નથી."><div className="admin-category-list">{categories.map((category) => <article key={category._id}><img src={imageSource(category.image)} alt="" /><div><strong>{category.name}</strong><span className="muted">{category.productCount || ""}</span></div><button className="table-action" title="ફેરફાર કરો" onClick={() => setEditing(category)}><Pencil size={16} /></button><button className="table-action danger" title="કાઢી નાખો" onClick={() => remove(category)}><Trash2 size={16} /></button></article>)}</div></DataTable></div>;
}
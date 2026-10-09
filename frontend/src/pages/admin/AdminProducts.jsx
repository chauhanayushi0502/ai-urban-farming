import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../context/AppContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { imageSource, money } from "../../lib/format.js";

export default function AdminProducts() {
  const { data: products, loading, setData } = useLoad("/products?limit=100", []);
  const { data: categories } = useLoad("/categories", []);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const id = editing?._id;
    try {
      await api(id ? `/admin/products/${id}` : "/admin/products", { method: id ? "PATCH" : "POST", body: form });
      setEditing(null);
      event.currentTarget.reset();
      setData(await api("/products?limit=100"));
      notify(id ? "પ્રોડક્ટ અપડેટ થઈ." : "પ્રોડક્ટ ઉમેરાઈ.");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  async function remove(product) {
    if (!window.confirm(`${product.name} કાઢી નાખવું છે?`)) return;
    try {
      await api(`/admin/products/${product._id}`, { method: "DELETE" });
      setData(products.filter((item) => item._id !== product._id));
      notify("પ્રોડક્ટ કાઢી નાખવામાં આવી.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">સંગ્રહ</p><h1>પ્રોડક્ટ્સ</h1></div></div><form className="admin-form" onSubmit={submit} key={editing?._id || "new"}><h2>{editing ? "પ્રોડક્ટમાં ફેરફાર કરો" : "પ્રોડક્ટ ઉમેરો"}</h2><div className="admin-form-grid"><label>પ્રોડક્ટનું નામ<input name="name" defaultValue={editing?.name || ""} required /></label><label>કિંમત<input name="price" type="number" min="0.01" step="0.01" defaultValue={editing?.price || ""} required /></label><label>સ્ટોક<input name="stock" type="number" min="0" defaultValue={editing?.stock ?? 0} required /></label><label>કેટેગરી<select name="category" defaultValue={editing?.category?._id || editing?.category || categories[0]?._id || ""} required>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label className="wide-field">વર્ણન<textarea name="description" rows="2" defaultValue={editing?.description || ""} /></label><label className="wide-field">પ્રોડક્ટ ઇમેજ<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label></div><div className="form-actions"><button className="button" disabled={busy}>{editing ? "પ્રોડક્ટ સાચવો" : "પ્રોડક્ટ ઉમેરો"}</button>{editing && <button type="button" className="button button-outline" onClick={() => setEditing(null)}>રદ કરો</button>}</div></form><DataTable loading={loading} empty="હજુ સુધી કોઈ પ્રોડક્ટ્સ નથી."><table><thead><tr><th>પ્રોડક્ટ</th><th>કેટેગરી</th><th>કિંમત</th><th>સ્ટોક</th><th>ક્રિયાઓ</th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td className="admin-product-cell"><img src={imageSource(product.image)} alt="" /><strong>{product.name}</strong></td><td>{product.category?.name || "—"}</td><td>{money(product.price)}</td><td><span className={product.stock <= 5 ? "stock-low" : ""}>{product.stock}</span></td><td><button className="table-action" onClick={() => { setEditing(product); window.scrollTo({ top: 0, behavior: "smooth" }); }} title="ફેરફાર કરો"><Pencil size={16} /></button><button className="table-action danger" onClick={() => remove(product)} title="કાઢી નાખો"><Trash2 size={16} /></button></td></tr>)}</tbody></table></DataTable></div>;
}
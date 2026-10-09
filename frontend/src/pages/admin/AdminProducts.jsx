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
      notify(id ? "Product updated." : "Product added.");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  async function remove(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await api(`/admin/products/${product._id}`, { method: "DELETE" });
      setData(products.filter((item) => item._id !== product._id));
      notify("Product deleted.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">The collection</p><h1>Products</h1></div></div><form className="admin-form" onSubmit={submit} key={editing?._id || "new"}><h2>{editing ? "Edit product" : "Add product"}</h2><div className="admin-form-grid"><label>Product name<input name="name" defaultValue={editing?.name || ""} required /></label><label>Price<input name="price" type="number" min="0.01" step="0.01" defaultValue={editing?.price || ""} required /></label><label>Stock<input name="stock" type="number" min="0" defaultValue={editing?.stock ?? 0} required /></label><label>Category<select name="category" defaultValue={editing?.category?._id || editing?.category || categories[0]?._id || ""} required>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label className="wide-field">Description<textarea name="description" rows="2" defaultValue={editing?.description || ""} /></label><label className="wide-field">Product image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label></div><div className="form-actions"><button className="button" disabled={busy}>{editing ? "Save product" : "Add product"}</button>{editing && <button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button>}</div></form><DataTable loading={loading} empty="No products yet."><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td className="admin-product-cell"><img src={imageSource(product.image)} alt="" /><strong>{product.name}</strong></td><td>{product.category?.name || "—"}</td><td>{money(product.price)}</td><td><span className={product.stock <= 5 ? "stock-low" : ""}>{product.stock}</span></td><td><button className="table-action" onClick={() => { setEditing(product); window.scrollTo({ top: 0, behavior: "smooth" }); }} title="Edit"><Pencil size={16} /></button><button className="table-action danger" onClick={() => remove(product)} title="Delete"><Trash2 size={16} /></button></td></tr>)}</tbody></table></DataTable></div>;
}
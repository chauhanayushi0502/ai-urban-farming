import { useState } from "react";
import { useToast } from "../../context/AppContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";

export default function AdminInventory() {
  const { data: products, loading, setData } = useLoad("/products?limit=100&sort=name", []);
  const notify = useToast();

  async function update(product, value) {
    try {
      const updated = await api(`/admin/products/${product._id}/stock`, { method: "PATCH", body: { stock: Number(value) } });
      setData(products.map((item) => item._id === product._id ? { ...item, stock: updated.stock } : item));
      notify("સ્ટોક અપડેટ થયો.");
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">ઉપલબ્ધતા</p><h1>ઇન્વેન્ટરી</h1></div></div><DataTable loading={loading} empty="ટ્રૅક કરવા માટે કોઈ પ્રોડક્ટ્સ નથી."><table><thead><tr><th>પ્રોડક્ટ</th><th>હાલનો સ્ટોક</th><th>જથ્થો અપડેટ કરો</th></tr></thead><tbody>{products.map((product) => <InventoryRow key={product._id} product={product} onUpdate={update} />)}</tbody></table></DataTable></div>;
}

function InventoryRow({ product, onUpdate }) {
  const [stock, setStock] = useState(product.stock);
  return <tr><td>{product.name}</td><td className={product.stock <= 5 ? "stock-low" : ""}>{product.stock}</td><td><form className="inline-stock" onSubmit={(event) => { event.preventDefault(); onUpdate(product, stock); }}><input aria-label={`${product.name} માટે સ્ટોક`} type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} /><button className="button button-small">અપડેટ કરો</button></form></td></tr>;
}
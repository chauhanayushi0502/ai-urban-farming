import { useState } from "react";
import { Sprout } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { formatNameByLanguage } from "../../lib/format.js";

export default function AdminInventory() {
  const { data: products, loading, setData } = useLoad("/products?limit=100&sort=name", []);
  const { t, language } = useLanguage();
  const notify = useToast();

  async function update(product, value) {
    try {
      const updated = await api(`/admin/products/${product._id}/stock`, {
        method: "PATCH",
        body: { stock: Number(value) },
      });
      setData(products.map((item) => (item._id === product._id ? { ...item, stock: updated.stock } : item)));
      notify(t("stock_updated", "Stock updated successfully."), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <AdminShell current="/admin/inventory">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">
            <Sprout size={15} /> {t("inventory_title", "Live Stock & Availability")}
          </p>
          <h1>{t("admin_inventory", "Inventory Management")}</h1>
          <p className="muted">
            {t("admin_inventory_sub", "Quickly audit greenhouse stock, update plant quantities, and flag low inventory.")}
          </p>
        </div>
      </div>

      <DataTable loading={loading} empty={t("no_inventory_items", "No plants or products found in inventory.")}>
        <table>
          <thead>
            <tr>
              <th>{t("product_label", "Plant / Item")}</th>
              <th>{t("current_stock", "Current Stock")}</th>
              <th>{t("update_qty", "Update Quantity")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <InventoryRow key={product._id} product={product} onUpdate={update} language={language} t={t} />
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}

function InventoryRow({ product, onUpdate, language, t }) {
  const [stock, setStock] = useState(product.stock);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    await onUpdate(product, stock);
    setBusy(false);
  };

  return (
    <tr>
      <td>
        <strong>{formatNameByLanguage(product, language)}</strong>
      </td>
      <td>
        <span className={product.stock <= 5 ? "stock-low" : ""}>
          {product.stock} {product.stock <= 5 && `(${t("low_stock", "⚠️ Low Stock")})`}
        </span>
      </td>
      <td>
        <form className="inline-stock" onSubmit={handleSubmit}>
          <input
            aria-label={`${product.name} stock`}
            type="number"
            min="0"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
          />
          <button className="button button-small" disabled={busy}>
            {busy ? "..." : t("update", "Update")}
          </button>
        </form>
      </td>
    </tr>
  );
}
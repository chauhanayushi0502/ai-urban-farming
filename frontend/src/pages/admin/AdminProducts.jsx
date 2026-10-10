import { useState, useRef } from "react";
import { Pencil, Trash2, Plus, X, Upload, Sprout, Image as ImageIcon } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { imageSource, money, formatNameByLanguage } from "../../lib/format.js";
import { compressAndOptimizeImage } from "../../lib/image-optimizer.js";

export default function AdminProducts() {
  const { data: products, loading, setData } = useLoad("/products?limit=100", []);
  const { data: categories } = useLoad("/categories", []);
  const { t, language } = useLanguage();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const formRef = useRef(null);
  const notify = useToast();

  const handleEditClick = (product) => {
    setEditing(product);
    setPreviewUrl(product.image ? imageSource(product.image) : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditing(null);
    setPreviewUrl(null);
    setShowForm(false);
    if (formRef.current) formRef.current.reset();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const id = editing?._id;

    // Validate category selection
    const categoryVal = form.get("category");
    if (!categoryVal) {
      notify(t("select_category_err", "Please select a valid plant category."), "error");
      setBusy(false);
      return;
    }

    try {
      const rawImage = form.get("image");
      if (rawImage && rawImage.size > 0 && typeof rawImage !== "string") {
        try {
          const optimizedImage = await compressAndOptimizeImage(rawImage, 800, 0.82);
          form.set("image", optimizedImage);
        } catch {
          // If compression fails, continue with original
        }
      }

      await api(id ? `/admin/products/${id}` : "/admin/products", {
        method: id ? "PATCH" : "POST",
        body: form,
      });

      // Refresh list
      const freshProducts = await api("/products?limit=100");
      setData(freshProducts);

      notify(
        id
          ? t("product_updated", "Plant/Product updated successfully.")
          : t("product_created", "Plant added to nursery catalog successfully!"),
        "success"
      );

      handleCancel();
    } catch (error) {
      notify(error.message || t("product_save_fail", "Failed to save product."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(product) {
    if (!window.confirm(`${product.name}: ${t("confirm_delete", "Are you sure you want to delete this plant?")}`)) return;
    try {
      await api(`/admin/products/${product._id}`, { method: "DELETE" });
      setData(products.filter((item) => item._id !== product._id));
      notify(t("product_deleted", "Product deleted successfully."), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <AdminShell current="/admin/products">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">
            <Sprout size={15} /> {t("catalog_inventory", "Catalog & Inventory")}
          </p>
          <h1>{t("admin_products", "Plants & Products")}</h1>
          <p className="muted">
            {t("admin_products_sub", "Add, edit, manage stock and pricing for nursery plants and garden accessories.")}
          </p>
        </div>
        <button
          className="button"
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setEditing(null);
              setPreviewUrl(null);
              setShowForm(true);
            }
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}{" "}
          {showForm ? t("close_form", "Close Form") : t("add_plant_btn", "Add New Plant")}
        </button>
      </div>

      {showForm && (
        <form
          ref={formRef}
          className="admin-form"
          onSubmit={submit}
          key={editing?._id || "new"}
          style={{ marginBottom: "28px" }}
        >
          <h2>{editing ? t("edit_plant", "Edit Plant / Product") : t("add_plant", "Add New Plant to Nursery")}</h2>

          <div className="admin-form-grid">
            <label>
              {t("plant_name", "Plant / Item Name *")}
              <input
                name="name"
                defaultValue={editing?.name || ""}
                placeholder="e.g. Variegated Monstera Deliciosa"
                required
              />
            </label>

            <label>
              {t("price", "Price (₹) *")}
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={editing?.price || ""}
                placeholder="e.g. 299"
                required
              />
            </label>

            <label>
              {t("stock_quantity", "Stock Quantity *")}
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={editing?.stock ?? 10}
                required
              />
            </label>

            <label>
              {t("category", "Plant Category *")}
              <select
                name="category"
                defaultValue={editing?.category?._id || editing?.category || (categories[0]?._id ?? "")}
                required
              >
                {categories.length === 0 ? (
                  <option value="">{t("loading_categories", "Loading categories...")}</option>
                ) : (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {formatNameByLanguage(category.name, language)}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="wide-field">
              {t("description", "Care Instructions & Description")}
              <textarea
                name="description"
                rows="3"
                defaultValue={editing?.description || ""}
                placeholder={t("desc_placeholder", "Watering requirement, sunlight exposure, soil blend, and general care...")}
              />
            </label>

            <label className="wide-field">
              {t("product_image", "Plant Photo / Image")}
              <div style={{ display: "flex", gap: "14px", alignItems: "center", marginTop: "4px" }}>
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ flex: 1 }}
                />
                {previewUrl && (
                  <div style={{ position: "relative" }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: "52px",
                        height: "52px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #c7d2c3",
                      }}
                    />
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="form-actions">
            <button className="button" disabled={busy}>
              {busy
                ? t("saving", "Saving…")
                : editing
                ? t("save_changes", "Save Changes")
                : t("add_plant_btn", "Add Plant")}
            </button>
            <button type="button" className="button button-outline" onClick={handleCancel}>
              {t("cancel", "Cancel")}
            </button>
          </div>
        </form>
      )}

      <DataTable loading={loading} empty={t("no_products_yet", "No plants or products found in nursery.")}>
        <table>
          <thead>
            <tr>
              <th>{t("product_th", "Plant & Photo")}</th>
              <th>{t("category_th", "Category")}</th>
              <th>{t("price_th", "Price")}</th>
              <th>{t("stock_th", "Stock")}</th>
              <th>{t("actions_th", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td className="admin-product-cell">
                  <img
                    src={imageSource(product.image)}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/images/catalog/bg.png";
                    }}
                  />
                  <div>
                    <strong>{formatNameByLanguage(product.name, language)}</strong>
                    {product.description && (
                      <small className="table-subline" style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.description}
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge-pill">
                    {product.category?.name ? formatNameByLanguage(product.category.name, language) : "—"}
                  </span>
                </td>
                <td>
                  <strong>{money(product.price)}</strong>
                </td>
                <td>
                  <span className={product.stock <= 5 ? "stock-low" : ""}>
                    {product.stock} {product.stock <= 5 && "⚠️ Low"}
                  </span>
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => handleEditClick(product)}
                    title={t("edit", "Edit")}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="table-action danger"
                    onClick={() => remove(product)}
                    title={t("delete", "Delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}
import { useState } from "react";
import { Pencil, Trash2, Plus, X, Tags } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { imageSource, formatNameByLanguage } from "../../lib/format.js";

export default function AdminCategories() {
  const { data: categories, loading, setData } = useLoad("/categories", []);
  const { t, language } = useLanguage();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const handleEditClick = (category) => {
    setEditing(category);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
  };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await api(editing ? `/admin/categories/${editing._id}` : "/admin/categories", {
        method: editing ? "PATCH" : "POST",
        body: form,
      });
      handleCancel();
      event.currentTarget.reset();
      setData(await api("/categories"));
      notify(editing ? t("category_updated", "Category updated.") : t("category_created", "Category created."), "success");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(category) {
    if (!window.confirm(`${category.name}: ${t("confirm_delete_cat", "Delete this category?")}`)) return;
    try {
      await api(`/admin/categories/${category._id}`, { method: "DELETE" });
      setData(categories.filter((item) => item._id !== category._id));
      notify(t("category_deleted", "Category deleted."), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <AdminShell current="/admin/categories">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">
            <Tags size={15} /> {t("catalog_structure", "Catalog Structure")}
          </p>
          <h1>{t("admin_categories", "Categories")}</h1>
          <p className="muted">
            {t("admin_categories_sub", "Manage nursery plant classifications, indoor/outdoor grouping, and section banners.")}
          </p>
        </div>
        <button
          className="button"
          onClick={() => {
            if (showForm) handleCancel();
            else {
              setEditing(null);
              setShowForm(true);
            }
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}{" "}
          {showForm ? t("close_form", "Close Form") : t("add_category_btn", "Add Category")}
        </button>
      </div>

      {showForm && (
        <form
          className="admin-form compact-form"
          onSubmit={submit}
          key={editing?._id || "new"}
          style={{ marginBottom: "28px" }}
        >
          <h2>{editing ? t("edit_category", "Edit Category") : t("add_category", "Add New Category")}</h2>
          <div className="admin-form-grid">
            <label>
              {t("category_name", "Category Name *")}
              <input name="name" defaultValue={editing?.name || ""} placeholder="e.g. Bonsai & Exotics" required />
            </label>
            <label>
              {t("category_image", "Category Banner Image")}
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            </label>
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              {busy ? t("saving", "Saving…") : editing ? t("save_changes", "Save Changes") : t("add_category_btn", "Add Category")}
            </button>
            <button type="button" className="button button-outline" onClick={handleCancel}>
              {t("cancel", "Cancel")}
            </button>
          </div>
        </form>
      )}

      <DataTable loading={loading} empty={t("no_categories_yet", "No categories found.")}>
        <div className="admin-category-list">
          {categories.map((category) => (
            <article key={category._id}>
              <img
                src={imageSource(category.image)}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/catalog/bg.png";
                }}
              />
              <div>
                <strong>{formatNameByLanguage(category.name, language)}</strong>
                <span className="muted">{category.productCount ? `${category.productCount} plants` : "0 plants"}</span>
              </div>
              <button
                className="table-action"
                title={t("edit", "Edit")}
                onClick={() => handleEditClick(category)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="table-action danger"
                title={t("delete", "Delete")}
                onClick={() => remove(category)}
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      </DataTable>
    </AdminShell>
  );
}
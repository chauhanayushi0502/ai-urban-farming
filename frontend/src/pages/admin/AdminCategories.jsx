import { useState } from "react";
import { Pencil, Trash2, Plus, X, Tags } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { DataTable } from "../../components/Feedback.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { imageSource, formatNameByLanguage, getTranslationsForName } from "../../lib/format.js";
import { compressAndOptimizeImage } from "../../lib/image-optimizer.js";

export default function AdminCategories() {
  const { data: categories, loading, setData } = useLoad("/categories", []);
  const { t, language } = useLanguage();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [nameGuVal, setNameGuVal] = useState("");
  const [nameHiVal, setNameHiVal] = useState("");
  const [nameEnVal, setNameEnVal] = useState("");
  const notify = useToast();

  const handleAutoFill = (text) => {
    const query = (text || nameVal || "").trim();
    if (!query) return;
    const res = getTranslationsForName(query);
    if (res.gu) setNameGuVal(res.gu);
    if (res.hi) setNameHiVal(res.hi);
    if (res.en) setNameEnVal(res.en);
  };

  const handleEditClick = (category) => {
    setEditing(category);
    setNameVal(category.name || "");
    setNameGuVal(category.name_gu || "");
    setNameHiVal(category.name_hi || "");
    setNameEnVal(category.name_en || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditing(null);
    setNameVal("");
    setNameGuVal("");
    setNameHiVal("");
    setNameEnVal("");
    setShowForm(false);
  };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const auto = getTranslationsForName(nameVal);
    const finalGu = (nameGuVal || "").trim() || auto.gu || nameVal.trim();
    const finalHi = (nameHiVal || "").trim() || auto.hi || nameVal.trim();
    const finalEn = (nameEnVal || "").trim() || auto.en || nameVal.trim();
    form.set("name", nameVal.trim() || finalEn);
    form.set("name_gu", finalGu);
    form.set("name_hi", finalHi);
    form.set("name_en", finalEn);

    try {
      const rawImage = form.get("image");
      if (rawImage && rawImage.size > 0 && typeof rawImage !== "string") {
        try {
          const optimizedImage = await compressAndOptimizeImage(rawImage, 800, 0.82);
          form.set("image", optimizedImage);
        } catch {}
      }

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
              setNameVal("");
              setNameGuVal("");
              setNameHiVal("");
              setNameEnVal("");
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("category_name", "Category Name *")}</span>
                <button
                  type="button"
                  className="button-subtle-pill"
                  style={{ fontSize: "11px", padding: "2px 8px", cursor: "pointer" }}
                  onClick={() => handleAutoFill(nameVal)}
                >
                  ✨ {language === "gu" ? "ઓટો-અનુવાદ ભરો" : language === "hi" ? "स्वतः अनुवाद भरें" : "Auto-Fill Names"}
                </button>
              </div>
              <input
                name="name"
                value={nameVal}
                onChange={(e) => {
                  setNameVal(e.target.value);
                  if (!nameGuVal && !nameHiVal && !nameEnVal) {
                    const auto = getTranslationsForName(e.target.value);
                    if (auto.gu) setNameGuVal(auto.gu);
                    if (auto.hi) setNameHiVal(auto.hi);
                    if (auto.en) setNameEnVal(auto.en);
                  }
                }}
                onBlur={() => {
                  if (nameVal && (!nameGuVal || !nameHiVal || !nameEnVal)) {
                    handleAutoFill(nameVal);
                  }
                }}
                placeholder="e.g. Bonsai & Exotics / બોન્સાઈ"
                required
              />
            </label>
            <label>
              {t("category_name_gu", "Name in Gujarati (ગુજરાતી)")}
              <input
                name="name_gu"
                value={nameGuVal}
                onChange={(e) => setNameGuVal(e.target.value)}
                placeholder="દા.ત. બોન્સાઈ અને વિદેશી છોડ"
              />
            </label>
            <label>
              {t("category_name_hi", "Name in Hindi (हिन्दी)")}
              <input
                name="name_hi"
                value={nameHiVal}
                onChange={(e) => setNameHiVal(e.target.value)}
                placeholder="उदा. बोन्साई और विदेशी पौधे"
              />
            </label>
            <label>
              {t("category_name_en", "Name in English")}
              <input
                name="name_en"
                value={nameEnVal}
                onChange={(e) => setNameEnVal(e.target.value)}
                placeholder="e.g. Bonsai & Exotics"
              />
            </label>
            <label className="wide-field">
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
                <strong>{formatNameByLanguage(category, language)}</strong>
                <span className="muted">{category.productCount ? `${category.productCount} ${t("plants_count", "plants")}` : `0 ${t("plants_count", "plants")}`}</span>
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
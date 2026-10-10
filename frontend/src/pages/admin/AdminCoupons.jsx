import { useState } from "react";
import { Tag, Plus, Trash2, Check, X, Percent, IndianRupee, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

export default function AdminCoupons() {
  const notify = useToast();
  const { t, language } = useLanguage();
  const { data: coupons, setData: setCoupons, reload } = useLoad("/admin/coupons", []);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    validUntil: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return notify(t("enter_coupon_code_err", "Please enter a coupon code."), "error");
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      return notify(t("enter_discount_val_err", "Enter a valid discount value."), "error");
    }

    setBusy(true);
    try {
      await api("/admin/coupons", {
        method: "POST",
        body: {
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrderAmount: Number(form.minOrderAmount) || 0,
          maxDiscountAmount: Number(form.maxDiscountAmount) || 0,
          validUntil: form.validUntil || null,
          description: form.description.trim(),
        },
      });
      notify(t("coupon_created_success", "Coupon created successfully!"), "success");
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        validUntil: "",
        description: "",
      });
      setShowForm(false);
      reload();
    } catch (err) {
      notify(err.message || t("coupon_create_fail", "Failed to create coupon"), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api(`/admin/coupons/${coupon._id}`, {
        method: "PATCH",
        body: { isActive: !coupon.isActive },
      });
      notify(
        language === "gu"
          ? `કૂપન ${coupon.code} ${!coupon.isActive ? "સક્રિય" : "નિષ્ક્રિય"} કરવામાં આવી.`
          : language === "hi"
          ? `कूपन ${coupon.code} ${!coupon.isActive ? "सक्रिय" : "निष्क्रिय"} किया गया।`
          : `Coupon ${coupon.code} ${!coupon.isActive ? "activated" : "deactivated"}.`,
        "success"
      );
      reload();
    } catch (err) {
      notify(err.message || "Failed to update coupon", "error");
    }
  };

  const handleDelete = async (couponId, code) => {
    if (!window.confirm(language === "gu" ? `શું તમે ખરેખર કૂપન "${code}" કાઢી નાખવા માંગો છો?` : `Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await api(`/admin/coupons/${couponId}`, { method: "DELETE" });
      notify(t("coupon_deleted", "Coupon deleted."), "success");
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (err) {
      notify(err.message || "Failed to delete coupon", "error");
    }
  };

  return (
    <AdminShell current="/admin/coupons">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow"><Tag size={15} /> {t("promotions_discounts", "Promotions & Discounts")}</p>
          <h1>{t("coupon_management", "Coupon Codes Management")}</h1>
          <p className="muted">{t("admin_coupons_sub", "Create and manage promo vouchers, percentage discounts, and order thresholds.")}</p>
        </div>
        <button className="button" onClick={() => setShowForm((prev) => !prev)}>
          <Plus size={16} /> {showForm ? t("close_form", "Close Form") : t("create_coupon", "Create Coupon")}
        </button>
      </div>

      {showForm && (
        <form className="admin-card coupon-form-card" onSubmit={handleSubmit}>
          <div className="form-card-title">
            <h3>{t("create_coupon", "Add New Coupon")}</h3>
          </div>
          <div className="form-grid-2">
            <label>
              <span>{t("coupon_code", "Coupon Code * (e.g. MONSOON20)")}</span>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="PROMOCODE"
              />
            </label>

            <label>
              <span>{t("discount_type", "Discount Type")}</span>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="percentage">{t("percentage", "Percentage (%) Discount")}</option>
                <option value="fixed">{t("fixed_amount", "Fixed Flat (₹) Amount")}</option>
              </select>
            </label>

            <label>
              <span>{t("discount_value", "Discount Value *")} {form.discountType === "percentage" ? "(%)" : "(₹)"}</span>
              <input
                type="number"
                required
                min="1"
                max={form.discountType === "percentage" ? "100" : "10000"}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === "percentage" ? "20" : "100"}
              />
            </label>

            <label>
              <span>{t("min_order", "Minimum Cart Subtotal (₹)")}</span>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="e.g. 499"
              />
            </label>

            {form.discountType === "percentage" && (
              <label>
                <span>{t("max_discount", "Max Discount Cap (₹)")}</span>
                <input
                  type="number"
                  min="0"
                  value={form.maxDiscountAmount}
                  onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                  placeholder="e.g. 500"
                />
              </label>
            )}

            <label>
              <span>{t("valid_until", "Expiry Date (Optional)")}</span>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              />
            </label>

            <label className="full-width">
              <span>{t("description", "Description / Banner Note")}</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("coupon_desc_placeholder", "e.g. 20% off on all balcony garden plants above ₹799")}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="button" disabled={busy}>
              {busy ? t("saving", "Saving…") : t("save_changes", "Save Coupon")}
            </button>
            <button type="button" className="button button-outline" onClick={() => setShowForm(false)}>
              {t("cancel", "Cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="admin-card table-card">
        {coupons.length === 0 ? (
          <div className="empty-state">
            <Tag size={32} className="muted" />
            <p>{t("no_coupons_yet", "No coupons found. Click 'Create Coupon' to add promotional codes.")}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("coupon_code", "Code")}</th>
                  <th>{t("discount_type", "Discount")}</th>
                  <th>{t("min_order", "Min Order")}</th>
                  <th>{t("max_discount", "Cap")}</th>
                  <th>{t("usage_label", "Usage")}</th>
                  <th>{t("valid_until", "Expiry")}</th>
                  <th>{t("status_label", "Status")}</th>
                  <th>{t("actions_th", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
                  return (
                    <tr key={c._id}>
                      <td>
                        <strong className="coupon-badge">{c.code}</strong>
                        {c.description && <div className="text-xs muted">{c.description}</div>}
                      </td>
                      <td>
                        <strong>
                          {c.discountType === "percentage" ? `${c.discountValue}%` : money(c.discountValue)}
                        </strong>
                      </td>
                      <td>{c.minOrderAmount > 0 ? money(c.minOrderAmount) : "—"}</td>
                      <td>{c.maxDiscountAmount > 0 ? money(c.maxDiscountAmount) : "—"}</td>
                      <td>
                        <span className="badge-pill">{c.usageCount || 0} {t("used_count", "used")}</span>
                      </td>
                      <td>
                        {c.validUntil ? (
                          <span className={isExpired ? "text-danger" : ""}>
                            {new Date(c.validUntil).toLocaleDateString()}
                            {isExpired && ` (${t("expired", "Expired")})`}
                          </span>
                        ) : (
                          <span className="muted">{t("never", "Never")}</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-pill ${c.isActive ? "status-active" : "status-inactive"}`}
                          onClick={() => handleToggleActive(c)}
                        >
                          {c.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-action danger"
                          title={t("delete", "Delete")}
                          onClick={() => handleDelete(c._id, c.code)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

import { useState } from "react";
import { Tag, Plus, Trash2, Check, X, Percent, IndianRupee, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { AdminShell } from "../../components/AdminShell.jsx";
import { useToast } from "../../context/AppContext.jsx";
import { useLoad } from "../../hooks/useLoad.js";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

export default function AdminCoupons() {
  const notify = useToast();
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
    if (!form.code.trim()) return notify("Please enter a coupon code.", "error");
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      return notify("Enter a valid discount value.", "error");
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
      notify("Coupon created successfully!", "success");
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
      notify(err.message || "Failed to create coupon", "error");
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
      notify(`Coupon ${coupon.code} ${!coupon.isActive ? "activated" : "deactivated"}.`, "success");
      reload();
    } catch (err) {
      notify(err.message || "Failed to update coupon", "error");
    }
  };

  const handleDelete = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await api(`/admin/coupons/${couponId}`, { method: "DELETE" });
      notify("Coupon deleted.", "success");
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (err) {
      notify(err.message || "Failed to delete coupon", "error");
    }
  };

  return (
    <AdminShell current="/admin/coupons">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow"><Tag size={15} /> Promotions & Discounts</p>
          <h1>Coupon Codes Management</h1>
          <p className="muted">Create and manage promo vouchers, percentage discounts, and order thresholds.</p>
        </div>
        <button className="button" onClick={() => setShowForm((prev) => !prev)}>
          <Plus size={16} /> {showForm ? "Close Form" : "Create Coupon"}
        </button>
      </div>

      {showForm && (
        <form className="admin-card coupon-form-card" onSubmit={handleSubmit}>
          <div className="form-card-title">
            <h3>Add New Coupon</h3>
          </div>
          <div className="form-grid-2">
            <label>
              <span>Coupon Code * (e.g. MONSOON20)</span>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="PROMOCODE"
              />
            </label>

            <label>
              <span>Discount Type</span>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%) Discount</option>
                <option value="fixed">Fixed Flat (₹) Amount</option>
              </select>
            </label>

            <label>
              <span>Discount Value * {form.discountType === "percentage" ? "(%)" : "(₹)"}</span>
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
              <span>Minimum Cart Subtotal (₹)</span>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="e.g. 499 (0 for no minimum)"
              />
            </label>

            {form.discountType === "percentage" && (
              <label>
                <span>Max Discount Cap (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={form.maxDiscountAmount}
                  onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                  placeholder="e.g. 500 (0 for no cap)"
                />
              </label>
            )}

            <label>
              <span>Expiry Date (Optional)</span>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              />
            </label>

            <label className="full-width">
              <span>Description / Banner Note</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. 20% off on all balcony garden plants above ₹799"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="button" disabled={busy}>
              {busy ? "Saving…" : "Save Coupon"}
            </button>
            <button type="button" className="button-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="admin-card table-card">
        {coupons.length === 0 ? (
          <div className="empty-state">
            <Tag size={32} className="muted" />
            <p>No coupons found. Click "Create Coupon" to add promotional codes.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Cap</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                      <td>{c.minOrderAmount > 0 ? money(c.minOrderAmount) : "None"}</td>
                      <td>{c.maxDiscountAmount > 0 ? money(c.maxDiscountAmount) : "No cap"}</td>
                      <td>
                        <span className="badge-pill">{c.usageCount || 0} used</span>
                      </td>
                      <td>
                        {c.validUntil ? (
                          <span className={isExpired ? "text-danger" : ""}>
                            {new Date(c.validUntil).toLocaleDateString()}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="muted">Never</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-pill ${c.isActive ? "status-active" : "status-inactive"}`}
                          onClick={() => handleToggleActive(c)}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="icon-button-danger"
                          title="Delete coupon"
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

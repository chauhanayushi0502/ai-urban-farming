import { Printer, X, CheckCircle, Clock, ShieldCheck, Download } from "lucide-react";
import { money, formatNameByLanguage } from "../lib/format.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;
  const { language } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const orderId = (order._id || "").toString().slice(-8).toUpperCase();
  const isPaid = order.paymentStatus === "paid" || ["upi", "card", "netbanking"].includes(order.paymentMethod);

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-actions no-print">
          <button className="button-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print / Save as PDF
          </button>
          <button className="icon-button" onClick={onClose} aria-label="Close invoice">
            <X size={20} />
          </button>
        </div>

        <div className="printable-invoice" id="printable-invoice">
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <div className="brand-logo-text">
                <span className="brand-leaf">🌿</span> Green Leaf Plant Nursery
              </div>
              <p className="invoice-tagline">Urban Gardening, Rare Plants & Smart Botanicals</p>
              <p className="invoice-address-line">142 Botanical Garden Road, Green Hub, Ahmedabad, GJ 380015</p>
              <p className="invoice-address-line">GSTIN: 24AAACG1234F1Z9 · support@greenleafnursery.com</p>
            </div>
            <div className="invoice-meta">
              <h2 className="invoice-title">TAX INVOICE</h2>
              <div className="invoice-meta-item">
                <span className="meta-label">Invoice / Order #:</span>
                <span className="meta-val">GLN-{orderId}</span>
              </div>
              <div className="invoice-meta-item">
                <span className="meta-label">Order Date:</span>
                <span className="meta-val">{formattedDate}</span>
              </div>
              <div className="invoice-meta-item">
                <span className="meta-label">Payment Status:</span>
                <span className={`status-pill ${isPaid ? "paid" : "pending"}`}>
                  {isPaid ? "PAID" : "CASH ON DELIVERY"}
                </span>
              </div>
              <div className="invoice-meta-item">
                <span className="meta-label">Payment Method:</span>
                <span className="meta-val">{order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}</span>
              </div>
              {order.paymentDetails?.transactionId && (
                <div className="invoice-meta-item">
                  <span className="meta-label">Txn Reference:</span>
                  <span className="meta-val font-mono">{order.paymentDetails.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="invoice-divider" />

          {/* Customer & Shipping Details */}
          <div className="invoice-addresses">
            <div className="invoice-address-box">
              <span className="box-title">Billed & Shipped To:</span>
              <p className="customer-name"><strong>{order.shippingAddress?.fullName || "Valued Customer"}</strong></p>
              <p>{order.shippingAddress?.addressLine}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </p>
              <p>Phone: {order.shippingAddress?.phone}</p>
            </div>
            <div className="invoice-address-box">
              <span className="box-title">Fulfillment & Nursery Dispatch:</span>
              <p><strong>Green Leaf Urban Fulfillment Hub</strong></p>
              <p>Greenhouse Bay #4, Express Flora Logistics</p>
              <p>Status: <strong className="capitalize">{order.status || "Processing"}</strong></p>
              {order.trackingNumber && <p>Tracking #: <code>{order.trackingNumber}</code></p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{formatNameByLanguage(item.name, language)}</strong>
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{money(item.price)}</td>
                  <td className="text-right">{money(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="invoice-summary-grid">
            <div className="invoice-notes">
              <p className="note-title">🌱 Nursery Guarantee & Care Note</p>
              <p>All live plants and saplings are transit-conditioned and guaranteed healthy upon arrival. Water according to the smart care guidelines included with your shipment.</p>
              <div className="eco-stamp">
                <ShieldCheck size={16} /> 100% Organically Grown & Eco-Packaged
              </div>
            </div>

            <div className="invoice-totals-box">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{money(order.subtotal || 0)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="total-row discount-row">
                  <span>Promo Discount ({order.couponCode || "Coupon"}):</span>
                  <span>- {money(order.discountAmount)}</span>
                </div>
              )}

              <div className="total-row">
                <span>Delivery / Shipping:</span>
                <span>{order.shippingAmount > 0 ? money(order.shippingAmount) : "FREE"}</span>
              </div>

              <div className="total-row">
                <span>Tax / GST:</span>
                <span>{money(order.taxAmount || 0)}</span>
              </div>

              <hr className="total-divider" />

              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span>{money(order.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p>Thank you for growing with Green Leaf Plant Nursery! For support or care tips, visit greenleafnursery.com/garden</p>
            <p className="text-xs text-muted">This is a computer-generated tax invoice and requires no physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

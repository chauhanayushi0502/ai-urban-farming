import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Truck,
  CreditCard,
  QrCode,
  Building2,
  Tag,
  Check,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  Smartphone,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Loading } from "../components/Feedback.jsx";
import { useApp, useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";
import { imageSource, money } from "../lib/format.js";

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

export default function CheckoutPage() {
  const { user, settings, syncCart } = useApp();
  const { data: cart, loading } = useLoad("/cart", { items: [] });
  const { data: publicCoupons } = useLoad("/coupons/public", []);
  const notify = useToast();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    addressLine: user.address || "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiTimer, setUpiTimer] = useState(300); // 5 min countdown
  const [upiTxnId, setUpiTxnId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: user.fullName || "",
    expiry: "",
    cvv: "",
  });

  // Coupons
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Items and Base Math
  const items = (cart.items || []).filter((item) => item.product);
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.product.price, 0));
  
  // Coupon Discount Math
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && appliedCoupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscountAmount);
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(subtotal, Math.max(0, roundMoney(discountAmount)));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const shipping = subtotal ? Math.max(0, Number(settings.shipping_charge) || 0) : 0;
  const taxRate = Math.max(0, Number(settings.tax_rate) || 0);
  const tax = roundMoney(taxableAmount * taxRate / 100);
  const total = roundMoney(taxableAmount + shipping + tax);

  // Countdown timer for UPI QR
  useEffect(() => {
    if (paymentMethod !== "upi") return;
    const timer = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentMethod]);

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  // Apply Coupon
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) return notify("Enter a promo code first.", "error");

    setCouponLoading(true);
    try {
      const res = await api("/coupons/apply", {
        method: "POST",
        body: { code, subtotal },
      });
      setAppliedCoupon(res);
      setCouponCodeInput(res.code);
      notify(`Promo code ${res.code} applied! Saved ₹${res.discountAmount}`, "success");
    } catch (err) {
      notify(err.message || "Invalid coupon code", "error");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    notify("Coupon removed.", "info");
  };

  // Format Card Number
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2)}`;
    setCardDetails({ ...cardDetails, expiry: val });
  };

  async function submit(event) {
    event.preventDefault();

    // Validation
    if (paymentMethod === "card") {
      if (cardDetails.number.replace(/\s/g, "").length < 16) {
        return notify("Enter a complete 16-digit card number.", "error");
      }
      if (!cardDetails.expiry || !cardDetails.cvv) {
        return notify("Complete card expiry date and CVV.", "error");
      }
    }

    setBusy(true);
    try {
      const paymentDetails = {
        method: paymentMethod,
        transactionId: upiTxnId || `TXN_${Date.now()}_${Math.random().toString(36).slice(-5).toUpperCase()}`,
        bankOrUpi: paymentMethod === "netbanking" ? selectedBank : paymentMethod === "upi" ? "UPI-QR" : "Card",
      };

      const order = await api("/checkout", {
        method: "POST",
        body: {
          shippingAddress: address,
          paymentMethod,
          couponCode: appliedCoupon?.code || "",
          paymentDetails,
        },
      });

      await syncCart();
      notify(`Order ${order._id.toString().slice(-7).toUpperCase()} confirmed successfully!`, "success");
      navigate("/orders");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="page"><Loading /></main>;
  if (!items.length) {
    return (
      <main className="page">
        <section className="empty-state">
          <Truck size={26} />
          <h1>Your cart is empty.</h1>
          <p>Add a plant before checking out.</p>
          <Link className="button" to="/shop">
            Browse plants <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  // Render dynamic UPI QR
  const upiPayload = `upi://pay?pa=greenleaf@icici&pn=GreenLeafPlantNursery&am=${total}&cu=INR&tn=PlantNurseryOrder`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayload)}`;

  return (
    <main className="page checkout-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Almost home</p>
          <h1>Delivery & Smart Payment</h1>
        </div>
        <Link to="/cart" className="text-link">
          <ArrowLeft size={16} /> Back to cart
        </Link>
      </div>

      <form className="checkout-layout" onSubmit={submit}>
        <section className="checkout-form">
          {/* Address Section */}
          <div className="checkout-section-title">
            <MapPin size={18} />
            <div>
              <h2>1. Delivery Address</h2>
              <p className="muted">Where should we deliver your live plants and supplies?</p>
            </div>
          </div>

          <div className="checkout-fields">
            <label>
              Full name
              <input
                autoComplete="name"
                required
                maxLength="100"
                value={address.fullName}
                onChange={(e) => updateAddress("fullName", e.target.value)}
              />
            </label>
            <label>
              Phone number
              <input
                autoComplete="tel"
                type="tel"
                required
                maxLength="30"
                value={address.phone}
                onChange={(e) => updateAddress("phone", e.target.value)}
              />
            </label>
            <label className="wide-field">
              Street address / Apartment
              <input
                autoComplete="street-address"
                required
                maxLength="200"
                value={address.addressLine}
                onChange={(e) => updateAddress("addressLine", e.target.value)}
              />
            </label>
            <label>
              City
              <input
                autoComplete="address-level2"
                required
                maxLength="80"
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
              />
            </label>
            <label>
              State / Region
              <input
                autoComplete="address-level1"
                required
                maxLength="80"
                value={address.state}
                onChange={(e) => updateAddress("state", e.target.value)}
              />
            </label>
            <label>
              Postal Code (PIN)
              <input
                autoComplete="postal-code"
                required
                maxLength="20"
                value={address.postalCode}
                onChange={(e) => updateAddress("postalCode", e.target.value)}
              />
            </label>
          </div>

          {/* Payment Method Selector */}
          <div className="checkout-section-title payment-title">
            <CreditCard size={18} />
            <div>
              <h2>2. Select Payment Method</h2>
              <p className="muted">Choose UPI, Card, Net Banking or Cash on Delivery</p>
            </div>
          </div>

          <div className="payment-methods-grid">
            {/* 1. UPI QR */}
            <div
              className={`payment-method-card ${paymentMethod === "upi" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("upi")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                  />
                </div>
                <div className="method-title-wrap">
                  <strong><QrCode size={16} /> Instant UPI / QR Scan</strong>
                  <span className="method-sub">GPay, PhonePe, Paytm, BHIM</span>
                </div>
                <span className="badge-pill instant-pill">Instant & 0% Fee</span>
              </div>

              {paymentMethod === "upi" && (
                <div className="method-body upi-body" onClick={(e) => e.stopPropagation()}>
                  <div className="upi-qr-display">
                    <img src={qrSvgUrl} alt="UPI QR Code" className="upi-qr-image" />
                    <div className="upi-qr-details">
                      <div className="upi-timer">
                        <Clock size={14} />
                        <span>QR Expires in: <strong>{Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, "0")}</strong></span>
                      </div>
                      <p className="text-xs muted">Scan with any UPI app to pay exact amount: <strong>{money(total, settings.currency)}</strong></p>
                      
                      <div className="upi-apps-row">
                        <span className="app-icon-badge">GPay</span>
                        <span className="app-icon-badge">PhonePe</span>
                        <span className="app-icon-badge">Paytm</span>
                        <span className="app-icon-badge">BHIM</span>
                      </div>

                      <div className="upi-sim-box">
                        <label className="text-xs">Optional: UPI Reference / UTR Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 40291823901"
                          value={upiTxnId}
                          onChange={(e) => setUpiTxnId(e.target.value)}
                        />
                        <button
                          type="button"
                          className="button-text-sm"
                          onClick={() => {
                            setUpiTxnId(`UPI_${Math.floor(100000000000 + Math.random() * 900000000000)}`);
                            notify("Simulated UPI App payment verified!", "success");
                          }}
                        >
                          ⚡ Auto-Verify Mock Payment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Credit / Debit Card */}
            <div
              className={`payment-method-card ${paymentMethod === "card" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                </div>
                <div className="method-title-wrap">
                  <strong><CreditCard size={16} /> Credit / Debit Card</strong>
                  <span className="method-sub">Visa, Mastercard, RuPay, Maestro</span>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="method-body card-body" onClick={(e) => e.stopPropagation()}>
                  <div className="card-input-grid">
                    <label className="full-width">
                      <span>Card Number</span>
                      <input
                        type="text"
                        maxLength="19"
                        placeholder="4532 •••• •••• 8921"
                        value={cardDetails.number}
                        onChange={handleCardNumberChange}
                      />
                    </label>
                    <label className="full-width">
                      <span>Name on Card</span>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Expiry (MM/YY)</span>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                      />
                    </label>
                    <label>
                      <span>CVV / CVC</span>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })}
                      />
                    </label>
                  </div>
                  <div className="security-tag">
                    <ShieldCheck size={14} /> 256-bit SSL Encrypted & Bank-Grade Security
                  </div>
                </div>
              )}
            </div>

            {/* 3. Net Banking */}
            <div
              className={`payment-method-card ${paymentMethod === "netbanking" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("netbanking")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === "netbanking"}
                    onChange={() => setPaymentMethod("netbanking")}
                  />
                </div>
                <div className="method-title-wrap">
                  <strong><Building2 size={16} /> Net Banking</strong>
                  <span className="method-sub">All major Indian banks supported</span>
                </div>
              </div>

              {paymentMethod === "netbanking" && (
                <div className="method-body netbanking-body" onClick={(e) => e.stopPropagation()}>
                  <label className="full-width">
                    <span>Select Bank:</span>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="HDFC">HDFC Bank</option>
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                      <option value="PNB">Punjab National Bank</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            {/* 4. Cash on Delivery */}
            <div
              className={`payment-method-card ${paymentMethod === "cod" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                </div>
                <div className="method-title-wrap">
                  <strong><Truck size={16} /> Cash on Delivery (COD)</strong>
                  <span className="method-sub">Pay cash or UPI to delivery partner upon arrival</span>
                </div>
              </div>
            </div>
          </div>

          <button className="button checkout-submit" disabled={busy}>
            {busy ? "Confirming Order…" : `Pay ${money(total, settings.currency)} & Confirm Order`}
            <ArrowRight size={17} />
          </button>
        </section>

        {/* Order Summary & Coupons Aside */}
        <aside className="summary-panel checkout-summary">
          <h2>Order Summary</h2>
          {items.map(({ product, quantity }) => (
            <div className="checkout-item" key={product._id}>
              <img src={imageSource(product.image)} alt="" />
              <span>
                {product.name} <small>× {quantity}</small>
              </span>
              <strong>{money(product.price * quantity, settings.currency)}</strong>
            </div>
          ))}

          {/* Promo Code Box */}
          <div className="coupon-box-wrap">
            <span className="coupon-box-title">
              <Tag size={15} /> Have a Promo Code?
            </span>
            {appliedCoupon ? (
              <div className="applied-coupon-pill">
                <div className="coupon-applied-info">
                  <Check size={14} className="check-green" />
                  <strong>{appliedCoupon.code}</strong>
                  <span className="discount-tag">- {money(discountAmount, settings.currency)}</span>
                </div>
                <button type="button" className="remove-coupon-btn" onClick={removeCoupon}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. WELCOME10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  className="button button-sm"
                  disabled={couponLoading || !couponCodeInput.trim()}
                  onClick={() => handleApplyCoupon()}
                >
                  {couponLoading ? "…" : "Apply"}
                </button>
              </div>
            )}

            {/* Quick Public Coupon Suggestions */}
            {!appliedCoupon && publicCoupons && publicCoupons.length > 0 && (
              <div className="coupon-suggestions">
                <span className="text-xs muted">Available offers:</span>
                <div className="coupon-chips-list">
                  {publicCoupons.slice(0, 3).map((cp) => (
                    <button
                      key={cp.code}
                      type="button"
                      className="coupon-chip-btn"
                      onClick={() => handleApplyCoupon(cp.code)}
                    >
                      <span>{cp.code}</span>
                      <small>({cp.discountType === "percentage" ? `${cp.discountValue}% off` : `₹${cp.discountValue} off`})</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr />

          <div>
            <span>Cart Subtotal</span>
            <strong>{money(subtotal, settings.currency)}</strong>
          </div>

          {discountAmount > 0 && (
            <div className="discount-row-highlight">
              <span>Coupon Discount ({appliedCoupon?.code})</span>
              <strong className="text-success">- {money(discountAmount, settings.currency)}</strong>
            </div>
          )}

          <div>
            <span>Shipping / Delivery</span>
            <strong>{shipping > 0 ? money(shipping, settings.currency) : "FREE"}</strong>
          </div>

          <div>
            <span>Tax / GST ({taxRate}%)</span>
            <strong>{money(tax, settings.currency)}</strong>
          </div>

          <hr />

          <div className="summary-total">
            <span>Total Payable</span>
            <strong>{money(total, settings.currency)}</strong>
          </div>
        </aside>
      </form>
    </main>
  );
}
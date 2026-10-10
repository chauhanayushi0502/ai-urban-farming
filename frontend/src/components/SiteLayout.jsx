import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown, Globe, Heart, Leaf, LogOut, MapPin, Menu, Moon, RefreshCw, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { useLanguage, LANGUAGES } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import NotificationBell from "./NotificationBell.jsx";

export function Header() {
  const { user, cartCount, setUser, notify, settings, theme, toggleTheme, userLocation, deviceWeather, detectDeviceLocation } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    notify(t("toast_signout", "You are signed out."));
    navigate("/");
  }

  function search(event) {
    event.preventDefault();
    if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark"><Leaf size={20} /></span>
        <span>
          {t("site_name", settings.site_name || "Green Leaf Nursery")}
          <small>{t("brand_sub", "PLANT NURSERY")}</small>
        </span>
      </Link>
      
      <form className="header-search" onSubmit={search} role="search">
        <Search size={17} />
        <input 
          value={term} 
          onChange={(event) => setTerm(event.target.value)} 
          placeholder={t("search_placeholder", "Find your next plant...")} 
          aria-label={t("search_aria", "Search plants")} 
        />
        <button type="submit" aria-label={t("search_submit", "Submit search")}>
          <ArrowRight size={17} />
        </button>
      </form>
      
      <button 
        className="mobile-menu icon-button" 
        onClick={() => setMenuOpen(!menuOpen)} 
        aria-label={menuOpen ? t("menu_close", "Close menu") : t("menu_open", "Open menu")}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
        <NavLink to="/shop" onClick={() => setMenuOpen(false)}>{t("nav_shop", "Shop")}</NavLink>
        <NavLink to="/garden" onClick={() => setMenuOpen(false)}>{t("nav_garden", "AI Garden Doctor")}</NavLink>
        <NavLink to="/calendar" onClick={() => setMenuOpen(false)}>{t("nav_calendar", "Care Calendar")}</NavLink>
        <NavLink to="/planner" onClick={() => setMenuOpen(false)}>{t("nav_planner", "Crop Planner")}</NavLink>
        <NavLink to="/pilot" onClick={() => setMenuOpen(false)}>{t("nav_pilot", "Gardener Pilot")}</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>{t("nav_story", "Our story")}</NavLink>
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>{t("nav_contact", "Contact")}</NavLink>

        {/* Live Device Location & Temperature Badge with Dropdown Weather Panel */}
        {userLocation?.city && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="gps-header-badge"
              onClick={() => setWeatherOpen(!weatherOpen)}
              title={`${t("gps_detected_toast", "Device GPS Location Detected:")} ${userLocation.city}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(49, 84, 61, 0.12)",
                color: "var(--green-deep, #1b3524)",
                border: "1px solid rgba(49, 84, 61, 0.25)",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <MapPin size={13} style={{ color: "var(--green)" }} />
              <span>{userLocation.city}</span>
              {deviceWeather?.temperature != null && (
                <span style={{ background: "var(--green)", color: "#ffffff", padding: "1px 6px", borderRadius: "10px", fontSize: "11px", fontWeight: "800" }}>
                  {deviceWeather.temperature}°C
                </span>
              )}
            </button>

            {/* Site-Wide Weather & Hourly Forecast Dropdown */}
            {weatherOpen && (
              <div
                className="weather-popover"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: "0",
                  width: "320px",
                  background: "var(--paper, #ffffff)",
                  border: "1px solid var(--line, #e2e8df)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
                  padding: "16px",
                  zIndex: 1100,
                  color: "var(--ink)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontWeight: "800", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={15} color="var(--green)" />
                      {userLocation.city}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>
                      {deviceWeather?.condition || "Sunny / Pleasant"}
                    </span>
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--green-deep)" }}>
                    {deviceWeather?.temperature ?? 28}°C
                  </div>
                </div>

                {/* Hourly Forecast (Every Hour) */}
                {deviceWeather?.hourlyForecast && deviceWeather.hourlyForecast.length > 0 && (
                  <div style={{ marginBottom: "12px", background: "rgba(49, 84, 61, 0.05)", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: "8px" }}>
                      ⏰ {t("hourly_forecast", "Hourly Weather (Every Hour)")}
                    </div>
                    <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                      {deviceWeather.hourlyForecast.map((h, i) => (
                        <div key={i} style={{ flex: "0 0 54px", textAlign: "center", background: "var(--paper, #ffffff)", border: "1px solid var(--line, #e2e8df)", borderRadius: "6px", padding: "6px 2px", fontSize: "11px" }}>
                          <div style={{ opacity: 0.7, fontSize: "10px" }}>{h.time}</div>
                          <div style={{ fontSize: "14px", margin: "2px 0" }}>{h.icon}</div>
                          <div style={{ fontWeight: "800" }}>{h.temp}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5-Day Forecast */}
                {deviceWeather?.forecast && deviceWeather.forecast.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: "6px" }}>
                      📅 {t("5_day_forecast", "5-Day Forecast")}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", fontSize: "11px" }}>
                      {deviceWeather.forecast.slice(0, 4).map((d, i) => (
                        <div key={i} style={{ textAlign: "center", background: "rgba(0,0,0,0.02)", padding: "4px", borderRadius: "4px" }}>
                          <div style={{ opacity: 0.7, fontSize: "10px" }}>{d.dayName}</div>
                          <div style={{ fontWeight: "800" }}>{d.maxTemp}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid var(--line, #e2e8df)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => { detectDeviceLocation(); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--green)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px", padding: 0 }}
                  >
                    <RefreshCw size={11} /> {t("refresh_gps", "Refresh GPS")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherOpen(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--muted)", padding: 0 }}
                  >
                    ✕ {t("close", "Close")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Language Switcher Dropdown */}
        <div className="language-selector" title="Change Language / ભાષા બદલો / भाषा बदलें">
          <Globe size={16} />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            aria-label="Select Language"
            className="lang-select"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button 
          type="button"
          className="theme-toggle-btn icon-button" 
          onClick={toggleTheme} 
          title={t("theme_toggle_title", "Toggle Light / Dark Mode")}
          aria-label={t("theme_toggle_title", "Toggle Light / Dark Mode")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
        >
          {theme === "dark" ? <Sun size={18} style={{ color: "#f59e0b" }} /> : <Moon size={18} style={{ color: "var(--green)" }} />}
        </button>

        {user ? (
          <>
            <NavLink to="/wishlist" className="nav-icon" title={t("nav_wishlist", "Wishlist")} aria-label={t("nav_wishlist", "Wishlist")}>
              <Heart size={19} />
            </NavLink>
            <NavLink to="/cart" className="nav-icon cart-link" title={t("nav_cart", "Cart")} aria-label={`${t("nav_cart", "Cart")}, ${cartCount} items`}>
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
            </NavLink>
            <NotificationBell />
            <div className="account-menu">
              <button className="account-trigger">
                <UserRound size={17} />
                <span>{user.fullName.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </button>
              <div className="account-popover">
                <Link to="/profile">{t("nav_profile", "My profile")}</Link>
                <Link to="/orders">{t("nav_orders", "My orders")}</Link>
                <Link to="/calendar">{t("nav_calendar", "Care Calendar")}</Link>
                {user.role === "admin" && <Link to="/admin">{t("nav_admin", "Admin panel")}</Link>}
                <button onClick={logout}><LogOut size={15} /> {t("nav_signout", "Sign out")}</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link className="nav-login" to="/login">{t("nav_signin", "Sign in")}</Link>
            <Link className="button button-small" to="/register">
              {t("nav_join", "Join us")} <ArrowUpRight size={15} />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  const { settings } = useApp();
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <Link to="/" className="brand footer-brand">
        <span className="brand-mark"><Leaf size={18} /></span>
        <span>
          {t("site_name", settings.site_name || "Green Leaf Nursery")}
          <small>{t("brand_tagline", "GROW A LITTLE EVERY DAY")}</small>
        </span>
      </Link>
      <p>{t("footer_tagline", "Healthy plants, thoughtful growing.")}</p>
      <div>
        <Link to="/shop">{t("footer_shop", "Shop plants")}</Link>
        <Link to="/garden">{t("nav_garden", "AI Garden Doctor")}</Link>
        <Link to="/calendar">{t("nav_calendar", "Care Calendar")}</Link>
        <Link to="/planner">{t("nav_planner", "Crop Planner")}</Link>
        <Link to="/contact">{t("footer_contact", "Contact")}</Link>
      </div>
      <small>© {new Date().getFullYear()} {t("site_name", settings.site_name || "Green Leaf Nursery")}</small>
    </footer>
  );
}

export function ToastMessage({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.kind}`} role="status">
      {toast.kind === "success" ? "✓" : "!"}
      {toast.message}
    </div>
  );
}
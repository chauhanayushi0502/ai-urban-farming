import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown, Globe, Heart, Leaf, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { useLanguage, LANGUAGES } from "../i18n/LanguageContext.jsx";
import { api } from "../lib/api.js";
import NotificationBell from "./NotificationBell.jsx";

export function Header() {
  const { user, cartCount, setUser, notify, settings } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>{t("nav_story", "Our story")}</NavLink>
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>{t("nav_contact", "Contact")}</NavLink>

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
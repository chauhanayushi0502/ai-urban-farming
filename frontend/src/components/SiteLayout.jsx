import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown, Heart, Leaf, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import NotificationBell from "./NotificationBell.jsx";

export function Header() {
  const { user, cartCount, setUser, notify, settings } = useApp();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    notify("You are signed out.");
    navigate("/");
  }

  function search(event) {
    event.preventDefault();
    if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand"><span className="brand-mark"><Leaf size={20} /></span><span>{settings.site_name || "Green Leaf"}<small>PLANT NURSERY</small></span></Link>
      <form className="header-search" onSubmit={search} role="search">
        <Search size={17} /><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Find your next plant" aria-label="Search plants" /><button type="submit" aria-label="Submit search"><ArrowRight size={17} /></button>
      </form>
      <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
        <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
        <NavLink to="/garden" onClick={() => setMenuOpen(false)}>AI Garden Doctor</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>Our story</NavLink>
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
        {user ? <>
          <NavLink to="/wishlist" className="nav-icon" title="Wishlist" aria-label="Wishlist"><Heart size={19} /></NavLink>
          <NavLink to="/cart" className="nav-icon cart-link" title="Cart" aria-label={`Cart, ${cartCount} items`}><ShoppingBag size={19} />{cartCount > 0 && <span className="count-badge">{cartCount}</span>}</NavLink>
          <NotificationBell />
          <div className="account-menu"><button className="account-trigger"><UserRound size={17} /><span>{user.fullName.split(" ")[0]}</span><ChevronDown size={14} /></button><div className="account-popover"><Link to="/profile">My profile</Link><Link to="/orders">My orders</Link>{user.role === "admin" && <Link to="/admin">Admin panel</Link>}<button onClick={logout}><LogOut size={15} /> Sign out</button></div></div>
        </> : <><Link className="nav-login" to="/login">Sign in</Link><Link className="button button-small" to="/register">Join us <ArrowUpRight size={15} /></Link></>}
      </nav>
    </header>
  );
}

export function Footer() {
  const { settings } = useApp();
  return <footer className="site-footer"><Link to="/" className="brand footer-brand"><span className="brand-mark"><Leaf size={18} /></span><span>Green Leaf<small>GROW A LITTLE EVERY DAY</small></span></Link><p>Healthy plants, thoughtful growing.</p><div><Link to="/shop">Shop plants</Link><Link to="/garden">AI Garden Doctor</Link><Link to="/contact">{settings.contact_email || "Contact"}</Link></div><small>© {new Date().getFullYear()} {settings.site_name || "Green Leaf Plant Nursery"}</small></footer>;
}

export function ToastMessage({ toast }) {
  if (!toast) return null;
  return <div className={`toast toast-${toast.kind}`} role="status">{toast.kind === "success" ? "✓" : "!"}{toast.message}</div>;
}
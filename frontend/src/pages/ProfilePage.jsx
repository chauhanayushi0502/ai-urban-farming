import { useState } from "react";
import { ArrowRight, Heart, MapPin, Package, Pencil, Phone, Sprout, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

export default function ProfilePage() {
  const { user, refreshUser, notify } = useApp();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || "", address: user.address || "" });

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try { await api("/auth/profile", { method: "PATCH", body: form }); await refreshUser(); setEditing(false); notify("Profile updated."); }
    catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }

  return <main className="page"><div className="page-heading"><div><p className="eyebrow">Your account</p><h1>My profile</h1></div><button className="button button-outline" onClick={() => setEditing(!editing)}><Pencil size={16} />{editing ? "Cancel edit" : "Edit profile"}</button></div><div className="profile-layout"><section className="profile-panel"><div className="profile-avatar">{user.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>{editing ? <form onSubmit={save} className="form-stack"><label>Full name<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label><label>Email<input value={user.email} disabled /></label><label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Address<textarea rows="3" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label><button className="button" disabled={busy}>Save changes</button></form> : <><h2>{user.fullName}</h2><p className="muted">{user.email}</p><div className="profile-details"><p><Phone size={16} />{user.phone || "No phone number added"}</p><p><MapPin size={16} />{user.address || "No address added"}</p><p><UserRound size={16} />{user.role === "admin" ? "Administrator" : "Customer account"}</p></div><div className="profile-links"><Link to="/orders"><Package size={18} /> Order history <ArrowRight size={16} /></Link><Link to="/wishlist"><Heart size={18} /> Saved plants <ArrowRight size={16} /></Link></div></>}</section><section className="profile-aside"><Sprout size={22} /><p className="eyebrow">Plant notes</p><h3>A little care goes a long way.</h3><p className="muted">Use the plant health review for practical guidance when a leaf looks a little different.</p><Link to="/plant-review" className="text-link">Review a plant <ArrowRight size={16} /></Link></section></div></main>;
}
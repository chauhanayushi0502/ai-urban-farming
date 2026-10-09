import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../context/AppContext.jsx";
import { useLoad } from "../hooks/useLoad.js";
import { api } from "../lib/api.js";

export default function NotificationBell() {
  const { data, setData } = useLoad("/notifications", { items: [], unreadCount: 0 });
  const notify = useToast();
  const [open, setOpen] = useState(false);

  async function toggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      try { setData(await api("/notifications")); }
      catch (error) { notify(error.message, "error"); }
    }
  }

  async function markRead(id) {
    try {
      const updated = await api(`/notifications/${id}/read`, { method: "PATCH" });
      setData((current) => ({
        ...current,
        items: current.items.map((item) => item._id === id ? updated : item),
        unreadCount: Math.max(0, current.unreadCount - 1),
      }));
    } catch (error) { notify(error.message, "error"); }
  }

  async function markAllRead() {
    try {
      await api("/notifications/read-all", { method: "PATCH" });
      setData((current) => ({ ...current, items: current.items.map((item) => ({ ...item, readAt: new Date().toISOString() })), unreadCount: 0 }));
    } catch (error) { notify(error.message, "error"); }
  }

  return <div className="notification-menu"><button className="icon-button notification-trigger" onClick={toggle} aria-label={`Notifications, ${data.unreadCount || 0} unread`} title="Notifications"><Bell size={19} />{data.unreadCount > 0 && <span className="count-badge">{data.unreadCount}</span>}</button>{open && <section className="notification-popover"><header><strong>Notifications</strong><button onClick={markAllRead} disabled={!data.unreadCount}><CheckCheck size={15} /> Mark all read</button></header>{data.items.length ? <div className="notification-list">{data.items.map((item) => <Link key={item._id} to={item.link || "/orders"} onClick={() => { if (!item.readAt) markRead(item._id); setOpen(false); }} className={item.readAt ? "notification-item" : "notification-item unread"}><span className="notification-dot" /><span><strong>{item.title}</strong><small>{item.message}</small><time>{new Date(item.createdAt).toLocaleString()}</time></span></Link>)}</div> : <p className="notification-empty">You’re all caught up.</p>}</section>}</div>;
}
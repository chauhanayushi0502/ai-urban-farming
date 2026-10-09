import { Link } from "react-router-dom";
import { useLoad } from "../../hooks/useLoad.js";
import { Loading } from "../../components/Feedback.jsx";

export default function AdminMessages() {
  const { data: messages, loading } = useLoad("/admin/messages", []);
  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">From the community</p><h1>Messages</h1></div></div>{loading ? <Loading /> : !messages.length ? <section className="empty-state"><h2>No messages yet</h2><p>Contact form submissions will appear here.</p><Link className="button button-outline" to="/">Back to store</Link></section> : <div className="message-list">{messages.map((message) => <article key={message._id}><div><strong>{message.name}</strong><a href={`mailto:${message.email}`}>{message.email}</a><time>{new Date(message.createdAt).toLocaleString()}</time></div><p>{message.message}</p></article>)}</div>}</div>;
}
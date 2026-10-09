import { Link } from "react-router-dom";
import { useLoad } from "../../hooks/useLoad.js";
import { Loading } from "../../components/Feedback.jsx";

export default function AdminMessages() {
  const { data: messages, loading } = useLoad("/admin/messages", []);
  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">સમુદાય તરફથી</p><h1>સંદેશાઓ</h1></div></div>{loading ? <Loading /> : !messages.length ? <section className="empty-state"><h2>હજુ સુધી કોઈ સંદેશા નથી</h2><p>સંપર્ક ફોર્મમાંથી મોકલેલા સંદેશાઓ અહીં દેખાશે.</p><Link className="button button-outline" to="/">સ્ટોર પર પાછા ફરો</Link></section> : <div className="message-list">{messages.map((message) => <article key={message._id}><div><strong>{message.name}</strong><a href={`mailto:${message.email}`}>{message.email}</a><time>{new Date(message.createdAt).toLocaleString()}</time></div><p>{message.message}</p></article>)}</div>}</div>;
}
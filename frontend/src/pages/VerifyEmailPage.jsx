import { useEffect, useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, message: "", error: "" });
  useEffect(() => {
    let active = true;
    api("/auth/verify-email", { method: "POST", body: { token: params.get("token") } })
      .then((result) => active && setState({ loading: false, message: result.message, error: "" }))
      .catch((reason) => active && setState({ loading: false, message: "", error: reason.message }))
      .catch(() => {});
    return () => { active = false; };
  }, [params]);

  return <main className="page"><section className="empty-state">{state.loading ? <span className="loader" /> : state.error ? <CircleAlert size={25} /> : <Check size={25} />}<h1>{state.loading ? "ઇમેઇલ ચકાસાઈ રહ્યું છે…" : state.error ? "વેરિફિકેશન લિંક ઉપલબ્ધ નથી" : "ઇમેઇલ ચકાસાયેલ છે"}</h1>{!state.loading && <p>{state.error || state.message}</p>}{!state.loading && <Link className="button" to="/login">સાઇન ઇન કરવા આગળ વધો</Link>}</section></main>;
}
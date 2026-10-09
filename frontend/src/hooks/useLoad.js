import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export function useLoad(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(path)
      .then((value) => active && setData(value))
      .catch((reason) => active && setError(reason.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [path]);

  return { data, setData, loading, error };
}
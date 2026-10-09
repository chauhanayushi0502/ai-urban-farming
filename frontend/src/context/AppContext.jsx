import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [settings, setSettings] = useState({ currency: "₹", site_name: "Green Leaf Plant Nursery" });
  const [toast, setToast] = useState(null);

  async function refreshUser() {
    try {
      const result = await api("/auth/me");
      setUser(result.user);
      return result.user;
    } catch {
      setUser(null);
      return null;
    }
  }

  async function syncCart() {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await api("/cart");
      setCartCount((cart.items || []).reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }

  function notify(message, kind = "success") {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 3600);
  }

  useEffect(() => {
    Promise.all([refreshUser(), api("/settings").then(setSettings).catch(() => {})]).finally(() => setReady(true));
  }, []);

  useEffect(() => { syncCart(); }, [user?.id]);

  return (
    <AppContext.Provider value={{ user, setUser, ready, cartCount, syncCart, refreshUser, settings, setSettings, notify, toast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export function useToast() {
  return useApp().notify;
}
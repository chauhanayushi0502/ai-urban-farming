import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [settings, setSettings] = useState({ currency: "₹", site_name: "ગ્રીન લીફ પ્લાન્ટ નર્સરી" });
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  // Automatic Device GPS Location & Weather State
  const [userLocation, setUserLocation] = useState(null);
  const [deviceWeather, setDeviceWeather] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  async function detectDeviceLocation() {
    setLocationLoading(true);

    const fallbackWeather = async () => {
      try {
        const res = await api("/garden/weather");
        if (res?.weather) {
          setDeviceWeather(res.weather);
          setUserLocation({
            lat: res.weather.latitude || 23.0225,
            lon: res.weather.longitude || 72.5714,
            city: res.weather.city || "Ahmedabad, Gujarat",
            isGPS: false,
          });
        }
      } catch (err) {
        console.warn("Fallback weather notice:", err);
      } finally {
        setLocationLoading(false);
      }
    };

    if (typeof window === "undefined" || !navigator.geolocation) {
      await fallbackWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await api(`/garden/weather?lat=${latitude}&lon=${longitude}`);
          if (res?.weather) {
            setDeviceWeather(res.weather);
            setUserLocation({
              lat: latitude,
              lon: longitude,
              city: res.weather.city || "Device GPS Location",
              isGPS: true,
            });
          }
        } catch (err) {
          await fallbackWeather();
        } finally {
          setLocationLoading(false);
        }
      },
      async (geoErr) => {
        console.warn("GPS Geolocation notice:", geoErr.message);
        await fallbackWeather();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

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
    Promise.all([
      refreshUser(),
      api("/settings").then(setSettings).catch(() => {}),
      detectDeviceLocation()
    ]).finally(() => setReady(true));
  }, []);

  useEffect(() => { syncCart(); }, [user?.id]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        ready,
        cartCount,
        syncCart,
        refreshUser,
        settings,
        setSettings,
        notify,
        toast,
        theme,
        setTheme,
        toggleTheme,
        userLocation,
        deviceWeather,
        locationLoading,
        detectDeviceLocation
      }}
    >
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
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations.js";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

export const LANGUAGES = [
  { code: "gu", label: "ગુજરાતી", flag: "🌿", fontClass: "font-gu" },
  { code: "en", label: "English", flag: "🇬🇧", fontClass: "font-en" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", fontClass: "font-hi" }
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { user } = useApp() || {};

  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("app_language");
    if (saved && (saved === "gu" || saved === "en" || saved === "hi")) {
      return saved;
    }
    if (typeof navigator !== "undefined") {
      const navLangs = navigator.languages || [navigator.language];
      for (const l of navLangs) {
        if (!l) continue;
        const clean = l.toLowerCase();
        if (clean.startsWith("gu")) return "gu";
        if (clean.startsWith("hi")) return "hi";
        if (clean.startsWith("en")) return "en";
      }
    }
    return "gu";
  });

  // Automatically adapt language when user logs in with saved preferred language
  useEffect(() => {
    if (user?.language && (user.language === "gu" || user.language === "en" || user.language === "hi")) {
      if (user.language !== language) {
        setLanguageState(user.language);
        localStorage.setItem("app_language", user.language);
        document.documentElement.setAttribute("lang", user.language);
        document.documentElement.setAttribute("data-lang", user.language);
      }
    }
  }, [user?.language]);

  const setLanguage = (code) => {
    if (translations[code]) {
      setLanguageState(code);
      localStorage.setItem("app_language", code);
      document.documentElement.setAttribute("lang", code);
      document.documentElement.setAttribute("data-lang", code);

      // Persist to user profile in database if logged in
      if (user?.id) {
        api("/auth/language", { method: "PATCH", body: { language: code } }).catch((err) => {
          console.warn("Could not save preferred language to profile:", err);
        });
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("data-lang", language);
  }, [language]);

  const t = (key, fallback = null) => {
    if (!key) return "";
    const langDict = translations[language] || translations["gu"] || translations["en"];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English if missing in chosen language
    if (translations["en"] && translations["en"][key] !== undefined) {
      return translations["en"][key];
    }
    return fallback !== null ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations.js";

export const LANGUAGES = [
  { code: "gu", label: "ગુજરાતી", flag: "🌿", fontClass: "font-gu" },
  { code: "en", label: "English", flag: "🇬🇧", fontClass: "font-en" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", fontClass: "font-hi" }
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("app_language") || "gu";
  });

  const setLanguage = (code) => {
    if (translations[code]) {
      setLanguageState(code);
      localStorage.setItem("app_language", code);
      document.documentElement.setAttribute("lang", code);
      document.documentElement.setAttribute("data-lang", code);
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

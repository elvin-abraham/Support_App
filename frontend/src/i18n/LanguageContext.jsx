import { createContext, useContext, useState, useEffect } from "react";
import { t as translate, pickText } from "./strings.js";

const LanguageContext = createContext(null);

const STORAGE_KEY = "support-app-language";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "en" || saved === "hi" ? saved : "hi"; // default Hindi
    } catch {
      return "hi";
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable (private browsing etc.) — language just
      // won't persist across visits, which is a harmless degradation.
    }
  }, [lang]);

  function toggleLang() {
    setLang((prev) => (prev === "hi" ? "en" : "hi"));
  }

  const value = {
    lang,
    setLang,
    toggleLang,
    t: (key, ...args) => translate(key, lang, ...args),
    pick: (englishText, hindiText) => pickText(englishText, hindiText, lang),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

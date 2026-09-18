import { useLanguage } from "../i18n/LanguageContext.jsx";

// A small pill toggle: whichever language is NOT active is the button
// you can press, styled as the "other" choice you'd switch to.
export default function LanguageToggle({ variant }) {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      type="button"
      className={`language-toggle ${variant === "overlay" ? "language-toggle--overlay" : ""}`}
      onClick={toggleLang}
      aria-label="Switch language"
    >
      <span className={lang === "hi" ? "active" : ""}>हिं</span>
      <span className="language-toggle-divider">/</span>
      <span className={lang === "en" ? "active" : ""}>EN</span>
    </button>
  );
}

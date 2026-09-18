import { useEffect, useMemo, useState } from "react";
import { fetchAllTutorials, matchTutorialQuery } from "../api/tutorials.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const MAX_SUGGESTIONS = 5;

// Free-text search: as the customer types, cheap local matching against
// the actual tutorial titles gives instant suggestions (handles normal
// typing like "How to l" -> "How to login?" with zero network cost).
// If they submit without picking a suggestion — different phrasing,
// another language, typos — that's when we call the AI matcher, which
// is a separate, much smaller request than the chatbot (no knowledge
// base involved, just the list of tutorials that actually exist).
export default function ProductSelector({ onSelectTutorial }) {
  const [tutorials, setTutorials] = useState([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const { t, pick } = useLanguage();

  useEffect(() => {
    fetchAllTutorials()
      .then(setTutorials)
      .catch(() => setLoadError(true));
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tutorials
      .filter((tut) => {
        const title = (tut.title || "").toLowerCase();
        const titleHindi = (tut.titleHindi || "").toLowerCase();
        return title.includes(q) || titleHindi.includes(q);
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [query, tutorials]);

  function selectTutorial(tut) {
    setQuery("");
    setNoMatch(false);
    onSelectTutorial({ productSlug: tut.productSlug, tutorialSlug: tut.slug });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || searching) return;

    // If a suggestion is already showing, the top one is almost
    // certainly what they mean — no need for an AI round trip.
    if (suggestions.length > 0) {
      selectTutorial(suggestions[0]);
      return;
    }

    setSearching(true);
    setNoMatch(false);
    try {
      const result = await matchTutorialQuery(query.trim());
      if (result.matched) {
        setQuery("");
        onSelectTutorial({ productSlug: result.productSlug, tutorialSlug: result.tutorialSlug });
      } else {
        setNoMatch(true);
      }
    } catch {
      setNoMatch(true);
    } finally {
      setSearching(false);
    }
  }

  if (loadError) {
    return (
      <div className="selector-card">
        <p className="selector-lead">{t("noBackend")}</p>
        <button className="btn-primary" onClick={() => onSelectTutorial(null)}>
          {t("previewSample")}
        </button>
      </div>
    );
  }

  return (
    <div className="selector-card">
      <p className="selector-lead">{t("selectorLead")}</p>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNoMatch(false);
          }}
          autoFocus
        />
        <button type="submit" className="btn-primary" disabled={searching || !query.trim()}>
          {searching ? "…" : t("searchButton")}
        </button>
      </form>

      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((tut) => (
            <li key={tut.slug}>
              <button type="button" onClick={() => selectTutorial(tut)}>
                <span className="suggestion-title">{pick(tut.title, tut.titleHindi)}</span>
                <span className="suggestion-product">{tut.productName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searching && <p className="search-status">{t("searching")}</p>}
      {noMatch && !searching && <p className="search-status search-status--empty">{t("noMatch")}</p>}
    </div>
  );
}

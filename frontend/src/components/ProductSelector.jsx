import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAllTutorials, matchTutorialQuery, sendChatMessage } from "../api/tutorials.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const MAX_SUGGESTIONS = 5;

// Two views live in this one component because they share state that
// needs to flow between them: a query that doesn't match a tutorial
// directly becomes the first chat message, and a tutorial mentioned
// mid-conversation needs the same onSelectTutorial callback the search
// suggestions use.
export default function ProductSelector({ onSelectTutorial }) {
  const [view, setView] = useState("search"); // "search" | "chat"
  const [tutorials, setTutorials] = useState([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]); // [{ role, content, tutorialSuggestion? }]
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { t, pick } = useLanguage();

  useEffect(() => {
    fetchAllTutorials()
      .then(setTutorials)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

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

  // Starts a brand-new chat from a query that didn't directly match any
  // tutorial — the query itself becomes the first message.
  async function startChat(firstMessage) {
    setView("chat");
    setQuery("");
    setNoMatch(false);
    setMessages([{ role: "user", content: firstMessage }]);
    setChatLoading(true);
    try {
      const { reply, tutorialSuggestion } = await sendChatMessage(firstMessage, []);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, tutorialSuggestion }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSearchSubmit(e) {
    e.preventDefault();
    if (!query.trim() || searching) return;

    // An already-visible suggestion is almost certainly what they mean —
    // no need for an AI round trip at all.
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
        // Not a directional/tutorial question — hand off to the chatbot.
        await startChat(query.trim());
      }
    } catch {
      setNoMatch(true);
    } finally {
      setSearching(false);
    }
  }

  async function handleChatSubmit(e) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const { reply, tutorialSuggestion } = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, tutorialSuggestion }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function resetToSearch() {
    setView("search");
    setMessages([]);
    setChatInput("");
    setQuery("");
    setNoMatch(false);
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

  if (view === "chat") {
    return (
      <div className="selector-card chat-card">
        <div className="chat-header">
          <button type="button" className="btn-ghost" onClick={resetToSearch}>
            ← {t("newSearch")}
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
              <p>{m.content}</p>
              {m.tutorialSuggestion && (
                <button
                  type="button"
                  className="chat-tutorial-card"
                  onClick={() => selectTutorial(m.tutorialSuggestion)}
                >
                  🖼️ {t("openTutorial")}: {pick(m.tutorialSuggestion.title, m.tutorialSuggestion.titleHindi)}
                </button>
              )}
            </div>
          ))}
          {chatLoading && <div className="chat-bubble chat-bubble--assistant chat-bubble--loading">{t("thinking")}</div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleChatSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder={t("chatPlaceholder")}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={chatLoading || !chatInput.trim()}>
            {t("send")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="selector-card">
      <p className="selector-lead">{t("selectorLead")}</p>

      <form className="search-form" onSubmit={handleSearchSubmit}>
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

import { useState } from "react";
import ProductSelector from "./components/ProductSelector.jsx";
import TutorialPlayer from "./components/TutorialPlayer.jsx";
import { fetchTutorial } from "./api/tutorials.js";
import sampleTutorial from "./data/sampleTutorial.json";

export default function App() {
  const [activeTutorial, setActiveTutorial] = useState(null);

  async function handleSelectTutorial(selection) {
    // null selection means "no backend available, use local sample data"
    if (!selection) {
      setActiveTutorial(sampleTutorial);
      return;
    }
    try {
      const tutorial = await fetchTutorial(selection.productSlug, selection.tutorialSlug);
      setActiveTutorial(tutorial);
    } catch {
      setActiveTutorial(sampleTutorial);
    }
  }

  return (
    <div className="app-shell">
      {/* Only shown on the selector screen — once a tutorial is playing,
          this would just take up space the image could use instead. */}
      {!activeTutorial && (
        <header className="app-header">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 7.2 13.4 10.6 16.8 12 13.4 13.4 12 16.8 10.6 13.4 7.2 12 10.6 10.6Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1>Guide</h1>
            <p>Tell us what you're stuck on and we'll walk you through it, step by step.</p>
          </div>
        </header>
      )}

      <main>
        {activeTutorial ? (
          <TutorialPlayer tutorial={activeTutorial} onExit={() => setActiveTutorial(null)} />
        ) : (
          <ProductSelector onSelectTutorial={handleSelectTutorial} />
        )}
      </main>

      {!activeTutorial && (
        <footer className="app-footer">
          <a href="/admin">Manage tutorials</a>
        </footer>
      )}
    </div>
  );
}

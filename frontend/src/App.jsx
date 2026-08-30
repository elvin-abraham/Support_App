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
          this text would just be wasted vertical space. */}
      {!activeTutorial && (
        <header className="app-header">
          <h1>Support Center</h1>
          <p>Pick a product and question to follow a step-by-step visual guide.</p>
        </header>
      )}

      <main>
        {activeTutorial ? (
          <TutorialPlayer tutorial={activeTutorial} onExit={() => setActiveTutorial(null)} />
        ) : (
          <ProductSelector onSelectTutorial={handleSelectTutorial} />
        )}
      </main>
    </div>
  );
}





// import { useState } from "react";
// import ProductSelector from "./components/ProductSelector.jsx";
// import TutorialPlayer from "./components/TutorialPlayer.jsx";
// import { fetchTutorial } from "./api/tutorials.js";
// import sampleTutorial from "./data/sampleTutorial.json";

// export default function App() {
//   const [activeTutorial, setActiveTutorial] = useState(null);

//   async function handleSelectTutorial(selection) {
//     // null selection means "no backend available, use local sample data"
//     if (!selection) {
//       setActiveTutorial(sampleTutorial);
//       return;
//     }
//     try {
//       const tutorial = await fetchTutorial(selection.productSlug, selection.tutorialSlug);
//       setActiveTutorial(tutorial);
//     } catch {
//       setActiveTutorial(sampleTutorial);
//     }
//   }

//   return (
//     <div className="app-shell">
//       <header className="app-header">
//         <h1>Support Center</h1>
//         <p>Pick a product and question to follow a step-by-step visual guide.</p>
//       </header>

//       <main>
//         {activeTutorial ? (
//           <TutorialPlayer tutorial={activeTutorial} onExit={() => setActiveTutorial(null)} />
//         ) : (
//           <ProductSelector onSelectTutorial={handleSelectTutorial} />
//         )}
//       </main>
//     </div>
//   );
// }

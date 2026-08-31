import { useEffect, useState } from "react";
import { fetchProducts, fetchTutorialsForProduct } from "../api/tutorials.js";

// Lets the customer pick "Product" then "Question", mirroring the
// two-dropdown flow described in the brief. Falls back to a friendly
// message if the backend isn't running yet — it doesn't crash the app.
export default function ProductSelector({ onSelectTutorial }) {
  const [products, setProducts] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    fetchTutorialsForProduct(selectedProduct.slug)
      .then(setTutorials)
      .catch(() => setLoadError(true));
  }, [selectedProduct]);

  if (loadError) {
    return (
      <div className="selector-card">
        <p className="selector-lead">
          We can't reach the tutorial library right now. Start the backend
          (<code>npm run dev</code> in <code>backend/</code>), or preview a
          sample walkthrough below in the meantime.
        </p>
        <button className="btn-primary" onClick={() => onSelectTutorial(null)}>
          Preview a sample tutorial
        </button>
      </div>
    );
  }

  return (
    <div className="selector-card">
      <p className="selector-lead">Pick your product, then the task you need help with.</p>

      <label>
        <span className="field-label">Product</span>
        <select
          value={selectedProduct?.slug || ""}
          onChange={(e) => {
            const product = products.find((p) => p.slug === e.target.value);
            setSelectedProduct(product || null);
            setTutorials([]);
          }}
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {selectedProduct && (
        <label>
          <span className="field-label">Question</span>
          <select
            defaultValue=""
            onChange={(e) => {
              const tutorial = tutorials.find((t) => t.slug === e.target.value);
              if (tutorial) onSelectTutorial({ productSlug: selectedProduct.slug, tutorialSlug: tutorial.slug });
            }}
          >
            <option value="">Select a question…</option>
            {tutorials.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

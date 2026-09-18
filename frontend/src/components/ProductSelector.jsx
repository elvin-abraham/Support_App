import { useEffect, useState } from "react";
import { fetchProducts, fetchTutorialsForProduct } from "../api/tutorials.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

// Lets the customer pick "Product" then "Question", mirroring the
// two-dropdown flow described in the brief. Falls back to a friendly
// message if the backend isn't running yet — it doesn't crash the app.
export default function ProductSelector({ onSelectTutorial }) {
  const [products, setProducts] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const { t, pick } = useLanguage();

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

      <label>
        <span className="field-label">{t("product")}</span>
        <select
          value={selectedProduct?.slug || ""}
          onChange={(e) => {
            const product = products.find((p) => p.slug === e.target.value);
            setSelectedProduct(product || null);
            setTutorials([]);
          }}
        >
          <option value="">{t("selectProduct")}</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {pick(p.name, p.nameHindi)}
            </option>
          ))}
        </select>
      </label>

      {selectedProduct && (
        <label>
          <span className="field-label">{t("question")}</span>
          <select
            defaultValue=""
            onChange={(e) => {
              const tutorial = tutorials.find((t) => t.slug === e.target.value);
              if (tutorial) onSelectTutorial({ productSlug: selectedProduct.slug, tutorialSlug: tutorial.slug });
            }}
          >
            <option value="">{t("selectQuestion")}</option>
            {tutorials.map((tut) => (
              <option key={tut.slug} value={tut.slug}>
                {pick(tut.title, tut.titleHindi)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

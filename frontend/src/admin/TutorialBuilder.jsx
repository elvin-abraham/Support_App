import { useEffect, useState } from "react";
import { fetchProducts } from "../api/tutorials.js";
import { uploadImage, createProduct, createTutorial, slugify } from "../api/admin.js";
import HighlightEditor from "./HighlightEditor.jsx";
import TutorialPlayer from "../components/TutorialPlayer.jsx";

const DEFAULT_HIGHLIGHT = { x: 40, y: 40, width: 20, height: 12 };
const DEFAULT_STATEMENT = { x: 40, y: 60, text: "" };

let nextLocalId = 1;
function makeEmptyStep() {
  return {
    localId: nextLocalId++,
    screenshotUrl: "",
    uploading: false,
    uploadError: "",
    showHighlights: false,
    highlights: [], // [{ x, y, width, height }]
    showStatements: false,
    statements: [], // [{ x, y, text }]
    isFinalStep: false,
    finalMessageText: "",
  };
}

export default function TutorialBuilder() {
  const [products, setProducts] = useState([]);
  const [selectedProductSlug, setSelectedProductSlug] = useState("");
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");

  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState([makeEmptyStep()]);

  const [mode, setMode] = useState("build"); // "build" | "preview" | "published"
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  function updateStep(localId, patch) {
    setSteps((prev) => prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    setSteps((prev) => [...prev, makeEmptyStep()]);
  }

  function removeSlide(localId) {
    setSteps((prev) => (prev.length > 1 ? prev.filter((s) => s.localId !== localId) : prev));
  }

  // --- Highlighter +/- ---
  function addHighlight(localId) {
    setSteps((prev) =>
      prev.map((s) =>
        s.localId === localId ? { ...s, highlights: [...s.highlights, { ...DEFAULT_HIGHLIGHT }] } : s
      )
    );
  }
  function removeHighlight(localId) {
    setSteps((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, highlights: s.highlights.slice(0, -1) } : s))
    );
  }

  // --- Statement box +/- ---
  function addStatement(localId) {
    setSteps((prev) =>
      prev.map((s) =>
        s.localId === localId ? { ...s, statements: [...s.statements, { ...DEFAULT_STATEMENT }] } : s
      )
    );
  }
  function removeStatement(localId) {
    setSteps((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, statements: s.statements.slice(0, -1) } : s))
    );
  }
  function updateStatementText(localId, index, text) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.localId !== localId) return s;
        const next = s.statements.slice();
        next[index] = { ...next[index], text };
        return { ...s, statements: next };
      })
    );
  }

  async function handleFileChange(localId, file) {
    if (!file) return;
    updateStep(localId, { uploading: true, uploadError: "" });
    try {
      const url = await uploadImage(file);
      updateStep(localId, { screenshotUrl: url, uploading: false });
    } catch (err) {
      updateStep(localId, { uploading: false, uploadError: err.message });
    }
  }

  const productSlug = isNewProduct ? slugify(newProductName) : selectedProductSlug;
  const productName = isNewProduct
    ? newProductName
    : products.find((p) => p.slug === selectedProductSlug)?.name || "";

  const readyForPreview =
    productSlug &&
    title.trim() &&
    steps.length > 0 &&
    steps.every((s) => s.screenshotUrl && !s.uploading);

  function buildTutorialPayload() {
    return {
      title: title.trim(),
      productName,
      slug: slugify(title),
      description: "",
      steps: steps.map((s, i) => ({
        stepNumber: i + 1,
        screenshotUrl: s.screenshotUrl,
        highlights: s.showHighlights ? s.highlights : [],
        statements: s.showStatements ? s.statements : [],
        finalMessage: s.isFinalStep ? s.finalMessageText : "",
        isFinalStep: s.isFinalStep,
      })),
    };
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError("");
    try {
      if (isNewProduct) {
        await createProduct(newProductName.trim(), productSlug);
      }
      const payload = buildTutorialPayload();
      await createTutorial(productSlug, payload);
      setMode("published");
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  function resetForm() {
    setTitle("");
    setSteps([makeEmptyStep()]);
    setIsNewProduct(false);
    setSelectedProductSlug("");
    setNewProductName("");
    setMode("build");
    setPublishError("");
    fetchProducts().then(setProducts).catch(() => {});
  }

  if (mode === "published") {
    return (
      <div className="admin-shell">
        <div className="admin-card admin-success">
          <h2>Tutorial published</h2>
          <p>
            "{title}" is now live for {productName}. Customers can find it from the Support Center.
          </p>
          <button className="btn-primary" onClick={resetForm}>
            Add another tutorial
          </button>
        </div>
      </div>
    );
  }

  if (mode === "preview") {
    const previewTutorial = buildTutorialPayload();
    return (
      <div className="admin-shell admin-shell--preview">
        <div className="preview-toolbar">
          <div>
            <p className="eyebrow">Previewing</p>
            <h2>{title || "Untitled tutorial"}</h2>
          </div>
          <div className="preview-toolbar-actions">
            <button className="btn-secondary" onClick={() => setMode("build")}>
              Back to edit
            </button>
            <button className="btn-primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing…" : "Confirm & Publish"}
            </button>
          </div>
        </div>
        {publishError && <p className="admin-error">{publishError}</p>}
        <div className="preview-stage">
          <TutorialPlayer tutorial={previewTutorial} onExit={() => setMode("build")} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Create a tutorial</h1>
        <p>Select a product, describe the question, then walk through each slide.</p>
      </header>

      <div className="admin-card">
        <h3>1. Product</h3>
        {!isNewProduct ? (
          <div className="admin-row">
            <select value={selectedProductSlug} onChange={(e) => setSelectedProductSlug(e.target.value)}>
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="btn-ghost-outline" onClick={() => setIsNewProduct(true)}>
              + New product
            </button>
          </div>
        ) : (
          <div className="admin-row">
            <input
              type="text"
              placeholder="e.g. Incluziv ERP"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
            <button className="btn-ghost-outline" onClick={() => setIsNewProduct(false)}>
              Use existing product
            </button>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h3>2. Question</h3>
        <input
          type="text"
          placeholder="e.g. How to add a ledger?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="admin-card">
        <h3>3. Slides</h3>
        <div className="slide-list">
          {steps.map((step, index) => (
            <div key={step.localId} className="slide-card">
              <div className="slide-card-header">
                <span className="slide-number">Slide {index + 1}</span>
                {steps.length > 1 && (
                  <button className="btn-ghost" onClick={() => removeSlide(step.localId)}>
                    Remove
                  </button>
                )}
              </div>

              {!step.screenshotUrl ? (
                <label className="upload-dropzone">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => handleFileChange(step.localId, e.target.files[0])}
                    hidden
                  />
                  {step.uploading ? "Uploading…" : "Click to upload an image"}
                </label>
              ) : (
                <>
                  <HighlightEditor
                    screenshotUrl={step.screenshotUrl}
                    highlights={step.highlights}
                    onChangeHighlights={(next) => updateStep(step.localId, { highlights: next })}
                    showHighlights={step.showHighlights}
                    statements={step.statements}
                    onChangeStatements={(next) => updateStep(step.localId, { statements: next })}
                    showStatements={step.showStatements}
                  />
                  <label className="upload-replace">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => handleFileChange(step.localId, e.target.files[0])}
                      hidden
                    />
                    Replace image
                  </label>
                </>
              )}
              {step.uploadError && <p className="admin-error">{step.uploadError}</p>}

              <div className="slide-toggles">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={step.isFinalStep}
                    onChange={(e) => updateStep(step.localId, { isFinalStep: e.target.checked })}
                  />
                  This is the final "you're done" step
                </label>

                {!step.isFinalStep && (
                  <>
                    <div className="toggle-with-stepper">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={step.showHighlights}
                          onChange={(e) => updateStep(step.localId, { showHighlights: e.target.checked })}
                        />
                        Add a highlighter
                      </label>
                      {step.showHighlights && (
                        <span className="stepper">
                          <button
                            type="button"
                            className="btn-stepper"
                            onClick={() => addHighlight(step.localId)}
                            aria-label="Add highlighter"
                          >
                            +
                          </button>
                          <span className="stepper-count">{step.highlights.length}</span>
                          <button
                            type="button"
                            className="btn-stepper"
                            onClick={() => removeHighlight(step.localId)}
                            disabled={step.highlights.length === 0}
                            aria-label="Remove last highlighter"
                          >
                            −
                          </button>
                        </span>
                      )}
                    </div>

                    <div className="toggle-with-stepper">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={step.showStatements}
                          onChange={(e) => updateStep(step.localId, { showStatements: e.target.checked })}
                        />
                        Add a statement box
                      </label>
                      {step.showStatements && (
                        <span className="stepper">
                          <button
                            type="button"
                            className="btn-stepper"
                            onClick={() => addStatement(step.localId)}
                            aria-label="Add statement box"
                          >
                            +
                          </button>
                          <span className="stepper-count">{step.statements.length}</span>
                          <button
                            type="button"
                            className="btn-stepper"
                            onClick={() => removeStatement(step.localId)}
                            disabled={step.statements.length === 0}
                            aria-label="Remove last statement box"
                          >
                            −
                          </button>
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {step.showStatements && step.statements.length > 0 && (
                <div className="statement-text-list">
                  {step.statements.map((st, i) => (
                    <div key={i} className="statement-text-row">
                      <span className="statement-text-label">Statement {i + 1}</span>
                      <textarea
                        className="instruction-input"
                        placeholder="e.g. Enter your username here."
                        value={st.text}
                        onChange={(e) => updateStatementText(step.localId, i, e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}

              {step.isFinalStep && (
                <textarea
                  className="instruction-input"
                  placeholder="e.g. You're now logged in."
                  value={step.finalMessageText}
                  onChange={(e) => updateStep(step.localId, { finalMessageText: e.target.value })}
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>

        <button className="btn-add-slide" onClick={addSlide}>
          + Add another slide
        </button>
      </div>

      <div className="admin-actions">
        <button className="btn-primary" disabled={!readyForPreview} onClick={() => setMode("preview")}>
          Preview tutorial
        </button>
        {!readyForPreview && (
          <p className="admin-hint">
            Select a product, enter a question, and make sure every slide has an image before previewing.
          </p>
        )}
      </div>
    </div>
  );
}

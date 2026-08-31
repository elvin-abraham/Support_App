import { useEffect, useState } from "react";
import { fetchProducts } from "../api/tutorials.js";
import { uploadImage, createProduct, createTutorial, slugify } from "../api/admin.js";
import HighlightEditor from "./HighlightEditor.jsx";
import TutorialPlayer from "../components/TutorialPlayer.jsx";

let nextLocalId = 1;
function makeEmptyStep() {
  return {
    localId: nextLocalId++,
    screenshotUrl: "",
    uploading: false,
    uploadError: "",
    showHighlight: false,
    highlight: null, // { x, y, width, height }
    showInstruction: false,
    instructionText: "",
    isFinalStep: false,
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
        highlightX: s.showHighlight && s.highlight ? s.highlight.x : 0,
        highlightY: s.showHighlight && s.highlight ? s.highlight.y : 0,
        highlightWidth: s.showHighlight && s.highlight ? s.highlight.width : 0,
        highlightHeight: s.showHighlight && s.highlight ? s.highlight.height : 0,
        instructionText: s.showInstruction || s.isFinalStep ? s.instructionText : "",
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
                    highlight={step.highlight}
                    onChangeHighlight={(h) => updateStep(step.localId, { highlight: h })}
                    showHighlight={step.showHighlight && !step.isFinalStep}
                    instructionText={step.instructionText}
                    showInstruction={step.showInstruction && !step.isFinalStep}
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
                    onChange={(e) =>
                      updateStep(step.localId, {
                        isFinalStep: e.target.checked,
                        showHighlight: e.target.checked ? false : step.showHighlight,
                      })
                    }
                  />
                  This is the final "you're done" step
                </label>

                {!step.isFinalStep && (
                  <>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={step.showHighlight}
                        onChange={(e) =>
                          updateStep(step.localId, {
                            showHighlight: e.target.checked,
                            highlight: e.target.checked ? step.highlight : null,
                          })
                        }
                      />
                      Add a highlighter
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={step.showInstruction}
                        onChange={(e) => updateStep(step.localId, { showInstruction: e.target.checked })}
                      />
                      Add a statement box
                    </label>
                  </>
                )}
              </div>

              {(step.showInstruction || step.isFinalStep) && (
                <textarea
                  className="instruction-input"
                  placeholder={
                    step.isFinalStep ? "e.g. You're now logged in." : "e.g. Enter your username here."
                  }
                  value={step.instructionText}
                  onChange={(e) => updateStep(step.localId, { instructionText: e.target.value })}
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

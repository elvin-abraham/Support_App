import { useState, useRef, useEffect, useCallback } from "react";
import HighlightBox from "./HighlightBox.jsx";
import InstructionCard from "./InstructionCard.jsx";

// Generic tutorial player. It knows nothing about "login" specifically —
// it just walks through whatever `steps` array it's given.
export default function TutorialPlayer({ tutorial, onExit }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = tutorial.steps || [];
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  // Each step can have any number of independent highlights and
  // statement boxes now, not just one of each.
  const highlights = Array.isArray(step?.highlights) ? step.highlights : [];
  const statements = Array.isArray(step?.statements) ? step.statements : [];

  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const [renderedSize, setRenderedSize] = useState(null);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img || !img.naturalWidth || !img.naturalHeight) return;

    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;
    const scale = Math.min(stageW / img.naturalWidth, stageH / img.naturalHeight);

    setRenderedSize({
      width: img.naturalWidth * scale,
      height: img.naturalHeight * scale,
    });
  }, []);

  useEffect(() => {
    setRenderedSize(null);
    if (imgRef.current && imgRef.current.complete) {
      measure();
    }
  }, [step?.screenshotUrl, measure]);

  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [measure]);

  if (!step) {
    return <p>This tutorial has no steps yet.</p>;
  }

  function goNext() {
    if (!isLastStep) setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  return (
    <div className="tutorial-player">
      <div className="top-bar">
        <div className="tutorial-header">
          <div>
            <p className="eyebrow">{tutorial.productName}</p>
            <h2>{tutorial.title}</h2>
          </div>
          {onExit && (
            <button className="btn-ghost" onClick={onExit}>
              <span>Exit</span>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <ol className="trail" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
          {steps.map((s, i) => {
            const state = i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming";
            return (
              <li key={s.stepNumber} className={`trail-item trail-item--${state}`}>
                <span className="trail-dot">{i < stepIndex ? "✓" : i + 1}</span>
                {i < steps.length - 1 && <span className="trail-line" />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="screenshot-stage" ref={stageRef}>
        <div
          className="screenshot-frame"
          style={renderedSize ? { width: renderedSize.width, height: renderedSize.height } : undefined}
        >
          <img
            ref={imgRef}
            src={step.screenshotUrl}
            alt={`Step ${step.stepNumber}`}
            className="screenshot"
            onLoad={measure}
          />

          {highlights.map((h, i) => (
            <HighlightBox
              key={`highlight-${i}`}
              x={Number(h.x) || 0}
              y={Number(h.y) || 0}
              width={Number(h.width) || 0}
              height={Number(h.height) || 0}
            />
          ))}

          {statements.map((s, i) => (
            <InstructionCard key={`statement-${i}`} x={Number(s.x) || 0} y={Number(s.y) || 0} text={s.text} />
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        {Boolean(step.isFinalStep) && (
          <div className="final-note">
            <p>{step.finalMessage}</p>
          </div>
        )}
        <div className="tutorial-controls">
          <button className="btn-secondary" onClick={goBack} disabled={stepIndex === 0}>
            Back
          </button>
          <span className="step-count">
            Step {stepIndex + 1} of {steps.length}
          </span>
          {isLastStep ? (
            <button className="btn-primary" onClick={onExit}>
              Done
            </button>
          ) : (
            <button className="btn-primary" onClick={goNext}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

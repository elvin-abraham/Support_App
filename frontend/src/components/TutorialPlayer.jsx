import { useState, useRef, useEffect, useCallback } from "react";
import HighlightBox from "./HighlightBox.jsx";
import InstructionCard from "./InstructionCard.jsx";

// Generic tutorial player. It knows nothing about "login" specifically —
// it just walks through whatever `steps` array it's given. This is what
// makes adding a new tutorial ("How to generate an invoice", etc.) a
// content change, not a new component.
export default function TutorialPlayer({ tutorial, onExit }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = tutorial.steps || [];
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  // MySQL DECIMAL columns come back as strings (e.g. "28.00"), not
  // numbers. Coerce once here so every arithmetic use below is safe.
  const highlightX = Number(step?.highlightX) || 0;
  const highlightY = Number(step?.highlightY) || 0;
  const highlightWidth = Number(step?.highlightWidth) || 0;
  const highlightHeight = Number(step?.highlightHeight) || 0;

  // "stage" is the space left over between the top bar and bottom bar.
  // "frame" is sized in JS to exactly match the image's own aspect
  // ratio, scaled up as large as the stage allows.
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

  const cardY = Math.min(highlightY + highlightHeight + 2, 88);

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

        {/* The trail: each waypoint is a step, connected in sequence —
            a more literal "you are here on the path" indicator than a
            plain progress bar. */}
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
          <HighlightBox
            x={highlightX}
            y={highlightY}
            width={highlightWidth}
            height={highlightHeight}
          />
          {highlightWidth > 0 && (
            <InstructionCard x={highlightX} y={cardY} text={step.instructionText} />
          )}
        </div>
      </div>

      <div className="bottom-bar">
        {Boolean(step.isFinalStep) && (
          <div className="final-note">
            <p>{step.instructionText}</p>
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

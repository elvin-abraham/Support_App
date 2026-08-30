import { useState } from "react";
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

  if (!step) {
    return <p>This tutorial has no steps yet.</p>;
  }

  function goNext() {
    if (!isLastStep) setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  // Place the instruction card just under the highlight, clamped so it
  // doesn't run off the bottom of the screenshot.
  const cardY = Math.min(step.highlightY + step.highlightHeight + 2, 88);

  return (
    <div className="tutorial-player">
      <div className="tutorial-header">
        <div>
          <p className="eyebrow">{tutorial.productName}</p>
          <h2>{tutorial.title}</h2>
        </div>
        {onExit && (
          <button className="btn-ghost" onClick={onExit}>
            Exit tutorial
          </button>
        )}
      </div>

      <div className="progress-track" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
        {steps.map((s, i) => (
          <div key={s.stepNumber} className={`progress-dot ${i <= stepIndex ? "filled" : ""}`} />
        ))}
      </div>

      <div className="screenshot-frame">
        <img src={step.screenshotUrl} alt={`Step ${step.stepNumber}`} className="screenshot" />
        <HighlightBox
          x={step.highlightX}
          y={step.highlightY}
          width={step.highlightWidth}
          height={step.highlightHeight}
        />
        {step.highlightWidth > 0 && (
          <InstructionCard x={step.highlightX} y={cardY} text={step.instructionText} />
        )}
      </div>

      {step.isFinalStep && (
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
  );
}

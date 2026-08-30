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

  const frameRef = useRef(null);
  const imgRef = useRef(null);
  // The wrapper's exact rendered size in pixels, computed to match how
  // the browser would "contain"-fit the image inside the frame. We size
  // the wrapper to this exactly (instead of relying on CSS max-height
  // percentages, which don't resolve correctly here) so the highlight
  // box and instruction card always line up with the visible image.
  const [renderedSize, setRenderedSize] = useState(null);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth || !img.naturalHeight) return;

    const frameW = frame.clientWidth;
    const frameH = frame.clientHeight;
    const scale = Math.min(frameW / img.naturalWidth, frameH / img.naturalHeight);

    setRenderedSize({
      width: img.naturalWidth * scale,
      height: img.naturalHeight * scale,
    });
  }, []);

  // Re-measure whenever the step (and therefore the image) changes.
  useEffect(() => {
    setRenderedSize(null);
    // If the browser already has this image cached, "load" may not fire
    // again — check `complete` and measure immediately in that case.
    if (imgRef.current && imgRef.current.complete) {
      measure();
    }
  }, [step?.screenshotUrl, measure]);

  // Re-measure if the window/frame is resized.
  useEffect(() => {
    if (!frameRef.current) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(frameRef.current);
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

      <div className="screenshot-frame" ref={frameRef}>
        <div
          className="screenshot-wrapper"
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
            x={step.highlightX}
            y={step.highlightY}
            width={step.highlightWidth}
            height={step.highlightHeight}
          />
          {step.highlightWidth > 0 && (
            <InstructionCard x={step.highlightX} y={cardY} text={step.instructionText} />
          )}
        </div>
      </div>

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
  );
}




// import { useState } from "react";
// import HighlightBox from "./HighlightBox.jsx";
// import InstructionCard from "./InstructionCard.jsx";

// // Generic tutorial player. It knows nothing about "login" specifically —
// // it just walks through whatever `steps` array it's given. This is what
// // makes adding a new tutorial ("How to generate an invoice", etc.) a
// // content change, not a new component.
// export default function TutorialPlayer({ tutorial, onExit }) {
//   const [stepIndex, setStepIndex] = useState(0);
//   const steps = tutorial.steps || [];
//   const step = steps[stepIndex];
//   const isLastStep = stepIndex === steps.length - 1;

//   if (!step) {
//     return <p>This tutorial has no steps yet.</p>;
//   }

//   function goNext() {
//     if (!isLastStep) setStepIndex((i) => i + 1);
//   }

//   function goBack() {
//     if (stepIndex > 0) setStepIndex((i) => i - 1);
//   }

//   // Place the instruction card just under the highlight, clamped so it
//   // doesn't run off the bottom of the screenshot.
//   const cardY = Math.min(step.highlightY + step.highlightHeight + 2, 88);

//   return (
//     <div className="tutorial-player">
//       <div className="tutorial-header">
//         <div>
//           <p className="eyebrow">{tutorial.productName}</p>
//           <h2>{tutorial.title}</h2>
//         </div>
//         {onExit && (
//           <button className="btn-ghost" onClick={onExit}>
//             Exit tutorial
//           </button>
//         )}
//       </div>

//       <div className="progress-track" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
//         {steps.map((s, i) => (
//           <div key={s.stepNumber} className={`progress-dot ${i <= stepIndex ? "filled" : ""}`} />
//         ))}
//       </div>

//       <div className="screenshot-frame">
//         {/* screenshot-wrapper shrink-wraps to the image's actual rendered
//             size (not the outer frame), so percentage-based highlight
//             positions always line up with real pixels on the image even
//             when the frame's aspect ratio differs from the screenshot's. */}
//         <div className="screenshot-wrapper">
//           <img src={step.screenshotUrl} alt={`Step ${step.stepNumber}`} className="screenshot" />
//           <HighlightBox
//             x={step.highlightX}
//             y={step.highlightY}
//             width={step.highlightWidth}
//             height={step.highlightHeight}
//           />
//           {step.highlightWidth > 0 && (
//             <InstructionCard x={step.highlightX} y={cardY} text={step.instructionText} />
//           )}
//         </div>
//       </div>

//       {Boolean(step.isFinalStep) && (
//         <div className="final-note">
//           <p>{step.instructionText}</p>
//         </div>
//       )}

//       <div className="tutorial-controls">
//         <button className="btn-secondary" onClick={goBack} disabled={stepIndex === 0}>
//           Back
//         </button>
//         <span className="step-count">
//           Step {stepIndex + 1} of {steps.length}
//         </span>
//         {isLastStep ? (
//           <button className="btn-primary" onClick={onExit}>
//             Done
//           </button>
//         ) : (
//           <button className="btn-primary" onClick={goNext}>
//             Next
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

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

  // "stage" is the space left over between the top bar and bottom bar
  // (which now each take their own row again, not floating overlays).
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
      {/* Top bar: product name, title, exit, progress dots — its own row,
          sitting directly above the image, not on top of it. */}
      <div className="top-bar">
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

      {/* Bottom bar: Back/Next, step count — its own row, directly below
          the image. */}
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




// import { useState, useRef, useEffect, useCallback } from "react";
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

//   // MySQL DECIMAL columns come back as strings (e.g. "28.00"), not
//   // numbers. Coerce once here so every arithmetic use below is safe.
//   const highlightX = Number(step?.highlightX) || 0;
//   const highlightY = Number(step?.highlightY) || 0;
//   const highlightWidth = Number(step?.highlightWidth) || 0;
//   const highlightHeight = Number(step?.highlightHeight) || 0;

//   // "stage" now spans the ENTIRE player box (header/controls float over
//   // it as overlays instead of taking their own flow space), so the
//   // image gets as much of the screen as its own aspect ratio allows.
//   const stageRef = useRef(null);
//   const imgRef = useRef(null);
//   const [renderedSize, setRenderedSize] = useState(null);

//   const measure = useCallback(() => {
//     const stage = stageRef.current;
//     const img = imgRef.current;
//     if (!stage || !img || !img.naturalWidth || !img.naturalHeight) return;

//     const stageW = stage.clientWidth;
//     const stageH = stage.clientHeight;
//     const scale = Math.min(stageW / img.naturalWidth, stageH / img.naturalHeight);

//     setRenderedSize({
//       width: img.naturalWidth * scale,
//       height: img.naturalHeight * scale,
//     });
//   }, []);

//   useEffect(() => {
//     setRenderedSize(null);
//     if (imgRef.current && imgRef.current.complete) {
//       measure();
//     }
//   }, [step?.screenshotUrl, measure]);

//   useEffect(() => {
//     if (!stageRef.current) return;
//     const observer = new ResizeObserver(() => measure());
//     observer.observe(stageRef.current);
//     return () => observer.disconnect();
//   }, [measure]);

//   if (!step) {
//     return <p>This tutorial has no steps yet.</p>;
//   }

//   function goNext() {
//     if (!isLastStep) setStepIndex((i) => i + 1);
//   }

//   function goBack() {
//     if (stepIndex > 0) setStepIndex((i) => i - 1);
//   }

//   const cardY = Math.min(highlightY + highlightHeight + 2, 88);

//   return (
//     <div className="tutorial-player">
//       <div className="screenshot-stage" ref={stageRef}>
//         <div
//           className="screenshot-frame"
//           style={renderedSize ? { width: renderedSize.width, height: renderedSize.height } : undefined}
//         >
//           <img
//             ref={imgRef}
//             src={step.screenshotUrl}
//             alt={`Step ${step.stepNumber}`}
//             className="screenshot"
//             onLoad={measure}
//           />
//           <HighlightBox
//             x={highlightX}
//             y={highlightY}
//             width={highlightWidth}
//             height={highlightHeight}
//           />
//           {highlightWidth > 0 && (
//             <InstructionCard x={highlightX} y={cardY} text={step.instructionText} />
//           )}
//         </div>
//       </div>

//       {/* Floating overlay bar — sits on top of the image, doesn't take its own row */}
//       <div className="overlay-top">
//         <div className="tutorial-header">
//           <div>
//             <p className="eyebrow">{tutorial.productName}</p>
//             <h2>{tutorial.title}</h2>
//           </div>
//           {onExit && (
//             <button className="btn-ghost" onClick={onExit}>
//               Exit tutorial
//             </button>
//           )}
//         </div>
//         <div className="progress-track" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
//           {steps.map((s, i) => (
//             <div key={s.stepNumber} className={`progress-dot ${i <= stepIndex ? "filled" : ""}`} />
//           ))}
//         </div>
//       </div>

//       {/* Floating overlay bar — bottom controls, same idea */}
//       <div className="overlay-bottom">
//         {Boolean(step.isFinalStep) && (
//           <div className="final-note">
//             <p>{step.instructionText}</p>
//           </div>
//         )}
//         <div className="tutorial-controls">
//           <button className="btn-secondary" onClick={goBack} disabled={stepIndex === 0}>
//             Back
//           </button>
//           <span className="step-count">
//             Step {stepIndex + 1} of {steps.length}
//           </span>
//           {isLastStep ? (
//             <button className="btn-primary" onClick={onExit}>
//               Done
//             </button>
//           ) : (
//             <button className="btn-primary" onClick={goNext}>
//               Next
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
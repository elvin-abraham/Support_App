import { useState, useRef, useEffect, useCallback } from "react";

const MIN_SIZE = 3; // smallest allowed highlight, as a percentage of the image

// Renders a screenshot, sized as large as the available space allows
// (same "fit exactly, no cropping" approach the live tutorial player
// uses), with an optional draggable/resizable highlight box on top.
//
// - If `highlight` is null/zero-sized and `showHighlight` is true, the
//   admin can click-and-drag anywhere on the image to draw a new box.
// - Once a box exists, dragging its body moves it; dragging the small
//   handle in its bottom-right corner resizes it.
// - All positions are reported back as percentages of the image (the
//   same coordinate system the published tutorial uses), so what you
//   see here is exactly what customers will see.
export default function HighlightEditor({
  screenshotUrl,
  highlight,
  onChangeHighlight,
  showHighlight,
  instructionText,
  showInstruction,
}) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const [renderedSize, setRenderedSize] = useState(null);
  const dragState = useRef(null); // { mode: 'move' | 'resize' | 'draw', ... }

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img || !img.naturalWidth || !img.naturalHeight) return;
    const scale = Math.min(stage.clientWidth / img.naturalWidth, stage.clientHeight / img.naturalHeight);
    setRenderedSize({ width: img.naturalWidth * scale, height: img.naturalHeight * scale });
  }, []);

  useEffect(() => {
    setRenderedSize(null);
    if (imgRef.current && imgRef.current.complete) measure();
  }, [screenshotUrl, measure]);

  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [measure]);

  const hasBox = highlight && highlight.width > 0 && highlight.height > 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pxToPercent(px, axis) {
    if (!renderedSize) return 0;
    return (px / renderedSize[axis]) * 100;
  }

  function handlePointerDown(e, mode) {
    if (!showHighlight || !renderedSize) return;
    e.preventDefault();
    e.stopPropagation();
    dragState.current = {
      mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startHighlight: highlight || { x: 0, y: 0, width: 0, height: 0 },
    };
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  }

  function handleStageMouseDown(e) {
    // Only start "draw a new box" if there isn't one yet.
    if (!showHighlight || hasBox || !renderedSize) return;
    const rect = imgRef.current.getBoundingClientRect();
    const startX = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const startY = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    dragState.current = { mode: "draw", originX: startX, originY: startY };
    onChangeHighlight({ x: startX, y: startY, width: 0, height: 0 });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  }

  function handlePointerMove(e) {
    const drag = dragState.current;
    if (!drag || !renderedSize) return;

    if (drag.mode === "draw") {
      const rect = imgRef.current.getBoundingClientRect();
      const currentX = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const currentY = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
      const x = Math.min(drag.originX, currentX);
      const y = Math.min(drag.originY, currentY);
      const width = Math.abs(currentX - drag.originX);
      const height = Math.abs(currentY - drag.originY);
      onChangeHighlight({ x, y, width, height });
      return;
    }

    const deltaXPct = pxToPercent(e.clientX - drag.startClientX, "width");
    const deltaYPct = pxToPercent(e.clientY - drag.startClientY, "height");
    const start = drag.startHighlight;

    if (drag.mode === "move") {
      const x = clamp(start.x + deltaXPct, 0, 100 - start.width);
      const y = clamp(start.y + deltaYPct, 0, 100 - start.height);
      onChangeHighlight({ ...start, x, y });
    } else if (drag.mode === "resize") {
      const width = clamp(start.width + deltaXPct, MIN_SIZE, 100 - start.x);
      const height = clamp(start.height + deltaYPct, MIN_SIZE, 100 - start.y);
      onChangeHighlight({ ...start, width, height });
    }
  }

  function handlePointerUp() {
    dragState.current = null;
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
  }

  const cardY = hasBox ? Math.min(highlight.y + highlight.height + 2, 88) : 0;

  return (
    <div className="editor-stage" ref={stageRef}>
      <div
        className="editor-frame"
        style={renderedSize ? { width: renderedSize.width, height: renderedSize.height } : undefined}
        onMouseDown={handleStageMouseDown}
      >
        <img ref={imgRef} src={screenshotUrl} alt="Slide preview" className="editor-image" onLoad={measure} />

        {showHighlight && !hasBox && (
          <div className="editor-hint">Click and drag on the image to draw a highlight</div>
        )}

        {showHighlight && hasBox && (
          <div
            className="editor-highlight"
            style={{
              left: `${highlight.x}%`,
              top: `${highlight.y}%`,
              width: `${highlight.width}%`,
              height: `${highlight.height}%`,
            }}
            onMouseDown={(e) => handlePointerDown(e, "move")}
          >
            <div className="editor-resize-handle" onMouseDown={(e) => handlePointerDown(e, "resize")} />
          </div>
        )}

        {showInstruction && hasBox && instructionText && (
          <div
            className="editor-instruction-preview"
            style={{ left: `${highlight.x}%`, top: `${cardY}%` }}
          >
            {instructionText}
          </div>
        )}
      </div>
    </div>
  );
}

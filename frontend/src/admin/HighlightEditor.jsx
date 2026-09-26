import { useState, useRef, useEffect, useCallback } from "react";

const MIN_SIZE = 3;

export default function HighlightEditor({
  screenshotUrl,
  highlights,
  onChangeHighlights,
  showHighlights,
  statements,
  onChangeStatements,
  showStatements,
}) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const [renderedSize, setRenderedSize] = useState(null);
  const dragState = useRef(null);

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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function pxToPercent(px, axis) {
    if (!renderedSize) return 0;
    return (px / renderedSize[axis]) * 100;
  }
  function startDrag(e, kind, index, mode) {
    e.preventDefault();
    e.stopPropagation();
    const list = kind === "highlight" ? highlights : statements;
    dragState.current = { kind, index, mode, startClientX: e.clientX, startClientY: e.clientY, startBox: { ...list[index] } };
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  }
  function handlePointerMove(e) {
    const drag = dragState.current;
    if (!drag || !renderedSize) return;
    const deltaXPct = pxToPercent(e.clientX - drag.startClientX, "width");
    const deltaYPct = pxToPercent(e.clientY - drag.startClientY, "height");
    const start = drag.startBox;
    if (drag.kind === "highlight") {
      const width = start.width ?? 20;
      const height = start.height ?? 10;
      if (drag.mode === "move") {
        const x = clamp(start.x + deltaXPct, 0, 100 - width);
        const y = clamp(start.y + deltaYPct, 0, 100 - height);
        updateHighlight(drag.index, { ...start, x, y });
      } else if (drag.mode === "resize") {
        const newWidth = clamp(width + deltaXPct, MIN_SIZE, 100 - start.x);
        const newHeight = clamp(height + deltaYPct, MIN_SIZE, 100 - start.y);
        updateHighlight(drag.index, { ...start, width: newWidth, height: newHeight });
      }
    } else {
      const x = clamp(start.x + deltaXPct, 0, 96);
      const y = clamp(start.y + deltaYPct, 0, 96);
      updateStatement(drag.index, { ...start, x, y });
    }
  }
  function handlePointerUp() {
    dragState.current = null;
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
  }
  function updateHighlight(index, box) {
    const next = highlights.slice();
    next[index] = box;
    onChangeHighlights(next);
  }
  function updateStatement(index, note) {
    const next = statements.slice();
    next[index] = note;
    onChangeStatements(next);
  }

  const nothingToShow = (showHighlights || showStatements) && highlights.length === 0 && statements.length === 0;

  return (
    <div className="editor-stage" ref={stageRef}>
      <div className="editor-frame" style={renderedSize ? { width: renderedSize.width, height: renderedSize.height } : undefined}>
        <img ref={imgRef} src={screenshotUrl} alt="Slide preview" className="editor-image" onLoad={measure} />
        {showHighlights && highlights.map((h, i) => (
          <div key={`h-${i}`} className="editor-highlight" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.width}%`, height: `${h.height}%` }} onMouseDown={(e) => startDrag(e, "highlight", i, "move")}>
            <span className="editor-badge">{i + 1}</span>
            <div className="editor-resize-handle" onMouseDown={(e) => startDrag(e, "highlight", i, "resize")} />
          </div>
        ))}
        {showStatements && statements.map((s, i) => (
          <div key={`s-${i}`} className="editor-statement" style={{ left: `${s.x}%`, top: `${s.y}%` }} onMouseDown={(e) => startDrag(e, "statement", i, "move")}>
            <span className="editor-badge editor-badge--statement">{i + 1}</span>
            <span className="editor-statement-text">{s.text ? s.text : <em>Type this statement's text below</em>}</span>
          </div>
        ))}
        {nothingToShow && <div className="editor-hint">Use the + buttons below to add a highlighter or statement box</div>}
      </div>
    </div>
  );
}


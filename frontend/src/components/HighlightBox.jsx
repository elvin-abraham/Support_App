export default function HighlightBox({ x, y, width, height }) {
  if (!width || !height) return null;
  return (
    <div
      className="highlight-box"
      style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }}
    />
  );
}

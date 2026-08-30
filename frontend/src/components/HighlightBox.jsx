// Renders a highlighted rectangle over part of the screenshot.
// x/y/width/height are all percentages (0-100) of the screenshot's own
// dimensions, so the box stays correctly placed at any render size.
export default function HighlightBox({ x, y, width, height }) {
  if (!width || !height) return null;

  return (
    <div
      className="highlight-box"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
    />
  );
}

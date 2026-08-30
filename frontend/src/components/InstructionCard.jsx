// The small instruction bubble anchored near the highlighted area.
// Positioned just below the highlight box by default; nudge with the
// x/y props if a step needs the card placed elsewhere to avoid overlap.
export default function InstructionCard({ x, y, text }) {
  return (
    <div
      className="instruction-card"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <p>{text}</p>
    </div>
  );
}

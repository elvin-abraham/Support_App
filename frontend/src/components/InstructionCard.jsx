export default function InstructionCard({ x, y, text }) {
  return (
    <div className="instruction-card" style={{ left: `${x}%`, top: `${y}%` }}>
      <p>{text}</p>
    </div>
  );
}

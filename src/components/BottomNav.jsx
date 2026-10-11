// The bottom bar: Learn, Games, Progress, and End session (only after you have practiced).
export default function BottomNav({ onGo, onEnd, canEnd }) {
  return (
    <nav className="nav">
      <button className="btn ghost" onClick={() => onGo("home")}>Learn</button>
      <button className="btn ghost" onClick={() => onGo("games")}>Games</button>
      <button className="btn ghost" onClick={() => onGo("progress")}>Progress</button>
      {canEnd && <button className="btn" onClick={onEnd}>End session</button>}
    </nav>
  );
}
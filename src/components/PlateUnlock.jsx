// The gold plate that spins in when you finish a unit. Click anywhere to close it.
export default function PlateUnlock({ title, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="plate-big"><span>UNLOCKED<br />★<br />{title}</span></div>
      <h2>Gold plate earned!</h2>
      <button className="btn" style={{ width: 200 }} onClick={onClose}>Continue</button>
    </div>
  );
}
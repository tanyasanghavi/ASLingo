// Always visible once you are logged in. "ASLingo" takes you back to the Learn page.
export default function TopBar({ user, onHome, onLogout }) {
  return (
    <header className="top">
      <button className="btn ghost" onClick={onHome}>ASLingo</button>
      <span>{user}</span>
      <button className="btn ghost" onClick={onLogout}>Log out</button>
    </header>
  );
}
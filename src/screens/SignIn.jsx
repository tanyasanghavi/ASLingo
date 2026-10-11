import { useState } from "react";

// Log in, or make a new account. The wizard is drawn behind this screen by App.jsx.
export default function SignIn({ onAuth, players }) {
  const [mode, setMode] = useState("login");
  const [u, setU] = useState(""), [p, setP] = useState(""), [p2, setP2] = useState("");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (mode === "signup" && p !== p2) return setErr("Passwords don't match");
    setBusy(true);
    const msg = await onAuth(mode, u, p);
    setBusy(false);
    if (msg) setErr(msg);
  };
  const pick = (m) => { setMode(m); setErr(""); setP(""); setP2(""); };

  return (
    <main className="screen">
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 44 }}>ASLingo</h1>
        <p>Learn sign language with a coach that watches you and helps you improve in real time.</p>
        <small>Tap the wizard!</small>
      </div>
      <form className="stack card" onSubmit={submit} autoComplete="off">
        <div className="tabs">
          <button type="button" className={"opt" + (mode === "login" ? " on" : "")} onClick={() => pick("login")}>Log in</button>
          <button type="button" className={"opt" + (mode === "signup" ? " on" : "")} onClick={() => pick("signup")}>New user</button>
        </div>
        {mode === "login" && players.length > 0 && (
          <div><small>Players on this device (tap your name):</small>
            <div className="tabs" style={{ marginTop: 6 }}>{players.map((n) => <button type="button" key={n} className={"opt" + (u === n ? " on" : "")} onClick={() => setU(n)}>{n}</button>)}</div>
          </div>
        )}
        <input name="aslingo-user" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} autoComplete="off" />
        <input name="aslingo-pass" type="password" placeholder={mode === "signup" ? "Create a password (6+ characters)" : "Password"} value={p} onChange={(e) => setP(e.target.value)} autoComplete="new-password" />
        {mode === "signup" && <input name="aslingo-pass2" type="password" placeholder="Confirm password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" />}
        {err && <small style={{ color: "#ff8fa3" }}>{err}</small>}
        <button className="btn" type="submit" disabled={busy || !u.trim() || !p}>{mode === "login" ? "Log in" : "Create account"}</button>
        <small style={{ opacity: 0.7 }}>Your camera video stays on your device.</small>
      </form>
    </main>
  );
}
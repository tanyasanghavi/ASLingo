import { useState } from "react";

// First screen. "Continue with Google" or "Continue with email".
// The 3D wizard is drawn behind this screen by App.jsx (tap him!).
// Both buttons are still a mock: real Google/email sign-in comes later (Firebase Auth).
export default function SignIn({ onSignIn }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const valid = /^\S+@\S+\.\S+$/.test(email.trim());

  return (
    <main className="screen signin">
      <div>
        <h1 className="logo">ASLingo</h1>
        <p className="tagline">Learn sign language with a coach that watches you and helps you improve in real time.</p>
        <p className="hint">Tap the wizard!</p>
      </div>

      <div className="stack">
        <button className="btn" onClick={() => onSignIn("player@aslingo.dev", "google")}>Continue with Google</button>

        {!emailOpen ? (
          <button className="btn ghost" onClick={() => setEmailOpen(true)}>Continue with email</button>
        ) : (
          <form className="stack" onSubmit={(e) => { e.preventDefault(); if (valid) onSignIn(email, "email"); }}>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
            <button className="btn ghost" type="submit" disabled={!valid}>Sign in</button>
          </form>
        )}
        <p className="fine">By continuing you agree to the Terms and Privacy Policy. Camera video stays on your device.</p>
      </div>
    </main>
  );
}
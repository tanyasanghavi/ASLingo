import { useState } from 'react'
import Wizard3D from '../components/Wizard3D.jsx'

export default function SignIn({ onSignIn }) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <main className="screen center">
      <div className="hero-wizard">
        <Wizard3D height={380} />
        <p className="hint">Tap the wizard. Drag to spin him.</p>
      </div>

      <h1 className="logo">
        ASL<span style={{ textTransform: 'lowercase' }}>ingo</span>
      </h1>
      <p className="tagline">Learn sign language with a coach that watches you and helps you improve in real time.</p>

      <div className="stack">
        {/* Step 2 replaces these with real Google / email sign-in (Firebase Auth). */}
        <button className="btn primary" onClick={() => onSignIn('player@aslingo.dev', 'google')}>
          Continue with Google
        </button>

        {!emailOpen ? (
          <button className="btn ghost" onClick={() => setEmailOpen(true)}>
            Continue with email
          </button>
        ) : (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault()
              if (email.includes('@')) onSignIn(email, 'email')
            }}
          >
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <button className="btn ghost" type="submit" disabled={!email.includes('@')}>
              Sign in
            </button>
          </form>
        )}
      </div>

      <p className="fine">By continuing you agree to the Terms and Privacy Policy. Camera video stays on your device.</p>
    </main>
  )
}
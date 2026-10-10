import { useState } from 'react'

const LEVELS = [
  { id: 'beginner', title: 'Beginner', sub: "I'm new to sign language" },
  { id: 'some', title: 'Some signs', sub: 'I know the alphabet and a few words' },
  { id: 'advanced', title: 'Advanced', sub: 'I can hold simple conversations' },
]
const MINUTES = [
  { v: 5, label: 'Casual' },
  { v: 10, label: 'Regular' },
  { v: 20, label: 'Serious' },
]

export default function Onboarding({ onDone }) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState(null)
  const [minutes, setMinutes] = useState(null)

  const answered = [name.trim(), level, minutes].filter(Boolean).length
  const ready = answered === 3

  return (
    <main className="screen">
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={answered}>
        <span style={{ width: `${(answered / 3) * 100}%` }} />
      </div>

      <h2 className="title">Tell us about you</h2>

      <label className="q" htmlFor="name">What should we call you?</label>
      <input id="name" className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />

      <p className="q">What is your sign language level?</p>
      <div className="stack">
        {LEVELS.map((l) => (
          <button key={l.id} className={`choice ${level === l.id ? 'selected' : ''}`} onClick={() => setLevel(l.id)}>
            <strong>{l.title}</strong>
            <span>{l.sub}</span>
          </button>
        ))}
      </div>

      <p className="q">How much do you want to practice daily?</p>
      <div className="row3">
        {MINUTES.map((m) => (
          <button key={m.v} className={`choice small ${minutes === m.v ? 'selected' : ''}`} onClick={() => setMinutes(m.v)}>
            <strong>{m.v} min</strong>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="spacer" />
      <button className="btn primary" disabled={!ready} onClick={() => onDone({ name: name.trim(), level, dailyMinutes: minutes })}>
        Continue
      </button>
    </main>
  )
}
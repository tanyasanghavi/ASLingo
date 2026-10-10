import { useState } from 'react'
import Wizard3D from '../components/Wizard3D.jsx'
import { UNITS, isUnitUnlocked, lessonId } from '../data/curriculum.js'

export default function Home({ profile, update }) {
  const [unitId, setUnitId] = useState('alphabet')
  const unit = UNITS.find((u) => u.id === unitId)
  const done = profile.completed

  // The first lesson in the unit that isn't completed is the "current" one.
  const currentIndex = unit.lessons.findIndex((_, i) => !done.includes(lessonId(unit, i)))

  // Placeholder until the lesson player exists. It lets you test streak + XP right now.
  const startLesson = (i) => {
    update({ completed: [...done, lessonId(unit, i)], xp: profile.xp + 20, streak: Math.max(profile.streak, 1) })
  }

  return (
    <div className="home">
      <header className="topbar">
        <span className="chip">{profile.name}</span>
        <div className="chips">
          <span className="chip gold">Streak {profile.streak}</span>
          <span className="chip purple">{profile.xp} XP</span>
        </div>
      </header>

      <section className="wizard-ask">
        <Wizard3D height={230} />
        <div className="bubble">What do you want to learn today, {profile.name}?</div>
      </section>

      <section className="units" aria-label="Courses">
        {UNITS.map((u) => {
          const unlocked = isUnitUnlocked(u, profile.level)
          return (
            <button
              key={u.id}
              className={`unit ${u.id === unitId ? 'selected' : ''}`}
              disabled={!unlocked}
              onClick={() => setUnitId(u.id)}
            >
              <strong>{u.title}</strong>
              <span>{unlocked ? u.blurb : 'Locked'}</span>
            </button>
          )
        })}
      </section>

      <section className="path" aria-label={`${unit.title} lessons`}>
        {unit.lessons.map((label, i) => {
          const isDone = done.includes(lessonId(unit, i))
          const isCurrent = i === currentIndex
          const state = isDone ? 'done' : isCurrent ? 'current' : 'locked'
          return (
            <div key={label} className="node-row" style={{ transform: `translateX(${Math.sin(i * 1.3) * 56}px)` }}>
              <button
                className={`node ${state}`}
                disabled={state === 'locked'}
                onClick={() => isCurrent && startLesson(i)}
                aria-label={`${label}, ${state}`}
              >
                {isDone ? '✓' : i + 1}
              </button>
              <span className="node-label">{label}</span>
            </div>
          )
        })}
        {currentIndex === -1 && <p className="fine">Unit complete. Pick another course above.</p>}
      </section>
    </div>
  )
}
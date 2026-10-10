const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'games', label: 'Games' },
  { id: 'battle', label: 'Battle' },
  { id: 'progress', label: 'Progress' },
  { id: 'me', label: 'Me' },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={tab === t.id ? 'active' : ''}
          aria-current={tab === t.id ? 'page' : undefined}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
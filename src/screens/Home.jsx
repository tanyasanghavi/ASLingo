import { UNITS, WORDS, SENTENCES, SECTIONS, LETTERS, NUMBERS } from "../data/curriculum";
const OFFSETS = [0, 50, 80, 50, 0]; // the zigzag, in pixels

// A round gold plate. Gray and dashed until the unit is complete.
const Plate = ({ on }) => <span className={"plate" + (on ? " gold" : "")} title={on ? "Unit complete!" : "Finish this unit to earn the gold plate"}>★</span>;

export default function Home({ state, section, setSection, open, currentOf, onStart }) {
  const done = (l) => (state.best[l] || 0) >= 85;
  const list = section === "numbers" ? NUMBERS : LETTERS;
  const cur = currentOf(list);
  return (
    <div className="screen">
      <div className="row">
        <h2>Hello, {state.profile.name}</h2>
        <span className="card" style={{ padding: "6px 12px" }}>Streak {state.streak} · {state.xp} XP</span>
      </div>

      <div className="tabs">
        {SECTIONS.map(([id, t]) => (
          <button key={id} disabled={!open[id]} className={"opt" + (section === id ? " on" : "")} onClick={() => setSection(id)}>{t}{!open[id] && " (locked)"}</button>
        ))}
      </div>

      {section === "letters" || section === "numbers" ? (
        <div className="stack" style={{ alignItems: "center", paddingLeft: 120 }}>
          <p className="card">What shall we learn today?</p>
          {UNITS[section].map((u) => (
            <div key={u.title} className="stack" style={{ alignItems: "center", paddingLeft: 0 }}>
              <div className="card row" style={{ width: "100%" }}><b>{u.title}</b><Plate on={u.items.every(done)} /></div>
              {u.items.map((l) => {
                const i = list.indexOf(l), locked = i > cur;
                return <button key={l} className={"node" + (done(l) ? " done" : "") + (locked ? " locked" : "")} style={{ marginLeft: OFFSETS[i % OFFSETS.length] }} disabled={locked} onClick={() => onStart(l)} aria-label={`Lesson ${l}`}>{l}</button>;
              })}
            </div>
          ))}
        </div>
      ) : !open[section] ? (
        <p className="card stack">Finish all the letters and numbers to unlock {section}.</p>
      ) : section === "words" ? (
        <div className="stack">
          {Object.entries(WORDS).map(([cat, words], i) => (
            <div key={cat} className="card">
              <div className="row"><b>Unit {i + 1}: {cat}</b><Plate on={false} /></div>
              {words.map((w) => <div key={w} className="row"><span>{w}</span><small>Demo coming soon</small></div>)}
            </div>
          ))}
        </div>
      ) : (
        <div className="stack">
          <div className="card">
            <div className="row"><b>Unit 1: Greetings and feelings</b><Plate on={false} /></div>
            {SENTENCES.map((t) => <div key={t} className="row"><span>{t}</span><small>Demo coming soon</small></div>)}
          </div>
        </div>
      )}
      <span />
    </div>
  );
}
import { useState } from "react";
import { LETTERS, NUMBERS, WORDS, SENTENCES, SECTIONS } from "../data/curriculum";
const OFFSETS = [0, 50, 80, 50, 0]; // the zigzag, in pixels

export default function Home({ state, section, setSection, open, currentOf, onStart }) {
  const [cat, setCat] = useState("Nouns");
  const best = (l) => state.best[l] || 0;
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
          {list.map((l, i) => {
            const locked = i > cur, done = best(l) >= 85;
            return <button key={l} className={"node" + (done ? " done" : "") + (locked ? " locked" : "")} style={{ marginLeft: OFFSETS[i % OFFSETS.length] }} disabled={locked} onClick={() => onStart(l)} aria-label={`Lesson ${l}`}>{l}</button>;
          })}
        </div>
      ) : !open[section] ? (
        <p className="card stack">Finish all the letters and numbers to unlock {section}.</p>
      ) : section === "words" ? (
        <div className="stack">
          <div className="tabs">{Object.keys(WORDS).map((c) => <button key={c} className={"opt" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}</div>
          {WORDS[cat].map((w) => <div key={w} className="card row"><b>{w}</b><small>Demo coming soon</small></div>)}
        </div>
      ) : (
        <div className="stack">{SENTENCES.map((t) => <div key={t} className="card row"><b>{t}</b><small>Demo coming soon</small></div>)}</div>
      )}
      <span />
    </div>
  );
}
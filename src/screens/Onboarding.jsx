import { useState } from "react";
const LEVELS = [["Beginner", "I'm new to sign language"], ["Some signs", "I know the alphabet and a few words"], ["Advanced", "I can hold simple conversations"]];
const GOALS = [5, 10, 20];

export default function Onboarding({ onDone }) {
  const [name, setName] = useState(""), [level, setLevel] = useState("Beginner"), [goal, setGoal] = useState(10);
  return (
    <div className="screen">
      <h2>Tell me about you</h2>
      <div className="stack card">
        <label>What should I call you?<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
        <div>What is your level?
          {LEVELS.map(([l, d]) => <button key={l} className={"opt" + (level === l ? " on" : "")} onClick={() => setLevel(l)}><b>{l}</b><br /><small>{d}</small></button>)}
        </div>
        <div>How long will you practice each day?
          <div className="row">{GOALS.map((g) => <button key={g} className={"opt" + (goal === g ? " on" : "")} onClick={() => setGoal(g)}>{g} min</button>)}</div>
        </div>
        <button className="btn" disabled={!name.trim()} onClick={() => onDone({ name: name.trim(), level, goal })}>Continue</button>
      </div>
    </div>
  );
}
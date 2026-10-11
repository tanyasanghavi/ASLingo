import { useEffect, useState } from "react";
import Challenge from "../components/Challenge";
import OnlineBattle from "./OnlineBattle";
import Social from "./Social";
import { LESSONS } from "../data/curriculum";
import { myId } from "../lib/net";

const pick = () => LESSONS[Math.floor(Math.random() * LESSONS.length)];
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function Bingo({ award }) {
  const [card] = useState(() => Array.from({ length: 9 }, pick));
  const [marked, setMarked] = useState([]), [idx, setIdx] = useState(() => Math.floor(Math.random() * 9));
  const won = LINES.some((l) => l.every((i) => marked.includes(i)));
  const hit = () => {
    const m = [...marked, idx]; setMarked(m); award(5);
    if (LINES.some((l) => l.every((i) => m.includes(i)))) return award(50);
    const rest = [0,1,2,3,4,5,6,7,8].filter((i) => !m.includes(i));
    setIdx(rest[Math.floor(Math.random() * rest.length)]);
  };
  return (
    <div className="stack">
      <p className="card">{won ? "BINGO! +50 points" : <>Sign <b>{card[idx]}</b> to mark the glowing square</>}</p>
      <div className="grid3">{card.map((l, i) => <div key={i} className={"opt" + (marked.includes(i) ? " on" : "")} style={{ textAlign: "center", outline: i === idx && !won ? "2px dashed #ffd24a" : "none" }}>{l}</div>)}</div>
      {!won && <Challenge token={idx + "-" + marked.length} target={card[idx]} onHit={hit} />}
    </div>
  );
}

function Battle({ award }) {
  const [round, setRound] = useState(1), [target, setTarget] = useState(pick), [left, setLeft] = useState(8);
  const [me, setMe] = useState(0), [cpu, setCpu] = useState(0), [end, setEnd] = useState(false);
  const finish = (mine) => { // mine = your points this round, the computer gets 10-18
    const m = me + mine, c = cpu + 10 + Math.floor(Math.random() * 9);
    setMe(m); setCpu(c);
    if (round === 5) { setEnd(true); award(m > c ? 40 : 15); } else { setRound(round + 1); setTarget(pick()); setLeft(8); }
  };
  useEffect(() => { if (end) return; const t = setInterval(() => setLeft((l) => l - 1), 1000); return () => clearInterval(t); }, [round, end]);
  useEffect(() => { if (left <= 0 && !end) finish(0); }, [left]);
  return (
    <div className="stack">
      <div className="card row"><span>You {me}</span><span>Round {round}/5 · {Math.max(left, 0)}s</span><span>Computer {cpu}</span></div>
      {end ? <p className="card">{me > cpu ? "You win! +40 points" : "Good try! +15 points"}</p>
        : <><p className="card">Sign <b>{target}</b> before time runs out!</p><Challenge token={round} target={target} onHit={() => finish(10 + left)} /></>}
    </div>
  );
}

export default function Games({ state, award }) {
  const [g, setG] = useState(null), [tab, setTab] = useState("play");
  const me = { id: myId, name: state.profile.name, points: state.gamePoints + state.xp };
  const games = [
    ["online", "Sign Battle (online)", "Face a random player. You only see their score"],
    ["bingo", "ASL Bingo", "Sign called letters to fill a line"],
    ["battle", "Battle vs Computer", "5 quick rounds against the clock"],
  ];
  return (
    <div className="screen">
      <div className="row"><h2>Games</h2><span className="card" style={{ padding: "6px 12px" }}>Daily streak {state.gameStreak} · {state.gamePoints} pts</span></div>
      {g === "online" ? <OnlineBattle me={me} award={award} /> : g === "bingo" ? <Bingo award={award} /> : g === "battle" ? <Battle award={award} /> : (
        <div className="stack">
          <div className="row">
            {[["play", "Play"], ["board", "Leaderboard"], ["teams", "Teams"]].map(([id, t]) => (
              <button key={id} className={"opt" + (tab === id ? " on" : "")} style={{ textAlign: "center", margin: 0 }} onClick={() => setTab(id)}>{t}</button>
            ))}
          </div>
          {tab === "play" ? <>
            {games.map(([id, t, d]) => <div key={id} className="card row"><div><b>{t}</b><br /><small>{d}</small></div><button className="btn" style={{ width: 90 }} onClick={() => setG(id)}>Play</button></div>)}
            <div className="card" style={{ opacity: 0.6 }}><b>ASL Uno</b>: coming soon</div>
          </> : <Social tab={tab} me={me} />}
        </div>
      )}
      {g ? <div className="stack"><button className="btn ghost" onClick={() => setG(null)}>Back to games</button></div> : <span />}
    </div>
  );
}
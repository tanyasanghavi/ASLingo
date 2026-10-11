import { useEffect, useRef, useState } from "react";
import Challenge from "../components/Challenge";
import { LESSONS } from "../data/curriculum";
import { send, listen } from "../lib/net";
const pick = () => LESSONS[Math.floor(Math.random() * LESSONS.length)];

// 5 rounds against a random online player. You only ever see their SCORE, never their camera.
export default function OnlineBattle({ me, award }) {
  const [match, setMatch] = useState(null), [round, setRound] = useState(0), [left, setLeft] = useState(8);
  const [mine, setMine] = useState(0), [opp, setOpp] = useState({ total: 0, done: 0, left: false }), [paid, setPaid] = useState(false);
  const matched = useRef(false);

  useEffect(() => { // look for a random player; after 6 seconds play a bot so nobody waits forever
    const off = listen((m) => {
      if (m.type === "matched") { matched.current = true; setMatch({ opponent: m.opponent, targets: m.targets, bot: false }); }
      if (m.type === "opp") setOpp((o) => ({ ...o, total: m.total, done: m.done }));
      if (m.type === "left") setOpp((o) => ({ ...o, left: true }));
    });
    send({ type: "hello", ...me });
    send({ type: "find", signs: LESSONS });
    const t = setTimeout(() => {
      if (matched.current) return;
      send({ type: "leave" });
      setMatch({ opponent: "Wizard Bot", targets: Array.from({ length: 5 }, pick), bot: true });
    }, 6000);
    return () => { off(); clearTimeout(t); send({ type: "leave" }); };
  }, []);

  const playing = !!match && round < 5;
  useEffect(() => { if (!playing) return; const t = setInterval(() => setLeft((l) => l - 1), 1000); return () => clearInterval(t); }, [playing]);
  useEffect(() => { if (playing && left <= 0) finish(0); }, [left]);

  const finish = (pts) => { // pts = your points this round (0 if time ran out)
    const total = mine + pts;
    setMine(total); setRound(round + 1); setLeft(8);
    if (match.bot) setOpp((o) => ({ ...o, total: o.total + 10 + Math.floor(Math.random() * 9), done: o.done + 1 }));
    else send({ type: "score", total, done: round + 1 });
  };
  const over = !!match && round >= 5 && (match.bot || opp.done >= 5 || opp.left);
  useEffect(() => { if (over && !paid) { setPaid(true); award(mine > opp.total ? 60 : 20); } }, [over]);

  if (!match) return <p className="card">Searching for a random player...</p>;
  return (
    <div className="stack">
      <div className="card row"><span>You {mine}</span><span>{round < 5 ? `Round ${round + 1}/5 · ${Math.max(left, 0)}s` : "Done"}</span><span>{match.opponent} {opp.total}</span></div>
      <small>You can only see their score, never their camera.</small>
      {round < 5
        ? <><p className="card">Sign <b>{match.targets[round]}</b>!</p><Challenge token={round} target={match.targets[round]} onHit={() => finish(10 + left)} /></>
        : over ? <p className="card">{mine > opp.total ? "You win! +60 points" : "Good game! +20 points"}</p>
        : <p className="card">Waiting for {match.opponent} to finish...</p>}
    </div>
  );
}
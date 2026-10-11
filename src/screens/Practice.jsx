import { useCallback, useRef, useState } from "react";
import Camera from "../components/Camera";
import { SIGNS, describe } from "../data/curriculum";
import { scoreSign } from "../lib/scoring";
import { palmFacing, zone, motion } from "../lib/features";

// Phases: "demo" (the wizard's hand shows the sign) then "turn" (camera opens, live coaching).
export default function Practice({ sign, onDone, onExit, onPhase, onReplay, onSample, onEnd }) {
  const [phase, setPhase] = useState("demo");
  const [res, setRes] = useState({ score: 0, mistakes: [] });
  const [info, setInfo] = useState(null), [tip, setTip] = useState("");
  const hold = useRef(0), finished = useRef(false), trail = useRef([]);
  const latest = useRef(null), lastKey = useRef(""), timer = useRef(0), busy = useRef(false);

  // Ask Gemini (through your server) for one short tip. Never two calls at once.
  const askCoach = async () => {
    if (busy.current || !latest.current) return;
    busy.current = true;
    try {
      const r = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latest.current) });
      setTip((await r.json()).tip);
    } catch {}
    busy.current = false;
  };

  const onFrame = useCallback(({ hand, isRight, face }) => {
    if (!hand || finished.current) return;
    const palm = palmFacing(hand, isRight);
    const r = scoreSign(hand, SIGNS[sign], { palm });
    trail.current = [...trail.current.slice(-7), hand[0]];
    const size = Math.hypot(hand[0].x - hand[9].x, hand[0].y - hand[9].y);
    const f = { palm, location: zone(hand[0]), motion: motion(trail.current, size), face };
    setRes(r); setInfo(f); onSample(sign, r.score, r.mistakes[0]);
    latest.current = { sign, score: r.score, mistakes: r.mistakes, f };
    const key = r.mistakes.join("|");
    if (key !== lastKey.current) { lastKey.current = key; clearTimeout(timer.current); timer.current = setTimeout(askCoach, 700); }
    if (r.score >= 85) {
      hold.current ||= performance.now();
      if (performance.now() - hold.current > 1000) { finished.current = true; onDone(sign, r.score); }
    } else hold.current = 0;
  }, [sign]);

  return (
    <div className="screen">
      <div className="row">
        <button className="btn ghost" style={{ width: 100 }} onClick={onExit}>Back</button>
        <button className="btn ghost" style={{ width: 140 }} onClick={onEnd}>End session</button>
      </div>
      {phase === "demo" ? (
        <div className="stack">
          <p className="card">Watch the wizard's hand. This is <b>{sign}</b>.<br /><small>{describe(sign)}</small></p>
          <div className="row">
            <button className="btn ghost" onClick={onReplay}>Watch again</button>
            <button className="btn" onClick={() => { setPhase("turn"); onPhase("turn"); }}>My turn</button>
          </div>
        </div>
      ) : (
        <div className="stack" style={{ maxWidth: 520 }}>
          <Camera onFrame={onFrame} />
          <div className="bar"><div style={{ width: res.score + "%" }} /></div>
          {info && <div className="chips">Palm: {info.palm} · Hand: {info.location} · {info.motion} · Brows: {info.face?.brows || "?"} · Mouth: {info.face?.mouth || "?"}</div>}
          <p className="card"><small>Wizard says:</small><br />{res.mistakes.length ? tip || res.mistakes[0] : "Perfect! Hold it steady."}</p>
        </div>
      )}
    </div>
  );
}
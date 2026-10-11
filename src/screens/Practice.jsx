import { useCallback, useRef, useState } from "react";
import Camera from "../components/Camera";
import { SIGNS, describe } from "../data/curriculum";
import { scoreSign } from "../lib/scoring";
import { palmFacing, zone, motion } from "../lib/features";
const kind = (s) => (/\d/.test(s) ? "number" : "letter");

// Phases: "demo" (the wizard's hand shows the sign) then "turn" (camera opens, live coaching).
export default function Practice({ sign, onDone, onExit, onPhase, onReplay, onSample, onEnd }) {
  const [phase, setPhase] = useState("demo");
  const [res, setRes] = useState({ score: 0, mistakes: [] });
  const [info, setInfo] = useState(null), [tip, setTip] = useState(null);
  const hold = useRef(0), finished = useRef(false), trail = useRef([]);
  const latest = useRef(null), lastKey = useRef(""), timer = useRef(0), busy = useRef(false);

  // Ask Gemini (through your server) what you are signing and what to fix. Never two calls at once.
  const askCoach = async () => {
    const req = latest.current;
    if (busy.current || !req) return;
    busy.current = true;
    try {
      const r = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
      setTip({ text: (await r.json()).tip, key: req.key });
    } catch {}
    busy.current = false;
  };

  const onFrame = useCallback(({ hand, isRight, face }) => {
    if (!hand || finished.current) return;
    const palm = palmFacing(hand, isRight);
    const r = scoreSign(hand, SIGNS[sign], { palm });
    // Which sign does the hand look like? Score the hand against EVERY sign and keep the best matches.
    const ranked = Object.entries(SIGNS).map(([k, t]) => [k, scoreSign(hand, t, { palm }).score])
      .sort((a, b) => b[1] - a[1] || (b[0] === sign) - (a[0] === sign));
    const detected = ranked[0][1] >= 80 ? ranked.filter((x) => x[1] >= ranked[0][1] - 2).slice(0, 3).map(([k, s]) => ({ sign: k, kind: kind(k), score: s })) : [];
    trail.current = [...trail.current.slice(-7), hand[0]];
    const size = Math.hypot(hand[0].x - hand[9].x, hand[0].y - hand[9].y);
    const f = { palm, location: zone(hand[0]), motion: motion(trail.current, size), face };
    const key = r.mistakes.join("|") + "#" + detected.map((d) => d.sign).join("");
    setRes(r); setInfo({ ...f, key, detected }); onSample(sign, r.score, r.mistakes[0]);
    latest.current = { sign, score: r.score, mistakes: r.mistakes, f, detected, key };
    if (key !== lastKey.current) { lastKey.current = key; clearTimeout(timer.current); timer.current = setTimeout(askCoach, 700); } // ask only when something changes and stays steady
    if (r.score >= 85) {
      hold.current ||= performance.now();
      if (performance.now() - hold.current > 1000) { finished.current = true; onDone(sign, r.score); }
    } else hold.current = 0;
  }, [sign]);

  // Gemini's answer is used when it matches what the camera sees right now. Otherwise show the instant local version.
  const d = info?.detected || [];
  const head = d.length ? `You are signing the ${d[0].kind} ${d.map((x) => x.sign).join(" or ")}.` : "I can't tell what you are signing yet.";
  const body = res.mistakes.length ? res.mistakes[0] : "Perfect! Hold it steady.";
  const say = tip && tip.key === info?.key ? tip.text : `${head} ${body}`;

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
          <p className="card"><small>Wizard says:</small><br />{say}</p>
        </div>
      )}
    </div>
  );
}
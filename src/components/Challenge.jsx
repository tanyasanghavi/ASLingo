import { useEffect, useRef, useState } from "react";
import Camera from "./Camera";
import { SIGNS } from "../data/curriculum";
import { scoreSign } from "../lib/scoring";
import { palmFacing } from "../lib/features";

// Shows the camera and calls onHit when you hold the target sign for half a second.
// Change `token` to start a new round WITHOUT restarting the camera.
export default function Challenge({ target, token, onHit }) {
  const hold = useRef(0), done = useRef(false), [score, setScore] = useState(0);
  useEffect(() => { hold.current = 0; done.current = false; setScore(0); }, [token]);
  const onFrame = ({ hand, isRight }) => {
    if (!hand || done.current) return;
    const r = scoreSign(hand, SIGNS[target], { palm: palmFacing(hand, isRight) });
    setScore(r.score);
    if (r.score >= 85) { hold.current ||= performance.now(); if (performance.now() - hold.current > 500) { done.current = true; onHit(); } } else hold.current = 0;
  };
  return <><Camera onFrame={onFrame} /><div className="bar"><div style={{ width: score + "%" }} /></div></>;
}
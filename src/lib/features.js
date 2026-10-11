// Turns raw hand/face numbers into simple words the app (and Gemini) can use.
// Palm direction: cross product of (wrist -> index knuckle) and (wrist -> pinky knuckle).
// Which side the thumb is on flips between left and right hands, so we need isRight.
export function palmFacing(lm, isRight) {
  const a = { x: lm[5].x - lm[0].x, y: lm[5].y - lm[0].y };
  const b = { x: lm[17].x - lm[0].x, y: lm[17].y - lm[0].y };
  const z = a.x * b.y - a.y * b.x;
  return (isRight ? z < 0 : z > 0) ? "camera" : "away";
}
// Where the wrist is on screen. x is flipped because your preview is a mirror.
export const zone = (p) => `${p.y < 0.33 ? "high" : p.y > 0.66 ? "low" : "middle"}-${1 - p.x < 0.33 ? "left" : 1 - p.x > 0.66 ? "right" : "center"}`;
// How far the wrist moved over the last few frames, compared to hand size.
export function motion(trail, size) {
  if (trail.length < 5) return "still";
  const a = trail[0], b = trail[trail.length - 1];
  const d = Math.hypot(a.x - b.x, a.y - b.y) / size; // tune these numbers
  return d > 1 ? "moving fast" : d > 0.4 ? "moving" : "still";
}
// Face markers from MediaPipe "blendshapes" (scores from 0 to 1).
export function faceSummary(cats) {
  const v = (n) => cats.find((c) => c.categoryName === n)?.score || 0;
  const down = (v("browDownLeft") + v("browDownRight")) / 2;
  return {
    brows: v("browInnerUp") > 0.4 ? "raised" : down > 0.4 ? "lowered" : "neutral",
    mouth: v("jawOpen") > 0.3 ? "open" : "closed",
    smiling: (v("mouthSmileLeft") + v("mouthSmileRight")) / 2 > 0.4,
  };
}
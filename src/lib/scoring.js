// Compares the 21 hand points from MediaPipe to the target handshape.
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
const FINGERS = [["index", 6, 8, 5], ["middle", 10, 12, 9], ["ring", 14, 16, 13], ["pinky", 18, 20, 17]]; // name, middle joint, tip, knuckle
const TIPS = [8, 12, 16, 20], NAMES = ["index", "middle", "ring", "pinky"];

export function scoreSign(lm, t, ctx = {}) {
  const palm = dist(lm[0], lm[9]); // hand size, so distance from the camera doesn't matter
  const mistakes = [];
  let pts = 0, total = 0;
  FINGERS.forEach(([name, pip, tip, mcp], i) => {
    const want = t.fingers[i];
    total++;
    if (want === 0.5) { // curved finger: not straight, not fully curled
      const r = dist(lm[tip], lm[0]) / dist(lm[mcp], lm[0]); // tune 1.25 and 1.75 by testing
      if (r > 1.25 && r < 1.75) pts++;
      else mistakes.push(`Curve your ${name} finger gently.`);
    } else {
      const ext = dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]);
      if (ext === !!want) pts++;
      else mistakes.push(`Your ${name} finger should be ${want ? "straight" : "curled"}.`);
    }
  });
  const tucked = dist(lm[4], lm[9]) / palm < 0.6; // tune this number by testing
  total++;
  if (tucked === t.thumbTucked) pts++;
  else mistakes.push(t.thumbTucked ? "Tuck your thumb across your palm." : "Move your thumb out to the side.");
  if (t.touch !== undefined) { // thumb must touch one fingertip (numbers 6-9, letter F)
    total++;
    if (dist(lm[4], lm[TIPS[t.touch]]) / palm < 0.3) pts++; // tune this too
    else mistakes.push(`Touch your thumb to your ${NAMES[t.touch]} finger.`);
  }
  if (t.together) {
    const gap = (dist(lm[8], lm[12]) + dist(lm[12], lm[16]) + dist(lm[16], lm[20])) / 3 / palm;
    total++;
    if (gap < 0.35) pts++; // tune this too
    else mistakes.push("Bring your fingers closer together.");
  }
  if (ctx.palm && t.palm) { // palm orientation check
    total++;
    if (ctx.palm === t.palm) pts++;
    else mistakes.unshift("Turn your palm toward the camera.");
  }
  if (1 - lm[0].x < 0.1 || 1 - lm[0].x > 0.9) mistakes.push("Move your hand toward the center of the screen.");
  return { score: Math.round((pts / total) * 100), mistakes };
}
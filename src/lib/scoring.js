// Compares the 21 hand points from MediaPipe to the target handshape.
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
const FINGERS = [["index", 6, 8], ["middle", 10, 12], ["ring", 14, 16], ["pinky", 18, 20]];

export function scoreSign(lm, t, ctx = {}) {
  const palm = dist(lm[0], lm[9]); // hand size, so distance from the camera doesn't matter
  const mistakes = [];
  let pts = 0, total = 0;
  FINGERS.forEach(([name, pip, tip], i) => {
    const ext = dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]);
    total++;
    if (ext === !!t.fingers[i]) pts++;
    else mistakes.push(`Your ${name} finger should be ${t.fingers[i] ? "straight" : "curled"}.`);
  });
  const tucked = dist(lm[4], lm[9]) / palm < 0.6; // tune this number by testing
  total++;
  if (tucked === t.thumbTucked) pts++;
  else mistakes.push(t.thumbTucked ? "Tuck your thumb across your palm." : "Move your thumb out to the side.");
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
// h(fingers, thumbTucked, extras). Finger values: 1 = straight, 0.5 = curved, 0 = curled (index, middle, ring, pinky).
// extras: together (fingers pressed together), palm (null = not checked), touch (thumb touches finger 0=index..3=pinky)
const h = (fingers, thumbTucked, o = {}) => ({ fingers, thumbTucked, together: false, ...o });
const N = { palm: null }; // palm direction is not checked
const RAW = {
  A: h([0, 0, 0, 0], false), B: h([1, 1, 1, 1], true, { together: true }), C: h([0.5, 0.5, 0.5, 0.5], false),
  D: h([1, 0, 0, 0], true), E: h([0.5, 0.5, 0.5, 0.5], true), F: h([0, 1, 1, 1], false, { touch: 0 }),
  G: h([1, 0, 0, 0], false, N), H: h([1, 1, 0, 0], true, { together: true, palm: null }), I: h([0, 0, 0, 1], true),
  J: h([0, 0, 0, 1], true, N), // J uses the same handshape as I, then draws a J in the air. Motion is not scored yet.
  "0": h([0.5, 0.5, 0.5, 0.5], false, N), "1": h([1, 0, 0, 0], true, N), "2": h([1, 1, 0, 0], true, N),
  "3": h([1, 1, 0, 0], false, N), "4": h([1, 1, 1, 1], true, N), "5": h([1, 1, 1, 1], false, N),
  "6": h([1, 1, 1, 0], true, { palm: null, touch: 3 }), "7": h([1, 1, 0, 1], true, { palm: null, touch: 2 }),
  "8": h([1, 0, 1, 1], true, { palm: null, touch: 1 }), "9": h([0, 1, 1, 1], true, { palm: null, touch: 0 }),
};
// Most fingerspelling letters face the palm toward the viewer. Check each against a reference.
export const SIGNS = Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, { palm: "camera", ...v }]));

export const UNITS = {
  letters: [
    { title: "Unit 1: A to E", items: ["A", "B", "C", "D", "E"] },
    { title: "Unit 2: F to J", items: ["F", "G", "H", "I", "J"] },
  ],
  numbers: [
    { title: "Unit 1: 0 to 4", items: ["0", "1", "2", "3", "4"] },
    { title: "Unit 2: 5 to 9", items: ["5", "6", "7", "8", "9"] },
  ],
};
export const LETTERS = UNITS.letters.flatMap((u) => u.items); // A to J, in order
export const NUMBERS = UNITS.numbers.flatMap((u) => u.items); // 0 to 9, in order
export const LESSONS = ["A", "B", "D", "I", "1", "2", "5"]; // easy signs used by the games

export const SECTIONS = [["letters", "Letters"], ["numbers", "Numbers"], ["words", "Words"], ["sentences", "Sentences"]];
// Word and sentence lessons need recorded motion demos, so these are names only for now.
export const WORDS = {
  Nouns: ["Water", "Mom", "Dad", "Home"], Verbs: ["Eat", "Drink", "Help", "Learn"],
  Adjectives: ["Happy", "Sad", "Big", "Small"], Other: ["Hello", "Please", "Thank you", "Yes", "No"],
};
export const SENTENCES = ["Hello, my name is...", "Where is the bathroom?", "I am happy"];

// Turns a sign's data into plain instructions.
export function describe(sign) {
  const t = SIGNS[sign], n = ["index", "middle", "ring", "pinky"], pick = (v) => n.filter((_, i) => t.fingers[i] === v);
  const [up, bent, down] = [pick(1), pick(0.5), pick(0)], s = (a) => `${a.join(", ")} ${a.length > 1 ? "fingers" : "finger"}`;
  const parts = [];
  if (up.length) parts.push(`Straighten your ${s(up)}.`);
  if (bent.length) parts.push(`Curve your ${s(bent)} gently.`);
  if (down.length) parts.push(`Curl your ${s(down)} into your palm.`);
  parts.push(t.thumbTucked ? "Tuck your thumb across your palm." : "Hold your thumb out to the side.");
  if (t.touch !== undefined) parts.push(`Touch your thumb to your ${n[t.touch]} finger.`);
  if (t.together && up.length > 1) parts.push("Keep your fingers pressed together.");
  if (t.palm) parts.push("Your palm faces the camera.");
  return parts.join(" ");
}
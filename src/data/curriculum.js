// What each handshape should look like. 1 = finger extended (index, middle, ring, pinky).
const RAW = {
  A: { fingers: [0, 0, 0, 0], thumbTucked: false, together: false },
  B: { fingers: [1, 1, 1, 1], thumbTucked: true, together: true },
  I: { fingers: [0, 0, 0, 1], thumbTucked: true, together: false },
  L: { fingers: [1, 0, 0, 0], thumbTucked: false, together: false },
  Y: { fingers: [0, 0, 0, 1], thumbTucked: false, together: false },
  // Numbers 1-5. Palm direction varies by source, so palm: null means it is not checked.
  "1": { fingers: [1, 0, 0, 0], thumbTucked: true, together: false, palm: null },
  "2": { fingers: [1, 1, 0, 0], thumbTucked: true, together: false, palm: null },
  "3": { fingers: [1, 1, 0, 0], thumbTucked: false, together: false, palm: null },
  "4": { fingers: [1, 1, 1, 1], thumbTucked: true, together: false, palm: null },
  "5": { fingers: [1, 1, 1, 1], thumbTucked: false, together: false, palm: null },
};
// Most fingerspelling letters face the palm toward the viewer. Check each against a reference.
export const SIGNS = Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, { palm: "camera", ...v }]));

// Lessons, in order. To add a letter, add it to RAW above and to LETTERS (keep ABC order).
export const LETTERS = ["A", "B", "I", "L", "Y"];
export const NUMBERS = ["1", "2", "3", "4", "5"];
export const LESSONS = [...LETTERS, ...NUMBERS]; // used by the games

export const SECTIONS = [["letters", "Letters"], ["numbers", "Numbers"], ["words", "Words"], ["sentences", "Sentences"]];
// Word and sentence lessons need recorded motion demos, so these are names only for now.
export const WORDS = {
  Nouns: ["Water", "Mom", "Dad", "Home"],
  Verbs: ["Eat", "Drink", "Help", "Learn"],
  Adjectives: ["Happy", "Sad", "Big", "Small"],
  Other: ["Hello", "Please", "Thank you", "Yes", "No"],
};
export const SENTENCES = ["Hello, my name is...", "Where is the bathroom?", "I am happy"];

// Turns a sign's data into plain instructions.
export function describe(sign) {
  const t = SIGNS[sign], n = ["index", "middle", "ring", "pinky"];
  const up = n.filter((_, i) => t.fingers[i]), down = n.filter((_, i) => !t.fingers[i]);
  const parts = [];
  if (up.length) parts.push(`Straighten your ${up.join(", ")} ${up.length > 1 ? "fingers" : "finger"}.`);
  if (down.length) parts.push(`Curl your ${down.join(", ")} ${down.length > 1 ? "fingers" : "finger"} into your palm.`);
  parts.push(t.thumbTucked ? "Tuck your thumb across your palm." : "Hold your thumb out to the side.");
  if (t.together && up.length > 1) parts.push("Keep your fingers pressed together.");
  if (t.palm) parts.push("Your palm faces the camera.");
  return parts.join(" ");
}
// Saves each user's progress in the browser, under their own username.
const empty = { profile: null, xp: 0, streak: 0, lastDay: "", best: {}, sessions: [], gamePoints: 0, gameStreak: 0, lastGameDay: "" };
const key = (u) => "aslingo-data-" + u;
export const load = (u) => {
  try { return { ...empty, ...JSON.parse(localStorage.getItem(key(u))) }; } catch { return empty; }
};
export const save = (u, s) => localStorage.setItem(key(u), JSON.stringify(s));
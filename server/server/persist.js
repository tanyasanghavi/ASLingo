// Saves players and teams to players.json so the leaderboard survives server restarts.
import fs from "fs";
const FILE = new URL("./players.json", import.meta.url);
export const loadPlayers = () => {
  try { return new Map(Object.entries(JSON.parse(fs.readFileSync(FILE, "utf8")))); } catch { return new Map(); }
};
let t;
export const savePlayers = (players) => {
  clearTimeout(t);
  t = setTimeout(() => fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(players))), 300);
};
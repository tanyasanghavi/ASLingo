// One shared connection to your server for matchmaking, leaderboard and teams.
const KEY = "signquest-id";
export const myId = localStorage.getItem(KEY) || (localStorage.setItem(KEY, crypto.randomUUID()), localStorage.getItem(KEY));
let ws, queue = [];
const handlers = new Set();

function connect() {
  if (ws && ws.readyState <= 1) return; // already connecting or open
  ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  ws.onopen = () => { queue.forEach((m) => ws.send(m)); queue = []; };
  ws.onmessage = (e) => handlers.forEach((h) => h(JSON.parse(e.data)));
}
export function send(msg) {
  connect();
  const s = JSON.stringify(msg);
  ws.readyState === 1 ? ws.send(s) : queue.push(s);
}
export const listen = (h) => { handlers.add(h); return () => handlers.delete(h); };
// Gemini coach + online play (matchmaking, leaderboard, teams) in one small server.
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { loadPlayers, savePlayers } from "./persist.js";

const app = express();
app.use(express.json());
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

async function ask(prompt) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const d = await r.json();
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(JSON.stringify(d).slice(0, 300));
  return text.trim();
}

// Live coaching while the camera is on: says what you are signing, then the one fix to make.
app.post("/api/coach", async (req, res) => {
  const { sign, score, mistakes = [], f = {}, detected = [] } = req.body;
  const seen = detected.length ? detected.map((d) => `${d.kind} ${d.sign}`).join(" or ") : "no clear sign";
  try {
    res.json({ tip: await ask(`You are a friendly wizard coaching ASL fingerspelling.
The learner is practicing ${sign} (score ${score}/100). The camera thinks they are signing: ${seen}.
Measured problems: ${mistakes.join("; ") || "none"}.
Palm faces: ${f.palm}. Hand position: ${f.location}. Motion: ${f.motion}. Eyebrows: ${f.face?.brows || "unknown"}.
Reply with 2 short sentences. Sentence 1 must start with "You are signing the letter X" (say "number" for digits; if several signs look the same say "You may be signing X or Y"; if there is no clear sign say "I can't tell what you are signing yet"). Sentence 2: the one fix to make for ${sign}, or a short compliment if there are no problems. Use only the information above.`) });
  } catch (e) { console.error(e.message); res.json({ tip: mistakes[0] || "Keep going, you're close!" }); }
});

// Session summary for the Progress tab.
app.post("/api/summary", async (req, res) => {
  const { name, session } = req.body;
  try {
    res.json({ summary: await ask(`You are a kind wizard coach. Summarize ${name}'s ASL practice session in 3 short sentences:
a genuine compliment, one or two things to practice more (phrase like "practice L more"), and encouragement.
Use only this data: ${JSON.stringify(session.signs)}. Session length: ${session.seconds} seconds.`) });
  } catch (e) { console.error(e.message); res.json({ summary: "Great work today! Review your weakest letter tomorrow." }); }
});

// ---------- Online play. Players and teams are saved to players.json so they survive restarts. ----------
const players = loadPlayers(); // players and teams saved from earlier runs
let waiting = null;            // the socket that is waiting for an opponent
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
const out = (ws, m) => ws && ws.readyState === 1 && ws.send(JSON.stringify(m));
const teamNames = () => [...new Set([...players.values()].map((p) => p.team).filter(Boolean))];
const teamInfo = (name) => {
  if (!name) return null;
  const members = [...players.values()].filter((p) => p.team === name);
  return { name, points: members.reduce((s, p) => s + p.points, 0), members: members.map((p) => ({ name: p.name, points: p.points })) };
};
const leave = (ws) => { // stop waiting, or tell the opponent you left
  if (waiting === ws) waiting = null;
  if (ws.opp) { out(ws.opp, { type: "left" }); ws.opp.opp = null; ws.opp = null; }
};

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }

    if (m.type === "hello") { // a player introduces themselves (and updates their points)
      ws.pid = m.id;
      players.set(m.id, { team: null, ...players.get(m.id), name: String(m.name).slice(0, 20), points: m.points || 0 });
      savePlayers(players);
      out(ws, { type: "team", team: teamInfo(players.get(m.id).team) });
      return;
    }

    const me = players.get(ws.pid);
    if (!me) return;

    if (m.type === "find" && Array.isArray(m.signs) && m.signs.length) {
      leave(ws);
      if (waiting && waiting !== ws) { // someone is waiting, so pair up
        const a = waiting, b = ws;
        waiting = null; a.opp = b; b.opp = a;
        const targets = Array.from({ length: 5 }, () => pickOne(m.signs)); // both players get the same signs
        out(a, { type: "matched", opponent: me.name, targets });
        out(b, { type: "matched", opponent: players.get(a.pid)?.name || "Player", targets });
      } else waiting = ws;
    }

    if (m.type === "leave") leave(ws);
    if (m.type === "score") out(ws.opp, { type: "opp", total: m.total, done: m.done });

    if (m.type === "board") {
      out(ws, { type: "board",
        players: [...players.entries()].map(([id, p]) => ({ id, name: p.name, points: p.points })).sort((a, b) => b.points - a.points).slice(0, 10),
        teams: teamNames().map(teamInfo).sort((a, b) => b.points - a.points).slice(0, 5) });
    }

    if (m.type === "createTeam") {
      me.team = String(m.name || "").trim().slice(0, 20) || me.team;
      savePlayers(players);
      out(ws, { type: "team", team: teamInfo(me.team) });
    }
    if (m.type === "randomTeam") {
      const open = teamNames().filter((t) => teamInfo(t).members.length < 4);
      me.team = open.length ? pickOne(open) : "Wizard Squad " + (100 + Math.floor(Math.random() * 900));
      savePlayers(players);
      out(ws, { type: "team", team: teamInfo(me.team) });
    }
  });
  ws.on("close", () => leave(ws));
});

server.listen(3001, () => console.log("Server on http://localhost:3001"));
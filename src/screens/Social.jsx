import { useEffect, useState } from "react";
import { send, listen } from "../lib/net";

// Leaderboard tab and Teams tab.
export default function Social({ tab, me }) {
  const [board, setBoard] = useState({ players: [], teams: [] }), [team, setTeam] = useState(null), [name, setName] = useState("");
  useEffect(() => {
    const off = listen((m) => {
      if (m.type === "board") setBoard(m);
      if (m.type === "team") { setTeam(m.team); send({ type: "board" }); }
    });
    send({ type: "hello", ...me }); // introduces you to the server, then asks for the boards
    send({ type: "board" });
    return off;
  }, [me.points]);

  if (tab === "board") return (
    <div className="stack card">
      <b>Top players</b>
      {board.players.length === 0 && <small>No players yet. Play a game to get on the board!</small>}
      {board.players.map((p, i) => <div key={p.id} className="row"><span>{i + 1}. {p.name}{p.id === me.id ? " (you)" : ""}</span><b>{p.points}</b></div>)}
    </div>
  );
  return (
    <div className="stack">
      <div className="card">
        {team ? <>
          <div className="row"><b>Your team: {team.name}</b><span>{team.points} pts</span></div>
          {team.members.map((m, i) => <div key={i} className="row"><small>{m.name}</small><small>{m.points}</small></div>)}
        </> : <>
          <b>You are not on a team yet</b>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => send({ type: "randomTeam" })}>Join a random team</button>
          <input style={{ marginTop: 8 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Or name a new team" />
          <button className="btn ghost" style={{ marginTop: 8 }} disabled={!name.trim()} onClick={() => send({ type: "createTeam", name })}>Create / join this team</button>
        </>}
      </div>
      <div className="card"><b>Top teams</b>
        {board.teams.length === 0 && <small> None yet.</small>}
        {board.teams.map((t, i) => <div key={t.name} className="row"><span>{i + 1}. {t.name} ({t.members.length})</span><b>{t.points}</b></div>)}
      </div>
    </div>
  );
}
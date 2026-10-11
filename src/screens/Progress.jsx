import { useEffect, useState } from "react";

export default function Progress({ state, update }) {
  const last = state.sessions[0];
  const [busy, setBusy] = useState(false);
  // When a new session has no summary yet, ask Gemini for one and save it.
  useEffect(() => {
    if (!last || last.summary) return;
    setBusy(true);
    fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: state.profile.name, session: last }) })
      .then((r) => r.json())
      .then((d) => update((p) => ({ sessions: p.sessions.map((s) => (s.id === last.id ? { ...s, summary: d.summary } : s)) })))
      .catch(() => {}).finally(() => setBusy(false));
  }, [last?.id]);

  const acc = {}; // average score per letter across ALL sessions
  state.sessions.forEach((s) => s.signs.forEach((x) => (acc[x.sign] ||= []).push(x.avg)));
  return (
    <div className="screen">
      <h2>Progress</h2>
      <div className="stack">
        {!last && <p className="card">No sessions yet. Practice a letter, then press End session.</p>}
        {last && <p className="card"><small>Latest session · {last.date} · {last.seconds}s</small><br />{last.summary || (busy ? "The wizard is writing your summary..." : "")}</p>}
        <div className="card"><b>Accuracy by letter</b>
          <div className="grid3" style={{ marginTop: 8 }}>
            {Object.entries(acc).map(([l, a]) => <div key={l} className="card" style={{ textAlign: "center" }}><b>{l}</b><br />{Math.round(a.reduce((x, y) => x + y) / a.length)}%</div>)}
          </div>
        </div>
        {state.sessions.slice(1, 6).map((s) => <p key={s.id} className="card"><small>{s.date}</small><br />{s.summary || "No summary"}</p>)}
      </div>
      <span />
    </div>
  );
}
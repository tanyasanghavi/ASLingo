import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import Wizard3D from "./components/Wizard3D";
import Props3D from "./components/Props3D";
import PlateUnlock from "./components/PlateUnlock";
import BottomNav from "./components/BottomNav";
import TopBar from "./components/TopBar";
import SignIn from "./screens/SignIn";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import Practice from "./screens/Practice";
import Progress from "./screens/Progress";
import Games from "./screens/Games";
import { UNITS, LETTERS, NUMBERS } from "./data/curriculum";
import { load, save } from "./store/profile";
import { currentUser, login, signup, logout, listUsers } from "./store/auth";
import { send, setMyId } from "./lib/net";

// How many lessons are already open in each list, based on the level chosen in Onboarding.
const OPEN = { Beginner: 0, "Some signs": 9, Advanced: 99 };
const BASICS = [...LETTERS, ...NUMBERS];
const unitOf = (l) => [...UNITS.letters, ...UNITS.numbers].find((u) => u.items.includes(l));
const EMPTY_LOG = () => ({ start: 0, last: 0, samples: [] });

export default function App() {
  const [user, setUser] = useState(currentUser);
  const [s, setS] = useState(() => load(user || ""));
  const [screen, setScreen] = useState(!user ? "signin" : !s.profile ? "onboarding" : "home");
  const [section, setSection] = useState("letters");
  const [sign, setSign] = useState(null);
  const [turn, setTurn] = useState(false);
  const [replay, setReplay] = useState(0);   // goes up each time the wizard should show the sign again
  const [plate, setPlate] = useState(null);  // the unit name while the gold plate animation shows
  const log = useRef(EMPTY_LOG());           // everything you practice until you press End session

  const update = (p) => setS((prev) => { const n = { ...prev, ...(typeof p === "function" ? p(prev) : p) }; save(user, n); return n; });
  const today = () => new Date().toDateString();

  // Tell the leaderboard server who you are and your points, whenever they change.
  useEffect(() => { setMyId(user || "guest"); }, [user]);
  useEffect(() => { if (user && s.profile) send({ type: "hello", id: user, name: s.profile.name, points: s.xp + s.gamePoints }); }, [user, s.profile, s.xp, s.gamePoints]);

  const done = (l) => (s.best[l] || 0) >= 85;
  const currentOf = (list) => { // the furthest open lesson in a list
    const i = list.findIndex((l) => !done(l));
    return Math.min(list.length - 1, Math.max(OPEN[s.profile?.level] ?? 0, i < 0 ? list.length - 1 : i));
  };
  const advanced = s.profile?.level !== "Beginner";
  const open = { letters: true, numbers: true, words: advanced || BASICS.every(done), sentences: advanced || BASICS.every(done) };

  const onAuth = async (mode, name, pw) => {
    const err = await (mode === "signup" ? signup : login)(name, pw);
    if (err) return err;
    const n = name.trim().toLowerCase(), data = load(n);
    log.current = EMPTY_LOG(); // so one friend's practice never lands in another friend's report
    setUser(n); setS(data); setSection("letters");
    setScreen(data.profile ? "home" : "onboarding");
    return null;
  };
  const logoutNow = () => { logout(); log.current = EMPTY_LOG(); setUser(null); setScreen("signin"); };

  const finish = (l, score) => {
    const u = unitOf(l); // did this lesson just complete its unit?
    if (u && !u.items.every(done) && u.items.every((i) => i === l || done(i))) setPlate(u.title);
    update((p) => ({ xp: p.xp + 20, lastDay: today(), streak: p.lastDay === today() ? p.streak : p.streak + 1, best: { ...p.best, [l]: Math.max(p.best[l] || 0, score) } }));
    setScreen("home");
  };
  const award = (pts) => update((p) => ({ gamePoints: p.gamePoints + pts, lastGameDay: today(), gameStreak: p.lastGameDay === today() ? p.gameStreak : p.gameStreak + 1 }));

  const sample = (l, score, miss) => { // saves one sample every half second
    const L = log.current, now = Date.now();
    if (!L.start) L.start = now;
    if (now - L.last < 500) return;
    L.last = now; L.samples.push({ sign: l, score, miss });
  };
  const endSession = () => {
    const L = log.current; log.current = EMPTY_LOG();
    if (L.samples.length >= 3) {
      const per = {};
      L.samples.forEach((x) => { const p = (per[x.sign] ||= { sum: 0, n: 0, best: 0, miss: {} }); p.sum += x.score; p.n++; p.best = Math.max(p.best, x.score); if (x.miss) p.miss[x.miss] = (p.miss[x.miss] || 0) + 1; });
      const signs = Object.entries(per).map(([l, p]) => ({ sign: l, avg: Math.round(p.sum / p.n), best: p.best, topMistake: Object.entries(p.miss).sort((a, b) => b[1] - a[1])[0]?.[0] || null }));
      const session = { id: Date.now(), date: today(), seconds: Math.round((Date.now() - L.start) / 1000), signs, summary: null };
      update((p) => ({ sessions: [session, ...p.sessions].slice(0, 20) }));
    }
    setScreen("progress");
  };

  const wizardMode = screen === "practice" ? (turn ? "practice" : "demo") : screen === "games" || screen === "progress" ? "side" : screen;
  const showNav = ["home", "games", "progress"].includes(screen);

  return (
    <>
      <div className="bg">
        <Canvas camera={{ position: [0, 1, 7], fov: 50 }}>
          <color attach="background" args={["#000"]} />
          <Stars radius={60} depth={40} count={2500} factor={4} fade speed={1} />
          <Wizard3D mode={wizardMode} focus={Math.min(4, currentOf(section === "numbers" ? NUMBERS : LETTERS))} sign={sign} replay={replay} />
          <Props3D />
        </Canvas>
      </div>
      {user && screen !== "signin" && <TopBar user={user} onHome={() => setScreen(s.profile ? "home" : "onboarding")} onLogout={logoutNow} />}
      {screen === "signin" && <SignIn onAuth={onAuth} players={listUsers()} />}
      {screen === "onboarding" && <Onboarding onDone={(profile) => { update({ profile }); setScreen("home"); }} />}
      {screen === "home" && <Home state={s} section={section} setSection={setSection} open={open} currentOf={currentOf} onStart={(l) => { setSign(l); setTurn(false); setReplay((r) => r + 1); setScreen("practice"); }} />}
      {screen === "practice" && <Practice key={sign} sign={sign} onDone={finish} onExit={() => setScreen("home")} onPhase={() => setTurn(true)} onReplay={() => setReplay((r) => r + 1)} onSample={sample} onEnd={endSession} />}
      {screen === "games" && <Games state={s} award={award} />}
      {screen === "progress" && <Progress state={s} update={update} />}
      {showNav && <BottomNav onGo={setScreen} onEnd={endSession} canEnd={log.current.samples.length > 2} />}
      {plate && <PlateUnlock title={plate} onClose={() => setPlate(null)} />}
    </>
  );
}
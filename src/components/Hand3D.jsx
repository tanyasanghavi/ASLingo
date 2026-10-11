import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SIGNS } from "../data/curriculum";

const SKIN = { color: "#f1c9a5", emissive: "#a855f7", emissiveIntensity: 0.15 };
const LEN = [0.3, 0.22, 0.17], CURL = [1.45, 1.6, 1.1]; // segment lengths, and how far each joint bends in a fist
const ease = (p) => { const k = Math.min(1, Math.max(0, p)); return k * k * (3 - 2 * k); };
const Seg = ({ len }) => <mesh position={[0, len / 2, 0]}><capsuleGeometry args={[0.05, len - 0.1, 4, 10]} /><meshStandardMaterial {...SKIN} /></mesh>;

// One finger = 3 segments, each nested inside the previous so they bend like real joints.
function Finger({ x, ext, fan, prog }) {
  const j = [useRef(), useRef(), useRef()];
  useFrame(() => {
    const c = ext ? 1 - ease(prog.current) : 1; // starts as a fist; extended fingers open up
    j.forEach((r, i) => (r.current.rotation.x = CURL[i] * c));
  });
  return (
    <group position={[x, 0.28, 0]} rotation={[0, 0, fan]}>
      <group ref={j[0]}><Seg len={LEN[0]} />
        <group ref={j[1]} position={[0, LEN[0], 0]}><Seg len={LEN[1]} />
          <group ref={j[2]} position={[0, LEN[1], 0]}><Seg len={LEN[2]} /></group>
        </group>
      </group>
    </group>
  );
}

function Thumb({ tucked, prog }) {
  const a = useRef(), b = useRef();
  useFrame(() => {
    const s = ease(prog.current);
    a.current.rotation.z = (tucked ? 1.1 : -0.7) * s - 0.4 * (1 - s);
    a.current.rotation.x = tucked ? 0.5 * s : 0;
    b.current.rotation.x = tucked ? 0.9 * s : 0;
  });
  return (
    <group position={[0.31, -0.12, 0.03]}>
      <group ref={a}><Seg len={0.3} /><group ref={b} position={[0, 0.3, 0]}><Seg len={0.24} /></group></group>
    </group>
  );
}

// A glowing teaching hand, palm toward you. `replay` changes -> it plays the sign again.
export default function Hand3D({ sign, replay }) {
  const t = SIGNS[sign], prog = useRef(-0.3), g = useRef(), seen = useRef(replay);
  useFrame((st, dt) => {
    if (seen.current !== replay) { seen.current = replay; prog.current = -0.3; }
    prog.current = Math.min(1.2, prog.current + dt / 1.5);
    g.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.9) * 0.25;
  });
  const xs = [0.2, 0.07, -0.07, -0.2], spread = t.together ? 1 : 1.4;
  return (
    <group ref={g}>
      <mesh><boxGeometry args={[0.62, 0.56, 0.14]} /><meshStandardMaterial {...SKIN} /></mesh>
      <mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.2, 0.17, 0.3, 16]} /><meshStandardMaterial {...SKIN} /></mesh>
      {xs.map((x, i) => <Finger key={i} x={x * spread} ext={!!t.fingers[i]} fan={t.together ? 0 : -x * 1.2} prog={prog} />)}
      <Thumb tucked={t.thumbTucked} prog={prog} />
      <mesh position={[0, 0.25, -0.3]}><torusGeometry args={[0.95, 0.02, 8, 64]} /><meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} /></mesh>
    </group>
  );
}
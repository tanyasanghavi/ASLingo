import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SIGNS } from "../data/curriculum";

const SKIN = { color: "#f0c4a0", roughness: 0.6, emissive: "#a855f7", emissiveIntensity: 0.08 };
const LEN = [0.3, 0.2, 0.16], RAD = [0.056, 0.049, 0.043], CURL = [1.4, 1.7, 1.0]; // segment length, thickness, bend in a fist
const ease = (p) => { const k = Math.min(1, Math.max(0, p)); return k * k * (3 - 2 * k); };
const Bone = ({ len, r }) => <mesh position={[0, len / 2, 0]}><capsuleGeometry args={[r, len - 2 * r, 6, 14]} /><meshStandardMaterial {...SKIN} /></mesh>;

// One finger = knuckle + 3 tapered bones, each inside the last so they bend like real joints.
// e: 1 = straight, 0.5 = curved, 0 = curled. Every finger starts as a fist and moves to its shape.
function Finger({ x, size, e, fan, prog }) {
  const j = [useRef(), useRef(), useRef()];
  useFrame(() => { const c = 1 - e * ease(prog.current); j.forEach((r, i) => (r.current.rotation.x = CURL[i] * c)); });
  const L = LEN.map((v) => v * size);
  return (
    <group position={[x, 0.3, 0]} rotation={[0, 0, fan]}>
      <mesh><sphereGeometry args={[0.062, 14, 14]} /><meshStandardMaterial {...SKIN} /></mesh>
      <group ref={j[0]}><Bone len={L[0]} r={RAD[0]} />
        <group ref={j[1]} position={[0, L[0], 0]}><Bone len={L[1]} r={RAD[1]} />
          <group ref={j[2]} position={[0, L[1], 0]}><Bone len={L[2]} r={RAD[2]} /></group>
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
    <group position={[0.3, -0.12, 0.04]}>
      <mesh position={[-0.05, 0, 0.02]} scale={[1, 1.2, 0.8]}><sphereGeometry args={[0.13, 16, 16]} /><meshStandardMaterial {...SKIN} /></mesh>
      <group ref={a}><Bone len={0.28} r={0.062} /><group ref={b} position={[0, 0.28, 0]}><Bone len={0.22} r={0.053} /></group></group>
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
  const xs = [0.2, 0.065, -0.07, -0.2], size = [0.95, 1.05, 0.95, 0.78], spread = t.together ? 1 : 1.4; // the middle finger is longest, the pinky shortest
  return (
    <group ref={g}>
      <mesh scale={[1, 1.05, 0.33]}><sphereGeometry args={[0.36, 32, 24]} /><meshStandardMaterial {...SKIN} /></mesh>
      <mesh position={[0, -0.42, 0]}><cylinderGeometry args={[0.14, 0.16, 0.3, 20]} /><meshStandardMaterial {...SKIN} /></mesh>
      <mesh position={[0, -0.62, 0]}><cylinderGeometry args={[0.2, 0.24, 0.3, 24]} /><meshStandardMaterial color="#3b0a7a" emissive="#3b0a7a" emissiveIntensity={0.4} /></mesh>
      <mesh position={[0, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.025, 8, 32]} /><meshStandardMaterial color="#ffd24a" emissive="#ffd24a" emissiveIntensity={1} /></mesh>
      {xs.map((x, i) => <Finger key={i} x={x * spread} size={size[i]} e={t.fingers[i]} fan={t.together ? 0 : -x * 1.2} prog={prog} />)}
      <Thumb tucked={t.thumbTucked} prog={prog} />
      <mesh position={[0, 0.25, -0.3]}><torusGeometry args={[0.95, 0.02, 8, 64]} /><meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} /></mesh>
    </group>
  );
}
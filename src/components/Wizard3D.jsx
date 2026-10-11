import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import Hand3D from "./Hand3D.jsx";

// Where the wizard stands on each screen: [x, y, z, size]
const SPOTS = { signin: [0, -1.1, 0, 0.7], onboarding: [2.4, -2.4, 0, 0.65], demo: [-1.3, -2.5, 0, 0.85], practice: [2.4, -2.7, 0, 0.45], home: [-2.3, 0, 0, 0.5], side: [2.4, -2.4, 0, 0.65] };
const BEARD = [[0, 1.62, 0.42, 0.28], [-0.22, 1.66, 0.3, 0.2], [0.22, 1.66, 0.3, 0.2], [0, 1.4, 0.62, 0.3], [-0.2, 1.45, 0.5, 0.2], [0.2, 1.45, 0.5, 0.2], [0, 1.15, 0.78, 0.26], [0, 0.95, 0.8, 0.18]];
const GOLD = "#ffd24a", BASE = 2.3; // BASE = height of the hat brim

const Mat = ({ c, g = 0.25, ...p }) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={g} roughness={0.55} {...p} />;
const Ball = ({ p, r, s = [1, 1, 1], c, g }) => <mesh position={p} scale={s}><sphereGeometry args={[r, 24, 24]} /><Mat c={c} g={g} /></mesh>;
const Arm = ({ r, pos, rot, children }) => (
  <group ref={r} position={pos} rotation={rot}>
    <mesh position={[0, -0.35, 0]}><capsuleGeometry args={[0.16, 0.45, 6, 12]} /><Mat c="#3b0a7a" g={0.35} /></mesh>
    <mesh position={[0, -0.62, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.17, 0.04, 8, 20]} /><Mat c={GOLD} g={0.8} /></mesh>
    <Ball p={[0, -0.78, 0]} r={0.16} c="#f6cfae" g={0.1} />
    {children}
  </group>
);

// IMPORTANT: this component must only be used inside <Canvas> (App.jsx does that).
export default function Wizard3D({ mode, focus = 0, sign = null, replay = 0 }) {
  const g = useRef(), spin = useRef(0), armL = useRef(), eyes = useRef();
  useFrame((st, dt) => {
    const [x, y0, , size] = SPOTS[mode] || SPOTS.home;
    const y = mode === "home" ? 1.8 - focus * 0.95 : y0; // on the path he flies to the current lesson
    const p = g.current.position, k = Math.min(1, dt * 3), t = st.clock.elapsedTime;
    p.x += (x - p.x) * k; p.y += (y - p.y) * k;
    g.current.scale.setScalar(g.current.scale.x + (size - g.current.scale.x) * k);
    spin.current *= 0.96;
    g.current.rotation.y = Math.sin(t) * 0.3 + spin.current;
    g.current.position.y += Math.sin(t * 2) * 0.004;                                        // floating
    armL.current.rotation.z = mode === "practice" ? -0.35 : -2.4 + Math.sin(t * 5) * 0.25; // waving
    eyes.current.scale.y = t % 3.4 > 3.3 ? 0.1 : 1;                                        // blinking
  });
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} color="#a855f7" intensity={60} />
      <pointLight position={[-3, 2, 3]} color={GOLD} intensity={40} />
      <group ref={g} onPointerDown={() => (spin.current += Math.PI * 4)}>
        {/* Round purple robe, gold belt, deep purple cape */}
        <mesh position={[0, 0.9, 0]} scale={[1, 1.1, 1]}><sphereGeometry args={[0.75, 40, 40]} /><Mat c="#3b0a7a" g={0.35} /></mesh>
        <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.77, 0.05, 10, 48]} /><Mat c={GOLD} g={0.8} /></mesh>
        <mesh position={[0, 0.95, 0.79]}><boxGeometry args={[0.2, 0.2, 0.06]} /><Mat c={GOLD} g={1} /></mesh>
        <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.55, 1.0, 1.6, 32, 1, true, Math.PI * 0.62, Math.PI * 0.76]} /><Mat c="#2a0a60" g={0.3} side={DoubleSide} /></mesh>
        {[[-0.3, 1.25, 0.64], [0.32, 1.05, 0.68], [-0.15, 0.65, 0.74]].map((p, i) => <mesh key={i} position={p} scale={[1, 1, 0.4]}><octahedronGeometry args={[0.08]} /><Mat c={GOLD} g={1.2} /></mesh>)}
        <Ball p={[-0.28, 0.1, 0.5]} r={0.2} s={[1, 0.6, 1.4]} c="#5a3a1a" g={0.1} />
        <Ball p={[0.28, 0.1, 0.5]} r={0.2} s={[1, 0.6, 1.4]} c="#5a3a1a" g={0.1} />

        {/* Big round head, cheeks, nose, brows, mustache */}
        <Ball p={[0, 1.95, 0]} r={0.45} c="#f6cfae" g={0.1} />
        <Ball p={[0, 1.9, 0.47]} r={0.1} c="#f4a48c" g={0.2} />
        <Ball p={[-0.27, 1.86, 0.33]} r={0.07} c="#ff8fa3" g={0.4} />
        <Ball p={[0.27, 1.86, 0.33]} r={0.07} c="#ff8fa3" g={0.4} />
        <Ball p={[-0.17, 2.16, 0.38]} r={0.08} s={[1.7, 0.45, 0.6]} c="#ffffff" g={0.3} />
        <Ball p={[0.17, 2.16, 0.38]} r={0.08} s={[1.7, 0.45, 0.6]} c="#ffffff" g={0.3} />
        <Ball p={[-0.1, 1.8, 0.44]} r={0.1} s={[1.5, 0.6, 0.8]} c="#ffffff" g={0.3} />
        <Ball p={[0.1, 1.8, 0.44]} r={0.1} s={[1.5, 0.6, 0.8]} c="#ffffff" g={0.3} />
        <group ref={eyes} position={[0, 2.02, 0]}>
          {[-0.17, 0.17].map((x) => <group key={x}>
            <Ball p={[x, 0, 0.36]} r={0.1} c="#ffffff" g={0.4} />
            <Ball p={[x, 0, 0.42]} r={0.06} c="#111111" g={0} />
            <Ball p={[x + 0.02, 0.03, 0.47]} r={0.02} c="#ffffff" g={1} />
          </group>)}
        </group>
        {/* Puffy white beard */}
        {BEARD.map(([x, y, z, r], i) => <Ball key={i} p={[x, y, z]} r={r} c="#ffffff" g={0.3} />)}

        {/* Floppy blue hat with a bent tip, gold band, gold stars and pompom */}
        <mesh position={[0, BASE, 0]}><cylinderGeometry args={[0.85, 0.85, 0.07, 40]} /><Mat c="#1d3fbf" g={0.4} /></mesh>
        <mesh position={[0, BASE, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.85, 0.05, 10, 48]} /><Mat c="#1d3fbf" g={0.4} /></mesh>
        <mesh position={[0, BASE + 0.45, 0]}><cylinderGeometry args={[0.3, 0.55, 0.9, 32]} /><Mat c="#1d3fbf" g={0.4} /></mesh>
        <mesh position={[0, BASE + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.53, 0.04, 8, 40]} /><Mat c={GOLD} g={0.8} /></mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const h = 0.15 + i * 0.13, r = 0.55 - 0.25 * (h / 0.9) + 0.03, a = -0.95 + i * 0.38;
          return <mesh key={i} position={[r * Math.sin(a), BASE + h, r * Math.cos(a)]} rotation={[0, a, 0]} scale={[1, 1, 0.4]}><octahedronGeometry args={[0.07]} /><Mat c={GOLD} g={1.2} /></mesh>;
        })}
        <group position={[0, BASE + 0.9, 0]} rotation={[0, 0, -0.55]}>
          <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.14, 0.3, 0.7, 24]} /><Mat c="#1d3fbf" g={0.4} /></mesh>
          <group position={[0, 0.7, 0]} rotation={[0, 0, -0.8]}>
            <mesh position={[0, 0.25, 0]}><coneGeometry args={[0.14, 0.5, 24]} /><Mat c="#1d3fbf" g={0.4} /></mesh>
            <Ball p={[0, 0.52, 0]} r={0.1} c={GOLD} g={1.5} />
          </group>
        </group>

        {/* Right arm holds the wand, left arm waves */}
        <Arm pos={[0.7, 1.45, 0.1]} rot={[0, 0, 1.1]}>
          <group position={[0, -0.78, 0]} rotation={[0, 0, -0.9]}>
            <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.025, 0.025, 1, 10]} /><Mat c="#6b4a2b" g={0.1} /></mesh>
            <Ball p={[0, 1.03, 0]} r={0.08} c={GOLD} g={3} />
          </group>
        </Arm>
        <Arm r={armL} pos={[-0.7, 1.45, 0.1]} rot={[0, 0, -2.4]} />

        {mode === "home" && ( // broom for the learning path
          <group position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2 - 0.15]}>
            <mesh><cylinderGeometry args={[0.04, 0.04, 2.2]} /><Mat c="#6b4a2b" g={0.1} /></mesh>
            <mesh position={[0, -1.25, 0]}><coneGeometry args={[0.25, 0.6, 16]} /><Mat c="#c9a227" g={0.5} /></mesh>
          </group>
        )}
      </group>

      {/* The teaching hand floats next to him during a lesson demo */}
      {mode === "demo" && sign && <group position={[1.8, 0.7, 0.8]} scale={1.9}><Hand3D sign={sign} replay={replay} /></group>}
    </>
  );
}
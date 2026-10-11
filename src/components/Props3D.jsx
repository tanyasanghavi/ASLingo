import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

const GOLD = "#ffd24a";
const M = ({ c, g = 0.3, ...p }) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={g} roughness={0.5} {...p} />;
const Box = ({ p, s, c, g }) => <mesh position={p}><boxGeometry args={s} /><M c={c} g={g} /></mesh>;

// Open notebook: royal purple cover with gold trim and jewels, cream pages with lines of writing.
function Notebook() {
  return (
    <group rotation={[0.9, -0.5, 0.1]}>
      <Box p={[0, 0, 0]} s={[1.6, 0.09, 1.15]} c="#3b0a7a" g={0.5} />
      {[0.55, -0.55].map((z) => <Box key={z} p={[0, 0.05, z]} s={[1.6, 0.02, 0.04]} c={GOLD} g={1} />)}
      {[-0.78, 0.78].map((x) => <Box key={x} p={[x, 0.05, 0]} s={[0.04, 0.02, 1.15]} c={GOLD} g={1} />)}
      {[[-0.37, 0.1], [0.37, -0.1]].map(([x, r], i) => (
        <group key={i} position={[x, 0.12, 0]} rotation={[0, 0, r]}>
          <Box p={[0, 0, 0]} s={[0.7, 0.08, 0.95]} c="#fff4d6" g={0.35} />
          {[-0.3, -0.1, 0.1, 0.3].map((z) => <Box key={z} p={[0, 0.045, z]} s={[0.5, 0.01, 0.025]} c="#6b3fa0" g={0.2} />)}
        </group>
      ))}
      <Box p={[0, 0.1, 0]} s={[0.05, 0.1, 1]} c={GOLD} g={0.8} />
      <mesh position={[0, 0.07, 0.62]}><octahedronGeometry args={[0.1]} /><M c={GOLD} g={1.5} /></mesh>
      {[[-0.12, "#4f6bff"], [0.12, "#ff5c8a"]].map(([x, c]) => <mesh key={x} position={[x, 0.06, 0.62]}><sphereGeometry args={[0.04]} /><M c={c} g={1.5} /></mesh>)}
    </group>
  );
}

// A wand with gold bands, a glowing tip with a halo, and sparkles that circle it.
function Wand() {
  const sp = useRef();
  useFrame((_, dt) => (sp.current.rotation.y += dt * 1.5));
  return (
    <group rotation={[0, 0, 0.9]}>
      <mesh><cylinderGeometry args={[0.04, 0.06, 1.8, 16]} /><M c="#2a1a3a" g={0.2} /></mesh>
      {[-0.5, 0.2].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.07, 0.07, 0.1, 16]} /><M c={GOLD} g={1} /></mesh>)}
      <mesh position={[0, 0.98, 0]}><sphereGeometry args={[0.13, 24, 24]} /><M c={GOLD} g={3} /></mesh>
      <mesh position={[0, 0.98, 0]}><sphereGeometry args={[0.26, 24, 24]} /><meshBasicMaterial color={GOLD} transparent opacity={0.18} /></mesh>
      <pointLight position={[0, 1, 0]} color={GOLD} intensity={8} distance={4} />
      <group ref={sp} position={[0, 0.98, 0]}>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i * 1.3) * 0.38, Math.sin(i * 2.1) * 0.3, Math.sin(i * 1.3) * 0.38]}><octahedronGeometry args={[0.04]} /><M c="#fff3b0" g={2} /></mesh>)}
      </group>
    </group>
  );
}

// A cluster of small glowing crystals that slowly turns.
function Crystals() {
  const g = useRef();
  useFrame((_, dt) => (g.current.rotation.y += dt * 0.6));
  const items = [["#a855f7", 0, 0, 0, 1], ["#4f6bff", 0.45, -0.1, 0.2, 0.7], [GOLD, -0.4, -0.15, 0.1, 0.6], ["#c084fc", 0.1, -0.2, -0.4, 0.5]];
  return (
    <group ref={g}>
      {items.map(([c, x, y, z, s], i) => <mesh key={i} position={[x, y, z]} scale={[s * 0.5, s * 1.2, s * 0.5]}><octahedronGeometry args={[0.35]} /><M c={c} g={1.6} transparent opacity={0.9} /></mesh>)}
      <pointLight color="#a855f7" intensity={6} distance={4} />
    </group>
  );
}

// IMPORTANT: this must be used inside <Canvas> (App.jsx does that).
export default function Props3D() {
  return (
    <>
      <Float speed={1.6} floatIntensity={0.5}><group position={[-3.6, -2.3, 0.5]} scale={0.9}><Notebook /></group></Float>
      <Float speed={2} floatIntensity={0.6}><group position={[3.7, 1.0, 0]}><Wand /></group></Float>
      <Float speed={1.8} floatIntensity={0.4}><group position={[-3.5, 1.6, 0]}><Crystals /></group></Float>
      <Float speed={1.4} floatIntensity={0.4}><group position={[0.2, -3.0, 1]} scale={0.7}><Crystals /></group></Float>
    </>
  );
}
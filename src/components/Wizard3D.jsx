import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// Palette (kept in one place so the wizard matches the UI theme)
const C = {
  hat: '#1d3fbf', // blue hat
  hatDark: '#122a85',
  gold: '#ffc857',
  cape: '#4a1480', // deep purple cape
  skin: '#f2c9a6',
  beard: '#f7f7fb',
  wood: '#7a4a1c',
}

// A 5-point star, extruded so it has a little thickness.
function useStarGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    const points = 5
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? 0.42 : 1
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      i ? shape.lineTo(x, y) : shape.moveTo(x, y)
    }
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false })
  }, [])
}

// Places a gold star on the surface of the hat cone.
function HatStar({ geometry, angle, t, size }) {
  const HAT_RADIUS = 0.8
  const HAT_HEIGHT = 1.6
  const r = HAT_RADIUS * (1 - t)
  const y = -HAT_HEIGHT / 2 + HAT_HEIGHT * t
  const tilt = -Math.atan(HAT_RADIUS / HAT_HEIGHT) // follow the slope of the cone
  return (
    <group rotation={[0, angle, 0]}>
      <mesh geometry={geometry} position={[0, y, r - 0.02]} rotation={[tilt, 0, 0]} scale={size}>
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}

function Hat() {
  const star = useStarGeometry()
  const stars = [
    { angle: 0.2, t: 0.22, size: 0.14 },
    { angle: 1.6, t: 0.4, size: 0.1 },
    { angle: 3.0, t: 0.18, size: 0.12 },
    { angle: 4.3, t: 0.45, size: 0.09 },
    { angle: 5.4, t: 0.25, size: 0.13 },
    { angle: 0.9, t: 0.62, size: 0.07 },
    { angle: 3.8, t: 0.7, size: 0.06 },
  ]
  return (
    <group position={[0, 0.5, 0]} rotation={[0, 0, 0.12]}>
      {/* brim */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.08, 48]} />
        <meshStandardMaterial color={C.hatDark} emissive={C.hat} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.03, 12, 64]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={1} />
      </mesh>
      {/* cone */}
      <group position={[0, 0.84, 0]}>
        <mesh>
          <coneGeometry args={[0.8, 1.6, 40]} />
          <meshStandardMaterial color={C.hat} emissive={C.hat} emissiveIntensity={0.45} roughness={0.5} />
        </mesh>
        {stars.map((s, i) => (
          <HatStar key={i} geometry={star} {...s} />
        ))}
      </group>
      {/* floppy tip */}
      <mesh position={[0.18, 1.78, 0]} rotation={[0, 0, -0.7]}>
        <coneGeometry args={[0.2, 0.7, 24]} />
        <meshStandardMaterial color={C.hat} emissive={C.hat} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.5, 2.0, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function Head() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color={C.skin} roughness={0.7} />
      </mesh>
      {/* eyes */}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.46]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#1a1030" emissive="#6b8cff" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, -0.03, 0.52]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#e9a98a" />
      </mesh>
      {/* long white beard */}
      <mesh position={[0, -0.85, 0.22]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.52, 1.5, 32]} />
        <meshStandardMaterial color={C.beard} emissive="#cfd8ff" emissiveIntensity={0.25} roughness={0.9} />
      </mesh>
      {/* mustache */}
      <mesh position={[0, -0.15, 0.46]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 0.6]}>
        <capsuleGeometry args={[0.07, 0.4, 8, 16]} />
        <meshStandardMaterial color={C.beard} />
      </mesh>
    </group>
  )
}

function Body() {
  return (
    <group position={[0, -1.5, 0]}>
      <mesh>
        <coneGeometry args={[1.0, 2.2, 48]} />
        <meshStandardMaterial color={C.cape} emissive="#7b2cbf" emissiveIntensity={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.035, 12, 64]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

function Wand({ waveRef }) {
  const group = useRef()
  useFrame(({ clock }) => {
    const waving = waveRef.current > clock.elapsedTime
    const wob = waving ? Math.sin(clock.elapsedTime * 16) * 0.6 : Math.sin(clock.elapsedTime * 1.5) * 0.06
    group.current.rotation.z = -0.5 + wob
  })
  return (
    <group position={[1.0, -1.1, 0.55]}>
      <mesh>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={C.skin} />
      </mesh>
      <group ref={group}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.045, 1.1, 12]} />
          <meshStandardMaterial color={C.wood} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={3} />
        </mesh>
        <pointLight position={[0, 1.1, 0]} color={C.gold} intensity={3} distance={4} />
        <Sparkles position={[0, 1.1, 0]} count={18} scale={0.9} size={3} speed={0.6} color={C.gold} />
      </group>
    </group>
  )
}

// The whole wizard. Move your pointer and he looks at you. Drag to spin him. Tap and he waves.
function WizardModel() {
  const root = useRef()
  const drag = useRef({ down: false, lastX: 0, spin: 0 })
  const waveUntil = useRef(false)

  useFrame(({ pointer }, dt) => {
    const d = drag.current
    if (!d.down) d.spin = THREE.MathUtils.damp(d.spin, 0, 3, dt) // spring back
    const targetY = pointer.x * 0.45 + d.spin
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 6, dt)
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.15, 6, dt)
  })

  return (
    <group
      ref={root}
      onPointerDown={(e) => {
        drag.current.down = true
        drag.current.lastX = e.clientX
      }}
      onPointerMove={(e) => {
        if (!drag.current.down) return
        drag.current.spin += (e.clientX - drag.current.lastX) * 0.012
        drag.current.lastX = e.clientX
      }}
      onPointerUp={() => (drag.current.down = false)}
      onPointerOut={() => (drag.current.down = false)}
      onClick={() => {
        // wave for about 1.2 seconds
        waveUntil.current = true
        setTimeout(() => (waveUntil.current = false), 1200)
      }}
    >
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.6}>
        <group>
          <Body />
          <Head />
          <Hat />
          <WandBridge waveUntil={waveUntil} />
        </group>
      </Float>
    </group>
  )
}

// Tiny helper so the Wand can read "should I wave?" every frame.
function WandBridge({ waveUntil }) {
  const waveRef = useRef(0)
  useFrame(({ clock }) => {
    waveRef.current = waveUntil.current ? clock.elapsedTime + 1 : 0
  })
  return <Wand waveRef={waveRef} />
}

export default function Wizard3D({ height = 360 }) {
  return (
    <div className="wizard-canvas" style={{ height }}>
      <Canvas camera={{ position: [0, 0.2, 7], fov: 35 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[-3, 2, 4]} color="#8b5cf6" intensity={25} />
        <pointLight position={[3, 3, 3]} color="#ffc857" intensity={18} />
        <pointLight position={[0, -3, 3]} color="#3b5bff" intensity={20} />
        <WizardModel />
        <Sparkles count={40} scale={[5, 5, 3]} size={2.5} speed={0.3} color="#b794ff" />
      </Canvas>
    </div>
  )
}
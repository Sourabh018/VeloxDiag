import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Gauge3D — real WebGL ring gauge: a background track + a foreground arc
 * that sweeps to `value` percent, with a distorted core sphere at the
 * center whose wobble intensity reflects status severity.
 *
 * Used for the single most important number on a page (Dashboard's Health
 * Score, SystemHealth's Heap/Pool %) — deliberately more elaborate than
 * MiniOrb3D since there's only ever one or two of these per screen.
 */
const INTENSITY = {
  low: { distort: 0.15, speed: 1, spin: 0.12, pulse: false },
  medium: { distort: 0.3, speed: 1.8, spin: 0.22, pulse: false },
  high: { distort: 0.45, speed: 3, spin: 0.35, pulse: true },
};

function Core({ color, intensity }) {
  const meshRef = useRef();
  const cfg = INTENSITY[intensity] || INTENSITY.low;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * cfg.spin;
    meshRef.current.rotation.x += delta * cfg.spin * 0.5;
    if (cfg.pulse) {
      const s = 0.62 + Math.sin(state.clock.elapsedTime * 5) * 0.04;
      meshRef.current.scale.setScalar(s);
    } else {
      meshRef.current.scale.setScalar(0.62);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 3]} />
      <MeshDistortMaterial color={color} distort={cfg.distort} speed={cfg.speed} roughness={0.2} metalness={0.6} />
    </mesh>
  );
}

function RingArc({ value, color }) {
  const arcRef = useRef();
  const clamped = Math.max(0, Math.min(100, value));
  const arcLength = (clamped / 100) * Math.PI * 2;

  useFrame((_, delta) => {
    // gentle breathing scale so the ring doesn't look static/flat
    if (!arcRef.current) return;
    const s = 1 + Math.sin(Date.now() * 0.0015) * 0.01;
    arcRef.current.scale.setScalar(s);
  });

  return (
    <group ref={arcRef}>
      {/* background track */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[1, 0.1, 16, 64, Math.PI * 2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} transparent opacity={0.6} />
      </mesh>
      {/* foreground fill arc — starts at top (12 o'clock), sweeps clockwise */}
      {arcLength > 0.001 && (
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[1, 0.105, 16, 64, arcLength]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      )}
    </group>
  );
}

export default function Gauge3D({ value = 0, color = "#2563EB", intensity = "low", style }) {
  return (
    <div style={{ width: "100%", height: "100%", ...style }}>
      <Canvas camera={{ position: [0, 0, 3.4], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 3]} intensity={1.1} />
        <pointLight position={[-2, -1, -1]} intensity={0.3} color={color} />
        <group rotation={[0.3, 0, 0]}>
          <RingArc value={value} color={color} />
          <Core color={color} intensity={intensity} />
        </group>
      </Canvas>
    </div>
  );
}
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";

/**
 * MiniOrb3D — small real-WebGL status orb used inside StatCard's icon slot.
 *
 * Deliberately cheap: low-poly geometry, no antialiasing, fixed dpr=1, no
 * shadows/lights beyond two flat sources. Designed to be mounted many times
 * on one screen (every StatCard on Dashboard + SystemHealth simultaneously)
 * without adding up to a meaningful GPU cost.
 *
 * intensity controls how agitated the distort/spin is:
 *  - "low"      -> calm, barely-there wobble (good/neutral state)
 *  - "medium"   -> noticeably alive (warning state)
 *  - "high"     -> fast wobble + pulse (critical state) — draws the eye
 */
const INTENSITY = {
  low: { distort: 0.2, speed: 1, spin: 0.15, pulse: false },
  medium: { distort: 0.35, speed: 1.8, spin: 0.3, pulse: false },
  high: { distort: 0.5, speed: 3, spin: 0.5, pulse: true },
};

function Orb({ color, intensity }) {
  const meshRef = useRef();
  const cfg = INTENSITY[intensity] || INTENSITY.low;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * cfg.spin;
    meshRef.current.rotation.x += delta * cfg.spin * 0.6;
    if (cfg.pulse) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <MeshDistortMaterial
        color={color}
        distort={cfg.distort}
        speed={cfg.speed}
        roughness={0.25}
        metalness={0.5}
      />
    </mesh>
  );
}

export default function MiniOrb3D({ color = "#2563EB", intensity = "low", style }) {
  return (
    <div style={{ width: "100%", height: "100%", ...style }}>
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 40 }}
        dpr={1}
        gl={{ antialias: false, alpha: true }}
        frameloop="always"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <Orb color={color} intensity={intensity} />
      </Canvas>
    </div>
  );
}
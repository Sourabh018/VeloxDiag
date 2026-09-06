import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Fixed, full-viewport 3D background built on react-three-fiber.
 *
 * intensity="hero"    -> bigger shape, faster spin, denser particles, stronger cursor tilt (Landing / Login)
 * intensity="ambient" -> small, slow, sparse, gentle cursor tilt — sits behind dashboard content without
 *                        competing with tables/charts or costing much GPU.
 *
 * Rotation = a continuous base auto-spin (so it's never static) + a cursor-driven tilt offset
 * layered on top, smoothly eased toward the pointer position every frame.
 *
 * The canvas itself is pointer-events:none (so clicks pass through to the real UI beneath it),
 * which means React-Three-Fiber's own built-in pointer tracking never fires. So cursor position
 * is tracked with a plain window-level mousemove listener instead, normalized to -1..1, and read
 * inside useFrame via a ref (avoids re-rendering on every mouse move).
 */
function useCursorRef() {
  const cursor = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function handleMove(e) {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);
  return cursor;
}

function RotatingWireframe({ intensity, cursor }) {
  const meshRef = useRef();
  const spin = useRef({ x: 0, y: 0 });
  const speed = intensity === "hero" ? 0.15 : 0.04;
  const scale = intensity === "hero" ? 2.4 : 1.3;
  const tilt = intensity === "hero" ? 0.7 : 0.28; // how far the cursor can push rotation

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    spin.current.x += delta * speed;
    spin.current.y += delta * (speed * 0.7);

    const targetX = spin.current.x + cursor.current.y * tilt;
    const targetY = spin.current.y + cursor.current.x * tilt;

    // Ease toward the target each frame rather than snapping — keeps the motion smooth.
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.06);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.06);
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={intensity === "hero" ? "#2563EB" : "#3B82F6"}
        wireframe
        transparent
        opacity={intensity === "hero" ? 0.5 : 0.15}
      />
    </mesh>
  );
}

function Particles({ count, intensity, cursor }) {
  const pointsRef = useRef();
  const spinY = useRef(0);
  const driftStrength = intensity === "hero" ? 0.25 : 0.1;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    spinY.current += delta * 0.01;

    const targetY = spinY.current + cursor.current.x * driftStrength;
    const targetX = cursor.current.y * driftStrength * 0.5;

    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetY, 0.04);
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, targetX, 0.04);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={intensity === "hero" ? 0.02 : 0.012}
        color={intensity === "hero" ? "#93C5FD" : "#60A5FA"}
        transparent
        opacity={intensity === "hero" ? 0.65 : 0.2}
        sizeAttenuation
      />
    </points>
  );
}

export default function BackgroundScene({ intensity = "ambient" }) {
  const particleCount = intensity === "hero" ? 400 : 120;
  const cursor = useCursorRef();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]} // caps pixel ratio — keeps GPU cost sane, especially behind the dashboard
        gl={{ antialias: false, alpha: true }}
      >
        <RotatingWireframe intensity={intensity} cursor={cursor} />
        <Particles count={particleCount} intensity={intensity} cursor={cursor} />
      </Canvas>
    </div>
  );
}
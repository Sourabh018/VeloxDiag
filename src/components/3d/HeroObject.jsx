import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";

/**
 * Drop this into Landing page hero section / Login page side panel.
 * Not fixed — sized by parent container (e.g. 400x400 box).
 */
function HeroShape() {
  const meshRef = useRef();
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // gentle autorotate
    meshRef.current.rotation.y += delta * 0.25;

    // mouse parallax — pointer position comes from Canvas's normalized coords
    targetRotation.current.x = state.pointer.y * 0.3;
    targetRotation.current.y += (state.pointer.x * 0.5 - meshRef.current.rotation.y * 0) * 0;
    meshRef.current.rotation.x +=
      (targetRotation.current.x - meshRef.current.rotation.x) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.35}
          speed={2}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

export default function HeroObject({ style }) {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 320, ...style }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <pointLight position={[-3, -2, -2]} intensity={0.5} color="#a5b4fc" />
        <HeroShape />
      </Canvas>
    </div>
  );
}
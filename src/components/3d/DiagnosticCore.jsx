import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Line, Trail } from "@react-three/drei";
import * as THREE from "three";

/**
 * DiagnosticCore — the landing-page hero centerpiece.
 *
 * A central "core" node (the app) orbited by smaller "query" nodes.
 * One orbiting node is flagged red + pulsing (the slow query being caught),
 * connected to the core by a live line — visualizing what VeloxDiag actually does.
 *
 * Drop into a fixed-size container (e.g. 460x460). Not fullscreen — this sits
 * beside/within the hero text, layered above BackgroundScene.
 */

const NODE_COUNT = 7;
const FLAGGED_INDEX = 2; // which orbiting node is the "slow query" being highlighted

function useOrbitPositions(count, radius) {
  return useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      // slight vertical scatter so it doesn't look like a flat ring
      const yScatter = Math.sin(i * 2.1) * 0.5;
      return { angle, radius: radius + Math.sin(i * 1.7) * 0.3, y: yScatter };
    });
  }, [count, radius]);
}

function CoreNode() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x += delta * 0.05;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.85, 4]} />
        <MeshDistortMaterial
          color="#2563EB"
          distort={0.25}
          speed={1.6}
          roughness={0.15}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

function OrbitNode({ angle, radius, y, flagged, index }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const speed = 0.18 + index * 0.015; // slightly different speeds so it's not synchronized
  const t = useRef(angle);

  useFrame((state, delta) => {
    t.current += delta * speed;
    const x = Math.cos(t.current) * radius;
    const z = Math.sin(t.current) * radius;
    groupRef.current.position.set(x, y, z);

    if (flagged && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[flagged ? 0.14 : 0.09, 24, 24]} />
        <meshStandardMaterial
          color={flagged ? "#EF4444" : "#93C5FD"}
          emissive={flagged ? "#EF4444" : "#3B82F6"}
          emissiveIntensity={flagged ? 1.4 : 0.3}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function ConnectionLine({ angle, radius, y, speed, flagged }) {
  const lineRef = useRef();
  const t = useRef(angle);
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(radius, y, 0)], []);

  useFrame((_, delta) => {
    t.current += delta * speed;
    if (!lineRef.current) return;
    const x = Math.cos(t.current) * radius;
    const z = Math.sin(t.current) * radius;
    // update the second point of the line geometry each frame
    const posAttr = lineRef.current.geometry.attributes.position;
    posAttr.setXYZ(1, x, y, z);
    posAttr.needsUpdate = true;
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={flagged ? "#EF4444" : "#93C5FD"}
      transparent
      opacity={flagged ? 0.55 : 0.18}
      lineWidth={flagged ? 1.5 : 1}
    />
  );
}

function Scene() {
  const orbits = useOrbitPositions(NODE_COUNT, 2.1);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 3]} intensity={1.3} />
      <pointLight position={[-3, -2, -2]} intensity={0.6} color="#93C5FD" />
      <pointLight position={[2, 1, 2]} intensity={0.4} color="#EF4444" />

      <CoreNode />

      {orbits.map((o, i) => (
        <group key={i}>
          <OrbitNode
            angle={o.angle}
            radius={o.radius}
            y={o.y}
            flagged={i === FLAGGED_INDEX}
            index={i}
          />
          <ConnectionLine
            angle={o.angle}
            radius={o.radius}
            y={o.y}
            speed={0.18 + i * 0.015}
            flagged={i === FLAGGED_INDEX}
          />
        </group>
      ))}
    </>
  );
}

export default function DiagnosticCore({ style }) {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 360, ...style }}>
      <Canvas camera={{ position: [0, 0.6, 6], fov: 42 }} dpr={[1, 2]}>
        <Scene />
      </Canvas>
    </div>
  );
}
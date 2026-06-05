"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

function FloatingCubes() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  const cubes = Array.from({ length: 7 }, (_, i) => ({
    position: [
      (i % 3 - 1) * 2.2 + (i > 3 ? 1 : 0),
      Math.floor(i / 3) * 1.8 - 1,
      (i - 3) * 0.6,
    ] as [number, number, number],
    size: 0.6 + (i % 3) * 0.15,
    color: i % 2 === 0 ? "#3fb950" : "#58a6ff",
    rotSpeed: 0.4 + i * 0.1,
  }));

  return (
    <group ref={groupRef}>
      {cubes.map((cube, index) => (
        <mesh
          key={index}
          position={cube.position}
        >
          <boxGeometry args={[cube.size, cube.size, cube.size]} />
          <meshPhongMaterial
            color={cube.color}
            emissive={cube.color}
            emissiveIntensity={0.1}
            shininess={80}
          />
        </mesh>
      ))}
    </group>
  );
}

function NeuralNodes() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  const nodes = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 3.2 + Math.sin(i) * 0.4;
    return {
      pos: [
        Math.cos(angle) * radius,
        (i - 6) * 0.7,
        Math.sin(angle) * radius * 0.6,
      ] as [number, number, number],
      size: 0.18 + Math.random() * 0.08,
    };
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <group key={i}>
          <mesh position={node.pos}>
            <sphereGeometry args={[node.size]} />
            <meshBasicMaterial color="#3fb950" />
          </mesh>
          {/* Connections */}
          {i < nodes.length - 1 && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([
                    ...node.pos,
                    ...nodes[i + 1].pos,
                  ]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#58a6ff" transparent opacity={0.3} />
            </line>
          )}
        </group>
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="three-container h-[420px] md:h-[520px] lg:h-[580px] w-full">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 48 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-8, -6, -4]} intensity={0.6} color="#58a6ff" />

        <FloatingCubes />
        <NeuralNodes />

        <Stars
          radius={120}
          depth={40}
          count={80}
          factor={3}
          saturation={0}
          fade
          speed={0.6}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />
      </Canvas>
      <div className="floating-3d-hint">Drag to orbit • 3D AI Core</div>
    </div>
  );
}

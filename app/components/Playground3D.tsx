"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";
import LazyCanvas from "./LazyCanvas";

interface SceneProps {
  mode: "workflow" | "chess" | "particles";
}

function AIWorkflow({ mode }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * (mode === "workflow" ? 0.12 : 0.08);
    }
  });

  const stages = [
    { label: "DATA", pos: [-4.5, 0, 0], color: "#58a6ff" },
    { label: "EDA", pos: [-1.8, 1.6, 0], color: "#3fb950" },
    { label: "MODEL", pos: [1.6, -1.2, 0], color: "#bc8cff" },
    { label: "SHAP", pos: [4.2, 0.8, 0], color: "#e3b341" },
    { label: "DEPLOY", pos: [6.5, -0.4, 0], color: "#f85149" },
  ];

  return (
    <group ref={groupRef}>
      {/* Base platform */}
      <mesh position={[0, -2.8, 0]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[18, 9]} />
        <meshPhongMaterial color="#12151c" side={THREE.DoubleSide} />
      </mesh>

      {stages.map((stage, i) => (
        <group key={i} position={stage.pos as [number, number, number]}>
          {/* Stage box */}
          <mesh>
            <boxGeometry args={[1.6, 1.1, 1.1]} />
            <meshPhongMaterial color={stage.color} emissive={stage.color} emissiveIntensity={0.2} />
          </mesh>

          {/* Label */}
          <Html position={[0, 1.5, 0]} center>
            <div className="mono text-xs px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white font-semibold tracking-widest" style={{ color: stage.color }}>
              {stage.label}
            </div>
          </Html>

          {/* Connection lines to next */}
          {i < stages.length - 1 && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([
                    ...stage.pos,
                    ...stages[i + 1].pos,
                  ]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#3fb950" transparent opacity={0.55} />
            </line>
          )}
        </group>
      ))}

      {/* Floating data particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i) * 3.5 + (i % 4) * 0.8,
            Math.cos(i * 1.4) * 1.8 - 0.5,
            Math.cos(i * 0.8) * 2 - 1.5,
          ]}
        >
          <sphereGeometry args={[0.06]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#3fb950" : "#58a6ff"} />
        </mesh>
      ))}
    </group>
  );
}

function ChessBrain() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.22;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
    }
  });

  const pieces = [
    { type: "♔", pos: [0, 1.8, 0], color: "#e3b341" },
    { type: "♕", pos: [-2.2, 0.6, 1.4], color: "#bc8cff" },
    { type: "♖", pos: [2.4, -0.4, -1.8], color: "#58a6ff" },
    { type: "♗", pos: [-1.6, -1.2, 2.2], color: "#3fb950" },
    { type: "♘", pos: [1.8, 1.1, -2.4], color: "#f85149" },
  ];

  return (
    <group ref={groupRef}>
      {/* Central brain sphere */}
      <mesh>
        <sphereGeometry args={[1.4]} />
        <meshPhongMaterial color="#1a1f28" emissive="#3fb950" emissiveIntensity={0.25} />
      </mesh>

      {pieces.map((piece, i) => (
        <group key={i} position={piece.pos as [number, number, number]}>
          <mesh>
            <octahedronGeometry args={[0.65]} />
            <meshPhongMaterial color={piece.color} emissive={piece.color} emissiveIntensity={0.3} />
          </mesh>
          <Html position={[0, 1.4, 0]} center>
            <div className="text-3xl" style={{ filter: "drop-shadow(0 2px 4px black)" }}>
              {piece.type}
            </div>
          </Html>
        </group>
      ))}

      {/* Orbit rings */}
      <mesh rotation={[1.1, 0, 0]}>
        <torusGeometry args={[3.8, 0.03, 8, 48]} />
        <meshBasicMaterial color="#3fb950" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function ParticleNetwork() {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.Group>(null!);

  const count = 42;
  const { positions, velocities } = useMemo(() => {
    const seeded = (index: number) => {
      const value = Math.sin(index * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };
    const nextPositions = new Float32Array(count * 3);
    const nextVelocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      nextPositions[i] = (seeded(i + 1) - 0.5) * 14;
      nextPositions[i + 1] = (seeded(i + 2) - 0.5) * 9;
      nextPositions[i + 2] = (seeded(i + 3) - 0.5) * 12;
      nextVelocities[i] = (seeded(i + 4) - 0.5) * 0.012;
      nextVelocities[i + 1] = (seeded(i + 5) - 0.5) * 0.012;
      nextVelocities[i + 2] = (seeded(i + 6) - 0.5) * 0.012;
    }

    return { positions: nextPositions, velocities: nextVelocities };
  }, []);
  const velocitiesRef = useRef(velocities);

  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const velocity = velocitiesRef.current;

      for (let i = 0; i < count * 3; i += 3) {
        pos.array[i] += velocity[i];
        pos.array[i + 1] += velocity[i + 1];
        pos.array[i + 2] += velocity[i + 2];

        // bounce
        if (Math.abs(pos.array[i]) > 7) velocity[i] *= -1;
        if (Math.abs(pos.array[i + 1]) > 4.5) velocity[i + 1] *= -1;
        if (Math.abs(pos.array[i + 2]) > 6) velocity[i + 2] *= -1;
      }
      pos.needsUpdate = true;
    }

    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#3fb950" sizeAttenuation />
      </points>

      <group ref={linesRef}>
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  (i - 5) * 1.8, Math.sin(i) * 2, (i % 3) * 1.6,
                  (i - 4) * 1.9, Math.cos(i * 1.3) * 1.8, (i % 2 - 0.5) * 3.5,
                ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#58a6ff" transparent opacity={0.25} />
          </line>
        ))}
      </group>
    </>
  );
}

export default function Playground3D() {
  type SceneMode = "workflow" | "chess" | "particles";
  const [mode, setMode] = useState<SceneMode>("workflow");
  const webglAvailable = useWebGLAvailable();

  const scenes = {
    workflow: <AIWorkflow mode={mode} />,
    chess: <ChessBrain />,
    particles: <ParticleNetwork />,
  };

  return (
    <div className="playground">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-tag">INTERACTIVE 3D LAB</div>
          <div className="text-2xl font-semibold">Explore the 3D AI Universe</div>
        </div>

        <div className="flex gap-2">
          {[
            { id: "workflow" as const, label: "Workflow" },
            { id: "chess" as const, label: "Chess Brain" },
            { id: "particles" as const, label: "Network" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setMode(s.id)}
              className={`mono px-4 py-1.5 text-sm rounded-full border transition-all ${
                mode === s.id
                  ? "bg-accent text-[#0a0c10] border-accent"
                  : "border-border hover:border-accent hover:text-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="playground-3d relative">
        {webglAvailable !== true ? (
          <SceneFallback label="INTERACTIVE LAB" detail={`${mode} mode selected. WebGL is disabled in this browser, so this fallback keeps the layout usable.`} />
        ) : (
          <LazyCanvas className="w-full h-full" fallback={<div className="w-full h-full bg-[#05070a] animate-pulse rounded-xl" />}>
            <Canvas
              camera={{ position: [0, 1.5, 11], fov: 52 }}
              style={{ background: "#05070a" }}
            >
              <ambientLight intensity={0.7} />
              <pointLight position={[12, 18, 8]} intensity={1.5} />
              <pointLight position={[-12, -10, -6]} intensity={0.7} color="#bc8cff" />

              {scenes[mode]}

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                minDistance={3}
                maxDistance={22}
                autoRotate={mode === "particles"}
                autoRotateSpeed={0.25}
              />
            </Canvas>
          </LazyCanvas>
        )}

        <div className="absolute bottom-4 right-4 text-[10px] mono px-3 py-1 bg-black/60 rounded-full border border-white/10 text-muted-foreground">
          Drag • Scroll to zoom • {mode === "workflow" ? "Data flow visualization" : mode === "chess" ? "Strategic 3D core" : "Live particle graph"}
        </div>
      </div>

      <p className="text-center text-xs text-muted mt-4 mono tracking-widest">
        FULLY INTERACTIVE • POWERED BY THREE.JS + REACT THREE FIBER
      </p>
    </div>
  );
}

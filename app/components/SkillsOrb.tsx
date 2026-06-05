"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";

const skillsData = [
  { name: "Python", color: "#3fb950", size: 0.65, pos: [0, 2.8, 0] },
  { name: "PyTorch", color: "#bc8cff", size: 0.55, pos: [-2.6, 1.4, 1.2] },
  { name: "TensorFlow", color: "#58a6ff", size: 0.55, pos: [2.5, 1.6, -0.8] },
  { name: "Next.js", color: "#e3b341", size: 0.48, pos: [-1.8, -0.8, 2.4] },
  { name: "FastAPI", color: "#3fb950", size: 0.5, pos: [2.2, -1.2, 1.6] },
  { name: "SHAP", color: "#bc8cff", size: 0.42, pos: [-2.4, -1.6, -1.8] },
  { name: "Docker", color: "#f85149", size: 0.46, pos: [1.4, 2.2, -2.2] },
  { name: "AWS", color: "#58a6ff", size: 0.44, pos: [-0.8, -2.8, 0.6] },
];

function SkillNode({ skill, index }: { skill: any; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating + rotation
      meshRef.current.position.y = skill.pos[1] + Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.12;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4 + index;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={skill.pos as [number, number, number]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[skill.size]} />
        <meshPhongMaterial
          color={skill.color}
          emissive={skill.color}
          emissiveIntensity={hovered ? 0.45 : 0.15}
          shininess={100}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[skill.pos[0], skill.pos[1] + skill.size + 0.55, skill.pos[2]]}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
        center
      >
        <div
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-white border border-white/20 whitespace-nowrap"
          style={{
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.1s",
            color: skill.color,
          }}
        >
          {skill.name}
        </div>
      </Html>
    </group>
  );
}

function CentralCore() {
  const coreRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.95]} />
        <meshPhongMaterial
          color="#1a1f28"
          emissive="#3fb950"
          emissiveIntensity={0.3}
          shininess={60}
        />
      </mesh>
      {/* Inner glow ring */}
      <mesh>
        <torusGeometry args={[1.35, 0.06, 14, 42]} />
        <meshBasicMaterial color="#3fb950" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={linesRef}>
      {skillsData.map((skill, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                0, 0, 0,
                ...skill.pos,
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#58a6ff"
            transparent
            opacity={0.18}
          />
        </line>
      ))}
    </group>
  );
}

export default function SkillsOrb() {
  return (
    <div className="skills-3d">
      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 46 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[8, 10, 6]} intensity={1.4} />
        <pointLight position={[-9, -8, -5]} intensity={0.8} color="#bc8cff" />

        <CentralCore />
        <ConnectionLines />

        {skillsData.map((skill, index) => (
          <SkillNode key={index} skill={skill} index={index} />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4.5}
          maxDistance={14}
          autoRotate
          autoRotateSpeed={0.2}
        />
      </Canvas>
    </div>
  );
}

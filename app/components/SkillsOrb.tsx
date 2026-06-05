"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, useMemo } from "react";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";

type SkillOrbitData = {
  name: string;
  color: string;
  size: number;
  radius: number;
  speed: number;
  inclination: number; // angle in radians to tilt the orbital plane
  phase: number; // initial starting angle offset
};

const skillsOrbitData: SkillOrbitData[] = [
  { name: "Python", color: "#3fb950", size: 0.33, radius: 2.0, speed: 0.52, inclination: 0.12, phase: 0 },
  { name: "PyTorch", color: "#bc8cff", size: 0.28, radius: 2.7, speed: 0.42, inclination: -0.16, phase: 1.2 },
  { name: "TensorFlow", color: "#58a6ff", size: 0.28, radius: 3.4, speed: 0.36, inclination: 0.24, phase: 2.8 },
  { name: "Next.js", color: "#e3b341", size: 0.25, radius: 4.1, speed: 0.30, inclination: -0.08, phase: 4.1 },
  { name: "FastAPI", color: "#3fb950", size: 0.25, radius: 4.8, speed: 0.26, inclination: 0.15, phase: 0.8 },
  { name: "SHAP", color: "#bc8cff", size: 0.23, radius: 5.5, speed: 0.22, inclination: -0.28, phase: 5.3 },
  { name: "Docker", color: "#f85149", size: 0.23, radius: 6.2, speed: 0.19, inclination: 0.1, phase: 2.1 },
  { name: "AWS", color: "#58a6ff", size: 0.23, radius: 6.9, speed: 0.16, inclination: -0.2, phase: 3.5 },
];

interface SkillsOrbProps {
  theme?: "chess" | "knight" | "poet" | "king";
}

function OrbitLine({ radius, inclination, color }: { radius: number; inclination: number; color: string }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Orbit tilt around the X-axis
      const rotatedY = z * Math.sin(inclination);
      const rotatedZ = z * Math.cos(inclination);
      pts.push(new THREE.Vector3(x, rotatedY, rotatedZ));
    }
    return pts;
  }, [radius, inclination]);

  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.16} />
    </lineLoop>
  );
}

function SkillPlanet({ data, index }: { data: SkillOrbitData; index: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // If hovered, slow down orbit to let the user view/interact
      const speedFactor = hovered ? 0.05 : 1.0;
      const angle = state.clock.elapsedTime * data.speed * speedFactor + data.phase;
      
      const x = Math.cos(angle) * data.radius;
      const z = Math.sin(angle) * data.radius;
      
      // Calculate coordinates on the tilted orbital plane
      const y = z * Math.sin(data.inclination);
      const rotatedZ = z * Math.cos(data.inclination);
      
      groupRef.current.position.set(x, y, rotatedZ);
    }
    
    if (meshRef.current) {
      // Rotation on its own axis
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8 + index;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[data.size * (hovered ? 1.35 : 1.0)]} />
        <meshPhongMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.55 : 0.18}
          shininess={90}
        />
      </mesh>

      {/* Dynamic Tag Label */}
      <Html
        position={[0, data.size + 0.35, 0]}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
        center
      >
        <div
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-white border border-white/10 whitespace-nowrap"
          style={{
            transform: hovered ? "scale(1.15)" : "scale(1)",
            transition: "transform 0.15s ease",
            color: data.color,
            boxShadow: hovered ? `0 0 10px ${data.color}44` : "none",
          }}
        >
          {data.name}
        </div>
      </Html>
    </group>
  );
}

function SunStar({ theme = "chess" }: SkillsOrbProps) {
  const sunRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
    if (glowRef.current) {
      glowRef.current.rotation.z = -state.clock.elapsedTime * 0.25;
      const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Coordinate color with theme
  const sunColor = useMemo(() => {
    switch (theme) {
      case "knight": return "#ff4a4a";
      case "poet": return "#e3a95d";
      case "king": return "#ffd700";
      default: return "#3fb950";
    }
  }, [theme]);

  return (
    <group>
      {/* Glowing core sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.75]} />
        <meshPhongMaterial
          color="#161b22"
          emissive={sunColor}
          emissiveIntensity={0.4}
          shininess={100}
        />
      </mesh>
      
      {/* Core ring */}
      <mesh ref={glowRef}>
        <torusGeometry args={[0.95, 0.05, 8, 48]} />
        <meshBasicMaterial color={sunColor} transparent opacity={0.35} />
      </mesh>
      
      {/* Secondary ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 6, 32]} />
        <meshBasicMaterial color={sunColor} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default function SkillsOrb({ theme = "chess" }: SkillsOrbProps) {
  const webglAvailable = useWebGLAvailable();

  if (webglAvailable !== true) {
    return (
      <div className="skills-3d">
        <SceneFallback label="SKILL SYSTEM" detail="Python, PyTorch, TensorFlow, Next.js, FastAPI, SHAP, Docker, and AWS connected as a solar system orbit model." />
      </div>
    );
  }

  return (
    <div className="skills-3d">
      <Canvas
        camera={{ position: [0, 4.5, 9.5], fov: 46 }}
        style={{ background: "#05070a" }}
      >
        <ambientLight intensity={0.65} />
        <pointLight position={[10, 12, 8]} intensity={1.5} />
        <pointLight position={[-10, -10, -8]} intensity={0.7} color="#bc8cff" />

        <SunStar theme={theme} />

        {/* Orbits and planet nodes */}
        {skillsOrbitData.map((skill, index) => (
          <group key={index}>
            <OrbitLine
              radius={skill.radius}
              inclination={skill.inclination}
              color={skill.color}
            />
            <SkillPlanet
              data={skill}
              index={index}
            />
          </group>
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

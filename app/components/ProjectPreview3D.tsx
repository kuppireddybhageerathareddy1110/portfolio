"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { useWebGLAvailable } from "./WebGLGuard";

interface PreviewProps {
  type: string;
  color?: string;
  hovered?: boolean;
}

function PreviewMesh({ type, color = "#3fb950", hovered = false }: PreviewProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const rotationY = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotation speed up on hover
      const speed = hovered ? 1.8 : 0.6;
      rotationY.current += delta * speed;
      meshRef.current.rotation.y = rotationY.current;

      // Bobbing animation: more active on hover
      const bobFreq = hovered ? 3.5 : 2.0;
      const bobAmp = hovered ? 0.12 : 0.05;
      const bob = Math.sin(state.clock.elapsedTime * bobFreq) * bobAmp;
      
      const defaultY = (type === "flower2" || type === "flower5") ? -0.2 : -0.1;
      meshRef.current.position.y = defaultY + bob;

      // Scale transition (direct arithmetic lerp)
      const targetScale = hovered ? 1.35 : 1.0;
      meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.1;
      meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.1;
      meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.1;

      // Pitch tilting animation to lean toward screen on hover
      const targetX = hovered ? 0.38 : Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
      meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.1;
    }
  });

  // flower1: Sunflower style
  if (type === "flower1") {
    return (
      <group ref={meshRef} position={[0, -0.1, 0]}>
        {/* Large golden brown center disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.15, 32]} />
          <meshStandardMaterial color="#5c3a21" roughness={0.9} />
        </mesh>
        {/* Yellow Petals Ring */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 16;
          return (
            <mesh 
              key={i} 
              position={[Math.sin(angle) * 0.65, 0, Math.cos(angle) * 0.65]} 
              rotation={[0.1, -angle, 0]}
            >
              <boxGeometry args={[0.18, 0.05, 0.45]} />
              <meshPhongMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // flower2: Lotus style (pink, layered petals)
  if (type === "flower2") {
    return (
      <group ref={meshRef} position={[0, -0.2, 0]}>
        {/* Central seedpod */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.2, 16]} />
          <meshPhongMaterial color="#ffe066" />
        </mesh>
        {/* Inner petals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          return (
            <mesh 
              key={`inner-${i}`} 
              position={[Math.sin(angle) * 0.35, 0.2, Math.cos(angle) * 0.35]} 
              rotation={[0.6, -angle, 0.1]}
            >
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshPhongMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
        {/* Outer petals */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          return (
            <mesh 
              key={`outer-${i}`} 
              position={[Math.sin(angle) * 0.65, 0.05, Math.cos(angle) * 0.65]} 
              rotation={[0.2, -angle, 0.3]}
            >
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshPhongMaterial color="#ff7494" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // flower3: Rose style (compact spiral petals)
  if (type === "flower3") {
    return (
      <group ref={meshRef} position={[0, -0.1, 0]}>
        {/* Bud core */}
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshPhongMaterial color={color} />
        </mesh>
        {/* Tight layered petals wrapping around */}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i * Math.PI * 2.4) / 10;
          const radius = 0.18 + i * 0.045;
          return (
            <mesh 
              key={i} 
              position={[Math.sin(angle) * radius, 0.08 + i * 0.02, Math.cos(angle) * radius]} 
              rotation={[0.4 + i * 0.05, -angle + Math.PI / 2, 0.2]}
            >
              <sphereGeometry args={[0.25 - i * 0.005, 8, 8]} />
              <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // flower4: Daisy style (slender petals, orange/yellow core)
  if (type === "flower4") {
    return (
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshBasicMaterial color="#ff9900" />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 14;
          return (
            <mesh 
              key={i} 
              position={[Math.sin(angle) * 0.62, 0, Math.cos(angle) * 0.62]} 
              rotation={[0.08, -angle, 0]}
            >
              <boxGeometry args={[0.12, 0.03, 0.5]} />
              <meshPhongMaterial color={color} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // flower5: Tulip style (bell/cup shaped petals)
  if (type === "flower5") {
    return (
      <group ref={meshRef} position={[0, -0.2, 0]}>
        {/* Stem connection */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 8]} />
          <meshPhongMaterial color="#2e7d32" />
        </mesh>
        {/* 3 Inner overlapping cup petals */}
        {Array.from({ length: 3 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 3;
          return (
            <mesh 
              key={`inner-${i}`} 
              position={[Math.sin(angle) * 0.22, 0.25, Math.cos(angle) * 0.22]} 
              rotation={[0.5, -angle, 0]}
            >
              <cylinderGeometry args={[0.2, 0.1, 0.45, 16, 1, true]} />
              <meshPhongMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
        {/* 3 Outer overlapping cup petals */}
        {Array.from({ length: 3 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 3 + Math.PI / 3;
          return (
            <mesh 
              key={`outer-${i}`} 
              position={[Math.sin(angle) * 0.3, 0.22, Math.cos(angle) * 0.3]} 
              rotation={[0.35, -angle, 0]}
            >
              <cylinderGeometry args={[0.24, 0.12, 0.4, 16, 1, true]} />
              <meshPhongMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // flower6: Sakura/Cosmos style (pink 5-petal star layout)
  if (type === "flower6") {
    return (
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#ffe066" />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <mesh 
              key={i} 
              position={[Math.sin(angle) * 0.48, 0, Math.cos(angle) * 0.48]} 
              rotation={[0.15, -angle, 0]}
            >
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshPhongMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // fallback type support
  if (type === "flower") {
    return (
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial color="#ffe066" />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          return (
            <mesh 
              key={i} 
              position={[Math.sin(angle) * 0.6, 0, Math.cos(angle) * 0.6]} 
              rotation={[0.2, -angle, 0]}
            >
              <coneGeometry args={[0.22, 0.6, 16]} />
              <meshPhongMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // default
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.1]} />
      <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
}

export default function ProjectPreview3D({ type, color = "#3fb950" }: PreviewProps) {
  const webglAvailable = useWebGLAvailable();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Return loading skeleton/fallback until client-side hydration sets isMobile
  if (isMobile === null) {
    return <div className="project-3d-preview bg-[#05070a] animate-pulse" />;
  }

  if (isMobile || webglAvailable !== true) {
    return (
      <div className="project-3d-preview flex items-center justify-center relative bg-gradient-to-br from-[#0c0f16] to-[#05070a] overflow-hidden group-hover:from-[#111622] transition-all duration-300">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {/* Themed glowing core */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110"
          style={{
            background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
            boxShadow: `0 0 30px ${color}1a, inset 0 0 15px ${color}33`,
            border: `1px solid ${color}44`
          }}
        >
          {/* Internal rotating geometric shape */}
          <div 
            className="w-6 h-6 border-2 transition-transform duration-1000 ease-in-out group-hover:rotate-45"
            style={{ 
              borderColor: color,
              borderRadius: type === "nlp" ? "50%" : type === "cv" ? "4px" : type.startsWith("flower") ? "50%" : type === "logo" ? "3px" : type === "automl" ? "0" : "30% 70% 30% 70% / 50% 50% 50% 50%"
            }} 
          />
        </div>
        
        {/* Badge in top corner */}
        <div className="absolute top-2 right-2 text-[8px] mono text-[#8b949e] tracking-widest px-2 py-0.5 border border-white/5 rounded-full bg-black/40">
          2D SAFE MODE
        </div>
      </div>
    );
  }

  return (
    <div 
      className="project-3d-preview"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <Canvas camera={{ position: [0, 0, 4.2], fov: 52 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.65} />
        <pointLight position={[5, 5, 5]} intensity={1.1} />
        <PreviewMesh type={type} color={color} hovered={hovered} />
      </Canvas>
    </div>
  );
}

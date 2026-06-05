"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";

interface PreviewProps {
  type: string;
  color?: string;
}

function PreviewMesh({ type, color = "#3fb950" }: PreviewProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  if (type === "automl") {
    return (
      <group ref={meshRef}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshPhongMaterial color={color} />
        </mesh>
        {[ -0.9, 0.9 ].map((x, i) => (
          <mesh key={i} position={[x, -0.7, 0]}>
            <boxGeometry args={[0.4, 0.7, 0.4]} />
            <meshPhongMaterial color="#58a6ff" />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "nlp") {
    return (
      <group ref={meshRef}>
        <mesh>
          <torusGeometry args={[1, 0.35, 10, 32]} />
          <meshPhongMaterial color={color} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.55]} />
          <meshBasicMaterial color="#bc8cff" />
        </mesh>
      </group>
    );
  }

  if (type === "cv") {
    return (
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[1.05]} />
          <meshPhongMaterial color={color} />
        </mesh>
        <mesh position={[0.6, 0.4, 0.8]}>
          <sphereGeometry args={[0.32]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
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
              borderRadius: type === "nlp" ? "50%" : type === "cv" ? "4px" : type === "automl" ? "0" : "30% 70% 30% 70% / 50% 50% 50% 50%"
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
    <div className="project-3d-preview">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 52 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.65} />
        <pointLight position={[5, 5, 5]} intensity={1.1} />
        <PreviewMesh type={type} color={color} />
      </Canvas>
    </div>
  );
}

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
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

export default function ProjectPreview3D({ type, color }: PreviewProps) {
  const webglAvailable = useWebGLAvailable();

  if (webglAvailable !== true) {
    return (
      <div className="project-3d-preview">
        <SceneFallback label={type.toUpperCase()} detail="3D preview fallback" />
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

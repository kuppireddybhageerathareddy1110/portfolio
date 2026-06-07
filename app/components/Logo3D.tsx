'use client';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneFallback, useWebGLAvailable } from './WebGLGuard';
import LazyCanvas from './LazyCanvas';

interface BRLogoProps {
  isHovered: boolean;
}

const BRLogo: React.FC<BRLogoProps> = ({ isHovered }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Slow default rotation, speed up if hovered
    const speedMultiplier = isHovered ? 1.8 : 0.8;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.6 * speedMultiplier;
    // Subtle breathing / bobbing animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
  });

  const materialProps = {
    color: new THREE.Color('#10b981'), // Premium cyber emerald green
    roughness: 0.1,
    metalness: 0.9,
    emissive: new THREE.Color('#047857'),
    emissiveIntensity: isHovered ? 0.75 : 0.4,
  };

  return (
    <group ref={groupRef} scale={1.2}>
      {/* ─── LETTER 'B' ─── */}
      <group position={[-0.7, 0, 0]}>
        {/* Vertical stem */}
        <mesh position={[-0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 1.8, 0.18]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Upper loop (arc of 180 degrees) */}
        <mesh 
          position={[-0.4, 0.45, 0]} 
          rotation={[0, 0, -Math.PI / 2]} 
          castShadow
        >
          <torusGeometry args={[0.45, 0.09, 12, 24, Math.PI]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Lower loop */}
        <mesh 
          position={[-0.4, -0.45, 0]} 
          rotation={[0, 0, -Math.PI / 2]} 
          castShadow
        >
          <torusGeometry args={[0.45, 0.09, 12, 24, Math.PI]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>

      {/* ─── LETTER 'R' ─── */}
      <group position={[0.7, 0, 0]}>
        {/* Vertical stem */}
        <mesh position={[-0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 1.8, 0.18]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Upper loop */}
        <mesh 
          position={[-0.4, 0.45, 0]} 
          rotation={[0, 0, -Math.PI / 2]} 
          castShadow
        >
          <torusGeometry args={[0.45, 0.09, 12, 24, Math.PI]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Diagonal leg */}
        <mesh 
          position={[0.02, -0.48, 0]} 
          rotation={[0, 0, -0.5]} 
          castShadow
        >
          <boxGeometry args={[0.18, 1.05, 0.18]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    </group>
  );
};

const Logo3D: React.FC = () => {
  const webglAvailable = useWebGLAvailable();
  const [isHovered, setIsHovered] = useState(false);

  if (webglAvailable !== true) {
    return (
      <div className="w-12 h-12 flex items-center justify-center font-bold text-xl text-[#10b981] bg-[#10b981]/10 rounded-xl">
        BR
      </div>
    );
  }

  return (
    <div 
      className="w-12 h-12 cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LazyCanvas className="w-full h-full" fallback={<div className="w-full h-full bg-[#10b981]/5 rounded-xl animate-pulse" />}>
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#10b981" />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#047857" />
          <BRLogo isHovered={isHovered} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </LazyCanvas>
    </div>
  );
};

export default Logo3D;

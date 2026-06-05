"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";

interface HeroSceneProps {
  theme: "chess" | "knight" | "poet" | "king";
}

// Generate coordinate lists for each theme
function generateTargets(theme: string, count: number) {
  const list: Array<{ pos: [number, number, number]; color: string; isGlow?: boolean }> = [];
  
  if (theme === "chess") {
    // Chessboard base (8x8)
    for (let x = -3.5; x <= 3.5; x += 1.0) {
      for (let z = -3.5; z <= 3.5; z += 1.0) {
        const isLight = (Math.round(x + 3.5) + Math.round(z + 3.5)) % 2 === 0;
        list.push({
          pos: [x * 0.8, -1.8, z * 0.8],
          color: isLight ? "#ffffff" : "#1a1f28",
          isGlow: !isLight
        });
      }
    }
    // Rooks on the corners
    const corners = [
      [-2.8, -2.8],
      [-2.8, 2.8],
      [2.8, -2.8],
      [2.8, 2.8]
    ];
    corners.forEach(([cx, cz]) => {
      list.push({ pos: [cx, -1.3, cz], color: "#3fb950" });
      list.push({ pos: [cx, -0.8, cz], color: "#3fb950" });
      list.push({ pos: [cx, -0.3, cz], color: "#58a6ff", isGlow: true });
    });
    // Pawn in the middle
    list.push({ pos: [0, -1.3, 0], color: "#3fb950" });
    list.push({ pos: [0, -0.8, 0], color: "#3fb950" });
    list.push({ pos: [0, -0.3, 0], color: "#58a6ff", isGlow: true });
    list.push({ pos: [0, 0.2, 0], color: "#3fb950" });
  } 
  else if (theme === "knight") {
    // Knight (Horse chess piece)
    // Rounded base
    for (let x = -1.6; x <= 1.6; x += 0.4) {
      for (let z = -1.6; z <= 1.6; z += 0.4) {
        if (x * x + z * z <= 2.2) {
          list.push({ pos: [x, -1.8, z], color: "#2e323c" });
          list.push({ pos: [x * 0.85, -1.3, z * 0.85], color: "#ff4a4a", isGlow: true });
        }
      }
    }
    // Tilted neck/body
    for (let y = -0.9; y <= 0.9; y += 0.45) {
      const zOffset = -y * 0.4;
      const r = 0.8 - y * 0.15;
      for (let x = -r; x <= r; x += 0.4) {
        for (let z = -0.6; z <= 0.6; z += 0.4) {
          list.push({ pos: [x, y, z + zOffset], color: "#ff4a4a" });
        }
      }
    }
    // Head structure
    for (let x = -0.45; x <= 0.45; x += 0.3) {
      // Head core
      list.push({ pos: [x, 1.25, -0.2], color: "#ffffff", isGlow: true });
      list.push({ pos: [x, 1.25, 0.25], color: "#ff4a4a" });
      // Snout (forward-pointing horse face)
      list.push({ pos: [x, 1.0, -0.65], color: "#ff4a4a" });
      list.push({ pos: [x, 0.7, -1.0], color: "#2e323c" });
      list.push({ pos: [x, 0.4, -1.35], color: "#ff4a4a" });
      // Mane (back hair of the knight horse)
      list.push({ pos: [x, 0.7, 0.6], color: "#2e323c" });
      list.push({ pos: [x, 0.1, 0.75], color: "#ff4a4a" });
      list.push({ pos: [x, -0.4, 0.85], color: "#2e323c" });
    }
    // Ears
    list.push({ pos: [-0.35, 1.7, 0.1], color: "#ff4a4a" });
    list.push({ pos: [0.35, 1.7, 0.1], color: "#ff4a4a" });
  } 
  else if (theme === "poet") {
    // Open Book and Quill Pen
    // Curved sheets on left and right
    for (let px = -3.2; px <= 3.2; px += 0.45) {
      if (Math.abs(px) < 0.2) continue;
      for (let py = -2.0; py <= 2.0; py += 0.45) {
        const dist = Math.abs(px) - 0.2;
        const pz = Math.sin(dist * 0.75) * 0.9 - 0.6;
        // Cream paper sheets
        list.push({ pos: [px, py * 0.85, pz], color: "#f3ece4" });
        // Leather back cover
        list.push({ pos: [px, py * 0.87, pz - 0.25], color: "#e3a95d", isGlow: true });
      }
    }
    // Book spine
    for (let py = -1.8; py <= 1.8; py += 0.4) {
      list.push({ pos: [0, py * 0.8, -0.7], color: "#4d3e34" });
    }
    // Quill Pen
    for (let q = 0; q <= 6; q++) {
      const t = q / 6;
      list.push({
        pos: [t * 1.5, t * 1.8 - 0.3, t * 0.8],
        color: q % 2 === 0 ? "#e3a95d" : "#f3ece4",
        isGlow: q % 3 === 0
      });
    }
  } 
  else if (theme === "king") {
    // Crown
    const radius = 2.1;
    const steps = 18;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;
      
      // Crown bottom band
      list.push({ pos: [cx, -1.6, cz], color: "#ffd700", isGlow: true });
      list.push({ pos: [cx, -1.2, cz], color: "#ffd700" });
      
      // Spikes: 6 spikes
      const isSpike = i % 3 === 0;
      if (isSpike) {
        list.push({ pos: [cx, -0.8, cz], color: "#ffd700" });
        list.push({ pos: [cx * 1.05, -0.3, cz * 1.05], color: "#ffd700" });
        list.push({ pos: [cx * 1.1, 0.2, cz * 1.1], color: "#ffd700", isGlow: true });
        list.push({ pos: [cx * 1.15, 0.7, cz * 1.15], color: "#f472b6" }); // magenta jewel tip
      }
      
      // Royal purple velvet cap
      for (let h = -1.0; h <= 0.3; h += 0.45) {
        const domeR = radius * (1.0 - (h + 1.0) * 0.45);
        const dx = Math.cos(angle) * domeR * 0.8;
        const dz = Math.sin(angle) * domeR * 0.8;
        list.push({ pos: [dx, h, dz], color: "#371e72" });
      }
    }
    // Cross on top
    list.push({ pos: [0, 0.7, 0], color: "#ffd700" });
    list.push({ pos: [0, 1.1, 0], color: "#ffd700", isGlow: true });
    list.push({ pos: [-0.4, 1.1, 0], color: "#ffd700" });
    list.push({ pos: [0.4, 1.1, 0], color: "#ffd700" });
    list.push({ pos: [0, 1.5, 0], color: "#ffd700" });
  }

  // Map to count elements
  const result: Array<{ pos: [number, number, number]; color: string; isGlow: boolean }> = [];
  for (let i = 0; i < count; i++) {
    if (i < list.length) {
      result.push({
        pos: list[i].pos,
        color: list[i].color,
        isGlow: !!list[i].isGlow
      });
    } else {
      // Unused blocks hide under the scene
      result.push({
        pos: [0, -12, 0],
        color: "#000000",
        isGlow: false
      });
    }
  }
  
  return result;
}

function MorphingVoxelScene({ theme }: HeroSceneProps) {
  const count = 190;
  const targets = useMemo(() => generateTargets(theme, count), [theme, count]);
  
  const groupRef = useRef<THREE.Group>(null!);
  const blockRefs = useRef<Array<THREE.Mesh>>([]);
  
  // Starting arrangement: flat grid (like a chessboard grid)
  const initialPositions = useMemo(() => {
    const arr: Array<THREE.Vector3> = [];
    for (let i = 0; i < count; i++) {
      const x = ((i % 14) - 6.5) * 0.6;
      const z = ((Math.floor(i / 14) % 14) - 6.5) * 0.6;
      arr.push(new THREE.Vector3(x, -1.8, z));
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotation speed depends on theme for artistic flavor
      const rotSpeed = theme === "knight" ? 0.18 : theme === "poet" ? 0.12 : theme === "king" ? 0.14 : 0.16;
      groupRef.current.rotation.y = state.clock.elapsedTime * rotSpeed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.07) * 0.08;
    }
    
    const time = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const mesh = blockRefs.current[i];
      if (!mesh) continue;
      
      const target = targets[i];
      
      // Soft LERP interpolation with random individual speeds for organic morphing look
      const lerpSpeed = 0.065 + Math.sin(i * 15.2) * 0.015;
      
      // Delay block movement based on its index (creates a beautiful wave transition)
      mesh.position.x += (target.pos[0] - mesh.position.x) * lerpSpeed;
      
      // Subtle float effect on target Y axis for assembled pieces
      const floatY = target.pos[1] !== -12 
        ? target.pos[1] + Math.sin(time * 1.5 + i * 0.3) * 0.06
        : target.pos[1];
        
      mesh.position.y += (floatY - mesh.position.y) * lerpSpeed;
      mesh.position.z += (target.pos[2] - mesh.position.z) * lerpSpeed;
      
      // Shrink and scale down unused blocks
      const targetScale = target.pos[1] === -12 ? 0.001 : 1.0;
      const scaleSpeed = 0.1;
      const nextScale = mesh.scale.x + (targetScale - mesh.scale.x) * scaleSpeed;
      mesh.scale.set(nextScale, nextScale, nextScale);
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const initPos = initialPositions[i];
        const target = targets[i];
        
        return (
          <mesh
            key={i}
            ref={(el) => { if (el) blockRefs.current[i] = el; }}
            position={[initPos.x, initPos.y, initPos.z]}
            scale={[0.001, 0.001, 0.001]} // start small
          >
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshPhongMaterial
              color={target?.color || "#3fb950"}
              emissive={target?.color || "#3fb950"}
              emissiveIntensity={target?.isGlow ? 0.4 : 0.06}
              shininess={80}
              transparent
              opacity={target?.pos[1] === -12 ? 0.0 : 0.92}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function HeroScene({ theme = "chess" }: HeroSceneProps) {
  const webglAvailable = useWebGLAvailable();

  if (webglAvailable !== true) {
    return (
      <div className="three-container h-[420px] md:h-[520px] lg:h-[580px] w-full">
        <SceneFallback label="3D THEMED CORE" detail="WebGL is disabled in this browser, so the portfolio is showing a styled fallback instead of a blank canvas." />
      </div>
    );
  }

  return (
    <div className="three-container h-[420px] md:h-[520px] lg:h-[580px] w-full">
      <Canvas
        camera={{ position: [0, 0.5, 7.5], fov: 46 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.65} />
        <pointLight position={[10, 10, 10]} intensity={1.3} color="#ffffff" />
        <pointLight position={[-8, -6, -4]} intensity={0.7} color="#58a6ff" />
        <pointLight position={[0, 4, -4]} intensity={0.5} color={theme === "knight" ? "#ff4a4a" : theme === "king" ? "#ffd700" : "#3fb950"} />

        <MorphingVoxelScene theme={theme} />

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
          autoRotateSpeed={0.25}
          minPolarAngle={Math.PI * 0.25}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
      <div className="floating-3d-hint">Drag to orbit • 3D Voxel Core</div>
    </div>
  );
}

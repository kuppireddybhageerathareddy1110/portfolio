"use client";

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useGLTF, Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";
import LazyCanvas from "./LazyCanvas";

// Preload the GLB assets
useGLTF.preload("/arthur.glb");
useGLTF.preload("/knight.glb");

function LoadingModel() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#3fb950" wireframe />
    </mesh>
  );
}

function GLBModel({ url, scale, position }: { url: string; scale: number; position: [number, number, number] }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  // Traverse model to cast and receive shadows
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <group ref={groupRef}>
      <Float
        speed={1.5}
        rotationIntensity={0.1}
        floatIntensity={0.4}
        floatingRange={[-0.08, 0.08]}
      >
        <primitive object={scene} scale={scale} position={position} />
      </Float>
    </group>
  );
}

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

    // Floating digital data bits (theme-themed: green)
    for (let p = 0; p < 25; p++) {
      const angle = (p / 25) * Math.PI * 2;
      const px = Math.cos(angle) * (2.2 + Math.sin(p) * 0.5);
      const pz = Math.sin(angle) * (2.2 + Math.sin(p) * 0.5);
      const py = -1.0 + Math.sin(p * 1.5) * 1.5;
      list.push({ pos: [px, py, pz], color: "#3fb950", isGlow: p % 2 === 0 });
    }
  } 
  else if (theme === "knight") {
    // Knight (Futuristic Cyber-Knight chess horse piece)
    // Rounded base with glowing crimson rings
    for (let x = -1.6; x <= 1.6; x += 0.4) {
      for (let z = -1.6; z <= 1.6; z += 0.4) {
        const dSq = x * x + z * z;
        if (dSq <= 2.2) {
          // outer ring is glowing crimson
          const isOuter = dSq > 1.4 && dSq <= 2.2;
          list.push({ pos: [x, -1.8, z], color: isOuter ? "#ff1818" : "#1e222a", isGlow: isOuter });
          list.push({ pos: [x * 0.85, -1.3, z * 0.85], color: "#2e323c" });
        }
      }
    }
    // Tilted neck/body (sleek tech armor plates)
    for (let y = -0.9; y <= 0.9; y += 0.45) {
      const zOffset = -y * 0.4;
      const r = 0.8 - y * 0.15;
      for (let x = -r; x <= r; x += 0.4) {
        for (let z = -0.6; z <= 0.6; z += 0.4) {
          const isCore = Math.abs(x) < 0.1 && Math.abs(z) < 0.1;
          list.push({ 
            pos: [x, y, z + zOffset], 
            color: isCore ? "#ff1818" : "#2e323c", 
            isGlow: isCore 
          });
        }
      }
    }
    // Head structure (futuristic armor with glowing visor)
    for (let x = -0.45; x <= 0.45; x += 0.3) {
      const isCenter = Math.abs(x) < 0.1;
      // Visor / Eyes (high-intensity neon red)
      list.push({ pos: [x, 1.25, -0.35], color: "#ff0000", isGlow: true });
      list.push({ pos: [x, 1.25, 0.25], color: "#343840" });
      
      // Snout (forward-pointing face)
      list.push({ pos: [x, 1.0, -0.65], color: "#343840" });
      list.push({ pos: [x, 0.7, -1.0], color: "#ff1818", isGlow: isCenter });
      list.push({ pos: [x, 0.4, -1.35], color: "#343840" });
      
      // Mane (flowing neon hair)
      list.push({ pos: [x, 0.7, 0.6], color: "#ff1818", isGlow: true });
      list.push({ pos: [x, 0.1, 0.75], color: "#ff1818", isGlow: true });
      list.push({ pos: [x, -0.4, 0.85], color: "#ff1818", isGlow: true });
    }
    // Ears / Horns
    list.push({ pos: [-0.35, 1.7, 0.1], color: "#ff1818", isGlow: true });
    list.push({ pos: [0.35, 1.7, 0.1], color: "#ff1818", isGlow: true });

    // Floating combat embers/sparks
    for (let p = 0; p < 35; p++) {
      const angle = (p / 35) * Math.PI * 2;
      const px = Math.cos(angle) * (1.7 + Math.sin(p * 2) * 0.4);
      const pz = Math.sin(angle) * (1.7 + Math.sin(p * 2) * 0.4);
      const py = -1.6 + (p * 0.1); // rising up
      list.push({ pos: [px, py, pz], color: p % 2 === 0 ? "#ff1818" : "#ffd700", isGlow: true });
    }
  } 
  else if (theme === "poet") {
    // Open Book and Quill Pen
    // Curved sheets on left and right - warm parchment colors
    for (let px = -3.0; px <= 3.0; px += 0.45) {
      if (Math.abs(px) < 0.25) continue;
      for (let py = -1.8; py <= 1.8; py += 0.4) {
        const dist = Math.abs(px) - 0.25;
        const pz = Math.sin(dist * 0.8) * 0.85 - 0.55;
        // Cream paper sheets
        list.push({ pos: [px, py * 0.85, pz], color: "#fdf6e2" });
        // Leather back cover (warm rich brown)
        list.push({ pos: [px, py * 0.87, pz - 0.22], color: "#b4793f", isGlow: Math.abs(px) > 2.5 });
      }
    }
    // Book spine (dark mahogany wood style)
    for (let py = -1.8; py <= 1.8; py += 0.3) {
      list.push({ pos: [0, py * 0.85, -0.65], color: "#3d2b1f" });
      list.push({ pos: [0, py * 0.85, -0.85], color: "#dec1a0", isGlow: true }); // spine ribbon/trim
    }
    // Quill Pen (diagonal feather floating to the right)
    for (let q = 0; q <= 12; q++) {
      const t = q / 12;
      const qx = 1.3 + t * 1.5;
      const qy = 0.3 + t * 2.1;
      const qz = 0.5 + t * 1.1;
      // Quill shaft (stem)
      list.push({ pos: [qx, qy, qz], color: "#dec1a0", isGlow: q === 0 || q % 4 === 0 });
      
      // Feather barbs (fluff) - wider in middle, tapering at tip
      const width = Math.sin(t * Math.PI) * 0.7;
      if (width > 0.1) {
        list.push({ pos: [qx - width * 0.8, qy - 0.05, qz + width * 0.4], color: "#f3ece4" });
        list.push({ pos: [qx + width * 0.8, qy - 0.05, qz - width * 0.4], color: "#f3ece4" });
      }
    }
    // Floating golden literary particles ("inspiration dust")
    for (let p = 0; p < 28; p++) {
      const angle = (p / 28) * Math.PI * 2;
      const px = Math.cos(angle) * (1.2 + Math.sin(p * 3) * 0.5);
      const pz = Math.sin(angle) * (1.2 + Math.sin(p * 3) * 0.5) - 0.2;
      const py = -0.5 + (p * 0.1); // rises upwards from the pages
      list.push({ pos: [px, py, pz], color: "#e3a95d", isGlow: true });
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

    // Floating royal sparkles
    for (let p = 0; p < 25; p++) {
      const angle = (p / 25) * Math.PI * 2;
      const px = Math.cos(angle) * 2.4;
      const pz = Math.sin(angle) * 2.4;
      const py = -1.0 + Math.sin(p * 1.2) * 1.2;
      list.push({ pos: [px, py, pz], color: p % 2 === 0 ? "#ffd700" : "#f472b6", isGlow: true });
    }
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
  const count = 350;
  const targets = useMemo(() => generateTargets(theme, count), [theme, count]);
  
  const groupRef = useRef<THREE.Group>(null!);
  const blockRefs = useRef<Array<THREE.Mesh>>([]);
  
  // Starting arrangement: flat square grid
  const initialPositions = useMemo(() => {
    const arr: Array<THREE.Vector3> = [];
    for (let i = 0; i < count; i++) {
      const x = ((i % 19) - 9) * 0.45;
      const z = (Math.floor(i / 19) - 9) * 0.45;
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
      <LazyCanvas className="w-full h-full" fallback={<div className="w-full h-full bg-[#05070a] animate-pulse rounded-xl" />}>
        <Canvas
          camera={{ position: [0, 0.5, 7.5], fov: 46 }}
          style={{ background: "transparent" }}
          shadows
        >
          <ambientLight intensity={0.65} />
          <pointLight position={[10, 10, 10]} intensity={1.3} color="#ffffff" />
          <pointLight position={[-8, -6, -4]} intensity={0.7} color="#58a6ff" />
          <pointLight position={[0, 4, -4]} intensity={0.5} color={theme === "knight" ? "#ff4a4a" : theme === "king" ? "#ffd700" : "#3fb950"} />

          {/* HDR environment for realistic reflections when rendering GLB models */}
          {(theme === "king" || theme === "knight") && <Environment preset="city" />}

          {/* Subtle ground shadow for GLBs */}
          {(theme === "king" || theme === "knight") && (
            <ContactShadows
              position={[0, -0.2, 0]}
              opacity={0.5}
              scale={6}
              blur={1.8}
              far={3}
              color="#000000"
            />
          )}

          <Suspense fallback={<LoadingModel />}>
            {theme === "king" ? (
              <GLBModel url="/arthur.glb" scale={4.5} position={[0, -0.2, 0]} />
            ) : theme === "knight" ? (
              <GLBModel url="/knight.glb" scale={4.5} position={[0, -0.2, 0]} />
            ) : (
              <MorphingVoxelScene theme={theme} />
            )}
          </Suspense>

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
      </LazyCanvas>
      <div className="floating-3d-hint">
        {theme === "king" || theme === "knight" ? "Drag to orbit • 3D GLB Model" : "Drag to orbit • 3D Voxel Core"}
      </div>
    </div>
  );
}

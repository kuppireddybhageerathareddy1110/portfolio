"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";
import LazyCanvas from "./LazyCanvas";

// Preload for faster display
useGLTF.preload("/Copilot3D-24815eeb-bdfd-4cf8-b125-744e49fad4ce.glb");

function CopilotGLB() {
  const { scene } = useGLTF(
    "/Copilot3D-24815eeb-bdfd-4cf8-b125-744e49fad4ce.glb"
  );

  const groupRef = useRef<THREE.Group>(null!);

  // Subtle continuous slow rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });

  // Enable shadows and tone-map on every mesh inside the loaded model
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <group ref={groupRef}>
      <Float
        speed={1.4}
        rotationIntensity={0.12}
        floatIntensity={0.35}
        floatingRange={[-0.08, 0.08]}
      >
        <primitive
          object={scene}
          scale={4.8}
          position={[0, 0.1, 0]}
        />
      </Float>
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial color="#58a6ff" wireframe />
    </mesh>
  );
}

interface CopilotModel3DProps {
  /** Height class for the canvas wrapper, e.g. "h-[480px]" */
  heightClass?: string;
  /** Whether to show the orbit hint footer */
  showHint?: boolean;
}

export default function CopilotModel3D({
  heightClass = "h-[480px]",
  showHint = true,
}: CopilotModel3DProps) {
  const webglAvailable = useWebGLAvailable();

  if (webglAvailable !== true) {
    return (
      <div className={`relative w-full ${heightClass}`}>
        <SceneFallback
          label="COPILOT 3D MODEL"
          detail="WebGL is unavailable in this browser. The Copilot 3D model cannot be rendered."
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass}`}>
      <LazyCanvas
        className="w-full h-full"
        fallback={
          <div className="w-full h-full bg-[#05070a] animate-pulse rounded-xl flex items-center justify-center">
            <span className="text-xs mono text-[#3fb950] tracking-widest">
              LOADING 3D MODEL…
            </span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0.5, 6], fov: 44 }}
          style={{ background: "transparent" }}
          shadows
        >
          {/* Lighting rig */}
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[6, 8, 6]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-5, 4, -4]} intensity={0.9} color="#58a6ff" />
          <pointLight position={[4, -3, 3]} intensity={0.5} color="#3fb950" />
          <pointLight position={[0, 6, 0]} intensity={0.4} color="#bc8cff" />

          {/* HDR environment for realistic reflections */}
          <Environment preset="city" />

          {/* Subtle ground shadow */}
          <ContactShadows
            position={[0, -0.8, 0]}
            opacity={0.45}
            scale={8}
            blur={2.2}
            far={3}
            color="#000000"
          />

          {/* The GLB model */}
          <Suspense fallback={<LoadingFallback />}>
            <CopilotGLB />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={12}
            autoRotate={false}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.8}
          />
        </Canvas>
      </LazyCanvas>

      {showHint && (
        <div className="absolute bottom-4 right-4 text-[10px] mono px-3 py-1 bg-black/60 rounded-full border border-white/10 text-[#8b949e] pointer-events-none">
          Drag to orbit • Scroll to zoom • Copilot 3D
        </div>
      )}
    </div>
  );
}

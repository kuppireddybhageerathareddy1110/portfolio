"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { SceneFallback, useWebGLAvailable } from "./WebGLGuard";

interface Contribution {
  lat: number;
  lon: number;
  count: number;
  label: string;
}

const contributions: Contribution[] = [
  { lat: 20, lon: 78, count: 320, label: "India" },
  { lat: 40, lon: -100, count: 180, label: "USA" },
  { lat: 52, lon: 13, count: 95, label: "Germany" },
  { lat: 35, lon: 139, count: 72, label: "Japan" },
  { lat: -33, lon: 151, count: 48, label: "Australia" },
  { lat: 1, lon: 103, count: 65, label: "Singapore" },
];

type GlobePoint = {
  position: [number, number, number];
  size: number;
  color: string;
  count: number;
  label: string;
};

type GlobeLine = {
  start: [number, number, number];
  end: [number, number, number];
};

function Globe() {
  const globeRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Group>(null!);

  const { points, lines } = useMemo(() => {
    const pts: GlobePoint[] = [];
    const lns: GlobeLine[] = [];

    contributions.forEach((c, i) => {
      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lon + 180) * (Math.PI / 180);

      const x = -Math.sin(phi) * Math.cos(theta) * 2.8;
      const y = Math.cos(phi) * 2.8;
      const z = Math.sin(phi) * Math.sin(theta) * 2.8;
      const position: [number, number, number] = [x, y, z];

      const intensity = Math.min(c.count / 400, 1);

      pts.push({
        position,
        size: 0.12 + intensity * 0.18,
        color: intensity > 0.6 ? "#3fb950" : "#58a6ff",
        count: c.count,
        label: c.label,
      });

      // Connect to a few others
      if (i > 0) {
        const prev = pts[i - 1];
        lns.push({
          start: pts[i].position,
          end: prev.position,
        });
      }
    });

    return { points: pts, lines: lns };
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
    if (pointsRef.current) {
      pointsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.08);
      });
    }
  });

  return (
    <group>
      {/* Globe sphere */}
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[2.8]} />
          <meshPhongMaterial
            color="#0f141b"
            emissive="#1a1f28"
            emissiveIntensity={0.4}
            shininess={20}
            wireframe={false}
          />
        </mesh>

        {/* Subtle wireframe */}
        <mesh>
          <sphereGeometry args={[2.82]} />
          <meshBasicMaterial
            color="#3fb950"
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      </group>

      {/* Contribution points */}
      <group ref={pointsRef}>
        {points.map((pt, i) => (
          <group key={i} position={pt.position as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[pt.size]} />
              <meshBasicMaterial color={pt.color} />
            </mesh>
            <pointLight color={pt.color} intensity={0.4} distance={1.5} />

            <Html position={[0, pt.size + 0.6, 0]} center>
              <div className="text-[10px] mono bg-black/80 px-2 py-0.5 rounded border border-white/10 text-white whitespace-nowrap">
                {pt.label} <span className="text-[#3fb950]">{pt.count}</span>
              </div>
            </Html>
          </group>
        ))}
      </group>

      {/* Connection arcs */}
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  ...line.start,
                  ...line.end,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#58a6ff" transparent opacity={0.25} />
        </line>
      ))}
    </group>
  );
}

export default function ContributionGlobe() {
  const webglAvailable = useWebGLAvailable();

  if (webglAvailable !== true) {
    return (
      <div className="w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-[#30363d] bg-[#05070a]">
        <SceneFallback label="GLOBAL IMPACT" detail="1,248+ contributions across India, USA, Germany, Japan, Australia, and Singapore." />
      </div>
    );
  }

  return (
    <div className="w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-[#30363d] bg-[#05070a]">
      <Canvas camera={{ position: [0, 0, 9], fov: 48 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[8, 6, 4]} intensity={1.2} />
        <pointLight position={[-6, -4, -8]} intensity={0.6} color="#bc8cff" />

        <Globe />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={13}
          autoRotate
          autoRotateSpeed={0.15}
        />
      </Canvas>
      <div className="absolute bottom-3 right-3 text-[10px] mono px-3 py-1 bg-black/70 rounded-full border border-white/10 text-[#8b949e]">
        1,248 contributions • Global reach
      </div>
    </div>
  );
}

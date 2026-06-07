'use client';
import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneFallback, useWebGLAvailable } from './WebGLGuard';
import LazyCanvas from './LazyCanvas';

// ─── RK4 integrators ──────────────────────────────────────────────────────────
function rk4Rossler(x: number, y: number, z: number, dt: number, a: number, b: number, c: number): [number, number, number] {
  const f = (x: number, y: number, z: number): [number, number, number] => [-y - z, x + a * y, b + z * (x - c)];
  const [k1x, k1y, k1z] = f(x, y, z);
  const [k2x, k2y, k2z] = f(x + dt / 2 * k1x, y + dt / 2 * k1y, z + dt / 2 * k1z);
  const [k3x, k3y, k3z] = f(x + dt / 2 * k2x, y + dt / 2 * k2y, z + dt / 2 * k2z);
  const [k4x, k4y, k4z] = f(x + dt * k3x, y + dt * k3y, z + dt * k3z);
  return [
    x + dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x),
    y + dt / 6 * (k1y + 2 * k2y + 2 * k3y + k4y),
    z + dt / 6 * (k1z + 2 * k2z + 2 * k3z + k4z),
  ];
}

function rk4Lorenz(x: number, y: number, z: number, dt: number, s: number, r: number, b: number): [number, number, number] {
  const f = (x: number, y: number, z: number): [number, number, number] => [s * (y - x), x * (r - z) - y, x * y - b * z];
  const [k1x, k1y, k1z] = f(x, y, z);
  const [k2x, k2y, k2z] = f(x + dt / 2 * k1x, y + dt / 2 * k1y, z + dt / 2 * k1z);
  const [k3x, k3y, k3z] = f(x + dt / 2 * k2x, y + dt / 2 * k2y, z + dt / 2 * k2z);
  const [k4x, k4y, k4z] = f(x + dt * k3x, y + dt * k3y, z + dt * k3z);
  return [
    x + dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x),
    y + dt / 6 * (k1y + 2 * k2y + 2 * k3y + k4y),
    z + dt / 6 * (k1z + 2 * k2z + 2 * k3z + k4z),
  ];
}

// ─── Rössler Attractor 3D Scene ───────────────────────────────────────────────
const MAX_TRAIL = 6000;

function RosslerTrail({ params }: { params: { a: number; b: number; c: number; sp: number } }) {
  const line = useMemo(
    () =>
      new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: "#6adfb8", transparent: true, opacity: 0.85 })
      ),
    []
  );
  const stateRef = useRef({ x: 0.1, y: 0.1, z: 0.1 });
  const trailRef = useRef<Float32Array>(new Float32Array(MAX_TRAIL * 3));
  const countRef = useRef(0);
  const headRef = useRef(0);

  useFrame(() => {
    const P = params;
    const steps = Math.round(P.sp * 6);
    const s = stateRef.current;
    const trail = trailRef.current;

    for (let i = 0; i < steps; i++) {
      let [nx, ny, nz] = rk4Rossler(s.x, s.y, s.z, 0.012, P.a, P.b, P.c);
      
      // Prevent integration values from blowing up to NaN / Infinity
      if (isNaN(nx) || isNaN(ny) || isNaN(nz) || !isFinite(nx) || !isFinite(ny) || !isFinite(nz) || Math.abs(nx) > 400 || Math.abs(ny) > 400 || Math.abs(nz) > 400) {
        nx = 0.1;
        ny = 0.1;
        nz = 0.1;
      }
      
      s.x = nx; s.y = ny; s.z = nz;

      const idx = headRef.current * 3;
      trail[idx] = s.x * 0.065;
      trail[idx + 1] = s.y * 0.065;
      trail[idx + 2] = (s.z - P.c) * 0.065;

      headRef.current = (headRef.current + 1) % MAX_TRAIL;
      if (countRef.current < MAX_TRAIL) countRef.current++;
    }

    if (line) {
      const geom = line.geometry;
      const count = countRef.current;

      // Build ordered array from circular buffer
      const ordered = new Float32Array(count * 3);
      const head = headRef.current;
      if (count < MAX_TRAIL) {
        ordered.set(trail.subarray(0, count * 3));
      } else {
        const tailStart = head * 3;
        const tailLen = (MAX_TRAIL - head) * 3;
        ordered.set(trail.subarray(tailStart, tailStart + tailLen), 0);
        ordered.set(trail.subarray(0, tailStart), tailLen);
      }

      geom.setAttribute('position', new THREE.BufferAttribute(ordered, 3));
      geom.setDrawRange(0, count);
      
      // Safe bounding sphere computation to prevent console NaN errors
      if (count > 1 && !isNaN(ordered[0])) {
        geom.computeBoundingSphere();
      }
    }
  });

  return <primitive object={line} />;
}

function RosslerScene({ params }: { params: { a: number; b: number; c: number; sp: number } }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#6adfb8" />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#0a4a2f" />
      <RosslerTrail params={params} />
      {/* Grid helper for depth reference */}
      <gridHelper args={[4, 20, '#1a3a2a', '#0a1a12']} position={[0, -1.5, 0]} />
      <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={0.4} minDistance={2} maxDistance={10} />
    </>
  );
}

// ─── Lorenz Attractor 3D Scene ────────────────────────────────────────────────
function LorenzTrail({ params }: { params: { s: number; r: number; b: number; sp: number } }) {
  const line = useMemo(
    () =>
      new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: "#6ab4ff", transparent: true, opacity: 0.85 })
      ),
    []
  );
  const stateRef = useRef({ x: 0.1, y: 0, z: 0 });
  const trailRef = useRef<Float32Array>(new Float32Array(MAX_TRAIL * 3));
  const countRef = useRef(0);
  const headRef = useRef(0);

  useFrame(() => {
    const P = params;
    const steps = Math.round(P.sp * 6);
    const s = stateRef.current;
    const trail = trailRef.current;
    const cy = P.r / 2, cz = P.r / 2;

    for (let i = 0; i < steps; i++) {
      let [nx, ny, nz] = rk4Lorenz(s.x, s.y, s.z, 0.005, P.s, P.r, P.b);
      
      // Prevent integration values from blowing up to NaN / Infinity
      if (isNaN(nx) || isNaN(ny) || isNaN(nz) || !isFinite(nx) || !isFinite(ny) || !isFinite(nz) || Math.abs(nx) > 400 || Math.abs(ny) > 400 || Math.abs(nz) > 400) {
        nx = 0.1;
        ny = 0.0;
        nz = 0.0;
      }
      
      s.x = nx; s.y = ny; s.z = nz;

      const idx = headRef.current * 3;
      trail[idx] = s.x * 0.055;
      trail[idx + 1] = (s.y - cy) * 0.055;
      trail[idx + 2] = (s.z - cz) * 0.055;

      headRef.current = (headRef.current + 1) % MAX_TRAIL;
      if (countRef.current < MAX_TRAIL) countRef.current++;
    }

    if (line) {
      const geom = line.geometry;
      const count = countRef.current;
      const ordered = new Float32Array(count * 3);
      const head = headRef.current;
      if (count < MAX_TRAIL) {
        ordered.set(trail.subarray(0, count * 3));
      } else {
        const tailStart = head * 3;
        const tailLen = (MAX_TRAIL - head) * 3;
        ordered.set(trail.subarray(tailStart, tailStart + tailLen), 0);
        ordered.set(trail.subarray(0, tailStart), tailLen);
      }

      geom.setAttribute('position', new THREE.BufferAttribute(ordered, 3));
      geom.setDrawRange(0, count);
      
      // Safe bounding sphere computation to prevent console NaN errors
      if (count > 1 && !isNaN(ordered[0])) {
        geom.computeBoundingSphere();
      }
    }
  });

  return <primitive object={line} />;
}

function LorenzScene({ params }: { params: { s: number; r: number; b: number; sp: number } }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#6ab4ff" />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#0a2a5a" />
      <LorenzTrail params={params} />
      <gridHelper args={[4, 20, '#1a2a4a', '#0a1228']} position={[0, -1.5, 0]} />
      <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={0.5} minDistance={2} maxDistance={10} />
    </>
  );
}

// ─── Water Lily 3D Scene ──────────────────────────────────────────────────────
function WaterLilyMesh({ 
  params, 
  position = [0, 0, 0], 
  scale = 1, 
  delay = 0 
}: { 
  params: { np: number; spread: number; bloom: number };
  position?: [number, number, number];
  scale?: number;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [bloomProgress, setBloomProgress] = useState(0.0);

  // Animate the bloom opening effect when mounted
  useEffect(() => {
    const start = Date.now() + delay;
    let animId: number;

    const animateBloom = () => {
      const now = Date.now();
      if (now < start) {
        setBloomProgress(0.0);
        animId = requestAnimationFrame(animateBloom);
        return;
      }
      const elapsed = (now - start) / 3200; // 3.2 seconds bloom time
      if (elapsed >= 1.0) {
        setBloomProgress(1.0);
      } else {
        // ease-out cubic
        const t = 1 - Math.pow(1 - elapsed, 3);
        setBloomProgress(t);
        animId = requestAnimationFrame(animateBloom);
      }
    };

    animId = requestAnimationFrame(animateBloom);
    return () => cancelAnimationFrame(animId);
  }, [params.np, delay]);

  const geometry = useMemo(() => {
    const { np, spread, bloom } = params;
    const phi = 1 + Math.sqrt(5);
    const vpp = 23, vrpp = 15;

    function interp1(xs: number[], ys: number[], t: number) {
      const n = xs.length;
      if (t <= xs[0]) return ys[0];
      if (t >= xs[n - 1]) return ys[n - 1];
      for (let i = 0; i < n - 1; i++) {
        if (t <= xs[i + 1]) {
          const f = (t - xs[i]) / (xs[i + 1] - xs[i]);
          return ys[i] * (1 - f) + ys[i + 1] * f;
        }
      }
      return ys[n - 1];
    }

    function ip1arr(xsN: number[], ys: number[], n: number) {
      const xs = xsN.map(v => v * (n - 1));
      return Array.from({ length: n }, (_, i) => interp1(xs, ys, i));
    }

    const PR = Array.from({ length: vpp }, (_, i) => {
      const v = -1 + 2 * i / (vpp - 1);
      return 1 - Math.abs(v);
    });

    const currentSpread = spread * (0.3 + 0.7 * bloomProgress);
    const currentBloom = bloom * bloomProgress;

    const petalScale = ip1arr([0, 0.5, 1], [0.3, 0.8, 0.1], np);
    const petalWidth = ip1arr([0, 1], [1, 0.5], np).map(v => v * v);
    const phiArrBase = ip1arr([0, 1], [0, currentSpread], np).map(v => Math.pow(v / currentSpread, 0.9) * currentSpread);

    const verts: number[] = [], colors: number[] = [], indices: number[] = [];
    const lspAll = Array.from({ length: vpp * np }, (_, i) => i / (vpp * np - 1));

    for (let pi = 0; pi < np; pi++) {
      const baseTheta = phi * (pi + 1);
      const lsv = Array.from({ length: vpp }, (_, i) => -1 + 2 * i / (vpp - 1));

      for (let vi = 0; vi < vpp; vi++) {
        const theta = (baseTheta + lsv[vi] / 2 * petalScale[pi]) * Math.PI;
        for (let ri = 0; ri < vrpp; ri++) {
          const r = ri / (vrpp - 1);
          const petalR = PR[vi] * petalWidth[pi] * r;
          const dphi = PR[vi] * interp1([0, 0.5, 1], [0, 0.05, 0.1], pi / (np - 1));
          const phi_v = phiArrBase[pi] + Math.pow(r, 4) * 0.03;
          const phi_total = phi_v + dphi;
          const core = Math.pow(r, 2) * 0.6 * lspAll[pi * vpp + vi];
          const W = Math.cos(Math.PI * phi_total) * (petalR + core);
          const x = Math.cos(theta) * W;
          const y = Math.sin(theta) * W;
          const z = (Math.sin(Math.PI * phi_total) * petalR * 1.7 + core * 0.4) * currentBloom;
          verts.push(x, y, z);
          colors.push(Math.min(1, Math.max(0, phi_total)));
        }
      }
    }

    for (let pi = 0; pi < np; pi++) {
      for (let vi = 0; vi < vpp - 1; vi++) {
        for (let ri = 0; ri < vrpp - 1; ri++) {
          const base = (pi * vpp + vi) * vrpp + ri;
          const next = (pi * vpp + (vi + 1)) * vrpp + ri;
          const maxIdx = verts.length / 3 - 1;
          if (base + 1 <= maxIdx && next + 1 <= maxIdx) {
            indices.push(base, next, base + 1, next, next + 1, base + 1);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(
      colors.flatMap(c => {
        // Gradient: deep orange -> golden -> lime green -> green
        const t = c * 3;
        let r: number, g: number, b: number;
        if (t < 1) {
          r = 0.75 + 0.22 * t; g = 0.34 + 0.57 * t; b = 0.0 + 0.05 * t;
        } else if (t < 2) {
          const u = t - 1;
          r = 0.97 - 0.13 * u; g = 0.91 - 0.01 * u; b = 0.05 + 0.69 * u;
        } else {
          const u = t - 2;
          r = 0.84 - 0.06 * u; g = 0.92 - 0.09 * u; b = 0.74 - 0.13 * u;
        }
        return [r, g, b];
      }), 3
    ));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [params.np, params.spread, params.bloom, bloomProgress]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
      <meshPhongMaterial vertexColors side={THREE.DoubleSide} shininess={60} />
    </mesh>
  );
}

// ─── Butterfly 3D Component ──────────────────────────────────────────────────
function Butterfly({ bloom }: { bloom: number }) {
  const butterflyRef = useRef<THREE.Group>(null!);
  const leftWingRef = useRef<THREE.Mesh>(null!);
  const rightWingRef = useRef<THREE.Mesh>(null!);

  const xRef = useRef(0);
  const yRef = useRef(0.5);
  const zRef = useRef(0);

  useFrame((state) => {
    if (!butterflyRef.current || !leftWingRef.current || !rightWingRef.current) return;
    
    const t = state.clock.elapsedTime * 0.9;
    
    // Lissajous flight path around the flower
    const radiusX = 1.3 + Math.sin(t * 0.45) * 0.5;
    const radiusZ = 1.3 + Math.cos(t * 0.3) * 0.5;
    
    const x = Math.sin(t) * radiusX;
    const z = Math.cos(t) * radiusZ;
    const baseHeight = 0.45 + Math.sin(t * 2.5) * 0.12;

    // Landing cycle: loops every 14 seconds
    const cycle = (state.clock.elapsedTime % 14);
    let isLanded = false;

    if (cycle > 6 && cycle < 10) {
      // Landing phase normalized: goes 0 -> 1 -> 0
      const blend = Math.sin(((cycle - 6) / 4) * Math.PI);
      
      xRef.current = THREE.MathUtils.lerp(x, 0, blend);
      zRef.current = THREE.MathUtils.lerp(z, 0, blend);
      yRef.current = THREE.MathUtils.lerp(baseHeight, bloom * 0.28, blend);
      isLanded = blend > 0.85;
    } else {
      xRef.current = x;
      zRef.current = z;
      yRef.current = baseHeight;
    }

    butterflyRef.current.position.set(xRef.current, yRef.current, zRef.current);

    // Flapping speed: fast when flying, slow shiver/rest when landed
    const flapSpeed = isLanded ? 2.5 : 20.0;
    const flapAngle = Math.sin(state.clock.elapsedTime * flapSpeed) * 0.62;

    leftWingRef.current.rotation.y = flapAngle;
    rightWingRef.current.rotation.y = -flapAngle;

    // Face the direction of flight
    const nextT = t + 0.05;
    const nextRadiusX = 1.3 + Math.sin(nextT * 0.45) * 0.5;
    const nextRadiusZ = 1.3 + Math.cos(nextT * 0.3) * 0.5;
    const nextX = Math.sin(nextT) * nextRadiusX;
    const nextZ = Math.cos(nextT) * nextRadiusZ;
    
    const angle = Math.atan2(nextX - x, nextZ - z);
    butterflyRef.current.rotation.y = angle + Math.PI;
    
    butterflyRef.current.rotation.x = Math.sin(t * 2.5) * 0.12;
  });

  return (
    <group ref={butterflyRef} scale={0.65}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
        <meshStandardMaterial color="#0f0f12" roughness={0.5} />
      </mesh>

      {/* Left Wing */}
      <mesh ref={leftWingRef} position={[-0.01, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.16, 0.22, 3]} />
        <meshStandardMaterial 
          color="#ff33aa" 
          emissive="#ff0088" 
          emissiveIntensity={0.6} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.88} 
        />
      </mesh>

      {/* Right Wing */}
      <mesh ref={rightWingRef} position={[0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <coneGeometry args={[0.16, 0.22, 3]} />
        <meshStandardMaterial 
          color="#ff33aa" 
          emissive="#ff0088" 
          emissiveIntensity={0.6} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.88} 
        />
      </mesh>

      {/* Sparkles / Glitter path when flying */}
      <pointLight distance={0.8} intensity={1.5} color="#ec4899" decay={2} />
    </group>
  );
}

function LilyScene({ params }: { params: { np: number; spread: number; bloom: number } }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 8, 5]} intensity={1.2} color="#ffe066" />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#ff8833" />
      <directionalLight position={[0, 10, 0]} intensity={0.6} color="#ffffff" />
      
      {/* Render 3 blooming Water Lilies (1 main, 2 small delayed ones) */}
      <WaterLilyMesh params={params} position={[0, 0, 0]} scale={1.0} delay={0} />
      <WaterLilyMesh params={params} position={[-1.3, -0.2, 0.7]} scale={0.45} delay={800} />
      <WaterLilyMesh params={params} position={[1.4, -0.1, -0.7]} scale={0.38} delay={400} />
      
      {/* Animated flying and landing butterfly */}
      <Butterfly bloom={params.bloom} />
      
      <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={0.6} minDistance={1.5} maxDistance={8} />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type TabId = 'rossler' | 'lorenz' | 'lily' | 'all';

const TABS: { id: TabId; label: string; color: string }[] = [
  { id: 'rossler', label: 'Rössler', color: '#6adfb8' },
  { id: 'lorenz',  label: 'Lorenz',  color: '#6ab4ff' },
  { id: 'lily',    label: 'Water Lily', color: '#f8e70c' },
  { id: 'all',     label: 'All Three', color: '#d4a0ff' },
];

const EQ_DATA: Record<TabId, { eqs: { lhs: string; rhs: string }[]; facts: { v: string; k: string }[] }> = {
  rossler: {
    eqs: [{ lhs: 'dx/dt', rhs: '= −y − z' }, { lhs: 'dy/dt', rhs: '= x + a·y' }, { lhs: 'dz/dt', rhs: '= b + z·(x−c)' }],
    facts: [{ v: '1976', k: 'Otto Rössler' }, { v: '~2.01', k: 'Lyapunov λ₁' }, { v: '2.01D', k: 'fractal dim' }],
  },
  lorenz: {
    eqs: [{ lhs: 'dx/dt', rhs: '= σ(y−x)' }, { lhs: 'dy/dt', rhs: '= x(ρ−z)−y' }, { lhs: 'dz/dt', rhs: '= xy−β·z' }],
    facts: [{ v: '1963', k: 'Edward Lorenz' }, { v: '0.906', k: 'Lyapunov λ₁' }, { v: '2.06D', k: 'fractal dim' }],
  },
  lily: {
    eqs: [{ lhs: 'φ', rhs: '= (1+√5)/2 golden ratio' }, { lhs: 'θₙ', rhs: '= n·φ·2π fibonacci angle' }, { lhs: 'r(θ)', rhs: '= cos(πθ) petal envelope' }],
    facts: [{ v: '137.5°', k: 'golden angle' }, { v: 'Fib', k: 'spiral count' }, { v: '3D', k: 'dome geometry' }],
  },
  all: {
    eqs: [{ lhs: 'chaos', rhs: 'Rössler 1976' }, { lhs: 'butterfly', rhs: 'Lorenz 1963' }, { lhs: 'phyllotaxis', rhs: 'Fibonacci spiral' }],
    facts: [{ v: 'chaos', k: 'Rössler' }, { v: 'butterfly', k: 'Lorenz' }, { v: 'spiral', k: 'Lily' }],
  },
};

const TripleAttractor3D: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('rossler');
  const webglAvailable = useWebGLAvailable();

  // Slider state
  const [rP, setRP] = useState({ a: 0.2, b: 0.2, c: 5.7, sp: 1 });
  const [lP, setLP] = useState({ s: 10, r: 28, b: 2.667, sp: 1 });
  const [wP, setWP] = useState({ np: 60, spread: 0.4, bloom: 1 });

  const accentColor = TABS.find(t => t.id === activeTab)?.color ?? '#6adfb8';
  const eq = EQ_DATA[activeTab];

  const renderCanvas = useCallback((scene: React.ReactNode) => {
    if (webglAvailable !== true) {
      return (
        <SceneFallback label="3D ATTRACTOR" detail="WebGL is disabled. Enable it to see the interactive 3D attractor visualizations." />
      );
    }
    return (
      <LazyCanvas className="w-full h-full" fallback={<div className="w-full h-full bg-[#030308] animate-pulse" />}>
        <Canvas
          camera={{ position: [0, 1.5, 4.5], fov: 50 }}
          style={{ background: '#030308' }}
          gl={{ antialias: true, alpha: false }}
        >
          {scene}
        </Canvas>
      </LazyCanvas>
    );
  }, [webglAvailable]);

  const renderSliders = () => {
    if (activeTab === 'rossler') {
      return (
        <div style={{ position: 'absolute', right: 12, top: 12, background: 'rgba(3,3,8,.82)', border: `0.5px solid ${accentColor}40`, borderRadius: 10, padding: '14px 16px', minWidth: 155, zIndex: 3, fontSize: 10, backdropFilter: 'blur(8px)' }}>
          {[
            { label: 'a', key: 'a', min: 0.05, max: 0.5, step: 0.01, val: rP.a, fmt: (v: number) => v.toFixed(2) },
            { label: 'b', key: 'b', min: 0.05, max: 0.5, step: 0.01, val: rP.b, fmt: (v: number) => v.toFixed(2) },
            { label: 'c', key: 'c', min: 2, max: 10, step: 0.1, val: rP.c, fmt: (v: number) => v.toFixed(1) },
            { label: 'speed', key: 'sp', min: 0.2, max: 3, step: 0.1, val: rP.sp, fmt: (v: number) => v.toFixed(1) + '×' },
          ].map(s => (
            <div key={s.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: accentColor, letterSpacing: 2, marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>
                <span>{s.label}</span><span style={{ color: '#e8e4d9' }}>{s.fmt(s.val)}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} style={{ width: '100%', accentColor: accentColor }}
                onChange={e => setRP(p => ({ ...p, [s.key]: parseFloat(e.target.value) }))} />
            </div>
          ))}
          <button onClick={() => setRP({ a: 0.2, b: 0.2, c: 5.7, sp: 1 })} style={{ fontSize: 8, letterSpacing: 2, padding: '5px 10px', border: `0.5px solid ${accentColor}55`, borderRadius: 4, background: 'transparent', color: accentColor, cursor: 'pointer', marginTop: 2, fontFamily: "'Space Mono', monospace" }}>↺ reset</button>
        </div>
      );
    }
    if (activeTab === 'lorenz') {
      return (
        <div style={{ position: 'absolute', right: 12, top: 12, background: 'rgba(3,3,8,.82)', border: `0.5px solid ${accentColor}40`, borderRadius: 10, padding: '14px 16px', minWidth: 155, zIndex: 3, fontSize: 10, backdropFilter: 'blur(8px)' }}>
          {[
            { label: 'σ', key: 's', min: 1, max: 20, step: 0.5, val: lP.s, fmt: (v: number) => v.toFixed(1) },
            { label: 'ρ', key: 'r', min: 10, max: 50, step: 0.5, val: lP.r, fmt: (v: number) => v.toFixed(1) },
            { label: 'β', key: 'b', min: 0.5, max: 5, step: 0.05, val: lP.b, fmt: (v: number) => v.toFixed(2) },
            { label: 'speed', key: 'sp', min: 0.2, max: 3, step: 0.1, val: lP.sp, fmt: (v: number) => v.toFixed(1) + '×' },
          ].map(s => (
            <div key={s.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: accentColor, letterSpacing: 2, marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>
                <span>{s.label}</span><span style={{ color: '#e8e4d9' }}>{s.fmt(s.val)}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} style={{ width: '100%', accentColor: accentColor }}
                onChange={e => setLP(p => ({ ...p, [s.key]: parseFloat(e.target.value) }))} />
            </div>
          ))}
          <button onClick={() => setLP({ s: 10, r: 28, b: 2.667, sp: 1 })} style={{ fontSize: 8, letterSpacing: 2, padding: '5px 10px', border: `0.5px solid ${accentColor}55`, borderRadius: 4, background: 'transparent', color: accentColor, cursor: 'pointer', marginTop: 2, fontFamily: "'Space Mono', monospace" }}>↺ reset</button>
        </div>
      );
    }
    if (activeTab === 'lily') {
      return (
        <div style={{ position: 'absolute', right: 12, top: 12, background: 'rgba(3,3,8,.82)', border: `0.5px solid ${accentColor}40`, borderRadius: 10, padding: '14px 16px', minWidth: 155, zIndex: 3, fontSize: 10, backdropFilter: 'blur(8px)' }}>
          {[
            { label: 'petals', key: 'np', min: 12, max: 120, step: 1, val: wP.np, fmt: (v: number) => Math.round(v).toString() },
            { label: 'spread', key: 'spread', min: 0.1, max: 0.8, step: 0.01, val: wP.spread, fmt: (v: number) => v.toFixed(2) },
            { label: 'bloom', key: 'bloom', min: 0.1, max: 2, step: 0.05, val: wP.bloom, fmt: (v: number) => v.toFixed(2) },
          ].map(s => (
            <div key={s.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: accentColor, letterSpacing: 2, marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>
                <span>{s.label}</span><span style={{ color: '#e8e4d9' }}>{s.fmt(s.val)}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} style={{ width: '100%', accentColor: accentColor }}
                onChange={e => setWP(p => ({ ...p, [s.key]: parseFloat(e.target.value) }))} />
            </div>
          ))}
          <button onClick={() => setWP({ np: 60, spread: 0.4, bloom: 1 })} style={{ fontSize: 8, letterSpacing: 2, padding: '5px 10px', border: `0.5px solid ${accentColor}55`, borderRadius: 4, background: 'transparent', color: accentColor, cursor: 'pointer', marginTop: 2, fontFamily: "'Space Mono', monospace" }}>↺ reset</button>
        </div>
      );
    }
    return null;
  };

  const titleInfo: Record<TabId, { sub: string; title: string; highlight: string }> = {
    rossler: { sub: '— strange attractor', title: 'Röss', highlight: 'ler' },
    lorenz: { sub: '— butterfly effect', title: 'Loren', highlight: 'z' },
    lily: { sub: '— fibonacci phyllotaxis', title: 'Water', highlight: ' Lily' },
    all: { sub: '— triple chaos system', title: 'All', highlight: ' Three' },
  };

  const info = titleInfo[activeTab];

  return (
    <div style={{ fontFamily: "'Space Mono', monospace", background: '#030308', color: '#e8e4d9', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: '#030308', position: 'sticky', top: 0, zIndex: 10 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: 3,
              padding: '13px 22px',
              cursor: 'pointer',
              color: activeTab === tab.id ? tab.color : '#444',
              background: 'transparent',
              border: 'none',
              borderBottom: `1.5px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
              transition: '0.2s',
              textTransform: 'uppercase' as const,
              flex: 1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Canvas viewport */}
      <div style={{ position: 'relative', width: '100%', height: 460, background: '#030308', overflow: 'hidden' }}>
        {/* Title overlay */}
        <div style={{ position: 'absolute', top: 16, left: 20, zIndex: 4, pointerEvents: 'none' }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: accentColor, opacity: 0.6, marginBottom: 4 }}>{info.sub}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f0ebe0', lineHeight: 1, letterSpacing: -1 }}>
            {info.title}<span style={{ color: accentColor }}>{info.highlight}</span>
          </div>
        </div>

        {/* Hint overlay */}
        <div style={{ position: 'absolute', bottom: 12, left: 16, zIndex: 4, pointerEvents: 'none', fontSize: 9, letterSpacing: 2, color: '#555', fontFamily: "'Space Mono', monospace" }}>
          DRAG TO ORBIT • SCROLL TO ZOOM • THREE.JS R3F
        </div>

        {/* Slider controls */}
        {renderSliders()}

        {/* 3D Scenes */}
        {activeTab === 'rossler' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderCanvas(<RosslerScene params={rP} />)}
          </div>
        )}
        {activeTab === 'lorenz' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderCanvas(<LorenzScene params={lP} />)}
          </div>
        )}
        {activeTab === 'lily' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderCanvas(<LilyScene params={wP} />)}
          </div>
        )}
        {activeTab === 'all' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '100%', position: 'absolute', inset: 0 }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRight: '0.5px solid rgba(255,255,255,.05)' }}>
              {renderCanvas(<RosslerScene params={rP} />)}
              <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 8, letterSpacing: 3, color: '#6adfb8', opacity: 0.5, pointerEvents: 'none', zIndex: 5 }}>Rössler</div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden', borderRight: '0.5px solid rgba(255,255,255,.05)' }}>
              {renderCanvas(<LorenzScene params={lP} />)}
              <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 8, letterSpacing: 3, color: '#6ab4ff', opacity: 0.5, pointerEvents: 'none', zIndex: 5 }}>Lorenz</div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {renderCanvas(<LilyScene params={wP} />)}
              <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 8, letterSpacing: 3, color: '#f8e70c', opacity: 0.5, pointerEvents: 'none', zIndex: 5 }}>Water Lily</div>
            </div>
          </div>
        )}
      </div>

      {/* Equations row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '14px 18px 0' }}>
        {eq.eqs.map((e, i) => (
          <div key={i} style={{ background: '#08090f', border: '0.5px solid rgba(255,255,255,.06)', borderRadius: 8, padding: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accentColor}66,transparent)` }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, marginBottom: 3 }}>{e.lhs}</div>
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.8 }}>{e.rhs}</div>
          </div>
        ))}
      </div>

      {/* Info strip */}
      <div style={{ display: 'flex', gap: 0, padding: '12px 18px 14px', borderTop: '0.5px solid rgba(255,255,255,.04)', marginTop: 14 }}>
        {eq.facts.map((f, i) => (
          <div key={i} style={{ borderLeft: `1.5px solid ${accentColor}4d`, paddingLeft: 12, marginRight: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: accentColor }}>{f.v}</div>
            <div style={{ fontSize: 10, color: '#444', marginTop: 2, letterSpacing: 0.5 }}>{f.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripleAttractor3D;

"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Payment data for live notification toasts
// ---------------------------------------------------------------------------

const LIVE_PAYMENTS = [
  { amount: 4200, currency: "EUR", method: "Pix", from: "Lisbon, PT", icon: "⚡" },
  { amount: 1299, currency: "USD", method: "Visa", from: "New York, US", icon: "💳" },
  { amount: 8900, currency: "BRL", method: "Pix", from: "São Paulo, BR", icon: "⚡" },
  { amount: 159, currency: "GBP", method: "Apple Pay", from: "London, UK", icon: "🍎" },
  { amount: 0.012, currency: "BTC", method: "Crypto", from: "Singapore, SG", icon: "₿" },
  { amount: 3200, currency: "BRL", method: "Pix", from: "Rio de Janeiro, BR", icon: "⚡" },
  { amount: 540, currency: "EUR", method: "Mastercard", from: "Berlin, DE", icon: "💳" },
  { amount: 0.008, currency: "ETH", method: "Crypto", from: "Tokyo, JP", icon: "⟠" },
];

const TOAST_POSITIONS = [
  { top: "8%", left: "6%" },
  { top: "12%", right: "6%" },
  { bottom: "14%", left: "10%" },
  { top: "6%", right: "28%" },
  { bottom: "10%", right: "8%" },
  { top: "52%", left: "4%" },
  { bottom: "22%", right: "4%" },
  { top: "4%", left: "42%" },
];

// ---------------------------------------------------------------------------
// Globe connection data — cities as [lat, lng]
// ---------------------------------------------------------------------------

interface City {
  lat: number;
  lng: number;
  name: string;
}

const CITIES: City[] = [
  { lat: 40.71, lng: -74.01, name: "New York" },
  { lat: 51.51, lng: -0.13, name: "London" },
  { lat: 35.68, lng: 139.69, name: "Tokyo" },
  { lat: -23.55, lng: -46.63, name: "São Paulo" },
  { lat: 38.72, lng: -9.14, name: "Lisbon" },
  { lat: 1.35, lng: 103.82, name: "Singapore" },
  { lat: 52.52, lng: 13.41, name: "Berlin" },
  { lat: 48.86, lng: 2.35, name: "Paris" },
  { lat: 37.77, lng: -122.42, name: "San Francisco" },
  { lat: -33.87, lng: 151.21, name: "Sydney" },
  { lat: 25.2, lng: 55.27, name: "Dubai" },
  { lat: 22.32, lng: 114.17, name: "Hong Kong" },
  { lat: 19.43, lng: -99.13, name: "Mexico City" },
  { lat: -34.6, lng: -58.38, name: "Buenos Aires" },
  { lat: 55.75, lng: 37.62, name: "Moscow" },
  { lat: 28.61, lng: 77.21, name: "New Delhi" },
  { lat: -1.29, lng: 36.82, name: "Nairobi" },
  { lat: 33.89, lng: 35.5, name: "Beirut" },
  { lat: 59.33, lng: 18.07, name: "Stockholm" },
  { lat: -43.53, lng: 172.63, name: "Christchurch" },
];

// Predefined connections between cities (index pairs)
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [4, 1], [5, 2],
  [6, 1], [7, 4], [0, 8], [9, 5], [10, 5],
  [11, 2], [12, 0], [13, 4], [14, 6], [15, 2],
  [16, 10], [17, 4], [18, 10], [19, 1], [0, 10],
  [3, 13], [8, 11], [7, 0], [5, 16], [10, 1],
];

// Convert lat/lng to 3D position on sphere
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Create a curved arc between two points on the sphere
function createArcGeometry(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments = 64,
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  // Lift the arc higher for longer connections
  mid.normalize().multiplyScalar(2.2 + distance * 0.18);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) {
    points.push(curve.getPoint(i / segments));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  // Add a "progress" attribute for animation
  const drawRange = new Float32Array(segments + 1);
  for (let i = 0; i <= segments; i++) {
    drawRange[i] = i / segments;
  }
  geometry.setAttribute("aProgress", new THREE.BufferAttribute(drawRange, 1));
  return geometry;
}

// ---------------------------------------------------------------------------
// 3D Globe components
// ---------------------------------------------------------------------------

const GLOBE_RADIUS = 1.8;
const CYAN = new THREE.Color("#00e5ff");

const CYAN_GLOW = new THREE.Color("#00ffcc");

function GlobeSphere() {
  const meshRef = React.useRef<THREE.Mesh>(null);

  // Create a wireframe sphere with continent-like dots
  const dotsGeometry = React.useMemo(() => {
    const positions: number[] = [];
    const count = 4000;
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
      // Only keep some points to simulate landmass distribution
      positions.push(x, y, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <group>
      {/* Main wireframe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#0a1628"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Dot field on sphere surface */}
      <points geometry={dotsGeometry}>
        <pointsMaterial
          color="#00a5b8"
          size={0.018}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.97, 32, 32]} />
        <meshBasicMaterial
          color="#001a2e"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

function ConnectionArc({
  from,
  to,
  index,
  total,
}: {
  from: City;
  to: City;
  index: number;
  total: number;
}) {
  const lineRef = React.useRef<THREE.Line>(null);
  const progressRef = React.useRef(Math.random()); // Stagger start

  const geometry = React.useMemo(() => {
    const start = latLngToVec3(from.lat, from.lng, GLOBE_RADIUS);
    const end = latLngToVec3(to.lat, to.lng, GLOBE_RADIUS);
    return createArcGeometry(start, end);
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const elapsed = clock.elapsedTime;

    // Each arc has its own phase offset for variety
    const phase = (elapsed * 0.3 + index * 0.4) % 1;
    const drawCount = Math.floor(phase * 65);
    lineRef.current.geometry.setDrawRange(0, Math.max(1, drawCount));

    // Fade the whole line in/out based on cycle
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    const fadeIn = Math.min(phase * 4, 1);
    const fadeOut = phase > 0.7 ? 1 - (phase - 0.7) / 0.3 : 1;
    mat.opacity = fadeIn * fadeOut * 0.8;
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={CYAN}
        transparent
        opacity={0.6}
        linewidth={1}
      />
    </line>
  );
}

function CityNode({ city, index }: { city: City; index: number }) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const glowRef = React.useRef<THREE.Mesh>(null);
  const position = React.useMemo(
    () => latLngToVec3(city.lat, city.lng, GLOBE_RADIUS),
    [city],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const elapsed = clock.elapsedTime;
    // Pulsing scale
    const pulse = 1 + Math.sin(elapsed * 2.5 + index * 1.3) * 0.4;
    meshRef.current.scale.setScalar(pulse);

    if (glowRef.current) {
      const glowPulse = 1 + Math.sin(elapsed * 2.5 + index * 1.3) * 0.8;
      glowRef.current.scale.setScalar(glowPulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(elapsed * 2.5 + index * 1.3) * 0.1;
    }
  });

  return (
    <group position={position.toArray()}>
      {/* Core dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={CYAN_GLOW} />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function GlobeNetwork({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;

    // Slow auto-rotation + pointer parallax
    const targetY = time * (reducedMotion ? 0 : 0.08) + pointer.x * 0.3;
    const targetX = pointer.y * 0.15;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      3,
      delta,
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      3,
      delta,
    );
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 0.6}
      rotationIntensity={0}
      floatIntensity={reducedMotion ? 0 : 0.15}
      floatingRange={[-0.05, 0.05]}
    >
      <group ref={groupRef}>
        <GlobeSphere />
        {CONNECTIONS.map(([fromIdx, toIdx], i) => (
          <ConnectionArc
            key={`arc-${i}`}
            from={CITIES[fromIdx]}
            to={CITIES[toIdx]}
            index={i}
            total={CONNECTIONS.length}
          />
        ))}
        {CITIES.map((city, i) => (
          <CityNode key={city.name} city={city} index={i} />
        ))}
      </group>
    </Float>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <color attach="background" args={["#020810"]} />
      <fog attach="fog" args={["#020810", 6, 14]} />

      <ambientLight intensity={0.15} />
      <pointLight position={[3, 4, 5]} intensity={15} distance={12} color="#00e5ff" />
      <pointLight position={[-3, -2, 4]} intensity={10} distance={10} color="#0088aa" />

      <GlobeNetwork reducedMotion={reducedMotion} />

      {/* Ambient particle ring */}
      <AmbientParticles />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.6}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Noise opacity={0.018} />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

function AmbientParticles() {
  const ref = React.useRef<THREE.Points>(null);
  const count = 200;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.015;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00a5b8"
        size={0.02}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Payment notification toasts — integrated over the globe
// ---------------------------------------------------------------------------

function PaymentToast() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(
      () => setIdx((i) => (i + 1) % LIVE_PAYMENTS.length),
      2800,
    );
    return () => clearInterval(timer);
  }, []);

  const toasts = [
    LIVE_PAYMENTS[idx],
    LIVE_PAYMENTS[(idx + 3) % LIVE_PAYMENTS.length],
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {toasts.map((p, i) => {
        const pos = TOAST_POSITIONS[(idx + i) % TOAST_POSITIONS.length];
        return (
          <AnimatePresence mode="popLayout" key={`${idx}-${i}`}>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.95, filter: "blur(3px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              style={{
                ...pos,
                maxWidth: i === 0 ? "52%" : "46%",
              }}
            >
              {/* Live pulse indicator */}
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>

              {/* Payment method icon */}
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm">
                {p.icon}
              </span>

              {/* Payment info */}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Pagamento recebido
                </span>
                <span className="truncate text-xs font-bold text-white/90">
                  {formatCurrency(p.amount, p.currency)}{" "}
                  <span className="font-normal text-white/40">· {p.method}</span>
                </span>
              </div>

              {/* Origin */}
              <span className="ml-auto shrink-0 text-[10px] text-white/30">
                {p.from}
              </span>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static fallback for devices without WebGL
// ---------------------------------------------------------------------------

function StaticGlobeFallback() {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[#020810]">
      <div className="absolute size-[50%] rounded-full bg-cyan-500/10 blur-[80px]" />
      <div className="relative size-48 rounded-full border border-cyan-500/20 bg-cyan-950/30">
        <div className="absolute inset-4 rounded-full border border-cyan-400/10" />
        <div className="absolute inset-8 rounded-full border border-cyan-400/5" />
        {/* Simulated arcs */}
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200">
          <path d="M40,60 Q100,10 160,80" fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
          <path d="M30,120 Q100,60 170,100" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1" />
          <path d="M50,140 Q120,80 180,60" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export function AnimatedCubeHero({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [webglAvailable, setWebglAvailable] = React.useState(true);

  React.useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebglAvailable(Boolean(context));
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  return (
    <div
      className={`relative isolate min-h-[420px] overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#020810] shadow-[0_30px_120px_rgba(2,8,16,.7)] ${className}`}
      role="img"
      aria-label="Globo 3D interativo com rotas de pagamento globais em tempo real."
    >
      {/* Ambient grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 46%, rgba(0,229,255,0.08), transparent 40%),
            radial-gradient(circle at 65% 55%, rgba(0,136,170,0.05), transparent 45%),
            linear-gradient(rgba(0,229,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, 42px 42px, 42px 42px",
        }}
      />

      {/* Bottom ambient glow */}
      <div className="pointer-events-none absolute inset-x-[20%] bottom-[5%] h-20 rounded-[50%] bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[35%] bottom-[2%] h-14 rounded-[50%] bg-cyan-400/5 blur-3xl" />

      {webglAvailable ? (
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0.5, 5.5], fov: 38, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          frameloop={reducedMotion ? "demand" : "always"}
          className="relative z-10"
        >
          <Scene reducedMotion={reducedMotion} />
        </Canvas>
      ) : (
        <StaticGlobeFallback />
      )}

      {/* Live payment notification toasts */}
      <PaymentToast />

      {/* Bottom tagline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white/60">
          Global payment network
        </p>
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-cyan-400/50">
          Route · Connect · Scale
        </p>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
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
// Globe data
// ---------------------------------------------------------------------------

interface City { lat: number; lng: number; name: string }

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

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [4, 1], [5, 2],
  [6, 1], [7, 4], [0, 8], [9, 5], [10, 5],
  [11, 2], [12, 0], [13, 4], [14, 6], [15, 2],
  [16, 10], [17, 4], [18, 10], [19, 1], [0, 10],
  [3, 13], [8, 11], [7, 0], [5, 16], [10, 1],
];

// ---------------------------------------------------------------------------
// Simplified continent outlines (lat, lng) — enough points to be recognizable
// ---------------------------------------------------------------------------

const CONTINENTS: [number, number][][] = [
  // North America
  [[70,-165],[72,-130],[70,-100],[65,-88],[55,-60],[47,-53],[44,-65],[43,-70],[40,-74],[30,-82],[25,-80],[25,-97],[20,-105],[30,-118],[38,-123],[48,-124],[55,-133],[58,-152],[60,-165]],
  // South America
  [[12,-72],[10,-67],[7,-60],[5,-52],[0,-50],[-3,-41],[-8,-35],[-15,-39],[-23,-43],[-28,-49],[-33,-53],[-40,-63],[-46,-66],[-52,-70],[-55,-68],[-52,-75],[-42,-73],[-30,-71],[-18,-70],[-5,-80],[2,-78],[8,-77]],
  // Europe
  [[71,28],[70,40],[65,42],[60,30],[55,28],[54,10],[55,0],[51,2],[48,-5],[44,-9],[37,-9],[36,-6],[38,0],[40,4],[43,6],[44,12],[46,14],[48,17],[52,14],[54,10],[56,12],[58,18],[60,25],[64,20],[68,16]],
  // Africa
  [[37,-1],[35,10],[32,12],[30,32],[22,37],[12,44],[5,42],[0,42],[-5,40],[-12,40],[-20,35],[-26,33],[-34,18],[-34,26],[-28,32],[-15,40],[-5,12],[4,1],[5,-5],[15,-17],[20,-17],[25,-15],[30,-10],[35,-2]],
  // Asia
  [[72,180],[70,140],[65,135],[60,163],[55,163],[50,143],[45,143],[43,132],[38,128],[35,129],[32,122],[22,114],[22,108],[10,106],[1,104],[6,98],[8,77],[25,68],[25,57],[12,45],[30,35],[35,36],[42,44],[42,52],[37,55],[25,57]],
  // Australia
  [[-12,131],[-15,141],[-18,146],[-24,152],[-28,153],[-33,152],[-37,150],[-39,146],[-35,137],[-32,133],[-28,114],[-22,114],[-15,129]],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const R = 1.8; // globe radius
const CYAN = new THREE.Color("#00e5ff");
const CYAN_GLOW = new THREE.Color("#00ffcc");
const LAND_COLOR = new THREE.Color("#0ef0c8");

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createArcCurve(start: THREE.Vector3, end: THREE.Vector3) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.normalize().multiplyScalar(R + 0.35 + dist * 0.16);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

// ---------------------------------------------------------------------------
// Starfield background
// ---------------------------------------------------------------------------

function Starfield() {
  const count = 1200;
  const geo = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 15 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.3 + Math.random() * 1.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, []);

  useFrame(({ clock }) => {
    // Very slow rotation for parallax feel
  });

  return (
    <points geometry={geo}>
      <pointsMaterial
        color="#aaccff"
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Realistic Globe
// ---------------------------------------------------------------------------

function GlobeBody() {
  // Continent outlines as point cloud
  const continentGeo = React.useMemo(() => {
    const positions: number[] = [];
    for (const continent of CONTINENTS) {
      for (let j = 0; j < continent.length; j++) {
        const [lat, lng] = continent[j];
        const [lat2, lng2] = continent[(j + 1) % continent.length];
        // Interpolate between vertices for density
        const steps = 4;
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const latI = lat + (lat2 - lat) * t;
          const lngI = lng + (lng2 - lng) * t;
          const v = latLngToVec3(latI, lngI, R + 0.003);
          positions.push(v.x, v.y, v.z);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  // Latitude/longitude grid
  const gridGeo = React.useMemo(() => {
    const positions: number[] = [];
    // Latitude lines every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = -180; lng < 180; lng += 3) {
        const a = latLngToVec3(lat, lng, R + 0.002);
        const b = latLngToVec3(lat, lng + 3, R + 0.002);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    // Longitude lines every 30°
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -90; lat < 90; lat += 3) {
        const a = latLngToVec3(lat, lng, R + 0.002);
        const b = latLngToVec3(lat + 3, lng, R + 0.002);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <group>
      {/* Ocean sphere — deep dark blue with subtle shading */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial
          color="#030d1a"
          emissive="#001428"
          emissiveIntensity={0.3}
          shininess={25}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Lat/lng grid lines */}
      <lineSegments geometry={gridGeo}>
        <lineBasicMaterial color="#0a3d5c" transparent opacity={0.18} />
      </lineSegments>

      {/* Continent outlines — bright points tracing landmasses */}
      <points geometry={continentGeo}>
        <pointsMaterial
          color={LAND_COLOR}
          size={0.025}
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* Subtle inner glow to give depth */}
      <mesh>
        <sphereGeometry args={[R * 0.995, 32, 32]} />
        <meshBasicMaterial color="#001020" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Atmosphere glow (fresnel edge effect)
// ---------------------------------------------------------------------------

function Atmosphere() {
  const meshRef = React.useRef<THREE.Mesh>(null);

  const material = React.useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * intensity * 0.55;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[R * 1.14, 64, 64]} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Connection arcs with traveling particles
// ---------------------------------------------------------------------------

function ConnectionArc({ from, to, index }: { from: City; to: City; index: number }) {
  const lineRef = React.useRef<THREE.Line>(null);
  const particleRef = React.useRef<THREE.Mesh>(null);

  const curve = React.useMemo(() => {
    const start = latLngToVec3(from.lat, from.lng, R);
    const end = latLngToVec3(to.lat, to.lng, R);
    return createArcCurve(start, end);
  }, [from, to]);

  const points = React.useMemo(() => curve.getPoints(80), [curve]);
  const geo = React.useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const speed = 0.18 + (index % 5) * 0.04;
    const phase = (elapsed * speed + index * 0.37) % 1;

    // Animate the line draw range — trail effect
    if (lineRef.current) {
      const totalPts = 81;
      const trailLen = 30;
      const head = Math.floor(phase * totalPts);
      const tail = Math.max(0, head - trailLen);
      lineRef.current.geometry.setDrawRange(tail, head - tail);

      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.45 + Math.sin(elapsed * 1.5 + index) * 0.15;
    }

    // Traveling particle at the head of the arc
    if (particleRef.current) {
      const pos = curve.getPoint(phase);
      particleRef.current.position.copy(pos);
      const scale = 0.6 + Math.sin(elapsed * 4 + index * 2) * 0.3;
      particleRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={geo}>
        <lineBasicMaterial color={CYAN} transparent opacity={0.5} />
      </line>
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.022, 6, 6]} />
        <meshBasicMaterial color={CYAN_GLOW} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// City node with pulse ring
// ---------------------------------------------------------------------------

function CityNode({ city, index }: { city: City; index: number }) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const ringRef = React.useRef<THREE.Mesh>(null);
  const pos = React.useMemo(() => latLngToVec3(city.lat, city.lng, R + 0.01), [city]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      const pulse = 1 + Math.sin(t * 2 + index * 1.7) * 0.35;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      const ringPulse = 1 + Math.sin(t * 2 + index * 1.7) * 0.6;
      ringRef.current.scale.setScalar(ringPulse);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 2 + index * 1.7) * 0.08;
    }
  });

  return (
    <group position={pos.toArray()}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={CYAN_GLOW} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.065, 24]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Globe group with rotation
// ---------------------------------------------------------------------------

function GlobeNetwork({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const targetY = t * (reducedMotion ? 0 : 0.06) + pointer.x * 0.25;
    const targetX = (23.5 * Math.PI / 180) + pointer.y * 0.12; // real axial tilt

    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetY, 2.5, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetX, 2.5, delta);
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 0.4}
      rotationIntensity={0}
      floatIntensity={reducedMotion ? 0 : 0.1}
      floatingRange={[-0.04, 0.04]}
    >
      <group ref={groupRef}>
        <GlobeBody />
        <Atmosphere />
        {CONNECTIONS.map(([fi, ti], i) => (
          <ConnectionArc key={`arc-${i}`} from={CITIES[fi]} to={CITIES[ti]} index={i} />
        ))}
        {CITIES.map((city, i) => (
          <CityNode key={city.name} city={city} index={i} />
        ))}
      </group>
    </Float>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <color attach="background" args={["#020810"]} />

      <Starfield />

      {/* Directional sunlight from upper-right */}
      <directionalLight position={[5, 3, 4]} intensity={1.8} color="#c8e8ff" />
      <ambientLight intensity={0.08} />
      {/* Cyan accent fill from below-left */}
      <pointLight position={[-4, -3, 2]} intensity={8} distance={12} color="#006688" />
      {/* Subtle warm rim from behind */}
      <pointLight position={[0, 2, -6]} intensity={5} distance={10} color="#00aacc" />

      <GlobeNetwork reducedMotion={reducedMotion} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={1.3} luminanceThreshold={0.08} luminanceSmoothing={0.95} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.82} />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Payment notification toasts
// ---------------------------------------------------------------------------

function PaymentToast() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % LIVE_PAYMENTS.length), 2800);
    return () => clearInterval(timer);
  }, []);

  const toasts = [LIVE_PAYMENTS[idx], LIVE_PAYMENTS[(idx + 3) % LIVE_PAYMENTS.length]];

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
              style={{ ...pos, maxWidth: i === 0 ? "52%" : "46%" }}
            >
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm">{p.icon}</span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[10px] font-medium uppercase tracking-wider text-white/50">Pagamento recebido</span>
                <span className="truncate text-xs font-bold text-white/90">{formatCurrency(p.amount, p.currency)} <span className="font-normal text-white/40">· {p.method}</span></span>
              </div>
              <span className="ml-auto shrink-0 text-[10px] text-white/30">{p.from}</span>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static fallback
// ---------------------------------------------------------------------------

function StaticGlobeFallback() {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[#020810]">
      <div className="absolute size-[50%] rounded-full bg-cyan-500/10 blur-[80px]" />
      <div className="relative size-48 rounded-full border border-cyan-500/20 bg-cyan-950/30">
        <div className="absolute inset-4 rounded-full border border-cyan-400/10" />
        <div className="absolute inset-8 rounded-full border border-cyan-400/5" />
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
// Main export
// ---------------------------------------------------------------------------

export function AnimatedCubeHero({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [webglAvailable, setWebglAvailable] = React.useState(true);

  React.useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebglAvailable(Boolean(c.getContext("webgl2") || c.getContext("webgl")));
    } catch { setWebglAvailable(false); }
  }, []);

  return (
    <div
      className={`relative isolate min-h-[420px] overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#020810] shadow-[0_30px_120px_rgba(2,8,16,.7)] ${className}`}
      role="img"
      aria-label="Globo 3D interativo com rotas de pagamento globais em tempo real."
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 46%, rgba(0,229,255,0.06), transparent 40%),
            radial-gradient(circle at 65% 55%, rgba(0,136,170,0.03), transparent 45%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-x-[20%] bottom-[5%] h-20 rounded-[50%] bg-cyan-500/8 blur-3xl" />

      {webglAvailable ? (
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0.8, 5.2], fov: 36, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          frameloop={reducedMotion ? "demand" : "always"}
          className="relative z-10"
        >
          <Scene reducedMotion={reducedMotion} />
        </Canvas>
      ) : (
        <StaticGlobeFallback />
      )}

      <PaymentToast />

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white/60">Global payment network</p>
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-cyan-400/50">Route · Connect · Scale</p>
      </div>
    </div>
  );
}

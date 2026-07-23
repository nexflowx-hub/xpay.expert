"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Float } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Color palette — matched to Maquete_CuboMagico.png reference
// ---------------------------------------------------------------------------

const CUBE_SIZE = 4;
const CUBELET_SIZE = 0.62;
const CUBELET_GAP = 0.12;
const SPACING = CUBELET_SIZE + CUBELET_GAP;

// Reference-matched: vibrant violet core, electric blue mid, cyan accent
const violet = new THREE.Color("#D06FFF");
const electricBlue = new THREE.Color("#5599FF");
const cyan = new THREE.Color("#22d3ee");

// Deep navy base — reference shadow areas
const BASE_COLOR = "#0A0E17";
// Dark violet-tinted background — reference atmosphere
const BG_COLOR = "#050208";

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

// Positions for toasts around the cube (percentage-based)
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
// 3D Cube helpers
// ---------------------------------------------------------------------------

function smoothstep(value: number) {
  const x = THREE.MathUtils.clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function assemblyEnvelope(time: number) {
  const phase = (time % 14) / 14;

  if (phase < 0.36) return 0;
  if (phase < 0.54) return smoothstep((phase - 0.36) / 0.18);
  if (phase < 0.66) return 1;
  if (phase < 0.86) return 1 - smoothstep((phase - 0.66) / 0.2);
  return 0;
}

function cubeletColor(x: number, y: number, z: number) {
  const normalized = (x + y + z + CUBE_SIZE * 1.5) / (CUBE_SIZE * 3);
  // More cyan at the top-right, more violet at bottom-left, electric blue in between
  if (normalized > 0.7) return cyan;
  if (normalized > 0.45) return electricBlue;
  return violet;
}

function Cubelet({
  position,
  index,
}: {
  position: [number, number, number];
  index: number;
}) {
  const mesh = React.useRef<THREE.Mesh>(null);
  const base = React.useMemo(() => new THREE.Vector3(...position), [position]);
  const direction = React.useMemo(() => {
    const vector = base.clone();
    if (vector.lengthSq() < 0.001) vector.set(0.5, 0.5, 0.5);
    return vector.normalize();
  }, [base]);
  const accent = React.useMemo(
    () => cubeletColor(position[0], position[1], position[2]).clone(),
    [position],
  );
  const targetRef = React.useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    if (!mesh.current) return;

    const elapsed = clock.elapsedTime;
    const explode = assemblyEnvelope(elapsed + index * 0.022);
    const wave = Math.sin(elapsed * 1.45 + index * 0.73);
    const drift = Math.sin(elapsed * 0.82 + index * 1.91) * 0.035;

    const target = targetRef.current;

    target
      .copy(base)
      .multiplyScalar(1 + explode * 0.28)
      .addScaledVector(direction, explode * (0.28 + Math.abs(wave) * 0.18));

    target.x += direction.y * drift * explode;
    target.y += direction.z * drift * explode;
    target.z += direction.x * drift * explode;

    mesh.current.position.lerp(target, 1 - Math.exp(-delta * 7.5));
    mesh.current.rotation.x = explode * wave * 0.16;
    mesh.current.rotation.y = explode * Math.cos(elapsed + index) * 0.16;
    mesh.current.rotation.z = explode * Math.sin(elapsed * 0.7 + index) * 0.12;

    const material = mesh.current.material as THREE.MeshPhysicalMaterial;
    // Pulsing emissive intensity — "scanning node" effect from reference
    material.emissiveIntensity =
      0.35 + Math.max(0, Math.sin(elapsed * 2.3 + index * 0.47)) * 1.4 + explode * 0.6;
  });

  return (
    <mesh ref={mesh} position={position} castShadow receiveShadow>
      <boxGeometry args={[CUBELET_SIZE, CUBELET_SIZE, CUBELET_SIZE, 2, 2, 2]} />
      <meshPhysicalMaterial
        color={BASE_COLOR}
        emissive={accent}
        emissiveIntensity={0.55}
        metalness={0.96}
        roughness={0.15}
        clearcoat={1}
        clearcoatRoughness={0.08}
        envMapIntensity={2.0}
      />
      <Edges threshold={15} color={accent} scale={1.004} />
    </mesh>
  );
}

function ModularCube({ reducedMotion }: { reducedMotion: boolean }) {
  const group = React.useRef<THREE.Group>(null);
  const cubelets = React.useMemo(() => {
    const values: Array<{ position: [number, number, number]; index: number }> = [];
    const offset = ((CUBE_SIZE - 1) * SPACING) / 2;
    let index = 0;

    for (let x = 0; x < CUBE_SIZE; x += 1) {
      for (let y = 0; y < CUBE_SIZE; y += 1) {
        for (let z = 0; z < CUBE_SIZE; z += 1) {
          values.push({
            index,
            position: [x * SPACING - offset, y * SPACING - offset, z * SPACING - offset],
          });
          index += 1;
        }
      }
    }

    return values;
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!group.current) return;

    const time = clock.elapsedTime;
    const targetX = 0.48 + pointer.y * 0.1;
    const targetY = -0.58 + time * (reducedMotion ? 0 : 0.075) + pointer.x * 0.16;
    const targetZ = 0.08 + Math.sin(time * 0.35) * (reducedMotion ? 0 : 0.035);

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.2, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4.5, delta);
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.25}
      rotationIntensity={reducedMotion ? 0 : 0.12}
      floatIntensity={reducedMotion ? 0 : 0.42}
      floatingRange={[-0.12, 0.12]}
    >
      <group ref={group} rotation={[0.48, -0.58, 0.08]}>
        {cubelets.map((cubelet) => (
          <Cubelet key={cubelet.index} {...cubelet} />
        ))}
      </group>
    </Float>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <fog attach="fog" args={[BG_COLOR, 9, 18]} />

      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 7, 5]} intensity={2.8} color="#c8d8f8" />
      {/* Reference-matched point lights: violet primary, electric blue secondary */}
      <pointLight position={[-4, 1, 4]} intensity={38} distance={12} color="#B84EFF" />
      <pointLight position={[4, -1, 3]} intensity={34} distance={11} color="#5599FF" />
      <pointLight position={[0, 4, -3]} intensity={22} distance={10} color="#22d3ee" />
      {/* Extra fill from below for the "energy glow from within" look */}
      <pointLight position={[0, -3, 0]} intensity={12} distance={8} color="#D06FFF" />

      <ModularCube reducedMotion={reducedMotion} />

      {/* Subtle ground reflection disc */}
      <mesh position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 64]} />
        <meshBasicMaterial color="#1a0a2e" transparent opacity={0.12} />
      </mesh>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.15} darkness={0.92} />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Payment notification toasts — integrated over the cube
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

  // Show 2 toasts simultaneously for richer feel
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

function StaticCubeFallback() {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[#050208]">
      <div className="absolute size-[62%] rounded-full bg-[#D06FFF]/15 blur-[90px]" />
      <div className="grid size-52 rotate-[28deg] grid-cols-4 gap-1.5 [transform:rotateX(58deg)_rotateZ(38deg)] sm:size-64">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="rounded-sm border border-[#5599FF]/50 bg-gradient-to-br from-[#1a0a2e] via-[#0A0E17] to-[#0a1628] shadow-[0_0_20px_rgba(208,111,255,.22)]"
          />
        ))}
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
      className={`relative isolate min-h-[420px] overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#050208] shadow-[0_30px_120px_rgba(10,14,23,.7)] ${className}`}
      role="img"
      aria-label="Cubo modular 3D em rotação com notificações de pagamento ao vivo."
    >
      {/* Subtle grid overlay — reference-matched dark violet tint */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 46%, rgba(208,111,255,0.15), transparent 34%),
            radial-gradient(circle at 60% 55%, rgba(85,153,255,0.08), transparent 40%),
            linear-gradient(rgba(85,153,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(85,153,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, 42px 42px, 42px 42px",
        }}
      />

      {/* Bottom ambient glow — electric blue to violet */}
      <div className="pointer-events-none absolute inset-x-[15%] bottom-[5%] h-20 rounded-[50%] bg-[#5599FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[30%] bottom-[2%] h-14 rounded-[50%] bg-[#D06FFF]/10 blur-3xl" />

      {webglAvailable ? (
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [6.2, 5.1, 8.2], fov: 32, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          shadows
          frameloop={reducedMotion ? "demand" : "always"}
          className="relative z-10"
        >
          <Scene reducedMotion={reducedMotion} />
        </Canvas>
      ) : (
        <StaticCubeFallback />
      )}

      {/* Live payment notification toasts — overlaid on the cube */}
      <PaymentToast />

      {/* Bottom tagline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white/60">
          Modular orchestration engine
        </p>
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-[#5599FF]/50">
          Route · Connect · Scale
        </p>
      </div>
    </div>
  );
}

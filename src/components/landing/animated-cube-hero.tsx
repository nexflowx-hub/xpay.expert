"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Float } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

const CUBE_SIZE = 4;
const CUBELET_SIZE = 0.62;
const CUBELET_GAP = 0.12;
const SPACING = CUBELET_SIZE + CUBELET_GAP;

const violet = new THREE.Color("#8b5cf6");
const blue = new THREE.Color("#2563eb");
const cyan = new THREE.Color("#22d3ee");

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
  if (normalized > 0.64) return cyan;
  if (normalized > 0.34) return blue;
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
    material.emissiveIntensity =
      0.28 + Math.max(0, Math.sin(elapsed * 2.3 + index * 0.47)) * 1.1 + explode * 0.45;
  });

  return (
    <mesh ref={mesh} position={position} castShadow receiveShadow>
      <boxGeometry args={[CUBELET_SIZE, CUBELET_SIZE, CUBELET_SIZE, 2, 2, 2]} />
      <meshPhysicalMaterial
        color="#07101f"
        emissive={accent}
        emissiveIntensity={0.45}
        metalness={0.94}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.14}
        envMapIntensity={1.5}
      />
      <Edges threshold={18} color={accent} scale={1.003} />
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
      <color attach="background" args={["#02040a"]} />
      <fog attach="fog" args={["#02040a", 9, 18]} />

      <ambientLight intensity={0.22} />
      <directionalLight position={[4, 7, 5]} intensity={2.4} color="#dbeafe" />
      <pointLight position={[-4, 1, 4]} intensity={32} distance={11} color="#7c3aed" />
      <pointLight position={[4, -1, 3]} intensity={28} distance={10} color="#2563eb" />
      <pointLight position={[0, 4, -3]} intensity={18} distance={9} color="#22d3ee" />

      <ModularCube reducedMotion={reducedMotion} />

      <mesh position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 64]} />
        <meshBasicMaterial color="#172554" transparent opacity={0.08} />
      </mesh>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.45}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.72}
          mipmapBlur
        />
        <Noise opacity={0.025} />
        <Vignette eskil={false} offset={0.18} darkness={0.88} />
      </EffectComposer>
    </>
  );
}

function StaticCubeFallback() {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[#02040a]">
      <div className="absolute size-[62%] rounded-full bg-violet-600/20 blur-[90px]" />
      <div className="grid size-52 rotate-[28deg] grid-cols-4 gap-1.5 [transform:rotateX(58deg)_rotateZ(38deg)] sm:size-64">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="rounded-sm border border-blue-400/55 bg-gradient-to-br from-violet-950 via-slate-950 to-blue-950 shadow-[0_0_18px_rgba(59,130,246,.28)]"
          />
        ))}
      </div>
    </div>
  );
}

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
      className={`relative isolate min-h-[420px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#02040a] shadow-[0_30px_120px_rgba(15,23,42,.52)] ${className}`}
      role="img"
      aria-label="Cubo modular 3D em rotação, com blocos que se desacoplam e voltam a formar a estrutura."
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(79,70,229,.2),transparent_34%),linear-gradient(rgba(37,99,235,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.035)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]" />
      <div className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-16 rounded-[50%] bg-blue-500/20 blur-3xl" />

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

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white/70">
          Modular orchestration engine
        </p>
        <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-blue-300/55">
          Route · Connect · Scale
        </p>
      </div>
    </div>
  );
}

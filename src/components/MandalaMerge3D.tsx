"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { MotionValue } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type ProgressRef = { current: number };

const RING_PETAL_COUNT = 16;
const MERGE_DURATION_S = 3.2;
const KINDLE_RAMP_S = 1.6;
// Shared with RSVPForm: the localStorage key + window event name fired
// on a successful "attending = yes" submission. Keep these strings in
// sync — if they drift, the diyas never kindle.
const PRESENCE_STORAGE_KEY = "fa-presence-lit";
const PRESENCE_EVENT = "fa-presence-lit";

type RingProps = {
  side: "left" | "right";
  color: string;
  emissive: string;
  progressRef: ProgressRef;
};

function MandalaRing({ side, color, emissive, progressRef }: RingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dir = side === "left" ? -1 : 1;

  const petals = useMemo(
    () =>
      Array.from({ length: RING_PETAL_COUNT }).map((_, i) => {
        const angle = (i / RING_PETAL_COUNT) * Math.PI * 2;
        const r = 1.18;
        return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, angle };
      }),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const progress = progressRef.current;
    groupRef.current.position.x = dir * 1.25 * (1 - progress);
    groupRef.current.rotation.z = dir * t * 0.16;
    const breath = 1 + Math.sin(t * 1.3) * 0.025;
    groupRef.current.scale.setScalar(breath);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <torusGeometry args={[1.1, 0.014, 8, 96]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[0.85, 0.006, 6, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      {petals.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]} rotation={[0, 0, p.angle]}>
          <boxGeometry args={[0.16, 0.014, 0.014]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CenterBindu({ progressRef }: { progressRef: ProgressRef }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const progress = progressRef.current;
    if (coreRef.current) {
      const breath = 1 + Math.sin(t * 2) * 0.08;
      coreRef.current.scale.setScalar(breath * progress);
    }
    if (haloRef.current) {
      const breath = 1 + Math.sin(t * 0.8) * 0.12;
      haloRef.current.scale.setScalar(breath * progress);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.18 * progress;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color="#FFE9A8"
          emissive="#F4C430"
          emissiveIntensity={3.2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial
          color="#F4C430"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Animator({
  inView,
  progressRef,
}: {
  inView: boolean;
  progressRef: ProgressRef;
}) {
  const startedRef = useRef(false);
  const startTimeRef = useRef(0);

  useFrame((state) => {
    if (inView && !startedRef.current) {
      startedRef.current = true;
      startTimeRef.current = state.clock.elapsedTime;
    }
    if (startedRef.current) {
      const elapsed = state.clock.elapsedTime - startTimeRef.current;
      const p = Math.min(1, elapsed / MERGE_DURATION_S);
      progressRef.current = 1 - Math.pow(1 - p, 3);
    }
  });

  return null;
}

type DiyaProps = {
  position: [number, number, number];
  flameRef: ProgressRef;
  delay: number;
};

function Diya({ position, flameRef, delay }: DiyaProps) {
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const haloMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const raw = flameRef.current - delay;
    const intensity = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    if (flameMeshRef.current) {
      const flicker =
        1 + Math.sin(t * 8) * 0.06 + Math.sin(t * 17 + delay * 3) * 0.04;
      flameMeshRef.current.scale.set(
        intensity * flicker * 0.6,
        intensity * flicker,
        intensity * flicker * 0.6
      );
      const flameMat = flameMeshRef.current
        .material as THREE.MeshStandardMaterial;
      flameMat.emissiveIntensity = 2.6 * intensity;
    }
    if (haloMeshRef.current) {
      const haloMat = haloMeshRef.current.material as THREE.MeshBasicMaterial;
      haloMat.opacity = 0.22 * intensity;
      haloMeshRef.current.scale.setScalar(0.6 + intensity * 0.55);
    }
  });

  return (
    <group position={position}>
      {/* Clay bowl — slightly tapered, low-poly */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.1, 0.07, 10]} />
        <meshStandardMaterial color="#3A1F12" roughness={0.95} flatShading />
      </mesh>
      {/* Bowl rim highlight */}
      <mesh position={[0, 0.035, 0]}>
        <torusGeometry args={[0.155, 0.01, 6, 24]} />
        <meshStandardMaterial color="#5C3622" roughness={0.8} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameMeshRef} position={[0, 0.13, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color="#FFE9A8"
          emissive="#FFA94D"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>
      {/* Soft halo */}
      <mesh ref={haloMeshRef} position={[0, 0.13, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial
          color="#F4C430"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Kindler({
  flameRef,
  lit,
}: {
  flameRef: ProgressRef;
  lit: boolean;
}) {
  const startTimeRef = useRef<number | null>(null);

  useFrame((state) => {
    if (!lit) return;
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    // Ramp 0 → 1.6 so the second diya (delay 0.6) can also reach full.
    const target = Math.min(1.6, (elapsed / KINDLE_RAMP_S) * 1.6);
    if (target > flameRef.current) flameRef.current = target;
  });

  return null;
}

type MandalaMerge3DProps = {
  size?: number;
  /**
   * Optional scroll-driven progress (0..1). When provided, the merge is
   * scrubbable — guests control the fusion as they scroll. When omitted,
   * falls back to a one-shot ease-out timeline triggered on viewport entry.
   */
  scrollProgress?: MotionValue<number>;
};

export function MandalaMerge3D({ size = 280, scrollProgress }: MandalaMerge3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const flameRef = useRef(0);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lit, setLit] = useState(false);
  const isScrollDriven = !!scrollProgress;

  // Presence: read prior kindling from localStorage on mount, and listen
  // for the RSVPForm's success event so the diyas light in real time.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(PRESENCE_STORAGE_KEY) === "1") {
        flameRef.current = 1.6; // full ramp on reload — no animation needed
        setLit(true);
      }
    } catch {
      // localStorage may throw in private mode; fall through silently
    }
    const handler = () => {
      try {
        window.localStorage.setItem(PRESENCE_STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setLit(true);
    };
    window.addEventListener(PRESENCE_EVENT, handler);
    return () => window.removeEventListener(PRESENCE_EVENT, handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isScrollDriven) return;
    if (!wrapperRef.current) return;
    const node = wrapperRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.25 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [isScrollDriven]);

  useEffect(() => {
    if (!scrollProgress) return;
    const unsubscribe = scrollProgress.on("change", (v) => {
      progressRef.current = v < 0 ? 0 : v > 1 ? 1 : v;
    });
    return unsubscribe;
  }, [scrollProgress]);

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        style={{ width: size, height: size }}
        className="relative text-gold"
        aria-hidden
      >
        <svg
          viewBox="-1.5 -1.5 3 3"
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.03"
        >
          <circle cx="0" cy="0" r="1.1" opacity="0.85" />
          <circle cx="0" cy="0" r="0.85" opacity="0.6" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={Math.cos(a) * 1.02}
                y1={Math.sin(a) * 1.02}
                x2={Math.cos(a) * 1.18}
                y2={Math.sin(a) * 1.18}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.13" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{ width: size, height: size }}
      className="relative"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <pointLight position={[0, 0, 2.5]} intensity={1.0} color="#F4C430" />
          {!isScrollDriven && (
            <Animator inView={inView} progressRef={progressRef} />
          )}
          <Kindler flameRef={flameRef} lit={lit} />
          <MandalaRing
            side="left"
            color="#D4A84B"
            emissive="#D4A84B"
            progressRef={progressRef}
          />
          <MandalaRing
            side="right"
            color="#E85A2F"
            emissive="#E85A2F"
            progressRef={progressRef}
          />
          <CenterBindu progressRef={progressRef} />
          <Diya position={[-0.7, -1.45, 0]} flameRef={flameRef} delay={0} />
          <Diya position={[0.7, -1.45, 0]} flameRef={flameRef} delay={0.6} />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.45}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}

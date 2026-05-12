"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import type { Product, ProductViewerConfig } from "@/lib/site-data";

function RubberMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} metalness={0.08} roughness={0.9} />;
}

function MetalMaterial() {
  return <meshStandardMaterial color="#d7dce3" metalness={0.78} roughness={0.22} />;
}

function SealProfileModel({ config }: { config: ProductViewerConfig }) {
  const geometryArgs = useMemo<[THREE.Shape, THREE.ExtrudeGeometryOptions]>(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-1.5, -0.7);
    shape.lineTo(1.35, -0.7);
    shape.lineTo(1.35, -0.2);
    shape.lineTo(0.35, -0.2);
    shape.lineTo(0.35, 0.75);
    shape.lineTo(-0.65, 0.75);
    shape.lineTo(-0.65, 0.08);
    shape.lineTo(-1.5, 0.08);
    shape.closePath();

    return [shape, { depth: 3, bevelEnabled: false, steps: 1 }];
  }, []);

  return (
    <group rotation={[0.35, -0.55, 0.1]}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={geometryArgs} />
        <RubberMaterial color={config.surfaceColor} />
      </mesh>
      <mesh position={[0.25, 0.05, 3.02]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.08]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

function ORingModel({ config }: { config: ProductViewerConfig }) {
  return (
    <group rotation={[0.85, 0.55, 0.2]}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.65, 0.5, 48, 180]} />
        <RubberMaterial color={config.surfaceColor} />
      </mesh>
      <mesh scale={1.03}>
        <torusGeometry args={[1.65, 0.08, 24, 120]} />
        <meshStandardMaterial color={config.accentColor} metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

function ExpansionJointModel({ config }: { config: ProductViewerConfig }) {
  return (
    <group rotation={[0.5, -0.45, 0.08]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 3.4, 64]} />
        <RubberMaterial color={config.surfaceColor} />
      </mesh>

      {[-1.15, 0, 1.15].map((offset) => (
        <mesh key={offset} position={[0, 0, offset]} castShadow>
          <torusGeometry args={[0.95, 0.14, 28, 96]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.48} metalness={0.18} />
        </mesh>
      ))}

      {[-1.95, 1.95].map((offset) => (
        <mesh key={offset} position={[0, 0, offset]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.3, 0.36, 64]} />
          <MetalMaterial />
        </mesh>
      ))}
    </group>
  );
}

function SheetRollModel({ config }: { config: ProductViewerConfig }) {
  return (
    <group rotation={[0.34, -0.52, -0.08]}>
      <mesh position={[-0.7, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.72, 1.45, 64]} />
        <RubberMaterial color={config.surfaceColor} />
      </mesh>
      <mesh position={[0.85, 0.03, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.08, 1.8]} />
        <meshStandardMaterial color={config.accentColor} metalness={0.08} roughness={0.82} />
      </mesh>
      <mesh position={[0.35, 0.08, 0.02]} rotation={[0, 0, -0.14]}>
        <boxGeometry args={[1.7, 0.04, 1.55]} />
        <meshStandardMaterial color="#efe2b8" roughness={0.74} metalness={0.03} />
      </mesh>
    </group>
  );
}

function MountModel({ config }: { config: ProductViewerConfig }) {
  return (
    <group rotation={[0.48, -0.4, 0.05]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1.7, 64]} />
        <RubberMaterial color={config.surfaceColor} />
      </mesh>

      {[-0.95, 0.95].map((offset) => (
        <mesh key={offset} position={[0, 0, offset]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.18, 48]} />
          <MetalMaterial />
        </mesh>
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 2.65, 32]} />
        <MetalMaterial />
      </mesh>

      <mesh position={[0, 0.78, 0.2]} castShadow>
        <boxGeometry args={[1.1, 0.14, 0.14]} />
        <meshStandardMaterial color={config.accentColor} metalness={0.18} roughness={0.45} />
      </mesh>
    </group>
  );
}

function GasketStripModel({ config }: { config: ProductViewerConfig }) {
  const geometryArgs = useMemo<[THREE.Shape, THREE.ExtrudeGeometryOptions]>(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-1.6, -0.55);
    shape.lineTo(1.45, -0.55);
    shape.lineTo(1.45, -0.18);
    shape.lineTo(0.55, -0.18);
    shape.lineTo(0.55, 0.62);
    shape.lineTo(-0.15, 0.62);
    shape.lineTo(-0.15, 0.12);
    shape.lineTo(-1.6, 0.12);
    shape.closePath();

    return [shape, { depth: 2.8, bevelEnabled: false, steps: 1 }];
  }, []);

  return (
    <group rotation={[0.42, -0.58, 0.06]}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={geometryArgs} />
        <RubberMaterial color={config.surfaceColor} />
      </mesh>
      <mesh position={[0.2, 0.2, 2.82]}>
        <boxGeometry args={[0.85, 0.08, 0.08]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.36} metalness={0.15} />
      </mesh>
    </group>
  );
}

function SceneModel({ config }: { config: ProductViewerConfig }) {
  switch (config.preset) {
    case "seal-profile":
      return <SealProfileModel config={config} />;
    case "o-ring":
      return <ORingModel config={config} />;
    case "expansion-joint":
      return <ExpansionJointModel config={config} />;
    case "sheet-roll":
      return <SheetRollModel config={config} />;
    case "mount":
      return <MountModel config={config} />;
    case "gasket-strip":
      return <GasketStripModel config={config} />;
    default:
      return null;
  }
}

export function ProductViewer({ product }: { product: Product }) {
  // Theme-aware viewer surface. We only flip to the dark palette AFTER
  // hydration to keep the SSR HTML and the first client render byte-for-
  // byte identical (next-themes returns `undefined` on the server, then
  // resolves on mount — without the gate the wrapper className would
  // mismatch and React would log a hydration warning).
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  const wrapperBg = isDark
    ? "bg-slate-950"
    : "bg-[linear-gradient(160deg,#fff9ef_0%,#f1e6bf_48%,#dff0cf_100%)]";
  const wrapperBorder = isDark ? "border-slate-800" : "border-white/70";
  const sceneBg = isDark ? "#020617" : "#fbf6ea";       // slate-950 / cream
  const groundColor = isDark ? "#0f172a" : "#e0d0b4";   // slate-900 / sand

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-[2.4rem] border ${wrapperBorder} ${wrapperBg} shadow-[0_32px_90px_-48px_rgba(23,53,35,0.55)]`}
    >
      <Canvas
        className="h-full w-full"
        camera={{ position: product.viewer.cameraPosition, fov: 34 }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={[sceneBg]} />

        {/* Lighting rig
            ------------------------------------------------------------
            Slightly brighter in dark mode so the part doesn't fall into
            silhouette against the slate-950 backdrop. Order:
              1. Ambient   — flat baseline, prevents pitch-black faces.
              2. Hemi      — sky/ground gradient, keeps the part read-
                             able from any angle.
              3. Key (top-front-right) — main shape definition + shadow.
              4. Fill (front-left)     — softens the side opposite the
                                         key so contours stay legible.
              5. Rim (back)            — thin emerald rim so the part
                                         separates from the backdrop.
            ------------------------------------------------------------ */}
        <ambientLight intensity={isDark ? 0.55 : 0.35} />
        <hemisphereLight intensity={1.15} groundColor={groundColor} />
        <directionalLight
          position={[6, 7, 6]}
          intensity={isDark ? 2.6 : 2.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-5, 3, -4]}
          intensity={isDark ? 1.4 : 1.1}
          color={product.viewer.accentColor}
        />
        <directionalLight
          position={[0, 2, -6]}
          intensity={isDark ? 0.7 : 0.4}
          color={isDark ? "#10b981" : "#ffffff"}
        />
        <group position={[0, -0.1, 0]}>
          <SceneModel config={product.viewer} />
        </group>
        <ContactShadows position={[0, -1.65, 0]} opacity={0.36} scale={11} blur={2.1} far={6} />
        <OrbitControls
          enablePan
          enableDamping
          minDistance={3.6}
          maxDistance={8.5}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
        <span className="rounded-full border border-white/70 bg-white/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep backdrop-blur-sm">
          Rotate to inspect
        </span>
        <span className="rounded-full border border-white/10 bg-accent-deep px-3 py-1 font-mono text-xs text-white/82">
          {product.viewer.label}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
        <div className="max-w-sm rounded-[1.6rem] bg-white/82 p-4 shadow-[0_24px_44px_-28px_rgba(23,53,35,0.45)] backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-deep">
            3D presentation
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">{product.name}</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            This viewer uses product-specific demo geometry so buyers can rotate, inspect, and understand the form factor before you replace it with final uploaded GLB or GLTF assets.
          </p>
        </div>
      </div>
    </div>
  );
}
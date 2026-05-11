export function ProductViewerPlaceholder({ productName }: { productName: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fffcf7_0%,#e8ddcf_100%)] p-6 shadow-[0_30px_90px_-48px_rgba(20,33,43,0.6)]">
      <div className="absolute inset-x-10 bottom-7 h-8 rounded-full bg-[#17232d]/15 blur-2xl" />
      <div className="absolute inset-x-10 top-12 h-56 [perspective:1200px]">
        <div className="absolute inset-0 rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(23,35,45,0.85),rgba(184,95,45,0.85))] shadow-[0_24px_60px_-30px_rgba(20,33,43,0.8)] [transform:rotateX(63deg)_rotateZ(-28deg)]" />
        <div className="absolute inset-[16%] rounded-[1.5rem] border border-white/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.4),rgba(255,255,255,0.05))] [transform:rotateX(63deg)_rotateZ(-28deg)_translateZ(20px)]" />
        <div className="absolute inset-x-[22%] inset-y-[18%] rounded-[1.25rem] border border-white/35 bg-[linear-gradient(145deg,rgba(255,255,255,0.48),rgba(255,255,255,0.08))] [transform:rotateX(63deg)_rotateZ(-28deg)_translateZ(38px)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep">
            3D asset slot
          </span>
          <span className="rounded-full bg-[#17232d] px-3 py-1 font-mono text-xs text-white/75">
            GLB / GLTF
          </span>
        </div>

        <div className="max-w-sm rounded-[1.5rem] bg-white/75 p-4 backdrop-blur-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            Viewer pipeline initialized
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">{productName}</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            This stage is ready for an interactive model once product GLB assets are uploaded. Public pages can rotate the model while private pages keep formulation data hidden.
          </p>
        </div>
      </div>
    </div>
  );
}
/**
 * Texture layers. These sit above/below content and are the reason the
 * screen doesn't look like a flat CSS gradient.
 */

/** Fixed animated film grain. Mount once, at the app root. */
export function Grain() {
  return <div className="grain-overlay" aria-hidden />
}

/** Faint blueprint grid + vignette. Sits behind page content. */
export function Backdrop({ children }: { children?: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="blueprint absolute inset-0 opacity-60" />
      <div className="vignette absolute inset-0" />
      {children}
    </div>
  )
}

/**
 * Soft colour bloom that drifts behind content. Two of these at low
 * opacity does more for perceived depth than any amount of drop-shadow.
 */
export function Bloom({
  color = 'acid',
  className,
}: {
  color?: 'acid' | 'blood' | 'cyan'
  className?: string
}) {
  const map = {
    acid: 'rgba(212,255,63,0.20)',
    blood: 'rgba(255,45,85,0.20)',
    cyan: 'rgba(0,229,255,0.16)',
  }
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        borderRadius: '9999px',
        filter: 'blur(80px)',
        background: map[color],
        pointerEvents: 'none',
      }}
    />
  )
}

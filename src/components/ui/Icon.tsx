/**
 * Inline SVG icons.
 *
 * Deliberately not unicode glyphs (♪ ✓ → ✕). Display faces like Anton
 * carry almost no symbol coverage, so those characters fall back to tofu
 * boxes — which is exactly what a rushed build looks like. SVG always renders.
 */

interface IconProps {
  className?: string
  size?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function SoundOn({ className, size = 15 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M4 9v6h3l5 4V5L7 9H4z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

export function SoundOff({ className, size = 15 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M4 9v6h3l5 4V5L7 9H4z" />
      <path d="M17 9.5l5 5" />
      <path d="M22 9.5l-5 5" />
    </svg>
  )
}

export function Check({ className, size = 16 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

export function ArrowRight({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function Camera({ className, size = 16 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  )
}

export function Globe({ className, size = 16 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
    </svg>
  )
}

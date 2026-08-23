import { motion, type HTMLMotionProps } from 'motion/react'
import clsx from 'clsx'
import { sfx, haptic } from '@/lib/audio'

type Variant = 'primary' | 'danger' | 'ghost' | 'dark'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  children: React.ReactNode
  full?: boolean
  /** suppress the built-in click sound (e.g. when the handler plays its own) */
  silent?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-acid text-ink border-acid',
  danger: 'bg-blood text-bone border-blood',
  ghost: 'bg-transparent text-bone border-hairline hover:border-bone/50',
  dark: 'bg-raised text-bone border-hairline hover:border-acid/40',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm tracking-[0.08em]',
  md: 'px-6 py-3 text-lg tracking-[0.06em]',
  lg: 'px-8 py-4 text-2xl tracking-[0.04em]',
  xl: 'px-10 py-5 text-3xl tracking-[0.03em]',
}

/**
 * The tactile core of the app.
 *
 * Three things happen on press, together, in under 120ms:
 *  1. the button scales down slightly (squash)
 *  2. it translates into its own hard shadow, so it reads as physically
 *     depressing into the page rather than just dimming
 *  3. a synthesized click + haptic tick fires
 *
 * That combination is the difference between "a website button" and
 * "a game button". None of it is expensive; it's just deliberate.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  full,
  silent,
  className,
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      className={clsx(
        'font-display uppercase relative select-none border-2',
        'transition-colors duration-150',
        'disabled:opacity-35 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className,
      )}
      style={{ boxShadow: '4px 4px 0 0 var(--color-void)' }}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.965,
              x: 4,
              y: 4,
              boxShadow: '0px 0px 0 0 var(--color-void)',
            }
      }
      transition={{ type: 'spring', stiffness: 900, damping: 26, mass: 0.5 }}
      onClick={(e) => {
        if (!silent) sfx.tap()
        haptic.light()
        onClick?.(e)
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

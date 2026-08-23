import { useState } from 'react'
import { motion } from 'motion/react'
import { isMuted, toggleMute, haptic } from '@/lib/audio'
import { SoundOff, SoundOn } from '@/components/ui/Icon'

export function SoundToggle() {
  const [muted, setMuted] = useState(isMuted)

  return (
    <motion.button
      onClick={() => {
        setMuted(toggleMute())
        haptic.light()
      }}
      whileTap={{ scale: 0.88 }}
      className="border-hairline text-ash hover:text-bone hover:border-bone/40 relative flex h-9 w-9 items-center justify-center border transition-colors"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      title={muted ? 'Sound off — tap to enable' : 'Sound on'}
    >
      {muted ? <SoundOff /> : <SoundOn className="text-acid" />}
      {!muted && (
        <motion.span
          className="bg-acid absolute top-1 right-1 h-1 w-1"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
    </motion.button>
  )
}

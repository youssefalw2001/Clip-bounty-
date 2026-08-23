import { useCallback, useEffect, useRef, useState } from 'react'

export type Facing = 'front' | 'back'
export type CameraStatus = 'idle' | 'starting' | 'live' | 'denied' | 'unavailable'

/**
 * Live camera access for staking a photo.
 *
 * Deliberately has NO file-picker fallback. Capture is camera-only, in the
 * moment, against a prompt the player didn't choose. That single constraint
 * does more safety work than any amount of moderation:
 *   - there is no gallery to reach into, so pre-existing intimate photos
 *     can never enter the game
 *   - the content is always a response to a prompt, so escalating gains
 *     the player nothing
 *
 * If the camera is unavailable the player simply cannot ante up. That's the
 * correct failure mode.
 */
export function useCamera(facing: Facing = 'front') {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }
    setStatus('starting')
    stop()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing === 'front' ? 'user' : 'environment',
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setStatus('live')
    } catch (err) {
      const name = (err as DOMException)?.name
      setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
    }
  }, [facing, stop])

  useEffect(() => stop, [stop])

  /**
   * Grab a frame. Returns a data URL kept purely in memory — in this
   * prototype the photo never touches a network or disk.
   */
  const capture = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null

    // crop to a 3:4 portrait frame, matching the on-screen viewfinder
    const targetRatio = 3 / 4
    const vw = video.videoWidth
    const vh = video.videoHeight
    let sw = vw
    let sh = vw / targetRatio
    if (sh > vh) {
      sh = vh
      sw = vh * targetRatio
    }
    const sx = (vw - sw) / 2
    const sy = (vh - sh) / 2

    const canvas = document.createElement('canvas')
    canvas.width = 720
    canvas.height = 960
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    if (facing === 'front') {
      // un-mirror: the preview is mirrored for usability, but a mirrored
      // capture looks wrong when shown back to you
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.86)
  }, [facing])

  return { videoRef, status, start, stop, capture }
}

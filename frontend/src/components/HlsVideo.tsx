import Hls from 'hls.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../app/cn'

export function HlsVideo({
  src,
  className,
  poster,
  muted = true,
  lowLatencyMode = true,
  videoRef: externalVideoRef,
}: {
  src?: string
  className?: string
  poster?: string
  muted?: boolean
  lowLatencyMode?: boolean
  videoRef?: React.RefObject<HTMLVideoElement | null>
}) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoRef = externalVideoRef ?? internalVideoRef
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'playing' | 'needsClick'>('idle')

  const normalized = useMemo(() => {
    const s = (src ?? '').trim()
    return s.length > 0 ? s : undefined
  }, [src])

  const isLocalGateway8888 = useMemo(() => {
    if (!normalized) return false
    try {
      const u = new URL(normalized, window.location.href)
      return u.hostname === 'localhost' && u.port === '8888'
    } catch {
      return false
    }
  }, [normalized])

  useEffect(() => {
    setError(null)
    setPhase('idle')
    const video = videoRef.current
    if (!video || !normalized) return

    setPhase('loading')

    // Ensure autoplay policies see the element as muted.
    video.muted = Boolean(muted)
    ;(video as any).defaultMuted = Boolean(muted)
    ;(video as any).playsInline = true
    ;(video as any).autoplay = true

    const onPlaying = () => setPhase('playing')
    const onError = () => {
      // Avoid overriding a more specific hls.js error message.
      setError((prev) => prev ?? 'Video element failed to play the stream')
      setPhase((prev) => (prev === 'playing' ? 'playing' : 'idle'))
    }
    video.addEventListener('playing', onPlaying)
    video.addEventListener('error', onError)

    // Native HLS support (Safari)
    const canNative = video.canPlayType('application/vnd.apple.mpegurl')
    if (canNative) {
      video.src = normalized
      void video.play().catch(() => {
        setPhase('needsClick')
      })
      return () => {
        video.removeEventListener('playing', onPlaying)
        video.removeEventListener('error', onError)
      }
    }

    if (!Hls.isSupported()) {
      setError('HLS not supported in this browser')
      return
    }

    const hls = new Hls({
      lowLatencyMode,
      backBufferLength: 30,
      maxLiveSyncPlaybackRate: 1.5,
      // Reduce request spam when a gateway is offline (common during setup).
      manifestLoadingMaxRetry: 1,
      levelLoadingMaxRetry: 1,
      fragLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 1000,
      levelLoadingRetryDelay: 1000,
      fragLoadingRetryDelay: 1000,
    })

    hls.on(Hls.Events.ERROR, (_evt, data) => {
      // Surface common load failures quickly (otherwise hls.js may keep retrying and the UI looks blank).
      const details = (data as any)?.details as string | undefined
      const fatal = Boolean((data as any)?.fatal)
      const url = String((data as any)?.url ?? '')
      const code = (data as any)?.response?.code as number | undefined

      // hls.js emits string details like: manifestLoadError | levelLoadError | fragLoadError
      if (details === 'manifestLoadError') {
        if (isLocalGateway8888 && code === 404) {
          setError(
            `HLS path not found (404). Ensure the URL path matches MediaMTX config (case-sensitive). Tried: ${url || normalized}`,
          )
        } else if (isLocalGateway8888 && code === 500) {
          setError(
            'MediaMTX returned HTTP 500 while generating HLS. Common causes: camera stream is H.265/HEVC or the camera rejected the RTSP pull. Check streaming/mediamtx.log and switch the camera/stream profile to H.264 (AVC).',
          )
        } else if (isLocalGateway8888 && (!code || code === 0)) {
          setError('HLS gateway not reachable at http://localhost:8888. Start MediaMTX to enable live view.')
        } else {
          setError(`Cannot load HLS manifest${code ? ` (HTTP ${code})` : ''}. Check the gateway is running and allows CORS.`)
        }
      } else if (details === 'levelLoadError') {
        setError(`Cannot load HLS playlist${code ? ` (HTTP ${code})` : ''}. Check the gateway/network connectivity.`)
      } else if (details === 'fragLoadError') {
        setError(`Cannot load HLS segments${code ? ` (HTTP ${code})` : ''}. The gateway may not be pulling RTSP successfully.`)
      } else if (details === 'manifestIncompatibleCodecsError' || details === 'bufferAddCodecError') {
        setError(
          'Stream codec not supported by this browser (often H.265/HEVC). Switch the camera/stream to H.264 or use a gateway that transcodes to H.264/WebRTC.',
        )
      } else if (fatal) {
        setError((data as any)?.type ? `HLS fatal error: ${(data as any).type}` : 'HLS fatal error')
      }

      if (fatal) {
        hls.destroy()
      }
    })

    hls.loadSource(normalized)
    hls.attachMedia(video)

    const onManifest = () => {
      void video.play().catch(() => {
        setPhase('needsClick')
      })
    }
    hls.on(Hls.Events.MANIFEST_PARSED, onManifest)

    return () => {
      hls.off(Hls.Events.MANIFEST_PARSED, onManifest)
      hls.destroy()
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
    }
  }, [normalized, isLocalGateway8888, muted, lowLatencyMode])

  return (
    <div className={cn('relative h-full w-full', className)}>
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        crossOrigin="anonymous"
        muted={muted}
        autoPlay
        controls={false}
        poster={poster}
      />
      {phase === 'loading' && !error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/25 p-3 text-center text-xs text-white">
          <div>
            <div className="font-semibold">Loading stream…</div>
            <div className="mt-1 opacity-80">If this stays blank, the HLS gateway may be offline.</div>
          </div>
        </div>
      ) : null}
      {phase === 'needsClick' && !error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/45 p-3 text-center text-xs text-white">
          <div
            className="cursor-pointer select-none rounded-lg bg-white/15 px-3 py-2 font-semibold ring-1 ring-white/25 hover:bg-white/20"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const v = videoRef.current
              if (!v) return
              setError(null)
              void v.play().catch((err) => {
                const name = (err as any)?.name as string | undefined
                const message = (err as any)?.message as string | undefined
                if (name === 'NotAllowedError') setError('Autoplay/playback blocked by the browser')
                else if (name === 'NotSupportedError') setError('Stream not supported by this browser (codec/format)')
                else setError(message || 'Playback failed')
              })
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              e.stopPropagation()
              const v = videoRef.current
              if (!v) return
              setError(null)
              void v.play().catch((err) => {
                const name = (err as any)?.name as string | undefined
                const message = (err as any)?.message as string | undefined
                if (name === 'NotAllowedError') setError('Autoplay/playback blocked by the browser')
                else if (name === 'NotSupportedError') setError('Stream not supported by this browser (codec/format)')
                else setError(message || 'Playback failed')
              })
            }}
          >
            Click to play
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/55 p-3 text-center text-xs text-white">
          <div>
            <div className="font-semibold">Stream error</div>
            <div className="mt-1 opacity-80">{error}</div>
            {isLocalGateway8888 ? (
              <div className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-left text-[11px] leading-relaxed ring-1 ring-white/15">
                <div className="font-semibold">Fix</div>
                <div className="opacity-90">Run the RTSP→HLS gateway (MediaMTX):</div>
                <div className="mt-1 font-mono opacity-90">cd streaming</div>
                <div className="font-mono opacity-90">docker compose up -d</div>
                <div className="mt-2 opacity-80">No Docker? Download MediaMTX and run:</div>
                <div className="mt-1 font-mono opacity-90">.\\run-mediamtx.ps1</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

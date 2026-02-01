import { useEffect, useMemo, useRef, useState } from 'react'

async function waitForIceGatheringComplete(pc: RTCPeerConnection, timeoutMs = 5000) {
  if (pc.iceGatheringState === 'complete') return

  await new Promise<void>((resolve) => {
    const t = window.setTimeout(() => {
      cleanup()
      resolve()
    }, timeoutMs)

    const onStateChange = () => {
      if (pc.iceGatheringState !== 'complete') return
      window.clearTimeout(t)
      cleanup()
      resolve()
    }

    const cleanup = () => {
      pc.removeEventListener('icegatheringstatechange', onStateChange)
    }

    pc.addEventListener('icegatheringstatechange', onStateChange)
  })
}

export function WebRtcVideo({
  src,
  muted = true,
  className,
  videoRef: externalVideoRef,
  onError,
}: {
  src: string
  muted?: boolean
  className?: string
  videoRef?: React.RefObject<HTMLVideoElement | null>
  onError?: (error: string) => void
}) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoRef = externalVideoRef ?? internalVideoRef
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const normalizedSrc = useMemo(() => {
    let next = src.trim()

    if (next.includes('/whep:')) {
      next = next.replace('/whep:', '/whep')
    }

    if (!/^https?:\/\//i.test(next)) {
      next = `http://${next}`
    }

    return next
  }, [src])

  useEffect(() => {
    const abort = new AbortController()
    let pc: RTCPeerConnection | null = null
    let sessionUrl: string | null = null

    const stop = async () => {
      abort.abort()

      try {
        pc?.close()
      } catch {
        // ignore
      }

      // Best-effort: close server-side WHEP session.
      if (sessionUrl) {
        try {
          await fetch(sessionUrl, { method: 'DELETE', signal: abort.signal })
        } catch {
          // ignore
        }
      }

      pc = null
      sessionUrl = null
    }

    const start = async () => {
      setConnecting(true)
      setError(null)

      pc = new RTCPeerConnection({
        iceServers: [],
      })

      pc.addTransceiver('video', { direction: 'recvonly' })
      pc.addTransceiver('audio', { direction: 'recvonly' })

      pc.ontrack = (event) => {
        const videoEl = videoRef.current
        if (!videoEl) return

        const stream = event.streams?.[0]
        if (stream) {
          videoEl.srcObject = stream
        } else {
          const ms = new MediaStream([event.track])
          videoEl.srcObject = ms
        }
      }

      pc.onconnectionstatechange = () => {
        if (!pc) return
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setError('WebRTC connection failed.')
          setConnecting(false)
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await waitForIceGatheringComplete(pc)

      const offerSdp = pc.localDescription?.sdp
      if (!offerSdp) throw new Error('Failed to create WebRTC offer.')

      const res = await fetch(normalizedSrc, {
        method: 'POST',
        headers: {
          'content-type': 'application/sdp',
        },
        body: offerSdp,
        signal: abort.signal,
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`WHEP request failed: HTTP ${res.status}${body ? ` — ${body}` : ''}`)
      }

      const location = res.headers.get('location')
      if (location) {
        // Some servers return relative URLs.
        sessionUrl = new URL(location, normalizedSrc).toString()
      }

      const answerSdp = await res.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setConnecting(false)
    }

    void start().catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      setConnecting(false)
      onError?.(msg)
      void stop()
    })

    return () => {
      void stop()
    }
  }, [normalizedSrc, onError, videoRef])

  return (
    <div className={className ?? 'relative h-full w-full'}>
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        autoPlay
        muted={muted}
      />

      {connecting ? (
        <div className="absolute inset-0 grid place-items-center bg-black/35 text-xs font-semibold text-white">
          CONNECTING…
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/55 p-4 text-center text-xs font-semibold text-white">
          <div>
            <div>STREAM ERROR</div>
            <div className="mt-2 text-[11px] font-normal text-white/85">{error}</div>
            <div className="mt-3 text-[11px] font-normal text-white/80">
              Tip: ensure MediaMTX WebRTC is reachable on `:8889` and ICE UDP `:8189` is allowed by the firewall.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

import { Camera as CameraIcon, Maximize2, Info } from 'lucide-react'
import { Play, RotateCw, Camera as SnapshotIcon } from 'lucide-react'
import { cn } from '../app/cn'
import { useInView } from '../app/useInView'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Camera, Location } from '../api/types'
import { HlsVideo } from './HlsVideo'
import { WebRtcVideo } from './WebRtcVideo'
import { Badge } from './ui/Badge'
import { StatusDot } from './ui/StatusDot'
import { SignalStrength } from './SignalStrength'

export function CameraTile({
  camera,
  location,
  selected,
  onSelect,
  onFullscreen,
  onOpenLive,
  onSettings: _onSettings,
  onShowDetails,
}: {
  camera: Camera
  location?: Location
  selected: boolean
  onSelect: () => void
  onFullscreen: () => void
  onOpenLive?: () => void
  onSettings?: () => void
  onShowDetails?: (rect: DOMRect) => void
}) {
  const tileRef = useRef<HTMLDivElement | null>(null)
  const infoButtonRef = useRef<HTMLButtonElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const inView = useInView(tileRef)
  const [playerKey, setPlayerKey] = useState(0)
  const [whepFailed, setWhepFailed] = useState(false)
  const lastTapRef = useRef<number>(0)

  const canPlay = useMemo(() => {
    return Boolean(camera.enabled && (camera.whepUrl || camera.hlsUrl))
  }, [camera.enabled, camera.whepUrl, camera.hlsUrl])

  const isOffline = camera.status === 'OFFLINE'

  useEffect(() => {
    setWhepFailed(false)
  }, [camera.id, camera.whepUrl, camera.hlsUrl])

  const takeSnapshot = async () => {
    const videoEl = videoRef.current
    if (!videoEl) {
      alert('Video element not found. Please wait for stream to load.')
      return
    }

    // If video not fully loaded, wait a bit and retry
    if (!videoEl.videoWidth || !videoEl.videoHeight) {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (!videoEl.videoWidth || !videoEl.videoHeight) {
        alert('Stream not ready yet. Please try again.')
        return
      }
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoEl.videoWidth
      canvas.height = videoEl.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        alert('Failed to create canvas context')
        return
      }

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) {
        alert('Failed to encode image')
        return
      }

      const safeName = camera.name.replace(/[^a-z0-9\-_. ]/gi, '_').trim() || camera.id
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${safeName}-${ts}.png`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null
      // Don't trigger if clicking on action buttons
      if (target?.closest('[data-action-button="true"]')) {
        e.stopPropagation()
        return
      }
      onSelect()
    },
    [onSelect],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'touch') return
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-action-button="true"]')) return

      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        onFullscreen()
        lastTapRef.current = 0
        return
      }
      lastTapRef.current = now
    },
    [onFullscreen],
  )

  return (
    <div
      ref={tileRef}
      role="button"
      tabIndex={0}
      data-no-drag-scroll="true"
      className={cn(
        'group relative overflow-hidden rounded-lg bg-surface ring-1 ring-border text-left transition',
        'hover:ring-2 hover:ring-brand-500/50',
        selected && 'ring-2 ring-brand-500',
        isOffline && 'ring-2 ring-rose-500/60 animate-pulse-ring',
      )}
      onClick={handleClick}
      onDoubleClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onFullscreen()
      }}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onSelect()
      }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        {inView && canPlay ? (
          camera.whepUrl && !whepFailed ? (
            <WebRtcVideo
              key={playerKey}
              src={camera.whepUrl}
              videoRef={videoRef}
              onError={() => {
                if (camera.hlsUrl) setWhepFailed(true)
              }}
            />
          ) : camera.hlsUrl ? (
            <HlsVideo key={playerKey} src={camera.hlsUrl} videoRef={videoRef} />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-200">
              <div className="flex items-center gap-2 text-xs">
                <CameraIcon size={16} /> Stream error
                <span className="text-slate-400">(no compatible stream)</span>
              </div>
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-slate-200">
            <div className="flex items-center gap-2 text-xs">
              <CameraIcon size={16} /> Live Stream
              <span className="text-slate-400">(configure WHEP/HLS URL)</span>
            </div>
          </div>
        )}

        {/* Overlays - only show latency, status badge moved to card footer */}
        {camera.lastLatencyMs != null && camera.status !== 'OFFLINE' ? (
          <div className="pointer-events-none absolute left-3 top-3">
            <span className="rounded-md bg-black/35 px-2 py-1 text-[11px] font-medium tabular-nums text-white ring-1 ring-white/10">
              {camera.lastLatencyMs} ms
            </span>
          </div>
        ) : null}

        {/* Hover actions */}
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100 pointer-events-none">
          <button
            data-action-button="true"
            className={cn(
              'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white ring-1 ring-white/10 transition active:scale-95',
              canPlay ? 'hover:bg-black/45 cursor-pointer' : 'opacity-60 cursor-not-allowed',
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!canPlay) return
              onOpenLive?.()
            }}
            disabled={!canPlay}
            type="button"
            aria-label="Open Live View"
            title="Open Live View"
          >
            <Play size={16} className="pointer-events-none" />
          </button>
          <button
            data-action-button="true"
            className={cn(
              'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white ring-1 ring-white/10 transition active:scale-95',
              canPlay ? 'hover:bg-black/45 cursor-pointer' : 'opacity-60 cursor-not-allowed',
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!canPlay) return
              setPlayerKey((k) => k + 1)
            }}
            disabled={!canPlay}
            type="button"
            aria-label="Restart Stream"
            title="Restart Stream"
          >
            <RotateCw size={16} className="pointer-events-none" />
          </button>
          <button
            data-action-button="true"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white ring-1 ring-white/10 hover:bg-black/45 cursor-pointer transition active:scale-95"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFullscreen()
            }}
            type="button"
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize2 size={16} className="pointer-events-none" />
          </button>
          <button
            ref={infoButtonRef}
            data-action-button="true"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white ring-1 ring-white/10 hover:bg-black/45 cursor-pointer transition active:scale-95"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onShowDetails && infoButtonRef.current) {
                const rect = infoButtonRef.current.getBoundingClientRect()
                onShowDetails(rect)
              }
            }}
            type="button"
            aria-label="Details"
            title="Show camera details"
          >
            <Info size={16} className="pointer-events-none" />
          </button>
          <button
            data-action-button="true"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white ring-1 ring-white/10 hover:bg-black/45 cursor-pointer transition active:scale-95"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void takeSnapshot()
            }}
            type="button"
            aria-label="Snapshot"
            title="Take screenshot"
          >
            <SnapshotIcon size={16} className="pointer-events-none" />
          </button>
        </div>

        {!camera.enabled ? (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-xs font-semibold text-white">
            DISABLED
          </div>
        ) : null}

      </div>

      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold leading-tight">{camera.name}</div>
            <div className="truncate text-xs font-medium text-muted leading-tight">{location?.code ?? '—'} • {camera.zone}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <SignalStrength strength={camera.signalStrength} />
            <StatusDot status={camera.status} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {typeof camera.fps === 'number' ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">
                {camera.fps} FPS
              </span>
            ) : null}
            {camera.resolution ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">
                {camera.resolution}
              </span>
            ) : null}
            {camera.codec ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">
                {camera.codec}
              </span>
            ) : null}
            {!camera.enabled ? <Badge tone="neutral">DISABLED</Badge> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

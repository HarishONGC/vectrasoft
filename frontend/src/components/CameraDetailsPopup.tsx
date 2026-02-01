import { useEffect, useRef, useState } from 'react'
import { Copy, Globe, Network, Video, Activity, Wrench, RefreshCw, FileDown, X } from 'lucide-react'
import type { Camera, Location } from '../api/types'
import { useStreamCheck } from '../api/hooks'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { StatusDot } from './ui/StatusDot'

function copy(text: string) {
  void navigator.clipboard.writeText(text)
}

export function CameraDetailsPopup({
  camera,
  location,
  anchorRect,
  onClose,
}: {
  camera: Camera
  location?: Location
  anchorRect: DOMRect
  onClose: () => void
}) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const streamCheck = useStreamCheck()

  useEffect(() => {
    if (!popupRef.current) return

    const popup = popupRef.current
    const popupRect = popup.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate position
    let top = anchorRect.bottom + 10
    let left = anchorRect.left

    // Adjust if popup goes off right edge
    if (left + popupRect.width > viewportWidth) {
      left = viewportWidth - popupRect.width - 20
    }

    // Adjust if popup goes off left edge
    if (left < 20) {
      left = 20
    }

    // Adjust if popup goes off bottom edge
    if (top + popupRect.height > viewportHeight) {
      top = anchorRect.top - popupRect.height - 10
    }

    // If still off screen, position at top
    if (top < 20) {
      top = 20
    }

    setPosition({ top, left })
  }, [anchorRect])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const tone = camera.status === 'ONLINE' ? 'ok' : camera.status === 'OFFLINE' ? 'bad' : 'warn'
  const fmt = (v: unknown) => (v == null || v === '' ? '—' : String(v))

  const restartCamera = () => alert('Restart camera: integrate with camera/NVR API (ONVIF/vendor)')
  const resetStream = () => alert('Reset stream: integrate with gateway control (MediaMTX/FFmpeg)')
  const exportLogs = () => alert('Export logs: integrate with backend log bundle download')

  return (
    <div
      ref={popupRef}
      className="fixed z-50 w-[380px] rounded-lg bg-surface border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface2/50 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold">{camera.name}</div>
          <div className="truncate text-xs font-medium text-muted">{location?.name ?? '—'} • {camera.zone}</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={camera.status} />
          <Badge tone={tone}>{camera.status}</Badge>
          <button
            onClick={onClose}
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-surface2 hover:text-text"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto p-4">
        <div className="grid gap-3 text-sm">
          <div className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
            <Network size={16} className="text-muted" />
            <div className="min-w-0">
              <div className="text-xs text-muted">IP Address</div>
              <div className="truncate font-medium tabular-nums">{camera.ipAddress}</div>
            </div>
            <Button variant="ghost" className="h-9 px-2" onClick={() => copy(camera.ipAddress)}>
              <Copy size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
            <Video size={16} className="text-muted" />
            <div className="min-w-0">
              <div className="text-xs text-muted">RTSP URL</div>
              <div className="truncate font-medium">{camera.rtspUrl}</div>
            </div>
            <Button variant="ghost" className="h-9 px-2" onClick={() => copy(camera.rtspUrl)}>
              <Copy size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
            <Video size={16} className="text-muted" />
            <div className="min-w-0">
              <div className="text-xs text-muted">HLS URL</div>
              <div className="truncate font-medium">{camera.hlsUrl ?? '—'}</div>
            </div>
            <Button
              variant="ghost"
              className="h-9 px-2"
              disabled={!camera.hlsUrl}
              onClick={() => camera.hlsUrl && copy(camera.hlsUrl)}
            >
              <Copy size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
            <Video size={16} className="text-muted" />
            <div className="min-w-0">
              <div className="text-xs text-muted">WebRTC (WHEP) URL</div>
              <div className="truncate font-medium">{camera.whepUrl ?? '—'}</div>
            </div>
            <Button
              variant="ghost"
              className="h-9 px-2"
              disabled={!camera.whepUrl}
              onClick={() => camera.whepUrl && copy(camera.whepUrl)}
            >
              <Copy size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-[24px_1fr] items-center gap-2">
            <Globe size={16} className="text-muted" />
            <div>
              <div className="text-xs text-muted">Vendor / Type</div>
              <div className="font-medium">{camera.vendor} • {camera.cameraType}</div>
            </div>
          </div>

          <div className="rounded-lg bg-surface2 p-3 border border-border/50">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted">Installation Date</div>
                <div className="mt-0.5 font-medium tabular-nums">{camera.installationDate}</div>
              </div>
              <div>
                <div className="text-muted">Last Seen</div>
                <div className="mt-0.5 font-medium tabular-nums">{camera.lastSeenAt ?? '—'}</div>
              </div>
              <div>
                <div className="text-muted">Latency</div>
                <div className="mt-0.5 font-medium tabular-nums">
                  {camera.lastLatencyMs != null ? `${camera.lastLatencyMs} ms` : '—'}
                </div>
              </div>
              <div>
                <div className="text-muted">Enabled</div>
                <div className="mt-0.5 font-medium">{camera.enabled ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-muted">Location</div>
                <div className="mt-0.5 font-medium">{location?.code ?? '—'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-surface2 p-3 border border-border/50">
            <div className="text-xs font-medium">Stream telemetry</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted">Codec</div>
                <div className="mt-0.5 font-medium tabular-nums">{fmt(camera.codec)}</div>
              </div>
              <div>
                <div className="text-muted">Bitrate</div>
                <div className="mt-0.5 font-medium tabular-nums">{camera.bitrateKbps != null ? `${camera.bitrateKbps} kbps` : '—'}</div>
              </div>
              <div>
                <div className="text-muted">FPS</div>
                <div className="mt-0.5 font-medium tabular-nums">{camera.fps != null ? `${camera.fps}` : '—'}</div>
              </div>
              <div>
                <div className="text-muted">Resolution</div>
                <div className="mt-0.5 font-medium tabular-nums">{fmt(camera.resolution)}</div>
              </div>
              <div>
                <div className="text-muted">Packet loss</div>
                <div className="mt-0.5 font-medium tabular-nums">{camera.packetLossPct != null ? `${camera.packetLossPct}%` : '—'}</div>
              </div>
              <div>
                <div className="text-muted">Jitter</div>
                <div className="mt-0.5 font-medium tabular-nums">{camera.jitterMs != null ? `${camera.jitterMs} ms` : '—'}</div>
              </div>
              <div>
                <div className="text-muted">Firmware</div>
                <div className="mt-0.5 font-medium tabular-nums">{fmt(camera.firmwareVersion)}</div>
              </div>
              <div>
                <div className="text-muted">Last reboot</div>
                <div className="mt-0.5 font-medium tabular-nums">{fmt(camera.lastRebootAt)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-surface2 p-3 border border-border/50">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="h-9 text-xs" onClick={restartCamera}>
                <Wrench size={14} /> Restart
              </Button>
              <Button variant="secondary" className="h-9 text-xs" onClick={resetStream}>
                <RefreshCw size={14} /> Reset
              </Button>
              <Button variant="secondary" className="h-9 text-xs" onClick={() => streamCheck.mutate(camera.id)} disabled={streamCheck.isPending}>
                <Activity size={14} /> Diagnostics
              </Button>
              <Button variant="secondary" className="h-9 text-xs" onClick={exportLogs}>
                <FileDown size={14} /> Logs
              </Button>
            </div>
          </div>

          {streamCheck.data?.cameraId === camera.id ? (
            <div className="rounded-lg bg-surface2 p-3 border border-border/50">
              <div className="text-xs font-medium mb-2">Stream diagnostics</div>
              <div className="grid gap-1 text-[11px] text-muted tabular-nums">
                <div>
                  <span className="font-medium text-fg">RTSP</span>{' '}
                  {streamCheck.data.rtsp.ok ? (
                    <span className="text-emerald-600">OK</span>
                  ) : (
                    <span className="text-rose-600">FAIL</span>
                  )}{' '}
                  <span>({streamCheck.data.rtsp.ms}ms)</span>
                  <span className="ml-2">{streamCheck.data.rtsp.host}:{streamCheck.data.rtsp.port}</span>
                  {streamCheck.data.rtsp.error ? <span className="ml-2">— {streamCheck.data.rtsp.error}</span> : null}
                </div>
                <div>
                  <span className="font-medium text-fg">HLS</span>{' '}
                  {streamCheck.data.hls.ok ? (
                    <span className="text-emerald-600">OK</span>
                  ) : (
                    <span className="text-rose-600">FAIL</span>
                  )}{' '}
                  <span>({streamCheck.data.hls.ms}ms)</span>
                  {typeof streamCheck.data.hls.status === 'number' ? <span className="ml-2">HTTP {streamCheck.data.hls.status}</span> : null}
                  {typeof streamCheck.data.hls.looksLikeM3u8 === 'boolean' ? (
                    <span className="ml-2">m3u8: {streamCheck.data.hls.looksLikeM3u8 ? 'yes' : 'no'}</span>
                  ) : null}
                  {streamCheck.data.hls.error ? <span className="ml-2">— {streamCheck.data.hls.error}</span> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

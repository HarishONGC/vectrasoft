import { Copy, Globe, Network, Video, Activity, Wrench, RefreshCw, FileDown } from 'lucide-react'
import type { Camera, Location } from '../api/types'
import { useStreamCheck } from '../api/hooks'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card, CardBody, CardHeader } from './ui/Card'
import { StatusDot } from './ui/StatusDot'

function copy(text: string) {
  void navigator.clipboard.writeText(text)
}

export function CameraDetailsPanel({
  camera,
  location,
}: {
  camera?: Camera
  location?: Location
}) {
  const streamCheck = useStreamCheck()

  if (!camera) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="text-sm font-semibold">Selected Camera</div>
          <div className="text-xs text-muted">Choose a tile from the live grid</div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-muted">No camera selected.</div>
        </CardBody>
      </Card>
    )
  }

  const tone = camera.status === 'ONLINE' ? 'ok' : camera.status === 'OFFLINE' ? 'bad' : 'warn'

  const fmt = (v: unknown) => (v == null || v === '' ? '—' : String(v))

  const restartCamera = () => alert('Restart camera: integrate with camera/NVR API (ONVIF/vendor)')
  const resetStream = () => alert('Reset stream: integrate with gateway control (MediaMTX/FFmpeg)')
  const exportLogs = () => alert('Export logs: integrate with backend log bundle download')

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{camera.name}</div>
            <div className="truncate text-xs text-muted">{location?.name ?? '—'} • {camera.zone}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={camera.status} />
            <Badge tone={tone}>{camera.status}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardBody>
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

          <div className="rounded-xl bg-surface2 p-3 ring-1 ring-border/70">
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

          <div className="rounded-xl bg-surface2 p-3 ring-1 ring-border/70">
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

          <div className="rounded-xl bg-surface2 p-3 ring-1 ring-border/70">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="h-9" onClick={restartCamera}>
                <Wrench size={16} /> Restart camera
              </Button>
              <Button variant="secondary" className="h-9" onClick={resetStream}>
                <RefreshCw size={16} /> Reset stream
              </Button>
              <Button variant="secondary" className="h-9" onClick={() => streamCheck.mutate(camera.id)} disabled={streamCheck.isPending}>
                <Activity size={16} /> Run diagnostics
              </Button>
              <Button variant="secondary" className="h-9" onClick={exportLogs}>
                <FileDown size={16} /> Export logs
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-surface2 p-3 ring-1 ring-border/70">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs">
                <div className="font-medium">Stream diagnostics</div>
                <div className="text-muted">Checks RTSP port reachability + HLS manifest.</div>
              </div>
              <Button
                variant="secondary"
                className="h-9"
                disabled={streamCheck.isPending}
                onClick={() => streamCheck.mutate(camera.id)}
              >
                <Activity size={16} /> {streamCheck.isPending ? 'Testing…' : 'Test Stream'}
              </Button>
            </div>

            {streamCheck.isError ? (
              <div className="mt-2 text-xs text-rose-500">Test failed. Ensure backend is running.</div>
            ) : null}

            {streamCheck.data?.cameraId === camera.id ? (
              <div className="mt-2 grid gap-1 text-[11px] text-muted tabular-nums">
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

                {streamCheck.data.hls.status === 500 && streamCheck.data.hls.looksLikeM3u8 === false ? (
                  <div className="text-amber-600">
                    Tip: HTTP 500 from MediaMTX often means the camera stream is H.265/HEVC. Switch that camera stream/profile to H.264 (AVC) or point RTSP to an H.264 substream.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="text-xs text-muted">
            Streaming: integrate RTSP→WebRTC or RTSP→HLS and swap the placeholder tile with a player.
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

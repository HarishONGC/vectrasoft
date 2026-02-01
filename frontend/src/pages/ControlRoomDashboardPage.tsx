import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Maximize,
  Search,
  LayoutGrid,
  Camera,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys, useCameras, useLocations, useSummary } from '../api/hooks'
import type { CameraStatus, CameraType } from '../api/types'
import { useDragScroll } from '../app/useDragScroll'
import { CameraDetailsPopup } from '../components/CameraDetailsPopup'
import { CameraTile } from '../components/CameraTile'
import { KpiCard } from '../components/KpiCard'
import { LocationsTree } from '../components/LocationsTree'
import { HlsVideo } from '../components/HlsVideo'
import { WebRtcVideo } from '../components/WebRtcVideo'
import { Pagination } from '../components/Pagination'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useCameraStatusRealtime } from '../realtime/useCameraStatusRealtime'
import { cn } from '../app/cn'

type GridLayout = '2x2' | '3x3' | '4x4'

function formatSeconds(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function ControlRoomDashboardPage() {
  useCameraStatusRealtime()

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const wall = params.get('wall') === '1'

  const [layout, setLayout] = useState<GridLayout>('3x3')
  const [selectedLocationId, setSelectedLocationId] = useState<string | 'ALL'>('ALL')
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [popupCameraId, setPopupCameraId] = useState<string | null>(null)
  const [popupAnchorRect, setPopupAnchorRect] = useState<DOMRect | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CameraStatus | 'ALL'>('ALL')
  const [cameraType, setCameraType] = useState<CameraType | 'ALL'>('ALL')
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.7)
  const [playbackSpeed, setPlaybackSpeed] = useState('1')
  const [isPlaybackPaused, setIsPlaybackPaused] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [streamRefreshKey, setStreamRefreshKey] = useState(0)
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false)
  const [whepFailed, setWhepFailed] = useState(false)

  const { data: summary } = useSummary()
  const { data: locations = [] } = useLocations()
  const { data: cameras = [] } = useCameras()

  const gridScroll = useDragScroll<HTMLDivElement>()

  const prevSummaryRef = useRef<typeof summary | null>(null)

  useEffect(() => {
    if (!summary) return
    prevSummaryRef.current = summary
  }, [summary])

  const availabilityPct = useMemo(() => {
    if (!summary?.total) return null
    return Math.round((summary.online / summary.total) * 1000) / 10
  }, [summary])

  const locationById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations])

  const selectedLocationCounts = useMemo(() => {
    const scope = selectedLocationId === 'ALL' ? cameras : cameras.filter((c) => c.locationId === selectedLocationId)
    let online = 0
    let offline = 0
    let unstable = 0
    for (const cam of scope) {
      if (cam.status === 'ONLINE') online++
      else if (cam.status === 'OFFLINE') offline++
      else if (cam.status === 'WARNING') unstable++
    }
    return {
      total: scope.length,
      online,
      offline,
      unstable,
    }
  }, [cameras, selectedLocationId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cameras.filter((c) => {
      if (selectedLocationId !== 'ALL' && c.locationId !== selectedLocationId) return false
      if (status !== 'ALL' && c.status !== status) return false
      if (cameraType !== 'ALL' && c.cameraType !== cameraType) return false
      if (!q) return true
      const loc = locationById.get(c.locationId)
      return (
        c.name.toLowerCase().includes(q) ||
        c.ipAddress.toLowerCase().includes(q) ||
        c.zone.toLowerCase().includes(q) ||
        (loc?.name?.toLowerCase().includes(q) ?? false) ||
        (loc?.code?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [cameras, selectedLocationId, status, cameraType, search, locationById])

  const popupCamera = useMemo(
    () => cameras.find((c) => c.id === popupCameraId) ?? null,
    [cameras, popupCameraId],
  )

  // Pagination calculation
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const gridCameras = useMemo(() => filtered.slice(startIdx, endIdx), [filtered, startIdx, endIdx])

  const openFullscreen = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('fullscreen', id)
    setParams(next, { replace: true })
  }

  const closeFullscreen = () => {
    const next = new URLSearchParams(params)
    next.delete('fullscreen')
    setParams(next, { replace: true })
    
    // Exit browser fullscreen if active
    const doc = document as Document & { exitFullscreen?: () => Promise<void> }
    if (doc.fullscreenElement) {
      void doc.exitFullscreen?.()
    }
  }

  const enterWallMode = useCallback(() => {
    const next = new URLSearchParams(params)
    next.set('wall', '1')
    setParams(next, { replace: true })

    const doc = document as Document & { exitFullscreen?: () => Promise<void> }
    if (!doc.fullscreenElement) {
      void document.documentElement.requestFullscreen?.()
    }
  }, [params, setParams])

  const exitWallMode = useCallback(() => {
    const next = new URLSearchParams(params)
    next.set('wall', '0')
    setParams(next, { replace: true })

    const doc = document as Document & { exitFullscreen?: () => Promise<void> }
    if (doc.fullscreenElement) {
      void doc.exitFullscreen?.()
    }
  }, [params, setParams])

  const fullscreenId = params.get('fullscreen')
  const fullscreenCam = fullscreenId ? cameras.find((c) => c.id === fullscreenId) : undefined

  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    onFullscreenChange()
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (wall && !isBrowserFullscreen) {
      const next = new URLSearchParams(params)
      next.set('wall', '0')
      setParams(next, { replace: true })
    }
  }, [wall, isBrowserFullscreen, params, setParams])

  // Sync layout selection with pageSize for grid display
  useEffect(() => {
    if (layout === '2x2') {
      setPageSize(4)
    } else if (layout === '3x3') {
      setPageSize(9)
    } else if (layout === '4x4') {
      setPageSize(16)
    }
    setCurrentPage(1) // Reset to first page when layout changes
  }, [layout])

  useEffect(() => {
    const video = fullscreenVideoRef.current
    if (!video) return

    const updateTime = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      setPlaybackDuration(duration)
      setPlaybackPosition(video.currentTime || 0)
    }

    const onPlay = () => setIsPlaybackPaused(false)
    const onPause = () => setIsPlaybackPaused(true)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('durationchange', updateTime)
    video.addEventListener('loadedmetadata', updateTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    updateTime()

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('durationchange', updateTime)
      video.removeEventListener('loadedmetadata', updateTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [fullscreenCam?.id, streamRefreshKey])

  useEffect(() => {
    const video = fullscreenVideoRef.current
    if (!video) return
    video.muted = isMuted
    video.volume = isMuted ? 0 : volume
    video.playbackRate = Number(playbackSpeed)
  }, [isMuted, volume, playbackSpeed])

  const handleTogglePlay = useCallback(() => {
    const video = fullscreenVideoRef.current
    if (!video) return
    if (video.paused) {
      void video.play().catch(() => undefined)
    } else {
      video.pause()
    }
  }, [])

  const handleSnapshot = useCallback(() => {
    const video = fullscreenVideoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `snapshot-${fullscreenCam?.name ?? 'camera'}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [fullscreenCam?.name])

  const handleScrub = useCallback((value: number) => {
    const video = fullscreenVideoRef.current
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
    video.currentTime = (value / 100) * video.duration
  }, [])

  const handleToggleBrowserFullscreen = useCallback(() => {
    const doc = document as Document & { exitFullscreen?: () => Promise<void> }
    if (!doc.fullscreenElement) {
      void document.documentElement.requestFullscreen?.()
    } else {
      void doc.exitFullscreen?.()
    }
  }, [])

  const handleReconnect = useCallback(() => {
    setStreamRefreshKey((prev) => prev + 1)
  }, [])

  const handleRefreshCameras = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cameras })
    void queryClient.invalidateQueries({ queryKey: queryKeys.summary })
  }, [queryClient])

  const streamTypeLabel = fullscreenCam?.whepUrl
    ? 'WebRTC (WHEP)'
    : fullscreenCam?.hlsUrl
      ? 'HLS'
      : '—'

  const latencyMs = fullscreenCam?.lastLatencyMs

  // Clean up invalid fullscreen parameter if camera not found
  useEffect(() => {
    if (fullscreenId && !fullscreenCam && cameras.length > 0) {
      // Camera with fullscreen ID doesn't exist, close fullscreen
      closeFullscreen()
    }
  }, [fullscreenId, fullscreenCam, cameras.length])

  // Reset WHEP fallback when switching cameras
  useEffect(() => {
    if (fullscreenCam) {
      setWhepFailed(false)
    }
  }, [fullscreenId])

  // Handle ESC key to close fullscreen
  useEffect(() => {
    if (!fullscreenCam) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenCam])

  return (
    <div className="min-h-full p-3 sm:p-4">
      {!wall ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-3">
          <KpiCard label="Total Cameras" value={selectedLocationCounts.total} tone="brand" icon="globe" />
          <KpiCard label="Online" value={selectedLocationCounts.online} tone="ok" icon="check" />
          <KpiCard label="Offline" value={selectedLocationCounts.offline} tone="bad" icon="trash" />
          <KpiCard label="Warning / Unstable" value={selectedLocationCounts.unstable} tone="warn" icon="activity" />
          <KpiCard label="Availability" value={availabilityPct != null ? `${availabilityPct}%` : '—'} tone="neutral" icon="activity" />
        </div>
      ) : null}

      <div className={wall ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3'}>
        {wall ? null : (
          <Card className="p-3 overflow-auto border border-border">
            <div className="text-sm font-bold uppercase tracking-wider text-muted mb-1">Locations</div>
            <div className="mt-2">
              <LocationsTree
                locations={locations}
                cameras={cameras}
                selectedLocationId={selectedLocationId}
                onSelect={(id) => setSelectedLocationId(id)}
              />
            </div>
          </Card>
        )}

        <Card className="p-3 flex flex-col min-w-0 border border-border min-h-[600px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row min-w-0 w-full sm:flex-1 items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by camera name, IP, location, zone"
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={status} onChange={(e) => setStatus(e.target.value as CameraStatus | 'ALL')} className="flex-1 sm:flex-none sm:w-[140px]">
                  <option value="ALL">All Status</option>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="WARNING">Warning</option>
                </Select>
                <Select value={cameraType} onChange={(e) => setCameraType(e.target.value as CameraType | 'ALL')} className="flex-1 sm:flex-none sm:w-[140px]">
                  <option value="ALL">All Types</option>
                  <option value="PTZ">PTZ</option>
                  <option value="FIXED">Fixed</option>
                  <option value="DOME">Dome</option>
                  <option value="BULLET">Bullet</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
              <Button 
                variant="ghost" 
                onClick={handleRefreshCameras} 
                title="Refresh camera data"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant={layout === '2x2' ? 'primary' : 'secondary'} onClick={() => setLayout('2x2')} className="text-xs sm:text-sm px-2 sm:px-3">
                <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">2x2</span>
              </Button>
              <Button variant={layout === '3x3' ? 'primary' : 'secondary'} onClick={() => setLayout('3x3')} className="text-xs sm:text-sm px-2 sm:px-3">
                <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">3x3</span>
              </Button>
              <Button variant={layout === '4x4' ? 'primary' : 'secondary'} onClick={() => setLayout('4x4')} className="text-xs sm:text-sm px-2 sm:px-3">
                <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">4x4</span>
              </Button>
              <Button
                variant="ghost"
                onClick={wall ? exitWallMode : enterWallMode}
                title={wall ? 'Exit wall mode' : 'Video wall mode'}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {wall ? <Minimize2 size={14} className="sm:w-4 sm:h-4" /> : <Maximize size={14} className="sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{wall ? 'Exit Wall' : 'Wall'}</span>
              </Button>
            </div>
          </div>

          <div
            {...gridScroll.bind}
            className={
              'mt-3 overflow-auto select-none pb-4 px-1 ' +
              (gridScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab')
            }
            title="Drag to pan the grid"
          >
            <div
              className={
                pageSize === 4
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-1'
                  : pageSize === 6
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 px-1'
                    : pageSize === 9
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 px-1'
                      : pageSize === 16
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 px-1'
                        : pageSize === 25
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 px-1'
                          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 px-1'
              }
            >
              {gridCameras.map((cam) => (
                <CameraTile
                  key={cam.id}
                  camera={cam}
                  location={locationById.get(cam.locationId)}
                  selected={cam.id === selectedCameraId}
                  onSelect={() => {
                    setSelectedCameraId(cam.id)
                    openFullscreen(cam.id)
                  }}
                  onFullscreen={() => openFullscreen(cam.id)}
                  onOpenLive={() => openFullscreen(cam.id)}
                  onSettings={() => navigate('/admin/cameras')}
                  onShowDetails={(rect) => {
                    setPopupCameraId(cam.id)
                    setPopupAnchorRect(rect)
                  }}
                />
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-10 text-center text-sm text-muted">No cameras match the current filters.</div>
            ) : null}
            {filtered.length > 0 ? (
              <div className="mt-3">
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={filtered.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {popupCamera && popupAnchorRect ? (
        <CameraDetailsPopup
          camera={popupCamera}
          location={locationById.get(popupCamera.locationId)}
          anchorRect={popupAnchorRect}
          onClose={() => {
            setPopupCameraId(null)
            setPopupAnchorRect(null)
          }}
        />
      ) : null}

      {fullscreenCam && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden bg-black shadow-2xl">
              <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-b border-slate-700/60 px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-md bg-slate-900/90">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm sm:text-base md:text-lg font-bold text-text">{fullscreenCam.name}</div>
                      <div className="truncate text-xs sm:text-sm font-medium text-muted">
                        {locationById.get(fullscreenCam.locationId)?.name ?? '—'} • {fullscreenCam.zone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40">
                        <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400" />
                        LIVE
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-muted">
                    {streamTypeLabel}
                    {latencyMs != null ? ` • ${latencyMs} ms` : ''}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-surface2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text transition-colors hover:bg-surface2/70"
                    onClick={handleReconnect}
                    title="Reconnect stream"
                  >
                    <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Reconnect</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-surface2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text transition-colors hover:bg-surface2/70"
                    onClick={handleToggleBrowserFullscreen}
                    title="Toggle fullscreen"
                  >
                    {isBrowserFullscreen ? <Minimize2 size={12} className="sm:w-3.5 sm:h-3.5" /> : <Maximize2 size={12} className="sm:w-3.5 sm:h-3.5" />}
                    <span className="hidden sm:inline">{isBrowserFullscreen ? 'Exit' : 'Full'}</span>
                  </button>
                  <Button variant="secondary" onClick={closeFullscreen} className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                    Close
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col bg-black">
                <div className="relative flex-1 overflow-hidden">
                  <div className="absolute inset-0">
                      {fullscreenCam.enabled && (fullscreenCam.whepUrl || fullscreenCam.hlsUrl) ? (
                        fullscreenCam.whepUrl && !whepFailed ? (
                          <WebRtcVideo 
                            key={streamRefreshKey} 
                            src={fullscreenCam.whepUrl} 
                            videoRef={fullscreenVideoRef}
                            onError={() => {
                              console.warn('WHEP failed, falling back to HLS')
                              if (fullscreenCam.hlsUrl) {
                                setWhepFailed(true)
                              }
                            }}
                          />
                        ) : fullscreenCam.hlsUrl ? (
                          <HlsVideo
                            key={streamRefreshKey}
                            src={fullscreenCam.hlsUrl}
                            videoRef={fullscreenVideoRef}
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-slate-200">
                            <div className="max-w-md p-6 text-center">
                              <div className="text-sm font-semibold text-rose-400">WebRTC (WHEP) failed</div>
                              <div className="mt-2 text-xs text-slate-300/90">
                                MediaMTX may not be running or the stream isn't available. Check that MediaMTX is started and the camera source is reachable.
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="grid h-full place-items-center text-slate-200">
                          <div className="max-w-md p-6 text-center">
                            <div className="text-sm font-semibold">
                              {!fullscreenCam.enabled
                                ? 'Camera is disabled.'
                                : fullscreenCam.status === 'OFFLINE'
                                  ? 'Camera is offline.'
                                  : !fullscreenCam.whepUrl && !fullscreenCam.hlsUrl
                                    ? 'No live stream configured for this camera.'
                                    : 'Stream unavailable.'}
                            </div>
                            {!fullscreenCam.whepUrl && !fullscreenCam.hlsUrl && fullscreenCam.enabled ? (
                              <div className="mt-2 text-xs text-slate-300/90">
                                Set a WHEP (WebRTC) URL or HLS URL in Admin → Cameras to enable live playback.
                              </div>
                            ) : null}
                            {!fullscreenCam.whepUrl && !fullscreenCam.hlsUrl && fullscreenCam.enabled ? (
                              <div className="mt-4 flex justify-center">
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    closeFullscreen()
                                    navigate('/admin/cameras')
                                  }}
                                >
                                  Open Admin Cameras
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex-shrink-0 border-t border-slate-700/60 bg-slate-950/90 backdrop-blur-md px-2 sm:px-3 py-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-surface2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text hover:bg-surface2/70"
                          onClick={handleTogglePlay}
                          title="Play / Pause"
                        >
                          {isPlaybackPaused ? <Play size={12} className="sm:w-3.5 sm:h-3.5" /> : <Pause size={12} className="sm:w-3.5 sm:h-3.5" />}
                          <span className="hidden sm:inline">{isPlaybackPaused ? 'Play' : 'Pause'}</span>
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-surface2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text hover:bg-surface2/70"
                          onClick={handleSnapshot}
                          title="Capture snapshot"
                        >
                          <Camera size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Snapshot</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-surface2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text hover:bg-surface2/70"
                          onClick={handleReconnect}
                          title="Reconnect stream"
                        >
                          <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Reconnect</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-surface2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text hover:bg-surface2/70"
                          onClick={() => setIsMuted((prev) => !prev)}
                        >
                          {isMuted ? <VolumeX size={12} className="sm:w-3.5 sm:h-3.5" /> : <Volume2 size={12} className="sm:w-3.5 sm:h-3.5" />}
                          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio'}</span>
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => setVolume(Number(e.currentTarget.value))}
                          className="h-1 w-20 sm:w-24 md:w-32 cursor-pointer flex-shrink-0"
                        />
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(e.target.value)}
                          className="h-7 sm:h-8 md:h-9 rounded-lg border border-border bg-surface2 px-1.5 sm:px-2 text-[10px] sm:text-xs text-text"
                        >
                          <option value="0.5">0.5×</option>
                          <option value="1">1×</option>
                          <option value="1.5">1.5×</option>
                          <option value="2">2×</option>
                        </select>
                      </div>

                      <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
                        <div className="text-[10px] sm:text-xs text-muted whitespace-nowrap">
                          {playbackDuration > 0 ? `${formatSeconds(playbackPosition)} / ${formatSeconds(playbackDuration)}` : 'Live'}
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={0.1}
                          value={playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0}
                          onChange={(e) => handleScrub(Number(e.currentTarget.value))}
                          className="h-1 flex-1 min-w-0 cursor-pointer"
                          disabled={!playbackDuration}
                        />
                      </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  )
}

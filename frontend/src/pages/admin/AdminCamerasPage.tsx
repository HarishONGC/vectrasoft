import { useEffect, useMemo, useState } from 'react'
import { Download, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import type { Camera, CameraType } from '../../api/types'
import {
  getExportCamerasCsvUrl,
  useCameras,
  useCreateCamera,
  useDeleteCamera,
  useImportCameras,
  useLocations,
  useUpdateCamera,
} from '../../api/hooks'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'

function csvEscape(v: unknown) {
  const s = String(v ?? '')
  return `"${s.replaceAll('"', '""')}"`
}

function downloadCsv(filename: string, header: string[], rows: Array<Record<string, unknown>>) {
  const lines = [header.map(csvEscape).join(',')]
  for (const row of rows) {
    lines.push(header.map((h) => csvEscape(row[h])).join(','))
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const importTemplateHeader = [
  'Camera Name',
  'Location Code',
  'Area/Zone',
  'IP Address',
  'RTSP URL',
  'HLS URL',
  'Camera Type',
  'Vendor',
  'Installation Date',
] as const

function buildMumbaiTemplateRows() {
  const host = '10.227.96.70'
  // Password contains '@' so it must be URL-encoded as '%40'.
  const creds = 'admin:EV2002%40123'
  const installationDate = new Date().toISOString().slice(0, 10)

  return Array.from({ length: 10 }, (_v, idx) => {
    const channel = idx + 1
    const pad = String(channel).padStart(2, '0')
    return {
      'Camera Name': `Mumbai-NVR-${pad}`,
      'Location Code': 'MUMBAI',
      'Area/Zone': 'Mumbai (NVR)',
      'IP Address': host,
      'RTSP URL': `rtsp://${creds}@${host}:554/${channel}/2`,
      'HLS URL': `http://localhost:8888/mumbai-${pad}/index.m3u8`,
      'Camera Type': 'FIXED',
      Vendor: 'NVR',
      'Installation Date': installationDate,
    }
  })
}

function buildVijayawadaTemplateRows() {
  const host = '10.205.101.141'
  // Password contains '@' so it must be URL-encoded as '%40'.
  const creds = 'admin:Acss%405995'
  const installationDate = new Date().toISOString().slice(0, 10)

  return Array.from({ length: 50 }, (_v, idx) => {
    const channel = idx + 1
    const pad = String(channel).padStart(2, '0')
    return {
      'Camera Name': `Vijayawada-NVR-${pad}`,
      'Location Code': 'VIJAYAWADA',
      'Area/Zone': 'Vijayawada (NVR)',
      'IP Address': host,
      'RTSP URL': `rtsp://${creds}@${host}:554/${channel}/1`,
      'HLS URL': `http://localhost:8888/vijayawada-${pad}/index.m3u8`,
      'Camera Type': 'FIXED',
      Vendor: 'NVR',
      'Installation Date': installationDate,
    }
  })
}

export function AdminCamerasPage() {
  const [params, setParams] = useSearchParams()
  const { data: locations = [] } = useLocations()
  const { data: cameras = [], isLoading } = useCameras()
  const createCam = useCreateCamera()
  const updateCam = useUpdateCamera()
  const deleteCam = useDeleteCamera()
  const importCams = useImportCameras()

  const [q, setQ] = useState(() => params.get('q') ?? '')
  const [editing, setEditing] = useState<Camera | null>(null)
  const [creating, setCreating] = useState(() => params.get('create') === '1')

  const setCreatingFromUi = (v: boolean) => {
    setCreating(v)
    const next = new URLSearchParams(params)
    if (v) next.set('create', '1')
    else next.delete('create')
    setParams(next, { replace: true })
  }

  const setQFromUi = (nextQ: string) => {
    setQ(nextQ)
    const next = new URLSearchParams(params)
    if (nextQ.trim()) next.set('q', nextQ)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const locById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return cameras
    return cameras.filter((c) => {
      const loc = locById.get(c.locationId)
      return (
        c.name.toLowerCase().includes(query) ||
        c.ipAddress.toLowerCase().includes(query) ||
        c.zone.toLowerCase().includes(query) ||
        c.vendor.toLowerCase().includes(query) ||
        (loc?.name?.toLowerCase().includes(query) ?? false) ||
        (loc?.code?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [cameras, q, locById])

  return (
    <div className="min-h-full p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-lg font-semibold">Cameras</div>
          <div className="text-sm text-muted">Manage camera inventory and RTSP endpoints.</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={getExportCamerasCsvUrl()} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <Download size={16} /> Export CSV
            </Button>
          </a>

          <Button
            variant="secondary"
            onClick={() => downloadCsv('template-mumbai-nvr-10.csv', [...importTemplateHeader], buildMumbaiTemplateRows())}
          >
            <Download size={16} /> Template: Mumbai (10)
          </Button>

          <Button
            variant="secondary"
            onClick={() => downloadCsv('template-vijayawada-nvr-50.csv', [...importTemplateHeader], buildVijayawadaTemplateRows())}
          >
            <Download size={16} /> Template: Vijayawada (50)
          </Button>

          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                importCams.mutate(file)
                e.target.value = ''
              }}
            />
            <Button variant="secondary" disabled={importCams.isPending}>
              <Upload size={16} /> Bulk Import
            </Button>
          </label>

          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Add Camera
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[260px] flex-1">
              <Input value={q} onChange={(e) => setQFromUi(e.target.value)} placeholder="Search cameras (name / IP / location / vendor)" />
            </div>
            <div className="text-xs text-muted tabular-nums">{filtered.length} cameras</div>
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <Card className="p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-border/70">
                <th className="py-2 text-left font-medium">Name</th>
                <th className="py-2 text-left font-medium">Location</th>
                <th className="py-2 text-left font-medium">Zone</th>
                <th className="py-2 text-left font-medium">IP</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Vendor</th>
                <th className="py-2 text-left font-medium">Enabled</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-3 text-muted" colSpan={9}>
                    Loading...
                  </td>
                </tr>
              ) : null}

              {filtered.map((cam) => {
                const loc = locById.get(cam.locationId)
                const tone = cam.status === 'ONLINE' ? 'ok' : cam.status === 'OFFLINE' ? 'bad' : 'warn'
                return (
                  <tr key={cam.id} className="border-b border-border/50">
                    <td className="py-2 font-medium">{cam.name}</td>
                    <td className="py-2 text-muted">{loc?.code ?? '—'}</td>
                    <td className="py-2 text-muted">{cam.zone}</td>
                    <td className="py-2 text-muted tabular-nums">{cam.ipAddress}</td>
                    <td className="py-2 text-muted">{cam.cameraType}</td>
                    <td className="py-2 text-muted">{cam.vendor}</td>
                    <td className="py-2">
                      <label className="inline-flex items-center gap-2 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={cam.enabled}
                          disabled={updateCam.isPending}
                          onChange={async (e) => {
                            const newValue = e.target.checked
                            try {
                              await updateCam.mutateAsync({ id: cam.id, payload: { enabled: newValue } })
                            } catch (err) {
                              console.error('Failed to update camera status', err)
                              const errorMsg = err instanceof Error ? err.message : 'Unknown error'
                              alert(`Failed to toggle camera status:\n${errorMsg}`)
                              // Force re-render by triggering query invalidation
                              // The checkbox will revert to the actual state from the server
                            }
                          }}
                        />
                        {cam.enabled ? 'On' : 'Off'}
                      </label>
                    </td>
                    <td className="py-2">
                      <Badge tone={tone}>{cam.status}</Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="h-9" onClick={() => setEditing(cam)}>
                          <Pencil size={16} /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="h-9"
                          disabled={deleteCam.isPending}
                          onClick={async () => {
                            if (!confirm(`Delete camera ${cam.name}?`)) return
                            try {
                              await deleteCam.mutateAsync(cam.id)
                            } catch (err) {
                              console.error('Failed to delete camera', err)
                              alert('Failed to delete camera. Please try again.')
                            }
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {importCams.data ? (
            <div className="mt-3 text-xs text-muted">
              Imported: {importCams.data.created} created from {importCams.data.rows} rows.
            </div>
          ) : null}
          {importCams.error ? <div className="mt-3 text-xs text-rose-500">Import failed. Check the template.</div> : null}
        </Card>
      </div>

      <Modal open={creating} title="Add Camera" onClose={() => setCreatingFromUi(false)}>
        <CameraForm
          locations={locations}
          onCancel={() => setCreatingFromUi(false)}
          onSubmit={async (payload) => {
            try {
              console.log('Creating camera with payload:', payload)
              await createCam.mutateAsync(payload)
              setCreatingFromUi(false)
            } catch (err) {
              console.error('Failed to create camera', err)
              const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
              alert(`Failed to create camera:\n${errorMsg}`)
            }
          }}
        />
      </Modal>

      <Modal open={!!editing} title="Edit Camera" onClose={() => setEditing(null)}>
        {editing ? (
          <CameraForm
            initial={editing}
            locations={locations}
            onCancel={() => setEditing(null)}
            onSubmit={async (payload) => {
              try {
                console.log('Updating camera with payload:', payload)
                await updateCam.mutateAsync({ id: editing.id, payload })
                setEditing(null)
              } catch (err) {
                console.error('Failed to update camera', err)
                const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
                alert(`Failed to update camera:\n${errorMsg}`)
              }
            }}
          />
        ) : null}
      </Modal>
    </div>
  )
}

function CameraForm({
  initial,
  locations,
  onCancel,
  onSubmit,
}: {
  initial?: Camera
  locations: Array<{ id: string; name: string; code: string }>
  onCancel: () => void
  onSubmit: (payload: Partial<Camera>) => void
}) {
  const normalizeDateForInput = (value?: string) => {
    if (!value) return ''
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toISOString().slice(0, 10)
  }

  const [name, setName] = useState(initial?.name ?? '')
  const [locationId, setLocationId] = useState(initial?.locationId ?? (locations[0]?.id ?? ''))
  const [zone, setZone] = useState(initial?.zone ?? '')
  const [ipAddress, setIpAddress] = useState(initial?.ipAddress ?? '')
  const [rtspUrl, setRtspUrl] = useState(initial?.rtspUrl ?? '')
  const [hlsUrl, setHlsUrl] = useState(initial?.hlsUrl ?? '')
  const [whepUrl, setWhepUrl] = useState(initial?.whepUrl ?? '')
  const [cameraType, setCameraType] = useState<CameraType>((initial?.cameraType ?? 'FIXED') as CameraType)
  const [vendor, setVendor] = useState(initial?.vendor ?? '')
  const [installationDate, setInstallationDate] = useState(() => normalizeDateForInput(initial?.installationDate) || '2025-01-01')
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)

  useEffect(() => {
    if (!locations.length) return
    if (locationId && locations.some((l) => l.id === locationId)) return
    setLocationId(locations[0]?.id ?? '')
  }, [locationId, locations])

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Camera Name" />
        <Select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} — {l.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Area / Zone" />
        <Input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} placeholder="IP Address" />
      </div>

      <Input value={rtspUrl} onChange={(e) => setRtspUrl(e.target.value)} placeholder="RTSP URL" />

      <Input
        value={hlsUrl}
        onChange={(e) => setHlsUrl(e.target.value)}
        placeholder="HLS URL (optional, e.g., http(s)://gateway/stream/index.m3u8)"
      />

      <Input
        value={whepUrl}
        onChange={(e) => setWhepUrl(e.target.value)}
        placeholder="WebRTC (WHEP) URL (optional, e.g., http(s)://gateway/stream/whep)"
      />

      <div className="grid gap-2 md:grid-cols-3">
        <Select value={cameraType} onChange={(e) => setCameraType(e.target.value as CameraType)}>
          <option value="PTZ">PTZ</option>
          <option value="FIXED">Fixed</option>
          <option value="DOME">Dome</option>
          <option value="BULLET">Bullet</option>
        </Select>
        <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor" />
        <Input
          type="date"
          lang="en-GB"
          value={installationDate}
          onChange={(e) => setInstallationDate(e.target.value)}
          placeholder="Installation Date (DD-MM-YYYY)"
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <span className="font-medium">Enabled</span>
        <span className="text-xs text-muted">(disabled cameras are excluded from health checks)</span>
      </label>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button
          variant="primary"
          disabled={!name || !locationId || !zone || !ipAddress || !rtspUrl || !vendor}
          onClick={() => {
            const resolvedLocationId = locationId || locations[0]?.id
            if (!resolvedLocationId) return
            onSubmit({
              name,
              locationId: resolvedLocationId,
              zone,
              ipAddress,
              rtspUrl,
              hlsUrl: hlsUrl || undefined,
              whepUrl: whepUrl || undefined,
              cameraType,
              vendor,
              installationDate,
              enabled,
            })
          }}
        >
          Save
        </Button>
      </div>

      <div className="text-xs text-muted">
        Status is auto-detected by the health monitor (simulated in this demo).
      </div>
    </div>
  )
}

export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'WARNING'

export type CameraType = 'PTZ' | 'FIXED' | 'DOME' | 'BULLET'

export type LocationType = 'PLANT' | 'WAREHOUSE' | 'OFFICE' | 'SITE'
export type SlaPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type Location = {
  id: string
  name: string
  code: string
  region?: string
  locationType?: LocationType
  city?: string
  state?: string
  timezone?: string
  primaryContactName?: string
  primaryContactPhone?: string
  slaPriority?: SlaPriority
  notes?: string
  latitude?: number
  longitude?: number
  active: boolean
  createdAt: string
  archivedAt?: string
  deletedAt?: string
}

export type Camera = {
  id: string
  name: string
  locationId: string
  zone: string
  ipAddress: string
  rtspUrl: string
  hlsUrl?: string
  whepUrl?: string
  codec?: 'H264' | 'H265'
  fps?: number
  resolution?: string
  bitrateKbps?: number
  packetLossPct?: number
  jitterMs?: number
  firmwareVersion?: string
  lastRebootAt?: string
  cameraType: CameraType
  vendor: string
  installationDate: string
  enabled: boolean
  status: CameraStatus
  lastSeenAt?: string
  lastLatencyMs?: number
  signalStrength?: 0 | 1 | 2 | 3 | 4
}

export type HealthSettings = {
  pingIntervalSeconds: number
  timeoutMs: number
  unstableThreshold: number

  offlineTimeoutSeconds: number
  latencyWarnMs: number
  autoRetryCount: number
  escalationMinutes: number
}

export type AuditEvent = {
  id: string
  actor: string
  action:
    | 'LOCATION_CREATE'
    | 'LOCATION_UPDATE'
    | 'LOCATION_DELETE'
    | 'LOCATION_RECOVER'
    | 'CAMERA_CREATE'
    | 'CAMERA_UPDATE'
    | 'CAMERA_DELETE'
    | 'CAMERA_IMPORT'
    | 'SETTINGS_UPDATE'
  entityId?: string
  entityName?: string
  details?: Record<string, unknown>
  at: string
}

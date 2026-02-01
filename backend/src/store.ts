import type { Camera, HealthSettings, Location } from './models'

const nowIso = () => new Date().toISOString()

export class InMemoryStore {
  public locations: Location[] = []
  public cameras: Camera[] = []
  public healthSettings: HealthSettings = {
    pingIntervalSeconds: 5,
    timeoutMs: 1200,
    unstableThreshold: 2,
    offlineTimeoutSeconds: 20,
    latencyWarnMs: 250,
    autoRetryCount: 2,
    escalationMinutes: 10,
  }

  constructor(_seedData = true) {}

  async hydrateFromMysql(config: MysqlConfig) {
    const { createConnection } = await import('mysql2/promise')

    const toIso = (value: unknown) => {
      if (!value) return undefined
      const d = value instanceof Date ? value : new Date(value as any)
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
    }

    const toNum = (value: unknown) => (value == null || value === '' ? undefined : Number(value))
    const toBool = (value: unknown) => value === true || value === 1 || value === '1'
    const toSignal = (value: unknown) => {
      const n = toNum(value)
      if (n == null) return undefined
      if (n <= 0) return 0 as const
      if (n === 1) return 1 as const
      if (n === 2) return 2 as const
      if (n === 3) return 3 as const
      return 4 as const
    }

    const conn = await createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      ssl: config.ssl,
    })

    try {
      const [locationRows] = await conn.execute('SELECT * FROM locations')
      const [cameraRows] = await conn.execute('SELECT * FROM cameras')
      const [healthRows] = await conn.execute('SELECT * FROM health_settings')

      this.locations = (locationRows as any[]).map((row) => ({
        id: String(row.id),
        name: String(row.name),
        code: String(row.code),
        region: row.region ?? undefined,
        locationType: row.locationType ?? undefined,
        city: row.city ?? undefined,
        state: row.state ?? undefined,
        timezone: row.timezone ?? undefined,
        primaryContactName: row.primaryContactName ?? undefined,
        primaryContactPhone: row.primaryContactPhone ?? undefined,
        slaPriority: row.slaPriority ?? undefined,
        notes: row.notes ?? undefined,
        latitude: row.latitude != null ? Number(row.latitude) : undefined,
        longitude: row.longitude != null ? Number(row.longitude) : undefined,
        active: toBool(row.active),
        createdAt: toIso(row.createdAt) ?? nowIso(),
        archivedAt: toIso(row.archivedAt),
        deletedAt: toIso(row.deletedAt),
      }))

      this.cameras = (cameraRows as any[]).map((row) => ({
        id: String(row.id),
        name: String(row.name),
        locationId: String(row.locationId),
        zone: String(row.zone),
        ipAddress: String(row.ipAddress),
        rtspUrl: String(row.rtspUrl),
        hlsUrl: row.hlsUrl ?? undefined,
        whepUrl: row.whepUrl ?? undefined,
        codec: row.codec ?? undefined,
        fps: toNum(row.fps),
        resolution: row.resolution ?? undefined,
        bitrateKbps: toNum(row.bitrateKbps),
        packetLossPct: row.packetLossPct != null ? Number(row.packetLossPct) : undefined,
        jitterMs: toNum(row.jitterMs),
        firmwareVersion: row.firmwareVersion ?? undefined,
        lastRebootAt: toIso(row.lastRebootAt),
        cameraType: row.cameraType,
        vendor: String(row.vendor),
        installationDate: String(row.installationDate),
        enabled: toBool(row.enabled),
        status: row.status,
        lastSeenAt: toIso(row.lastSeenAt),
        lastLatencyMs: toNum(row.lastLatencyMs),
        signalStrength: toSignal(row.signalStrength),
      }))

      const health = (healthRows as any[])[0]
      if (health) {
        this.healthSettings = {
          pingIntervalSeconds: Number(health.pingIntervalSeconds),
          timeoutMs: Number(health.timeoutMs),
          unstableThreshold: Number(health.unstableThreshold),
          offlineTimeoutSeconds: Number(health.offlineTimeoutSeconds),
          latencyWarnMs: Number(health.latencyWarnMs),
          autoRetryCount: Number(health.autoRetryCount),
          escalationMinutes: Number(health.escalationMinutes),
        }
      }
    } finally {
      await conn.end()
    }
  }
}

export type MysqlConfig = {
  host: string
  user: string
  password?: string
  database: string
  port?: number
  ssl?: any
}

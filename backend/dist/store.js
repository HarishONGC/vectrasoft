"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStore = void 0;
const nowIso = () => new Date().toISOString();
class InMemoryStore {
    locations = [];
    cameras = [];
    healthSettings = {
        pingIntervalSeconds: 5,
        timeoutMs: 1200,
        unstableThreshold: 2,
        offlineTimeoutSeconds: 20,
        latencyWarnMs: 250,
        autoRetryCount: 2,
        escalationMinutes: 10,
    };
    constructor(_seedData = true) { }
    async hydrateFromMysql(config) {
        const { createConnection } = await Promise.resolve().then(() => __importStar(require('mysql2/promise')));
        const toIso = (value) => {
            if (!value)
                return undefined;
            const d = value instanceof Date ? value : new Date(value);
            return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
        };
        const toNum = (value) => (value == null || value === '' ? undefined : Number(value));
        const toBool = (value) => value === true || value === 1 || value === '1';
        const toSignal = (value) => {
            const n = toNum(value);
            if (n == null)
                return undefined;
            if (n <= 0)
                return 0;
            if (n === 1)
                return 1;
            if (n === 2)
                return 2;
            if (n === 3)
                return 3;
            return 4;
        };
        const conn = await createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port,
            ssl: config.ssl,
        });
        try {
            const [locationRows] = await conn.execute('SELECT * FROM locations');
            const [cameraRows] = await conn.execute('SELECT * FROM cameras');
            const [healthRows] = await conn.execute('SELECT * FROM health_settings');
            this.locations = locationRows.map((row) => ({
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
            }));
            this.cameras = cameraRows.map((row) => ({
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
            }));
            const health = healthRows[0];
            if (health) {
                this.healthSettings = {
                    pingIntervalSeconds: Number(health.pingIntervalSeconds),
                    timeoutMs: Number(health.timeoutMs),
                    unstableThreshold: Number(health.unstableThreshold),
                    offlineTimeoutSeconds: Number(health.offlineTimeoutSeconds),
                    latencyWarnMs: Number(health.latencyWarnMs),
                    autoRetryCount: Number(health.autoRetryCount),
                    escalationMinutes: Number(health.escalationMinutes),
                };
            }
        }
        finally {
            await conn.end();
        }
    }
}
exports.InMemoryStore = InMemoryStore;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoutes = buildRoutes;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const xlsx_1 = __importDefault(require("xlsx"));
const crypto_1 = require("crypto");
const net_1 = __importDefault(require("net"));
const validators_1 = require("./validators");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const DEFAULT_HEALTH_SETTINGS = {
    pingIntervalSeconds: 5,
    timeoutMs: 1200,
    unstableThreshold: 2,
    offlineTimeoutSeconds: 20,
    latencyWarnMs: 250,
    autoRetryCount: 2,
    escalationMinutes: 10,
};
const authUserFromReq = (req) => req.authUser;
const requireAdmin = (req, res) => {
    const user = authUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return false;
    }
    return true;
};
const actorFromReq = (req) => {
    const user = authUserFromReq(req);
    return (req.header('x-actor') ?? user?.email ?? 'operator').toString();
};
const reqIp = (req) => {
    const forwarded = (req.header('x-forwarded-for') ?? '').toString();
    if (forwarded)
        return forwarded.split(',')[0]?.trim() || undefined;
    return req.ip;
};
function normalizeHlsUrlForLocalGateway(hlsUrl) {
    if (!hlsUrl)
        return undefined;
    const trimmed = hlsUrl.trim();
    if (!trimmed)
        return undefined;
    try {
        const u = new URL(trimmed);
        const hostIsLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
        if (!hostIsLocal || u.port !== '8888')
            return trimmed;
        // MediaMTX paths are case-sensitive; normalize to lowercase.
        const normalizedPath = u.pathname.toLowerCase();
        if (normalizedPath.endsWith('.m3u8')) {
            u.pathname = normalizedPath;
            return u.toString();
        }
        // If a path is provided without the default playlist, append it.
        u.pathname = normalizedPath.replace(/\/+$/, '') + '/index.m3u8';
        return u.toString();
    }
    catch {
        return trimmed;
    }
}
function normalizeWhepUrlForLocalGateway(whepUrl) {
    if (!whepUrl)
        return undefined;
    const trimmed = whepUrl.trim();
    if (!trimmed)
        return undefined;
    try {
        const u = new URL(trimmed);
        const hostIsLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
        if (!hostIsLocal || u.port !== '8889')
            return trimmed;
        // MediaMTX paths are case-sensitive; normalize to lowercase.
        u.pathname = u.pathname.toLowerCase();
        // Ensure /whep suffix.
        if (!u.pathname.endsWith('/whep')) {
            u.pathname = u.pathname.replace(/\/+$/, '') + '/whep';
        }
        return u.toString();
    }
    catch {
        return trimmed;
    }
}
async function tcpProbe(host, port, timeoutMs) {
    const startedAt = Date.now();
    return await new Promise((resolve) => {
        const socket = new net_1.default.Socket();
        const done = (result) => {
            try {
                socket.removeAllListeners();
                socket.destroy();
            }
            catch { }
            resolve(result);
        };
        socket.setTimeout(timeoutMs);
        socket.once('connect', () => done({ ok: true, ms: Date.now() - startedAt }));
        socket.once('timeout', () => done({ ok: false, ms: Date.now() - startedAt, error: `Timeout after ${timeoutMs}ms` }));
        socket.once('error', (err) => done({ ok: false, ms: Date.now() - startedAt, error: err.message }));
        socket.connect(port, host);
    });
}
async function rtspOptionsProbe(rtspUrl, timeoutMs) {
    const startedAt = Date.now();
    let host = '';
    let port = 554;
    try {
        const u = new URL(rtspUrl);
        host = u.hostname;
        if (u.port)
            port = Number(u.port);
    }
    catch {
        return { ok: false, ms: 0, error: 'Invalid RTSP URL' };
    }
    return await new Promise((resolve) => {
        const socket = new net_1.default.Socket();
        let buffer = '';
        const done = (result) => {
            try {
                socket.removeAllListeners();
                socket.destroy();
            }
            catch { }
            resolve(result);
        };
        socket.setTimeout(timeoutMs);
        socket.once('connect', () => {
            // Minimal RTSP OPTIONS. Many NVRs respond with 200 or 401 (Unauthorized) if reachable.
            const req = `OPTIONS ${rtspUrl} RTSP/1.0\r\nCSeq: 1\r\nUser-Agent: CCTV-Dashboard\r\n\r\n`;
            socket.write(req);
        });
        socket.once('timeout', () => done({ ok: false, ms: Date.now() - startedAt, error: `Timeout after ${timeoutMs}ms` }));
        socket.once('error', (err) => done({ ok: false, ms: Date.now() - startedAt, error: err.message }));
        socket.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
            // RTSP header end.
            if (!buffer.includes('\r\n\r\n'))
                return;
            const firstLine = buffer.split('\r\n')[0] ?? '';
            const m = firstLine.match(/^RTSP\/(\d+\.\d+)\s+(\d{3})\s*(.*)$/);
            if (!m)
                return done({ ok: false, ms: Date.now() - startedAt, error: 'No RTSP response' });
            const code = Number(m[2]);
            const text = (m[3] ?? '').trim();
            if (code === 200 || code === 401)
                return done({ ok: true, ms: Date.now() - startedAt });
            return done({ ok: false, ms: Date.now() - startedAt, error: `RTSP ${code}${text ? ` ${text}` : ''}` });
        });
        socket.connect(port, host);
    });
}
async function fetchProbe(url, timeoutMs) {
    const startedAt = Date.now();
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
        // Use GET since many HLS servers don't reliably support HEAD.
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                // Keep it light; many servers ignore Range, but it helps when supported.
                Range: 'bytes=0-2048',
            },
            signal: controller.signal,
        });
        // Read a small amount to confirm it's not an HTML error page.
        const text = await res.text();
        const snippet = text.slice(0, 200);
        const looksLikeM3u8 = snippet.includes('#EXTM3U');
        return {
            ok: res.ok && looksLikeM3u8,
            status: res.status,
            ms: Date.now() - startedAt,
            contentType: res.headers.get('content-type') ?? undefined,
            looksLikeM3u8,
        };
    }
    catch (e) {
        const msg = e?.name === 'AbortError' ? `Timeout after ${timeoutMs}ms` : String(e?.message ?? e);
        return { ok: false, status: undefined, ms: Date.now() - startedAt, error: msg };
    }
    finally {
        clearTimeout(t);
    }
}
function isLocalMtxHls(url) {
    try {
        const u = new URL(url);
        const hostIsLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
        return hostIsLocal && u.port === '8888';
    }
    catch {
        return false;
    }
}
const toIso = (value) => {
    if (!value)
        return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};
const nowIso = () => new Date().toISOString();
const toNum = (value) => (value == null || value === '' ? undefined : Number(value));
const toBool = (value) => value === true || value === 1 || value === '1';
async function dbRows(db, sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows;
}
async function loadAccessLocationIds(db, userId) {
    const rows = await dbRows(db, 'SELECT locationId FROM user_location_access WHERE userId = ? AND canView = 1', [userId]);
    return rows.map((row) => String(row.locationId));
}
function requireUser(db) {
    const openPaths = new Set(['/auth/login', '/system']);
    return async (req, res, next) => {
        if (openPaths.has(req.path))
            return next();
        const userId = (req.header('x-user-id') ?? '').toString().trim();
        if (!userId)
            return res.status(401).json({ error: 'Unauthenticated' });
        try {
            const rows = await dbRows(db, 'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [userId]);
            const user = rows[0];
            if (!user)
                return res.status(401).json({ error: 'Invalid user' });
            req.authUser = {
                id: String(user.id),
                name: String(user.name),
                email: String(user.email),
                role: user.role,
            };
            return next();
        }
        catch (err) {
            return res.status(500).json({ error: 'Authentication failed' });
        }
    };
}
async function logAudit(db, payload) {
    await db.execute('INSERT INTO audit_events (id, actor, action, entityId, entityName, details, at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW())', [payload.actor, payload.action, payload.entityId ?? null, payload.entityName ?? null, payload.details ? JSON.stringify(payload.details) : null]);
}
function buildRoutes(db) {
    const router = express_1.default.Router();
    router.use(requireUser(db));
    router.post('/auth/login', async (req, res) => {
        const email = String(req.body?.email ?? '').trim().toLowerCase();
        const password = String(req.body?.password ?? '');
        if (!email || !password)
            return res.status(400).json({ error: 'Missing credentials' });
        const rows = await dbRows(db, 'SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [email]);
        const user = rows[0];
        if (!user || String(user.password_hash ?? '') !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const accessRows = await dbRows(db, 'SELECT locationId, canView, canControl FROM user_location_access WHERE userId = ? ORDER BY locationId', [user.id]);
        res.json({
            id: String(user.id),
            name: String(user.name),
            email: String(user.email),
            role: user.role,
            locationAccess: accessRows.map((row) => ({
                locationId: String(row.locationId),
                canView: toBool(row.canView),
                canControl: toBool(row.canControl),
            })),
        });
    });
    router.get('/admin/users', async (req, res) => {
        if (!requireAdmin(req, res))
            return;
        const rows = await dbRows(db, 'SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
        res.json(rows.map((row) => ({
            id: String(row.id),
            name: String(row.name),
            email: String(row.email),
            role: row.role,
            createdAt: toIso(row.createdAt) ?? nowIso(),
        })));
    });
    router.post('/admin/users', async (req, res) => {
        if (!requireAdmin(req, res))
            return;
        const name = String(req.body?.name ?? '').trim();
        const email = String(req.body?.email ?? '').trim().toLowerCase();
        const password = String(req.body?.password ?? '').trim();
        const role = String(req.body?.role ?? 'VIEWER').toUpperCase();
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Missing fields' });
        if (!['ADMIN', 'OPERATOR', 'VIEWER'].includes(role))
            return res.status(400).json({ error: 'Invalid role' });
        const id = (0, crypto_1.randomUUID)();
        await db.execute('INSERT INTO users (id, name, email, password_hash, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW())', [id, name, email, password, role]);
        res.status(201).json({ id, name, email, role, createdAt: nowIso() });
    });
    router.put('/admin/users/:id', async (req, res) => {
        if (!requireAdmin(req, res))
            return;
        const id = String(req.params.id);
        const patch = {};
        if (req.body?.name != null)
            patch.name = String(req.body.name).trim();
        if (req.body?.email != null)
            patch.email = String(req.body.email).trim().toLowerCase();
        if (req.body?.password != null && String(req.body.password).trim())
            patch.password_hash = String(req.body.password).trim();
        if (req.body?.role != null)
            patch.role = String(req.body.role).toUpperCase();
        const fields = Object.keys(patch);
        if (fields.length === 0)
            return res.status(400).json({ error: 'No changes provided' });
        const setSql = fields.map((k) => `${k} = ?`).join(', ');
        const values = fields.map((k) => patch[k]);
        await db.execute(`UPDATE users SET ${setSql} WHERE id = ?`, [...values, id]);
        const rows = await dbRows(db, 'SELECT id, name, email, role, createdAt FROM users WHERE id = ? LIMIT 1', [id]);
        const user = rows[0];
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({
            id: String(user.id),
            name: String(user.name),
            email: String(user.email),
            role: user.role,
            createdAt: toIso(user.createdAt) ?? nowIso(),
        });
    });
    router.delete('/admin/users/:id', async (req, res) => {
        if (!requireAdmin(req, res))
            return;
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(204).send();
    });
    router.get('/admin/users/:id/access', async (req, res) => {
        if (!requireAdmin(req, res))
            return;
        const rows = await dbRows(db, 'SELECT locationId, canView, canControl FROM user_location_access WHERE userId = ? ORDER BY locationId', [req.params.id]);
        res.json(rows.map((row) => ({
            locationId: String(row.locationId),
            canView: toBool(row.canView),
            canControl: toBool(row.canControl),
        })));
    });
    router.put('/admin/users/:id/access', async (req, res) => {
        if (!requireAdmin(req, res))
            return;
        const access = Array.isArray(req.body?.access) ? req.body.access : [];
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.execute('DELETE FROM user_location_access WHERE userId = ?', [req.params.id]);
            for (const row of access) {
                if (!row?.locationId)
                    continue;
                await conn.execute('INSERT INTO user_location_access (userId, locationId, canView, canControl, createdAt) VALUES (?, ?, ?, ?, NOW())', [
                    req.params.id,
                    String(row.locationId),
                    row.canView ? 1 : 0,
                    row.canControl ? 1 : 0,
                ]);
            }
            await conn.commit();
        }
        catch (err) {
            await conn.rollback();
            return res.status(500).json({ error: 'Failed to update access' });
        }
        finally {
            conn.release();
        }
        res.status(204).send();
    });
    // Debug helper: checks if the backend machine can reach the camera's RTSP port and fetch the camera's HLS manifest.
    router.get('/debug/cameras/:id/stream-check', async (req, res) => {
        const user = authUserFromReq(req);
        const cams = await dbRows(db, user?.role === 'ADMIN'
            ? 'SELECT * FROM cameras WHERE id = ? LIMIT 1'
            : `SELECT c.*
           FROM cameras c
           INNER JOIN locations l ON l.id = c.locationId
           INNER JOIN user_location_access ula ON ula.locationId = l.id AND ula.userId = ? AND ula.canView = 1
           WHERE c.id = ? LIMIT 1`, user?.role === 'ADMIN' ? [req.params.id] : [user?.id ?? '', req.params.id]);
        const cam = cams[0];
        if (!cam)
            return res.status(404).json({ error: 'Camera not found' });
        let rtspHost;
        let rtspPort = 554;
        try {
            const u = new URL(String(cam.rtspUrl));
            rtspHost = u.hostname;
            if (u.port)
                rtspPort = Number(u.port);
        }
        catch {
            // Fall back to IP address field if the RTSP URL is not parseable.
            rtspHost = cam.ipAddress;
        }
        const rtsp = rtspHost
            ? await rtspOptionsProbe(String(cam.rtspUrl), 3500)
            : { ok: false, ms: 0, error: 'Missing RTSP host' };
        const hlsUrl = cam.hlsUrl ? normalizeHlsUrlForLocalGateway(String(cam.hlsUrl)) : undefined;
        const hlsTimeoutMs = hlsUrl && isLocalMtxHls(hlsUrl) ? 8000 : 2500;
        const hls = hlsUrl ? await fetchProbe(hlsUrl, hlsTimeoutMs) : { ok: false, ms: 0, error: 'No HLS URL configured' };
        res.json({
            cameraId: cam.id,
            at: new Date().toISOString(),
            rtsp: { host: rtspHost, port: rtspPort, ...rtsp },
            hls: { url: hlsUrl, ...hls },
        });
    });
    router.get('/system', (_req, res) => {
        res.json({
            name: 'Centralized CCTV Monitoring System',
            uptimeSeconds: Math.floor(process.uptime()),
            serverTime: new Date().toISOString(),
        });
    });
    router.get('/health/settings', async (_req, res) => {
        const rows = await dbRows(db, 'SELECT * FROM health_settings LIMIT 1');
        if (!rows[0]) {
            await db.execute('INSERT INTO health_settings (id, pingIntervalSeconds, timeoutMs, unstableThreshold, offlineTimeoutSeconds, latencyWarnMs, autoRetryCount, escalationMinutes) VALUES (1, ?, ?, ?, ?, ?, ?, ?)', [
                DEFAULT_HEALTH_SETTINGS.pingIntervalSeconds,
                DEFAULT_HEALTH_SETTINGS.timeoutMs,
                DEFAULT_HEALTH_SETTINGS.unstableThreshold,
                DEFAULT_HEALTH_SETTINGS.offlineTimeoutSeconds,
                DEFAULT_HEALTH_SETTINGS.latencyWarnMs,
                DEFAULT_HEALTH_SETTINGS.autoRetryCount,
                DEFAULT_HEALTH_SETTINGS.escalationMinutes,
            ]);
            return res.json(DEFAULT_HEALTH_SETTINGS);
        }
        const health = rows[0];
        res.json({
            pingIntervalSeconds: Number(health.pingIntervalSeconds),
            timeoutMs: Number(health.timeoutMs),
            unstableThreshold: Number(health.unstableThreshold),
            offlineTimeoutSeconds: Number(health.offlineTimeoutSeconds),
            latencyWarnMs: Number(health.latencyWarnMs),
            autoRetryCount: Number(health.autoRetryCount),
            escalationMinutes: Number(health.escalationMinutes),
        });
    });
    router.put('/health/settings', async (req, res) => {
        const actor = actorFromReq(req);
        const parsed = validators_1.healthSettingsSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        await db.execute('INSERT INTO health_settings (id, pingIntervalSeconds, timeoutMs, unstableThreshold, offlineTimeoutSeconds, latencyWarnMs, autoRetryCount, escalationMinutes) VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE pingIntervalSeconds=VALUES(pingIntervalSeconds), timeoutMs=VALUES(timeoutMs), unstableThreshold=VALUES(unstableThreshold), offlineTimeoutSeconds=VALUES(offlineTimeoutSeconds), latencyWarnMs=VALUES(latencyWarnMs), autoRetryCount=VALUES(autoRetryCount), escalationMinutes=VALUES(escalationMinutes)', [
            parsed.data.pingIntervalSeconds,
            parsed.data.timeoutMs,
            parsed.data.unstableThreshold,
            parsed.data.offlineTimeoutSeconds,
            parsed.data.latencyWarnMs,
            parsed.data.autoRetryCount,
            parsed.data.escalationMinutes,
        ]);
        await logAudit(db, { actor, action: 'SETTINGS_UPDATE', entityName: 'HealthSettings', details: { ...parsed.data, ip: reqIp(req) } });
        res.json(parsed.data);
    });
    router.get('/summary', async (_req, res) => {
        const user = authUserFromReq(_req);
        const cameraCounts = await dbRows(db, user?.role === 'ADMIN'
            ? `SELECT
             COUNT(*) AS total,
             SUM(status = 'ONLINE') AS online,
             SUM(status = 'OFFLINE') AS offline,
             SUM(status = 'WARNING') AS warning
           FROM cameras c
           INNER JOIN locations l ON l.id = c.locationId
           WHERE l.deletedAt IS NULL`
            : `SELECT
             COUNT(*) AS total,
             SUM(status = 'ONLINE') AS online,
             SUM(status = 'OFFLINE') AS offline,
             SUM(status = 'WARNING') AS warning
           FROM cameras c
           INNER JOIN locations l ON l.id = c.locationId
           INNER JOIN user_location_access ula ON ula.locationId = l.id AND ula.userId = ? AND ula.canView = 1
           WHERE l.deletedAt IS NULL`, user?.role === 'ADMIN' ? [] : [user?.id ?? '']);
        const locationCounts = await dbRows(db, user?.role === 'ADMIN'
            ? 'SELECT COUNT(*) AS locationsActive FROM locations WHERE active = 1 AND deletedAt IS NULL'
            : `SELECT COUNT(*) AS locationsActive
           FROM locations l
           INNER JOIN user_location_access ula ON ula.locationId = l.id AND ula.userId = ? AND ula.canView = 1
           WHERE l.active = 1 AND l.deletedAt IS NULL`, user?.role === 'ADMIN' ? [] : [user?.id ?? '']);
        const counts = cameraCounts[0] ?? { total: 0, online: 0, offline: 0, warning: 0 };
        const locationsActive = locationCounts[0]?.locationsActive ?? 0;
        res.json({
            total: Number(counts.total ?? 0),
            online: Number(counts.online ?? 0),
            offline: Number(counts.offline ?? 0),
            warning: Number(counts.warning ?? 0),
            locationsActive: Number(locationsActive ?? 0),
        });
    });
    router.get('/locations', async (_req, res) => {
        const includeDeleted = String(_req.query.includeDeleted ?? '') === '1';
        const user = authUserFromReq(_req);
        const rows = await dbRows(db, user?.role === 'ADMIN'
            ? includeDeleted
                ? 'SELECT * FROM locations'
                : 'SELECT * FROM locations WHERE deletedAt IS NULL'
            : `SELECT l.*
           FROM locations l
           INNER JOIN user_location_access ula ON ula.locationId = l.id AND ula.userId = ? AND ula.canView = 1
           WHERE l.deletedAt IS NULL`, user?.role === 'ADMIN' ? [] : [user?.id ?? '']);
        res.json(rows.map((row) => ({
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
        })));
    });
    router.post('/locations', async (req, res) => {
        const actor = actorFromReq(req);
        const parsed = validators_1.locationCreateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const codeKey = parsed.data.code.trim().toUpperCase();
        const nameKey = parsed.data.name.trim().toLowerCase();
        const dupRows = await dbRows(db, 'SELECT * FROM locations WHERE deletedAt IS NULL AND (UPPER(code) = ? OR LOWER(name) = ?) LIMIT 1', [codeKey, nameKey]);
        const dup = dupRows[0];
        if (dup) {
            return res.status(409).json({
                error: {
                    message: 'Duplicate location detected',
                    fields: {
                        code: String(dup.code).trim().toUpperCase() === codeKey ? 'Code already exists' : undefined,
                        name: String(dup.name).trim().toLowerCase() === nameKey ? 'Name already exists' : undefined,
                    },
                },
            });
        }
        const id = (0, crypto_1.randomUUID)();
        const createdAt = new Date().toISOString();
        await db.execute('INSERT INTO locations (id, name, code, region, locationType, city, state, timezone, primaryContactName, primaryContactPhone, slaPriority, notes, latitude, longitude, active, createdAt, archivedAt, deletedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            id,
            parsed.data.name,
            parsed.data.code,
            parsed.data.region ?? null,
            parsed.data.locationType ?? null,
            parsed.data.city ?? null,
            parsed.data.state ?? null,
            parsed.data.timezone ?? null,
            parsed.data.primaryContactName ?? null,
            parsed.data.primaryContactPhone ?? null,
            parsed.data.slaPriority ?? null,
            parsed.data.notes ?? null,
            parsed.data.latitude ?? null,
            parsed.data.longitude ?? null,
            parsed.data.active ?? true,
            createdAt,
            parsed.data.archivedAt ?? null,
            parsed.data.deletedAt ?? null,
        ]);
        const loc = { id, createdAt, ...parsed.data };
        await logAudit(db, { actor, action: 'LOCATION_CREATE', entityId: id, entityName: parsed.data.name, details: { ...loc, ip: reqIp(req) } });
        res.status(201).json(loc);
    });
    router.put('/locations/:id', async (req, res) => {
        const actor = actorFromReq(req);
        const parsed = validators_1.locationUpdateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const existing = await dbRows(db, 'SELECT * FROM locations WHERE id = ? LIMIT 1', [req.params.id]);
        if (!existing[0])
            return res.status(404).json({ error: 'Location not found' });
        if (parsed.data.code || parsed.data.name) {
            const nextCode = (parsed.data.code ?? existing[0].code).trim().toUpperCase();
            const nextName = (parsed.data.name ?? existing[0].name).trim().toLowerCase();
            const dupRows = await dbRows(db, 'SELECT * FROM locations WHERE id <> ? AND deletedAt IS NULL AND (UPPER(code) = ? OR LOWER(name) = ?) LIMIT 1', [req.params.id, nextCode, nextName]);
            const dup = dupRows[0];
            if (dup) {
                return res.status(409).json({
                    error: {
                        message: 'Duplicate location detected',
                        fields: {
                            code: String(dup.code).trim().toUpperCase() === nextCode ? 'Code already exists' : undefined,
                            name: String(dup.name).trim().toLowerCase() === nextName ? 'Name already exists' : undefined,
                        },
                    },
                });
            }
        }
        const fields = Object.keys(parsed.data);
        if (fields.length > 0) {
            const setSql = fields.map((k) => `${k} = ?`).join(', ');
            const values = fields.map((k) => parsed.data[k]);
            await db.execute(`UPDATE locations SET ${setSql} WHERE id = ?`, [...values, req.params.id]);
        }
        const updated = (await dbRows(db, 'SELECT * FROM locations WHERE id = ? LIMIT 1', [req.params.id]))[0];
        await logAudit(db, {
            actor,
            action: 'LOCATION_UPDATE',
            entityId: req.params.id,
            entityName: updated?.name ?? existing[0].name,
            details: { ...parsed.data, ip: reqIp(req) },
        });
        res.json({
            id: String(updated.id),
            name: String(updated.name),
            code: String(updated.code),
            region: updated.region ?? undefined,
            locationType: updated.locationType ?? undefined,
            city: updated.city ?? undefined,
            state: updated.state ?? undefined,
            timezone: updated.timezone ?? undefined,
            primaryContactName: updated.primaryContactName ?? undefined,
            primaryContactPhone: updated.primaryContactPhone ?? undefined,
            slaPriority: updated.slaPriority ?? undefined,
            notes: updated.notes ?? undefined,
            latitude: updated.latitude != null ? Number(updated.latitude) : undefined,
            longitude: updated.longitude != null ? Number(updated.longitude) : undefined,
            active: toBool(updated.active),
            createdAt: toIso(updated.createdAt) ?? nowIso(),
            archivedAt: toIso(updated.archivedAt),
            deletedAt: toIso(updated.deletedAt),
        });
    });
    router.delete('/locations/:id', async (req, res) => {
        const actor = actorFromReq(req);
        const existing = await dbRows(db, 'SELECT * FROM locations WHERE id = ? LIMIT 1', [req.params.id]);
        if (!existing[0])
            return res.status(404).json({ error: 'Location not found' });
        await db.execute('UPDATE locations SET deletedAt = NOW(), active = 0 WHERE id = ?', [req.params.id]);
        await db.execute('UPDATE cameras SET enabled = 0 WHERE locationId = ?', [req.params.id]);
        await logAudit(db, {
            actor,
            action: 'LOCATION_DELETE',
            entityId: req.params.id,
            entityName: existing[0].name,
            details: { ip: reqIp(req) },
        });
        res.status(204).send();
    });
    router.post('/locations/:id/recover', async (req, res) => {
        const actor = actorFromReq(req);
        const existing = await dbRows(db, 'SELECT * FROM locations WHERE id = ? LIMIT 1', [req.params.id]);
        if (!existing[0])
            return res.status(404).json({ error: 'Location not found' });
        await db.execute('UPDATE locations SET deletedAt = NULL, active = 1 WHERE id = ?', [req.params.id]);
        const updated = (await dbRows(db, 'SELECT * FROM locations WHERE id = ? LIMIT 1', [req.params.id]))[0];
        await logAudit(db, {
            actor,
            action: 'LOCATION_RECOVER',
            entityId: req.params.id,
            entityName: updated?.name ?? existing[0].name,
            details: { ip: reqIp(req) },
        });
        res.json({
            id: String(updated.id),
            name: String(updated.name),
            code: String(updated.code),
            region: updated.region ?? undefined,
            locationType: updated.locationType ?? undefined,
            city: updated.city ?? undefined,
            state: updated.state ?? undefined,
            timezone: updated.timezone ?? undefined,
            primaryContactName: updated.primaryContactName ?? undefined,
            primaryContactPhone: updated.primaryContactPhone ?? undefined,
            slaPriority: updated.slaPriority ?? undefined,
            notes: updated.notes ?? undefined,
            latitude: updated.latitude != null ? Number(updated.latitude) : undefined,
            longitude: updated.longitude != null ? Number(updated.longitude) : undefined,
            active: toBool(updated.active),
            createdAt: toIso(updated.createdAt) ?? nowIso(),
            archivedAt: toIso(updated.archivedAt),
            deletedAt: toIso(updated.deletedAt),
        });
    });
    function rewriteStreamUrlForOrigin(streamUrl, req) {
        if (!streamUrl)
            return undefined;
        try {
            const urlObj = new URL(streamUrl);
            // Get the client's host - the one they're actually accessing from
            const clientHostHeader = req.headers['x-forwarded-host'];
            const clientHost = typeof clientHostHeader === 'string' ? clientHostHeader : req.hostname;
            // For port 8888 (HLS) or 8889 (WHEP), rewrite to use the client's actual host
            // This handles:
            // - localhost -> client's IP
            // - 127.0.0.1 -> client's IP
            // - Any tunnel/external IP -> client's local IP
            if (urlObj.port === '8888' || urlObj.port === '8889') {
                // Replace hostname with what the client is actually using to access the backend
                urlObj.hostname = clientHost || '127.0.0.1';
                return urlObj.toString();
            }
            return streamUrl;
        }
        catch {
            return streamUrl;
        }
    }
    router.get('/cameras', async (_req, res) => {
        const includeDeleted = String(_req.query.includeDeleted ?? '') === '1';
        const user = authUserFromReq(_req);
        const rows = user?.role === 'ADMIN'
            ? includeDeleted
                ? await dbRows(db, 'SELECT * FROM cameras')
                : await dbRows(db, 'SELECT c.* FROM cameras c INNER JOIN locations l ON l.id = c.locationId WHERE l.deletedAt IS NULL')
            : await dbRows(db, `SELECT c.*
           FROM cameras c
           INNER JOIN locations l ON l.id = c.locationId
           INNER JOIN user_location_access ula ON ula.locationId = l.id AND ula.userId = ? AND ula.canView = 1
           WHERE l.deletedAt IS NULL`, [user?.id ?? '']);
        res.json(rows.map((row) => ({
            id: String(row.id),
            name: String(row.name),
            locationId: String(row.locationId),
            zone: String(row.zone),
            ipAddress: String(row.ipAddress),
            rtspUrl: String(row.rtspUrl),
            hlsUrl: rewriteStreamUrlForOrigin(row.hlsUrl, _req),
            whepUrl: rewriteStreamUrlForOrigin(row.whepUrl, _req),
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
            signalStrength: row.signalStrength != null ? Number(row.signalStrength) : undefined,
        })));
    });
    router.get('/cameras/:id', async (req, res) => {
        const user = authUserFromReq(req);
        const rows = await dbRows(db, user?.role === 'ADMIN'
            ? 'SELECT * FROM cameras WHERE id = ? LIMIT 1'
            : `SELECT c.*
           FROM cameras c
           INNER JOIN locations l ON l.id = c.locationId
           INNER JOIN user_location_access ula ON ula.locationId = l.id AND ula.userId = ? AND ula.canView = 1
           WHERE c.id = ? LIMIT 1`, user?.role === 'ADMIN' ? [req.params.id] : [user?.id ?? '', req.params.id]);
        const cam = rows[0];
        if (!cam)
            return res.status(404).json({ error: 'Camera not found' });
        res.json({
            id: String(cam.id),
            name: String(cam.name),
            locationId: String(cam.locationId),
            zone: String(cam.zone),
            ipAddress: String(cam.ipAddress),
            rtspUrl: String(cam.rtspUrl),
            hlsUrl: rewriteStreamUrlForOrigin(cam.hlsUrl, req),
            whepUrl: rewriteStreamUrlForOrigin(cam.whepUrl, req),
            codec: cam.codec ?? undefined,
            fps: toNum(cam.fps),
            resolution: cam.resolution ?? undefined,
            bitrateKbps: toNum(cam.bitrateKbps),
            packetLossPct: cam.packetLossPct != null ? Number(cam.packetLossPct) : undefined,
            jitterMs: toNum(cam.jitterMs),
            firmwareVersion: cam.firmwareVersion ?? undefined,
            lastRebootAt: toIso(cam.lastRebootAt),
            cameraType: cam.cameraType,
            vendor: String(cam.vendor),
            installationDate: String(cam.installationDate),
            enabled: toBool(cam.enabled),
            status: cam.status,
            lastSeenAt: toIso(cam.lastSeenAt),
            lastLatencyMs: toNum(cam.lastLatencyMs),
            signalStrength: cam.signalStrength != null ? Number(cam.signalStrength) : undefined,
        });
    });
    router.post('/cameras', async (req, res) => {
        const actor = actorFromReq(req);
        const parsed = validators_1.cameraCreateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const normalizedHlsUrl = normalizeHlsUrlForLocalGateway(parsed.data.hlsUrl);
        const normalizedWhepUrl = normalizeWhepUrlForLocalGateway(parsed.data.whepUrl);
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const cam = {
            id,
            status: 'ONLINE',
            lastSeenAt: now,
            lastLatencyMs: 42,
            signalStrength: 4,
            enabled: parsed.data.enabled ?? true,
            ...parsed.data,
            hlsUrl: normalizedHlsUrl,
            whepUrl: normalizedWhepUrl,
        };
        await db.execute('INSERT INTO cameras (id, name, locationId, zone, ipAddress, rtspUrl, hlsUrl, whepUrl, codec, fps, resolution, bitrateKbps, packetLossPct, jitterMs, firmwareVersion, lastRebootAt, cameraType, vendor, installationDate, enabled, status, lastSeenAt, lastLatencyMs, signalStrength) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            cam.id,
            cam.name,
            cam.locationId,
            cam.zone,
            cam.ipAddress,
            cam.rtspUrl,
            cam.hlsUrl ?? null,
            cam.whepUrl ?? null,
            cam.codec ?? null,
            cam.fps ?? null,
            cam.resolution ?? null,
            cam.bitrateKbps ?? null,
            cam.packetLossPct ?? null,
            cam.jitterMs ?? null,
            cam.firmwareVersion ?? null,
            cam.lastRebootAt ?? null,
            cam.cameraType,
            cam.vendor,
            cam.installationDate,
            cam.enabled ? 1 : 0,
            cam.status,
            cam.lastSeenAt ?? null,
            cam.lastLatencyMs ?? null,
            cam.signalStrength ?? null,
        ]);
        await logAudit(db, { actor, action: 'CAMERA_CREATE', entityId: cam.id, entityName: cam.name, details: { ...cam, ip: reqIp(req) } });
        res.status(201).json(cam);
    });
    router.put('/cameras/:id', async (req, res) => {
        const actor = actorFromReq(req);
        const parsed = validators_1.cameraUpdateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const existing = await dbRows(db, 'SELECT * FROM cameras WHERE id = ? LIMIT 1', [req.params.id]);
        if (!existing[0])
            return res.status(404).json({ error: 'Camera not found' });
        const patch = { ...parsed.data };
        if (Object.prototype.hasOwnProperty.call(patch, 'hlsUrl')) {
            patch.hlsUrl = normalizeHlsUrlForLocalGateway(patch.hlsUrl);
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'whepUrl')) {
            patch.whepUrl = normalizeWhepUrlForLocalGateway(patch.whepUrl);
        }
        const fields = Object.keys(patch);
        if (fields.length > 0) {
            const setSql = fields.map((k) => `${k} = ?`).join(', ');
            const values = fields.map((k) => patch[k]);
            await db.execute(`UPDATE cameras SET ${setSql} WHERE id = ?`, [...values, req.params.id]);
        }
        const updated = (await dbRows(db, 'SELECT * FROM cameras WHERE id = ? LIMIT 1', [req.params.id]))[0];
        await logAudit(db, {
            actor,
            action: 'CAMERA_UPDATE',
            entityId: req.params.id,
            entityName: updated?.name ?? existing[0].name,
            details: { ...parsed.data, ip: reqIp(req) },
        });
        res.json({
            id: String(updated.id),
            name: String(updated.name),
            locationId: String(updated.locationId),
            zone: String(updated.zone),
            ipAddress: String(updated.ipAddress),
            rtspUrl: String(updated.rtspUrl),
            hlsUrl: updated.hlsUrl ?? undefined,
            whepUrl: updated.whepUrl ?? undefined,
            codec: updated.codec ?? undefined,
            fps: toNum(updated.fps),
            resolution: updated.resolution ?? undefined,
            bitrateKbps: toNum(updated.bitrateKbps),
            packetLossPct: updated.packetLossPct != null ? Number(updated.packetLossPct) : undefined,
            jitterMs: toNum(updated.jitterMs),
            firmwareVersion: updated.firmwareVersion ?? undefined,
            lastRebootAt: toIso(updated.lastRebootAt),
            cameraType: updated.cameraType,
            vendor: String(updated.vendor),
            installationDate: String(updated.installationDate),
            enabled: toBool(updated.enabled),
            status: updated.status,
            lastSeenAt: toIso(updated.lastSeenAt),
            lastLatencyMs: toNum(updated.lastLatencyMs),
            signalStrength: updated.signalStrength != null ? Number(updated.signalStrength) : undefined,
        });
    });
    router.delete('/cameras/:id', async (req, res) => {
        const actor = actorFromReq(req);
        const existing = await dbRows(db, 'SELECT * FROM cameras WHERE id = ? LIMIT 1', [req.params.id]);
        if (!existing[0])
            return res.status(404).json({ error: 'Camera not found' });
        await db.execute('DELETE FROM cameras WHERE id = ?', [req.params.id]);
        await logAudit(db, { actor, action: 'CAMERA_DELETE', entityId: req.params.id, entityName: existing[0].name, details: { ip: reqIp(req) } });
        res.status(204).send();
    });
    router.post('/import/cameras', upload.single('file'), async (req, res) => {
        const actor = actorFromReq(req);
        if (!req.file)
            return res.status(400).json({ error: 'Missing file' });
        const filename = (req.file.originalname ?? '').toLowerCase();
        const isCsv = filename.endsWith('.csv') || (req.file.mimetype ?? '').toLowerCase().includes('csv');
        const wb = isCsv
            ? xlsx_1.default.read(req.file.buffer.toString('utf8'), { type: 'string' })
            : xlsx_1.default.read(req.file.buffer, { type: 'buffer' });
        const firstSheet = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheet];
        const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: '' });
        const getStr = (v) => String(v ?? '').trim();
        let created = 0;
        for (const row of rows) {
            // Accept both "enterprise" headers and simple/camel headers.
            const name = getStr(row['Camera Name'] ?? row.name ?? row.Name);
            const locationCode = getStr(row['Location'] ?? row['Location Code'] ?? row.locationCode ?? row.LocationCode ?? row.location ?? row.Location);
            const zone = getStr(row['Area/Zone'] ?? row.Zone ?? row.zone ?? row.Area ?? row.area);
            const ipAddress = getStr(row['IP Address'] ?? row['IP'] ?? row.ipAddress ?? row.IpAddress ?? row.ip);
            const rtspUrl = getStr(row['RTSP URL'] ?? row['RTSP'] ?? row.rtspUrl ?? row.RtspUrl ?? row.rtsp_url);
            const hlsUrl = getStr(row['HLS URL'] ?? row['Hls Url'] ?? row.hlsUrl ?? row.hls_url);
            const cameraType = getStr(row['Camera Type'] ?? row.Type ?? row.cameraType ?? row.camera_type).toUpperCase();
            const vendor = getStr(row['Vendor'] ?? row.vendor ?? row.VendorName);
            const installationDate = getStr(row['Installation Date'] ?? row.InstallationDate ?? row.installationDate ?? row.install_date);
            if (!name || !locationCode || !zone || !ipAddress || !rtspUrl || !vendor)
                continue;
            const locRows = await dbRows(db, 'SELECT * FROM locations WHERE UPPER(code) = ? LIMIT 1', [locationCode.toUpperCase()]);
            let locId = locRows[0]?.id;
            if (!locId) {
                locId = (0, crypto_1.randomUUID)();
                const createdAt = new Date().toISOString();
                await db.execute('INSERT INTO locations (id, name, code, active, createdAt) VALUES (?, ?, ?, ?, ?)', [locId, locationCode, locationCode, 1, createdAt]);
                await logAudit(db, { actor, action: 'LOCATION_CREATE', entityId: locId, entityName: locationCode, details: { source: 'import', ip: reqIp(req) } });
            }
            const camId = (0, crypto_1.randomUUID)();
            const now = new Date().toISOString();
            const normalizedHls = normalizeHlsUrlForLocalGateway(hlsUrl || undefined);
            await db.execute('INSERT INTO cameras (id, name, locationId, zone, ipAddress, rtspUrl, hlsUrl, cameraType, vendor, installationDate, enabled, status, lastSeenAt, lastLatencyMs, signalStrength) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                camId,
                name,
                locId,
                zone,
                ipAddress,
                rtspUrl,
                normalizedHls ?? null,
                cameraType === 'PTZ' || cameraType === 'FIXED' || cameraType === 'DOME' || cameraType === 'BULLET' ? cameraType : 'FIXED',
                vendor,
                installationDate || new Date().toISOString().slice(0, 10),
                1,
                'ONLINE',
                now,
                50,
                4,
            ]);
            created++;
        }
        await logAudit(db, { actor, action: 'CAMERA_IMPORT', entityName: 'BulkImport', details: { created, rows: rows.length, ip: reqIp(req) } });
        res.json({ created, rows: rows.length });
    });
    router.get('/export/cameras.csv', async (_req, res) => {
        const header = [
            'name',
            'locationCode',
            'locationName',
            'zone',
            'ipAddress',
            'rtspUrl',
            'hlsUrl',
            'cameraType',
            'vendor',
            'installationDate',
            'enabled',
            'status',
            'lastSeenAt',
            'lastLatencyMs',
        ];
        const rows = await dbRows(db, 'SELECT c.*, l.code AS locationCode, l.name AS locationName FROM cameras c LEFT JOIN locations l ON l.id = c.locationId');
        const lines = [header.join(',')];
        for (const cam of rows) {
            const line = [
                cam.name,
                cam.locationCode ?? '',
                cam.locationName ?? '',
                cam.zone,
                cam.ipAddress,
                cam.rtspUrl,
                cam.hlsUrl ?? '',
                cam.cameraType,
                cam.vendor,
                cam.installationDate,
                toBool(cam.enabled) ? 'true' : 'false',
                cam.status,
                cam.lastSeenAt ?? '',
                cam.lastLatencyMs?.toString() ?? '',
            ]
                .map((v) => `"${String(v).replaceAll('"', '""')}"`)
                .join(',');
            lines.push(line);
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="camera-inventory.csv"');
        res.send(lines.join('\n'));
    });
    router.get('/audit', async (_req, res) => {
        const user = authUserFromReq(_req);
        if (user?.role !== 'ADMIN')
            return res.status(403).json({ error: 'Forbidden' });
        const rows = await dbRows(db, 'SELECT * FROM audit_events ORDER BY at DESC LIMIT 500');
        res.json(rows.map((row) => {
            let details = row.details ?? undefined;
            if (typeof details === 'string') {
                try {
                    details = JSON.parse(details);
                }
                catch {
                    details = { raw: details };
                }
            }
            return {
                id: String(row.id),
                actor: String(row.actor),
                action: row.action,
                entityId: row.entityId ?? undefined,
                entityName: row.entityName ?? undefined,
                details: details ?? undefined,
                at: toIso(row.at) ?? nowIso(),
            };
        }));
    });
    return router;
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const promise_1 = require("mysql2/promise");
const routes_1 = require("./routes");
const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const CORS_ORIGINS = CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
const isAllowedOrigin = (origin) => {
    if (!origin)
        return true;
    if (CORS_ORIGINS.includes('*'))
        return true;
    if (CORS_ORIGINS.includes(origin))
        return true;
    return isLocalhostOrigin(origin);
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '2mb' }));
app.disable('etag');
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin))
                return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        },
    },
});
app.get('/', (_req, res) => {
    res.type('text/plain').send('CCTV Dashboard Backend OK');
});
const mysqlConfig = process.env.DB_HOST
    ? {
        host: process.env.DB_HOST,
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? undefined,
        database: process.env.DB_NAME ?? 'vms',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    }
    : null;
if (!mysqlConfig) {
    // eslint-disable-next-line no-console
    console.error('[backend] Missing MySQL configuration. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT in backend/.env');
    process.exit(1);
}
const db = (0, promise_1.createPool)({
    host: mysqlConfig.host,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: mysqlConfig.database,
    port: mysqlConfig.port,
    connectionLimit: 10,
});
app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
app.use('/api', (0, routes_1.buildRoutes)(db));
io.on('connection', (socket) => {
    socket.emit('hello', {
        serverTime: new Date().toISOString(),
        message: 'Connected to CCTV monitoring updates',
    });
    socket.on('pingClient', () => {
        socket.emit('pongServer', { at: new Date().toISOString() });
    });
});
const start = async () => {
    try {
        await db.query('SELECT 1');
        // eslint-disable-next-line no-console
        console.log(`[backend] connected to MySQL (${mysqlConfig.database})`);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('[backend] MySQL load failed. Backend will not start.', err);
        process.exit(1);
    }
    server.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`[backend] listening on http://localhost:${PORT}`);
    });
};
void start();

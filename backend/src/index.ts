import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import { createPool } from 'mysql2/promise'
import { buildRoutes } from './routes'
import type { MysqlConfig } from './store'

const PORT = Number(process.env.PORT ?? 4000)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
const CORS_ORIGINS = CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isLocalhostOrigin = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
const isAllowedOrigin = (origin?: string | null) => {
  if (!origin) return true
  if (CORS_ORIGINS.includes('*')) return true
  if (CORS_ORIGINS.includes(origin)) return true
  return isLocalhostOrigin(origin)
}

const app = express()
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.disable('etag')

const server = http.createServer(app)
const io = new IOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
  },
})


app.get('/', (_req, res) => {
  res.type('text/plain').send('CCTV Dashboard Backend OK')
})

const mysqlConfig: MysqlConfig | null = process.env.DB_HOST
  ? {
      host: process.env.DB_HOST,
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? undefined,
      database: process.env.DB_NAME ?? 'vms',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    }
  : null

if (!mysqlConfig) {
  // eslint-disable-next-line no-console
  console.error('[backend] Missing MySQL configuration. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT in backend/.env')
  process.exit(1)
}

const db = createPool({
  host: mysqlConfig.host,
  user: mysqlConfig.user,
  password: mysqlConfig.password,
  database: mysqlConfig.database,
  port: mysqlConfig.port,
  connectionLimit: 10,
})

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})
app.use('/api', buildRoutes(db))

io.on('connection', (socket) => {
  socket.emit('hello', {
    serverTime: new Date().toISOString(),
    message: 'Connected to CCTV monitoring updates',
  })

  socket.on('pingClient', () => {
    socket.emit('pongServer', { at: new Date().toISOString() })
  })
})

const start = async () => {
  try {
    await db.query('SELECT 1')
    // eslint-disable-next-line no-console
    console.log(`[backend] connected to MySQL (${mysqlConfig.database})`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[backend] MySQL load failed. Backend will not start.', err)
    process.exit(1)
  }

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${PORT}`)
  })
}

void start()

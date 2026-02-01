import type { Server as IOServer } from 'socket.io'
import type { CameraStatus } from './models'
import { InMemoryStore } from './store'

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export function startStatusSimulator(store: InMemoryStore, io: IOServer) {
  const tick = () => {
    const now = new Date().toISOString()

    for (const cam of store.cameras) {
      if (!cam.enabled) {
        cam.status = 'OFFLINE'
        cam.lastLatencyMs = undefined
        cam.signalStrength = 0
        continue
      }
      // Basic heuristic: occasionally change states to mimic flaky networks
      const roll = Math.random()

      let newStatus: CameraStatus = cam.status
      if (roll < 0.02) newStatus = 'OFFLINE'
      else if (roll < 0.08) newStatus = 'WARNING'
      else if (roll < 0.55) newStatus = 'ONLINE'

      cam.status = newStatus
      cam.lastSeenAt = newStatus === 'OFFLINE' ? cam.lastSeenAt : now
      cam.lastLatencyMs = newStatus === 'OFFLINE' ? undefined : randInt(18, newStatus === 'WARNING' ? 220 : 90)
      cam.signalStrength = newStatus === 'OFFLINE' ? 0 : ((newStatus === 'WARNING' ? randInt(1, 3) : randInt(3, 4)) as 0 | 1 | 2 | 3 | 4)
    }

    io.emit('cameraStatusSnapshot', {
      at: now,
      cameras: store.cameras.map((c) => ({
        id: c.id,
        status: c.status,
        lastSeenAt: c.lastSeenAt,
        lastLatencyMs: c.lastLatencyMs,
        signalStrength: c.signalStrength,
      })),
    })
  }

  const intervalMs = 3000
  tick()
  const handle = setInterval(tick, intervalMs)

  return () => clearInterval(handle)
}

import type { Server as IOServer } from 'socket.io'
import type { CameraStatus } from './models'
import { InMemoryStore } from './store'

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export function startStatusSimulator(store: InMemoryStore, io: IOServer) {
  // Log camera data on first run
  console.log('[StatusSim] Starting simulator with cameras:')
  for (const cam of store.cameras.slice(0, 5)) {
    console.log(`  ${cam.name}: ipAddress=${cam.ipAddress}, rtspUrl=${cam.rtspUrl}`)
  }
  
  const tick = () => {
    const now = new Date().toISOString()

    for (const cam of store.cameras) {
      if (!cam.enabled) {
        cam.status = 'OFFLINE'
        cam.lastLatencyMs = undefined
        cam.signalStrength = 0
        continue
      }

      // If camera has no stream URLs, mark as OFFLINE
      if (!cam.whepUrl && !cam.hlsUrl) {
        cam.status = 'OFFLINE'
        cam.lastLatencyMs = undefined
        cam.signalStrength = 0
        continue
      }

      // Check if camera is using private/unreachable IP addresses
      const checkPrivateIP = (url: string | undefined): boolean => {
        if (!url) return false
        return (
          url.includes('10.205.101.') || 
          url.includes('10.227.96.') ||
          url.includes('192.168.') ||
          url.includes('172.16.') ||
          url.includes('127.0.0.') ||
          url.includes('localhost')
        )
      }

      // Only consider the camera IP / RTSP source for private-IP checks.
      // HLS/WHEP often point to a local gateway (e.g., MediaMTX) and should not force OFFLINE.
      const hasPrivateIP = 
        checkPrivateIP(cam.ipAddress) ||
        checkPrivateIP(cam.rtspUrl)

      if (hasPrivateIP) {
        console.log(`[StatusSim] Camera ${cam.name} has private IP - marking OFFLINE`)
        console.log(`  ipAddress: ${cam.ipAddress}`)
        console.log(`  rtspUrl: ${cam.rtspUrl}`)
        console.log(`  hlsUrl: ${cam.hlsUrl}`)
        console.log(`  whepUrl: ${cam.whepUrl}`)
        cam.status = 'OFFLINE'
        cam.lastLatencyMs = undefined
        cam.signalStrength = 0
        continue  // Skip the random status generator below
      }

      // Basic heuristic: occasionally change states to mimic flaky networks
      // Only runs for cameras without private IPs
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

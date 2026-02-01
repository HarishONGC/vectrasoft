import { io, type Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:4000'

export type CameraStatusSnapshot = {
  at: string
  cameras: Array<{ id: string; status: 'ONLINE' | 'OFFLINE' | 'WARNING'; lastSeenAt?: string; lastLatencyMs?: number; signalStrength?: 0 | 1 | 2 | 3 | 4 }>
}

export function createSocket(): Socket {
  return io(WS_URL, {
    transports: ['websocket', 'polling'],
  })
}

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Camera } from '../api/types'
import { queryKeys } from '../api/hooks'
import { createSocket, type CameraStatusSnapshot } from './socket'

export function useCameraStatusRealtime() {
  const qc = useQueryClient()

  useEffect(() => {
    const socket = createSocket()

    const onSnapshot = (payload: CameraStatusSnapshot) => {
      qc.setQueryData<Camera[]>(queryKeys.cameras, (prev) => {
        if (!prev) return prev
        const byId = new Map(payload.cameras.map((c) => [c.id, c]))
        return prev.map((cam) => {
          const patch = byId.get(cam.id)
          if (!patch) return cam
          return {
            ...cam,
            status: patch.status,
            lastSeenAt: patch.lastSeenAt,
            lastLatencyMs: patch.lastLatencyMs,
            signalStrength: patch.signalStrength,
          }
        })
      })

      qc.invalidateQueries({ queryKey: queryKeys.summary, exact: true })
    }

    socket.on('cameraStatusSnapshot', onSnapshot)

    return () => {
      socket.off('cameraStatusSnapshot', onSnapshot)
      socket.disconnect()
    }
  }, [qc])
}

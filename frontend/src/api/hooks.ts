import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AuditEvent, Camera, HealthSettings, Location, StreamCheckResult, Summary, SystemInfo, User, UserLocationAccess } from './types'
import { apiDownloadUrl, apiGet, apiSend, apiUpload } from './http'

export const queryKeys = {
  summary: ['summary'] as const,
  system: ['system'] as const,
  locations: ['locations'] as const,
  cameras: ['cameras'] as const,
  audit: ['audit'] as const,
  healthSettings: ['healthSettings'] as const,
  users: ['users'] as const,
  userAccess: ['userAccess'] as const,
}

export function useSystemInfo() {
  return useQuery({ queryKey: queryKeys.system, queryFn: () => apiGet<SystemInfo>('/system'), refetchInterval: 15000 })
}

export function useSummary() {
  return useQuery({ queryKey: queryKeys.summary, queryFn: () => apiGet<Summary>('/summary'), refetchInterval: 5000 })
}

export function useLocations() {
  return useQuery({ queryKey: queryKeys.locations, queryFn: () => apiGet<Location[]>('/locations'), staleTime: 5000 })
}

export function useLocationsAdmin({ includeDeleted = false }: { includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: [...queryKeys.locations, { includeDeleted }] as const,
    queryFn: () => apiGet<Location[]>(includeDeleted ? '/locations?includeDeleted=1' : '/locations'),
    staleTime: 5000,
  })
}

export function useCameras() {
  return useQuery({ 
    queryKey: queryKeys.cameras, 
    queryFn: () => apiGet<Camera[]>('/cameras'), 
    refetchInterval: 5000,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  })
}

export function useAudit() {
  return useQuery({ queryKey: queryKeys.audit, queryFn: () => apiGet<AuditEvent[]>('/audit'), refetchInterval: 10000 })
}

export function useHealthSettings() {
  return useQuery({ queryKey: queryKeys.healthSettings, queryFn: () => apiGet<HealthSettings>('/health/settings') })
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: () => apiGet<User[]>('/admin/users') })
}

export function useUserAccess(userId?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.userAccess, userId] as const,
    queryFn: () => apiGet<UserLocationAccess[]>(`/admin/users/${userId}/access`),
    enabled: !!userId,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; role: User['role'] }) =>
      apiSend<User>('/admin/users', 'POST', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; email: string; password: string; role: User['role'] }> }) =>
      apiSend<User>(`/admin/users/${id}`, 'PUT', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiSend<void>(`/admin/users/${id}`, 'DELETE'),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useUpdateUserAccess() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, access }: { id: string; access: UserLocationAccess[] }) =>
      apiSend<void>(`/admin/users/${id}/access`, 'PUT', { access }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.users })
      qc.invalidateQueries({ queryKey: [...queryKeys.userAccess, vars.id] as const })
    },
  })
}

export function useUpdateHealthSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: HealthSettings) => apiSend<HealthSettings>('/health/settings', 'PUT', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.healthSettings }),
  })
}

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Location>) => apiSend<Location>('/locations', 'POST', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.locations }),
  })
}

export function useUpdateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Location> }) => apiSend<Location>(`/locations/${id}`, 'PUT', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.locations }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiSend<void>(`/locations/${id}`, 'DELETE'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.locations })
      qc.invalidateQueries({ queryKey: queryKeys.cameras })
      qc.invalidateQueries({ queryKey: queryKeys.summary })
    },
  })
}

export function useRecoverLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiSend<Location>(`/locations/${id}/recover`, 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.locations })
      qc.invalidateQueries({ queryKey: queryKeys.cameras })
      qc.invalidateQueries({ queryKey: queryKeys.summary })
    },
  })
}

export function useCreateCamera() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Camera>) => apiSend<Camera>('/cameras', 'POST', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cameras })
      qc.invalidateQueries({ queryKey: queryKeys.summary })
    },
  })
}

export function useUpdateCamera() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Camera> }) => apiSend<Camera>(`/cameras/${id}`, 'PUT', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cameras })
      qc.invalidateQueries({ queryKey: queryKeys.summary })
    },
  })
}

export function useDeleteCamera() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiSend<void>(`/cameras/${id}`, 'DELETE'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cameras })
      qc.invalidateQueries({ queryKey: queryKeys.summary })
    },
  })
}

export function useImportCameras() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => apiUpload<{ created: number; rows: number }>('/import/cameras', file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cameras })
      qc.invalidateQueries({ queryKey: queryKeys.summary })
      qc.invalidateQueries({ queryKey: queryKeys.audit })
    },
  })
}

export function getExportCamerasCsvUrl() {
  return apiDownloadUrl('/export/cameras.csv')
}

export function useStreamCheck() {
  return useMutation({
    mutationFn: (cameraId: string) => apiGet<StreamCheckResult>(`/debug/cameras/${cameraId}/stream-check`),
  })
}

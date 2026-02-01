import { getActor, getUserId } from '../app/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

type CachedEntry<T> = {
  at: number
  value: T
}

const CACHE_PREFIX = 'cctv-api-cache:'
const MAX_CACHE_AGE_MS = 1000 * 60 * 5 // 5 minutes
const CACHE_ENABLED = import.meta.env.VITE_API_CACHE === '1'

function isOffline() {
  // navigator is undefined during SSR/build-time.
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function cacheKey(path: string) {
  // Include base URL so switching environments doesn't mix cached data.
  return `${CACHE_PREFIX}${API_BASE_URL}${path}`
}

function readCacheEntry<T>(path: string): CachedEntry<T> | undefined {
  if (!CACHE_ENABLED) return undefined
  try {
    const raw = localStorage.getItem(cacheKey(path))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as CachedEntry<T>
    if (!parsed || typeof parsed.at !== 'number') return undefined
    if (Date.now() - parsed.at > MAX_CACHE_AGE_MS) return undefined
    return parsed
  } catch {
    return undefined
  }
}

function readCache<T>(path: string): T | undefined {
  return readCacheEntry<T>(path)?.value
}

function writeCache<T>(path: string, value: T) {
  if (!CACHE_ENABLED) return
  try {
    const entry: CachedEntry<T> = { at: Date.now(), value }
    localStorage.setItem(cacheKey(path), JSON.stringify(entry))
  } catch {
    // Ignore quota / private mode issues.
  }
}

function mergeById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>) {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

function removeById<T extends { id: string }>(list: T[], id: string) {
  return list.filter((item) => item.id !== id)
}

function tryApplyOfflineMutation<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): { handled: true; value: T } | { handled: true; value: undefined } | { handled: false } {
  if (!CACHE_ENABLED) return { handled: false }

  const cameraMatch = path.match(/^\/cameras\/([^/]+)$/)
  const locationMatch = path.match(/^\/locations\/([^/]+)$/)

  if (method === 'PUT' && cameraMatch) {
    const id = cameraMatch[1]
    const cached = readCacheEntry<any[]>('/cameras')
    if (!cached || !Array.isArray(cached.value)) return { handled: false }
    const patch = (body ?? {}) as Record<string, unknown>
    const nextList = mergeById(cached.value, id, patch)
    const updated = nextList.find((c) => c.id === id)
    if (!updated) return { handled: false }
    writeCache('/cameras', nextList)
    return { handled: true, value: updated as T }
  }

  if (method === 'PUT' && locationMatch) {
    const id = locationMatch[1]
    const cached = readCacheEntry<any[]>('/locations')
    if (!cached || !Array.isArray(cached.value)) return { handled: false }
    const patch = (body ?? {}) as Record<string, unknown>
    const nextList = mergeById(cached.value, id, patch)
    const updated = nextList.find((l) => l.id === id)
    if (!updated) return { handled: false }
    writeCache('/locations', nextList)
    return { handled: true, value: updated as T }
  }

  if (method === 'DELETE' && cameraMatch) {
    const id = cameraMatch[1]
    const cached = readCacheEntry<any[]>('/cameras')
    if (!cached || !Array.isArray(cached.value)) return { handled: false }
    const nextList = removeById(cached.value, id)
    writeCache('/cameras', nextList)
    return { handled: true, value: undefined }
  }

  if (method === 'DELETE' && locationMatch) {
    const id = locationMatch[1]
    const cached = readCacheEntry<any[]>('/locations')
    if (!cached || !Array.isArray(cached.value)) return { handled: false }
    const nextList = removeById(cached.value, id)
    writeCache('/locations', nextList)
    return { handled: true, value: undefined }
  }

  return { handled: false }
}

function updateCacheOnSuccess<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', payload: unknown, response: T) {
  if (!CACHE_ENABLED) return

  const cameraMatch = path.match(/^\/cameras\/([^/]+)$/)
  const locationMatch = path.match(/^\/locations\/([^/]+)$/)

  if (method === 'PUT' && cameraMatch) {
    const id = cameraMatch[1]
    const cached = readCacheEntry<any[]>('/cameras')
    if (!cached || !Array.isArray(cached.value)) return
    const patch = (response ?? payload ?? {}) as Record<string, unknown>
    writeCache('/cameras', mergeById(cached.value, id, patch))
    return
  }

  if (method === 'PUT' && locationMatch) {
    const id = locationMatch[1]
    const cached = readCacheEntry<any[]>('/locations')
    if (!cached || !Array.isArray(cached.value)) return
    const patch = (response ?? payload ?? {}) as Record<string, unknown>
    writeCache('/locations', mergeById(cached.value, id, patch))
    return
  }

  if (method === 'DELETE' && cameraMatch) {
    const id = cameraMatch[1]
    const cached = readCacheEntry<any[]>('/cameras')
    if (!cached || !Array.isArray(cached.value)) return
    writeCache('/cameras', removeById(cached.value, id))
    return
  }

  if (method === 'DELETE' && locationMatch) {
    const id = locationMatch[1]
    const cached = readCacheEntry<any[]>('/locations')
    if (!cached || !Array.isArray(cached.value)) return
    writeCache('/locations', removeById(cached.value, id))
    return
  }

  if (method === 'POST' && path === '/cameras') {
    const cached = readCacheEntry<any[]>('/cameras')
    if (!cached || !Array.isArray(cached.value)) return
    writeCache('/cameras', [response as any, ...cached.value])
    return
  }

  if (method === 'POST' && path === '/locations') {
    const cached = readCacheEntry<any[]>('/locations')
    if (!cached || !Array.isArray(cached.value)) return
    writeCache('/locations', [response as any, ...cached.value])
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  if (isOffline()) {
    const cached = readCache<T>(path)
    if (cached !== undefined) return cached
    throw new Error('You appear to be offline, and no cached data is available.')
  }

  try {
    const userId = getUserId()
    const cacheBust = CACHE_ENABLED ? '' : (path.includes('?') ? '&' : '?') + `_ts=${Date.now()}`
    const res = await fetch(`${API_BASE_URL}${path}${cacheBust}`, {
      cache: 'no-store',
      headers: userId ? { 'x-user-id': userId } : undefined,
    })
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
    const data = (await res.json()) as T
    writeCache(path, data)
    return data
  } catch (err) {
    const isNetworkError = err instanceof TypeError || String((err as Error).message ?? '').includes('Failed to fetch')
    if (isNetworkError) {
      const cached = readCache<T>(path)
      if (cached !== undefined) return cached
    }
    throw err
  }
}

export async function apiSend<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  if (isOffline()) {
    throw new Error('You appear to be offline. Changes cannot be saved without a connection to the server.')
  }

  const userId = getUserId()
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
        'x-actor': getActor(),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      // Try to extract error message from response body
      let errorMessage = `${method} ${path} failed: ${res.status}`
      try {
        const errorData = await res.json()
        if (errorData.error) {
          // Handle Zod validation errors (nested object with fieldErrors and formErrors)
          if (typeof errorData.error === 'object' && (errorData.error.fieldErrors || errorData.error.formErrors)) {
            const fieldErrors = errorData.error.fieldErrors || {}
            const formErrors = errorData.error.formErrors || []
            const errorParts = []
            if (formErrors.length > 0) errorParts.push(...formErrors)
            for (const [field, errors] of Object.entries(fieldErrors)) {
              if (Array.isArray(errors) && errors.length > 0) {
                errorParts.push(`${field}: ${errors.join(', ')}`)
              }
            }
            errorMessage = errorParts.length > 0 ? errorParts.join('\n') : JSON.stringify(errorData.error)
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error
          } else {
            errorMessage = JSON.stringify(errorData.error)
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } catch {
        // If parsing fails, use the default error message
      }
      throw new Error(errorMessage)
    }
    if (res.status === 204) {
      updateCacheOnSuccess(path, method, body, undefined as T)
      return undefined as T
    }
    const data = (await res.json()) as T
    updateCacheOnSuccess(path, method, body, data)
    return data
  } catch (err) {
    const isNetworkError = err instanceof TypeError || String((err as Error).message ?? '').includes('Failed to fetch')
    if (isNetworkError) {
      const fallback = tryApplyOfflineMutation<T>(path, method, body)
      if (fallback?.handled) return fallback.value as T
    }
    throw err
  }
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  if (isOffline()) {
    throw new Error('You appear to be offline. Uploads require a connection to the server.')
  }

  const form = new FormData()
  form.append('file', file)

  const userId = getUserId()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(userId ? { 'x-user-id': userId } : {}),
      'x-actor': getActor(),
    },
    body: form,
  })

  if (!res.ok) throw new Error(`UPLOAD ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export function apiDownloadUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

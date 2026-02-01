export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  locationAccess?: Array<{ locationId: string; canView: boolean; canControl: boolean }>
}

const KEY = 'cctv.user'

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed || !parsed.id || !parsed.role) return null
    return parsed
  } catch {
    return null
  }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(KEY)
}

export function getRole(): UserRole | null {
  return getUser()?.role ?? null
}

export function getUserId(): string | null {
  return getUser()?.id ?? null
}

export function getActor(): string {
  const user = getUser()
  return user?.email ?? user?.name ?? 'operator'
}

export function isAuthenticated(): boolean {
  return !!getUser()
}

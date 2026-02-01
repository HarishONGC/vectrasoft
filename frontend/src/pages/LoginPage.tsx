import { Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUser } from '../app/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api', [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })

      if (!res.ok) {
        setError('Invalid credentials or account not found.')
        return
      }

      const user = (await res.json()) as {
        id: string
        name: string
        email: string
        role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
        locationAccess?: Array<{ locationId: string; canView: boolean; canControl: boolean }>
      }

      setUser(user)

      // All users (including ADMIN) navigate to control room after login
      nav('/control-room')
    } catch {
      setError('Unable to reach the server. Check the backend URL and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/background.webp)' }}
    >
      <div className="relative flex-1 grid place-items-center p-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/80" />
        <div className="relative w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
            <div className="p-8 sm:p-10 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
                Secure Access
              </div>
              <div className="mt-5 text-3xl sm:text-4xl font-bold leading-tight">
                Centralized CCTV Monitoring
              </div>
              <p className="mt-3 text-sm text-white/70">
                Live operations, compliance-ready audit trail, and location-based permissions.
              </p>
              <div className="mt-8 grid gap-3 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  SOC-grade dashboards for rapid incident response.
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-blue-400" />
                  Role-based access for control room and admin.
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-rose-400" />
                  Continuous health checks and alerting.
                </div>
              </div>
            </div>

            <div className="bg-white/95 p-6 sm:p-8 text-slate-900">
              <div className="text-sm font-semibold">Sign in</div>
              <div className="text-xs text-slate-500">Use your assigned credentials to continue</div>
              <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-600">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cctv.local"
                    autoComplete="username"
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="bg-white"
                  />
                </div>

                {error ? <div className="text-xs text-rose-600">{error}</div> : null}

                <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                  {busy ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield size={14} /> All access is audited and role-based.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

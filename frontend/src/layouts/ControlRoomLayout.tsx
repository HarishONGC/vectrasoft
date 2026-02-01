import { Outlet, useSearchParams, NavLink } from 'react-router-dom'
import { Building2, Camera, Settings, ChevronsLeft, ChevronsRight, Plus, Users } from 'lucide-react'
import { useState, useMemo } from 'react'
import { TopBar } from '../components/TopBar'
import { Footer } from '../components/Footer'
import { cn } from '../app/cn'
import { getRole } from '../app/auth'
import { useSummary } from '../api/hooks'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const itemBase =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface2'

export function ControlRoomLayout() {
  const [params] = useSearchParams()
  const isFullscreen = params.get('fullscreen')
  const role = getRole()
  const { data: summary } = useSummary()
  
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem('control-room.sidebar.collapsed') === '1'
    } catch {
      return false
    }
  })

  const counts = useMemo(() => {
    return {
      camerasTotal: summary?.total ?? null,
      camerasOffline: summary?.offline ?? null,
    }
  }, [summary])

  const setCollapsedPersist = (v: boolean) => {
    setCollapsed(v)
    try {
      window.localStorage.setItem('control-room.sidebar.collapsed', v ? '1' : '0')
    } catch {
      // ignore
    }
  }

  const showAdminNav = role === 'ADMIN'
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/bg-frame.svg)' }}>
      <TopBar mode="CONTROL" className={isFullscreen ? 'hidden' : ''} />
      <div className={cn('flex-1 grid', showAdminNav ? (collapsed ? 'grid-cols-[84px_1fr]' : 'grid-cols-[280px_1fr]') : '')}>
        {showAdminNav ? (
          <aside className={cn('border-r border-border/70 bg-surface/90 backdrop-blur-sm px-3 py-4', collapsed && 'px-2', isFullscreen && 'hidden')}>
            <div className={cn('flex items-center justify-between', collapsed ? 'px-1' : 'px-2')}>
              <div className={cn('text-xs font-semibold uppercase tracking-wider text-muted', collapsed && 'sr-only')}>Admin</div>
              <button
                className="rounded-lg p-2 text-muted hover:bg-surface2"
                onClick={() => setCollapsedPersist(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              </button>
            </div>

            <div className={cn('mt-3 grid gap-2', collapsed ? 'px-1' : 'px-2')}>
              <Button
                variant="primary"
                className={cn('justify-start', collapsed && 'px-0 justify-center')}
                title="Add Location"
                onClick={() => window.location.href = '/admin/locations?create=1'}
              >
                <Plus size={16} />
                {collapsed ? null : <span>Add Location</span>}
              </Button>
              <Button
                variant="secondary"
                className={cn('justify-start', collapsed && 'px-0 justify-center')}
                title="Add Camera"
                onClick={() => window.location.href = '/admin/cameras?create=1'}
              >
                <Plus size={16} />
                {collapsed ? null : <span>Add Camera</span>}
              </Button>
            </div>

            <div className={cn('mt-4 flex flex-wrap gap-2', collapsed ? 'px-1' : 'px-2')}>
              <div className={cn('flex items-center gap-2 text-xs text-muted', collapsed && 'w-full justify-center')}
                title={counts.camerasTotal != null ? `Total cameras: ${counts.camerasTotal}` : 'Total cameras'}>
                {collapsed ? <Camera size={16} /> : <span className="font-semibold">Cameras</span>}
                {counts.camerasTotal != null ? <Badge tone="neutral" className="tabular-nums">{counts.camerasTotal}</Badge> : null}
                {counts.camerasOffline != null ? <Badge tone={counts.camerasOffline > 0 ? 'bad' : 'ok'} className="tabular-nums">{counts.camerasOffline} off</Badge> : null}
              </div>
            </div>

            <div className={cn('mt-5 px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted', collapsed && 'sr-only')}>
              Inventory
            </div>

            <nav className="flex flex-col gap-1">
              <NavLink
                to="/admin/locations"
                className={({ isActive }) =>
                  cn(
                    itemBase,
                    collapsed && 'justify-center px-0',
                    isActive && 'bg-surface2 text-text ring-1 ring-border/70',
                  )
                }
                title="Locations"
              >
                <Building2 size={16} /> {collapsed ? null : 'Locations'}
              </NavLink>
              <NavLink
                to="/admin/cameras"
                className={({ isActive }) =>
                  cn(
                    itemBase,
                    collapsed && 'justify-center px-0',
                    isActive && 'bg-surface2 text-text ring-1 ring-border/70',
                  )
                }
                title="Cameras"
              >
                <Camera size={16} /> {collapsed ? null : 'Cameras'}
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  cn(
                    itemBase,
                    collapsed && 'justify-center px-0',
                    isActive && 'bg-surface2 text-text ring-1 ring-border/70',
                  )
                }
                title="Users & Access"
              >
                <Users size={16} /> {collapsed ? null : 'Users & Access'}
              </NavLink>
            </nav>

            <div className={cn('mt-6 px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted', collapsed && 'sr-only')}>System</div>
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  cn(
                    itemBase,
                    collapsed && 'justify-center px-0',
                    isActive && 'bg-surface2 text-text ring-1 ring-border/70',
                  )
                }
                title="Health Settings"
              >
                <Settings size={16} /> {collapsed ? null : 'Health Settings'}
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  cn(
                    itemBase,
                    collapsed && 'justify-center px-0',
                    isActive && 'bg-surface2 text-text ring-1 ring-border/70',
                  )
                }
                title="User Management"
              >
                <Users size={16} /> {collapsed ? null : 'User Management'}
              </NavLink>
            </nav>
          </aside>
        ) : null}
        <main className="min-w-0 bg-bg/80 backdrop-blur-[0.5px] flex flex-col">
          <Outlet />
        </main>
      </div>
      <Footer className={isFullscreen ? 'hidden' : ''} />
    </div>
  )
}

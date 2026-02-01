import { LogOut, Shield, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearUser, getRole, getUser } from '../app/auth'
import { useOnline } from '../app/useOnline'
import { useSystemInfo } from '../api/hooks'
import { ThemeToggle } from './ThemeToggle'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export function TopBar({ mode, className = '' }: { mode: 'ADMIN' | 'CONTROL', className?: string }) {
  const nav = useNavigate()
  const role = getRole()
  const user = getUser()
  const { data } = useSystemInfo()
  const online = useOnline()

  return (
    <div 
      className={`relative flex h-16 sm:h-18 items-center justify-between gap-2 sm:gap-4 border-b border-blue-300 dark:border-blue-800 px-3 sm:px-6 lg:px-8 rounded-b-xl sm:rounded-b-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 w-full backdrop-blur-md ${className}`}
      style={{ 
        backgroundImage: 'url(/blue-background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-blue-900/70 backdrop-blur-sm"></div>
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 min-w-0">
        <img 
          src="/vectrasoft-logo.svg" 
          alt="VectraSoft Technologies" 
          className="h-8 sm:h-10 w-auto flex-shrink-0 drop-shadow-lg"
        />
        <div className="hidden sm:block w-px h-8 bg-white/30 mx-1"></div>
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg">
          {mode === 'CONTROL' ? <Video size={18} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} /> : <Shield size={18} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />}
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-sm sm:text-lg font-bold text-white drop-shadow-lg truncate">Centralized CCTV Monitoring</div>
          <div className="text-[10px] sm:text-xs font-medium text-white/95 drop-shadow-md truncate">
            {mode === 'CONTROL' ? 'Control Room Dashboard' : 'Admin Console'}
            {data ? ` • Uptime ${formatUptime(data.uptimeSeconds)}` : ''}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {!online ? <Badge tone="bad">Offline</Badge> : null}
        {role ? (
          <div className="hidden sm:flex flex-col px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-[10px] sm:text-xs font-semibold text-white">
            <span>{role}</span>
            {user?.email ? <span className="text-[9px] font-normal text-white/80">{user.email}</span> : null}
          </div>
        ) : null}
        <ThemeToggle />
        <Button
          variant="ghost"
          onClick={() => {
            clearUser()
            nav('/login')
          }}
          className="font-medium text-white hover:bg-white/20 border border-white/30 backdrop-blur-md text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2"
        >
          <LogOut size={14} className="sm:w-[16px] sm:h-[16px]" strokeWidth={2.5} />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  )
}

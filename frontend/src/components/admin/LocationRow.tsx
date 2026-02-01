import { memo } from 'react'
import { Trash2, Edit2, MapPin, Wifi, AlertCircle } from 'lucide-react'
import { cn } from '../../app/cn'
import { StatusDot } from '../ui/StatusDot'
import { StatusTrend } from '../ui/StatusTrend'
import type { Location } from '../../api/types'
import type { Status } from '../ui/StatusDot'

type LocationWithAdminMetrics = Location & {
  status?: 'active' | 'inactive' | 'maintenance' | 'offline' | 'disabled'
  health?: number
  healthTrend?: number
  cameraCount?: number
  alertCount?: number
  lastUpdate?: string
  sla?: string
}

interface LocationRowProps {
  location: LocationWithAdminMetrics
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (location: LocationWithAdminMetrics) => void
  onDelete: (id: string) => void
  columns: string[]
  className?: string
}

const StatusBadge = memo(({ status }: { status: string }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-red-100 text-red-800',
  }
  
  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded', colors[status as keyof typeof colors] || colors.inactive)}>
      {status}
    </span>
  )
})
StatusBadge.displayName = 'StatusBadge'

const HealthIndicator = memo(({ health, trend }: { health: number; trend?: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-6 w-16 rounded-sm bg-gray-100 overflow-hidden">
      <div
        className={cn('transition-all', health > 75 ? 'bg-green-500' : health > 50 ? 'bg-yellow-500' : 'bg-red-500')}
        style={{ width: `${health}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{health}%</span>
    {trend !== undefined && (
      <StatusTrend current={health} previous={health - trend} format="number" size="sm" />
    )}
  </div>
))
HealthIndicator.displayName = 'HealthIndicator'

const CellContent = memo(({ column, location, onEdit, onDelete, onSelect, isSelected }: any) => {
  switch (column) {
    case 'select':
      return (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(location.id)}
          className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          aria-label={`Select location ${location.name}`}
        />
      )

    case 'name':
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-blue-600" />
          </div>
          <div className="truncate">
            <p className="font-medium text-gray-900 truncate">{location.name}</p>
            <p className="text-xs text-gray-500 truncate">{location.city}</p>
          </div>
        </div>
      )

    case 'status':
      const statusLabel = location.status ?? (location.active ? 'active' : 'inactive')
      const dotStatus: Status = location.active ? 'ONLINE' : 'OFFLINE'
      return (
        <div className="flex items-center gap-2">
          <StatusDot status={dotStatus} />
          <StatusBadge status={statusLabel} />
        </div>
      )

    case 'health':
      return <HealthIndicator health={location.health || 0} trend={location.healthTrend} />

    case 'cameras':
      return (
        <div className="flex items-center gap-2">
          <Wifi size={16} className="text-gray-400" />
          <span className="text-sm font-medium">{location.cameraCount || 0}</span>
        </div>
      )

    case 'region':
      return <span className="text-sm text-gray-700">{location.region || '—'}</span>

    case 'sla':
      return (
        <span className={cn('text-sm font-semibold', location.sla === 'high' ? 'text-green-600' : location.sla === 'medium' ? 'text-yellow-600' : 'text-gray-600')}>
          {location.sla || location.slaPriority?.toLowerCase() || '—'}
        </span>
      )

    case 'lastUpdate':
      return (
        <span className="text-sm text-gray-600">
          {location.lastUpdate ? new Date(location.lastUpdate).toLocaleDateString() : location.createdAt ? new Date(location.createdAt).toLocaleDateString() : '—'}
        </span>
      )

    case 'alerts':
      return (
        <div className="flex items-center justify-center">
          {location.alertCount ? (
            <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
              <AlertCircle size={14} className="text-red-600" />
              <span className="text-xs font-semibold text-red-600">{location.alertCount}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      )

    case 'actions':
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(location)}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            aria-label={`Edit ${location.name}`}
            title="Edit location"
          >
            <Edit2 size={16} className="text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(location.id)}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            aria-label={`Delete ${location.name}`}
            title="Delete location"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      )

    default:
      return <span className="text-sm text-gray-700">{(location as any)[column] || '—'}</span>
  }
})
CellContent.displayName = 'CellContent'

export const LocationRow = memo(
  ({ location, isSelected, onSelect, onEdit, onDelete, columns, className }: LocationRowProps) => {
    return (
      <tr className={cn('border-b border-gray-200 hover:bg-blue-50/40 transition-colors', className)}>
        {columns.map((column) => (
          <td
            key={`${location.id}-${column}`}
            className={cn(
              'px-4 py-3 text-sm',
              column === 'select' && 'w-10',
              column === 'actions' && 'w-20',
              column === 'name' && 'min-w-[200px]',
              column === 'health' && 'min-w-[180px]'
            )}
          >
            <CellContent
              column={column}
              location={location}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              isSelected={isSelected}
            />
          </td>
        ))}
      </tr>
    )
  },
  (prev, next) => {
    // Custom equality check for memoization
    return (
      prev.location.id === next.location.id &&
      prev.isSelected === next.isSelected &&
      JSON.stringify(prev.columns) === JSON.stringify(next.columns) &&
      prev.location.active === next.location.active &&
      prev.location.health === next.location.health &&
      prev.location.cameraCount === next.location.cameraCount
    )
  }
)
LocationRow.displayName = 'LocationRow'

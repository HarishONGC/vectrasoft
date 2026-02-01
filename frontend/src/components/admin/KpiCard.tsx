import { memo } from 'react'
import type { ReactNode } from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '../../app/cn'
import { StatusTrend } from '../ui/StatusTrend'

interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
    format?: 'percent' | 'number'
  }
  status?: 'success' | 'warning' | 'error' | 'info'
  onClick?: () => void
  className?: string
  loading?: boolean
  comparison?: string
  compact?: boolean
}

const statusColors = {
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

const statusIconColors = {
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
}

const TrendIcon = memo(({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
  const iconProps = { size: 16, className: 'flex-shrink-0' }
  
  switch (direction) {
    case 'up':
      return <ArrowUp {...iconProps} className="text-green-600" />
    case 'down':
      return <ArrowDown {...iconProps} className="text-red-600" />
    case 'stable':
      return <Minus {...iconProps} className="text-gray-400" />
  }
})
TrendIcon.displayName = 'TrendIcon'

export const KpiCard = memo(
  ({
    label,
    value,
    unit,
    icon,
    trend,
    status = 'info',
    onClick,
    className,
    loading = false,
    comparison,
    compact = false,
  }: KpiCardProps) => {
    if (loading) {
      return (
        <div
          className={cn(
            'rounded-lg border border-gray-200 bg-white p-4 cursor-wait',
            compact ? 'p-3' : 'p-4'
          )}
        >
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        </div>
      )
    }

    return (
      <div
        onClick={onClick}
        className={cn(
          'rounded-lg border-2 transition-all',
          statusColors[status],
          onClick ? 'cursor-pointer hover:shadow-md' : '',
          className
        )}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <div className={cn(compact ? 'p-3 space-y-1.5' : 'p-4 space-y-2')}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={cn(
                  'text-gray-600 font-medium',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                {label}
              </p>
            </div>
            {icon && (
              <div className={cn('flex-shrink-0', statusIconColors[status])}>
                {icon}
              </div>
            )}
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'font-bold text-gray-900',
                compact ? 'text-lg' : 'text-2xl'
              )}
            >
              {value}
            </span>
            {unit && (
              <span className={cn('text-gray-600 font-medium', compact ? 'text-xs' : 'text-sm')}>
                {unit}
              </span>
            )}
          </div>

          {/* Trend or Comparison */}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <TrendIcon direction={trend.direction} />
              <StatusTrend
                current={Number(value)}
                previous={Number(value) - trend.value}
                format={trend.format || 'percent'}
                size={compact ? 'sm' : 'md'}
              />
            </div>
          )}

          {comparison && !trend && (
            <p className={cn('text-gray-600 pt-1', compact ? 'text-xs' : 'text-xs')}>
              {comparison}
            </p>
          )}
        </div>
      </div>
    )
  }
)

KpiCard.displayName = 'KpiCard'

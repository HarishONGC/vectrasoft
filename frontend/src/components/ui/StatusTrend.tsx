import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../app/cn'

export interface StatusTrendProps {
  current: number
  previous?: number
  format?: 'number' | 'percent'
  direction?: 'up' | 'down'
  positive?: 'up' | 'down'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const StatusTrend: React.FC<StatusTrendProps> = ({
  current,
  previous,
  format = 'number',
  direction,
  positive = 'up',
  className,
  size = 'md',
}) => {
  const formatValue = (value: number) => {
    if (format === 'percent') return `${value}%`
    return value.toString()
  }

  // Calculate trend
  let trend: 'up' | 'down' | 'stable' | undefined
  let change = 0

  if (previous !== undefined) {
    if (current > previous) trend = 'up'
    else if (current < previous) trend = 'down'
    else trend = 'stable'

    change = Math.abs(current - previous)
  }

  const overrideTrend = direction || trend

  // Determine color based on direction and positive meaning
  const getTrendColor = () => {
    if (!overrideTrend) return 'text-muted'

    if (overrideTrend === 'stable') return 'text-muted'

    const isPositive = (overrideTrend === 'up' && positive === 'up') ||
                      (overrideTrend === 'down' && positive === 'down')

    if (isPositive) return 'text-emerald-600'
    return 'text-rose-600'
  }

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('font-semibold', size === 'lg' ? 'text-lg' : 'text-sm')}>
        {formatValue(current)}
      </span>

      {overrideTrend && (
        <span className={getTrendColor()}>
          {overrideTrend === 'up' && <TrendingUp size={iconSize} />}
          {overrideTrend === 'down' && <TrendingDown size={iconSize} />}
          {overrideTrend === 'stable' && <Minus size={iconSize} />}
        </span>
      )}

      {previous !== undefined && change > 0 && (
        <span className={cn(
          'text-xs font-medium',
          getTrendColor()
        )}>
          {format === 'percent' ? `${change}%` : change}
        </span>
      )}
    </div>
  )
}

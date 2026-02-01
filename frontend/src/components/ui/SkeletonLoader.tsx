import React from 'react'
import { cn } from '../../app/cn'

export interface SkeletonLoaderProps {
  rows?: number
  cols?: number
  variant?: 'card' | 'table' | 'list' | 'kpi'
  animate?: boolean
  className?: string
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 5,
  cols = 4,
  variant = 'table',
  animate = true,
  className,
}) => {
  const animationClass = animate ? 'animate-pulse' : ''

  const skeletonBg = 'bg-surface2'

  switch (variant) {
    case 'kpi':
      return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border border-border p-4 space-y-3',
                animationClass
              )}
            >
              <div className={cn('h-4 w-20 rounded', skeletonBg)} />
              <div className={cn('h-8 w-16 rounded', skeletonBg)} />
              <div className={cn('h-3 w-24 rounded', skeletonBg)} />
            </div>
          ))}
        </div>
      )

    case 'list':
      return (
        <div className={cn('space-y-3', className)}>
          {[...Array(rows)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border border-border p-4 space-y-2',
                animationClass
              )}
            >
              <div className={cn('h-4 w-3/4 rounded', skeletonBg)} />
              <div className={cn('h-3 w-1/2 rounded', skeletonBg)} />
            </div>
          ))}
        </div>
      )

    case 'card':
      return (
        <div
          className={cn(
            'rounded-lg border border-border p-6 space-y-4',
            animationClass,
            className
          )}
        >
          <div className={cn('h-6 w-1/3 rounded', skeletonBg)} />
          <div className="space-y-3">
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={cn('h-3 w-1/4 rounded', skeletonBg)} />
                <div className={cn('h-4 w-4/5 rounded', skeletonBg)} />
              </div>
            ))}
          </div>
        </div>
      )

    case 'table':
    default:
      return (
        <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
          {/* Header */}
          <div
            className={cn(
              'bg-surface2 border-b border-border px-4 py-3 grid gap-2',
              animationClass
            )}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {[...Array(cols)].map((_, i) => (
              <div key={i} className={cn('h-4 rounded', skeletonBg)} />
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {[...Array(rows)].map((_, rowIdx) => (
              <div
                key={rowIdx}
                className={cn(
                  'px-4 py-3 grid gap-2',
                  animationClass,
                  rowIdx % 2 === 0 ? 'bg-surface' : 'bg-surface/50'
                )}
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              >
                {[...Array(cols)].map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className={cn(
                      'h-4 rounded',
                      skeletonBg,
                      colIdx === 0 && 'w-3/4',
                      colIdx === cols - 1 && 'ml-auto w-1/2'
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )
  }
}

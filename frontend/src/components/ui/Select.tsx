import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../app/cn'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-lg bg-surface2 px-3 text-sm text-text',
        'border border-border/80 focus:outline-none focus:ring-2 focus:ring-brand-400/40',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

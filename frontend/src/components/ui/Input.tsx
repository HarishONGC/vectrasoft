import type { InputHTMLAttributes } from 'react'
import { cn } from '../../app/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg bg-surface2 px-3 text-sm text-text placeholder:text-muted',
        'border border-border/80 focus:outline-none focus:ring-2 focus:ring-brand-400/40',
        className,
      )}
      {...props}
    />
  )
}

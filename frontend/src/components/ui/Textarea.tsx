import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../app/cn'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg bg-surface2 px-3 py-2 text-sm text-text placeholder:text-muted',
        'border border-border/80 focus:outline-none focus:ring-2 focus:ring-brand-400/40',
        className,
      )}
      {...props}
    />
  )
}

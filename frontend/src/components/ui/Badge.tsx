import type { HTMLAttributes } from 'react'
import { cn } from '../../app/cn'

type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad'

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: 'bg-surface2 text-text',
    brand: 'bg-brand-600/15 text-brand-600 dark:text-brand-300',
    ok: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    warn: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    bad: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        'ring-1 ring-border/70',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

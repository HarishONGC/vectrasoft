import { cn } from '../app/cn'

export function SignalStrength({
  strength = 0,
  className,
}: {
  strength?: 0 | 1 | 2 | 3 | 4
  className?: string
}) {
  const bars = [1, 2, 3, 4] as const
  return (
    <div className={cn('flex items-end gap-0.5', className)} aria-label={`Signal ${strength}/4`}>
      {bars.map((b) => {
        const on = strength >= b
        const height = b === 1 ? 'h-2' : b === 2 ? 'h-3' : b === 3 ? 'h-4' : 'h-5'
        return <span key={b} className={cn('w-1 rounded-sm', height, on ? 'bg-brand-500' : 'bg-border')} />
      })}
    </div>
  )
}

import { cn } from '../app/cn'
import { Card } from './ui/Card'
import { useEffect, useState } from 'react'

export function KpiCard({
  label,
  value,
  tone = 'neutral',
  delta,
}: {
  label: string
  value: number | string
  tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'brand'
  delta?: number
}) {
  const borderColor =
    tone === 'ok'
      ? 'border-emerald-500/30'
      : tone === 'warn'
        ? 'border-amber-500/30'
        : tone === 'bad'
          ? 'border-rose-500/30'
          : tone === 'brand'
            ? 'border-brand-500/30'
            : 'border-border'

  return (
    <Card className={cn('p-4', borderColor)}>
      <div className="text-xs font-bold uppercase tracking-wider text-muted">{label}</div>
      <KpiValue value={value} delta={delta} />
    </Card>
  )
}

function KpiValue({ value, delta }: { value: number | string; delta?: number }) {
  const [pulse, setPulse] = useState(false)
  const [prev, setPrev] = useState<number | string>(value)

  useEffect(() => {
    if (value === prev) return
    setPrev(value)
    setPulse(true)
    const t = window.setTimeout(() => setPulse(false), 350)
    return () => window.clearTimeout(t)
  }, [value, prev])

  const deltaTone =
    typeof delta === 'number' && delta !== 0
      ? delta > 0
        ? 'text-emerald-600'
        : 'text-rose-600'
      : 'text-muted'

  const deltaText =
    typeof delta === 'number'
      ? delta === 0
        ? '—'
        : `${delta > 0 ? '↑' : '↓'} ${Math.abs(delta)}`
      : undefined

  return (
    <div className="mt-1.5 flex items-end justify-between gap-2">
      <div className={cn('text-3xl font-bold tabular-nums transition', pulse && 'scale-[1.02]')}>
        {value}
      </div>
      {deltaText ? <div className={cn('text-xs font-semibold tabular-nums', deltaTone)}>{deltaText}</div> : null}
    </div>
  )
}

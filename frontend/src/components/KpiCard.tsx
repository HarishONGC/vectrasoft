import { cn } from '../app/cn'
import { useEffect, useState } from 'react'
import { Globe, CheckCircle, Activity, Trash2 } from 'lucide-react'

export function KpiCard({
  label,
  value,
  tone = 'neutral',
  delta,
  icon,
}: {
  label: string
  value: number | string
  tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'brand'
  delta?: number
  icon?: 'globe' | 'check' | 'activity' | 'trash'
}) {
  const borderColor =
    tone === 'ok'
      ? 'border-l-emerald-500'
      : tone === 'warn'
        ? 'border-l-amber-500'
        : tone === 'bad'
          ? 'border-l-rose-500'
          : tone === 'brand'
            ? 'border-l-blue-500'
            : 'border-l-slate-400'

  const iconBgColor =
    tone === 'ok'
      ? 'bg-emerald-100'
      : tone === 'warn'
        ? 'bg-amber-100'
        : tone === 'bad'
          ? 'bg-rose-100'
          : tone === 'brand'
            ? 'bg-blue-100'
            : 'bg-slate-100'

  const iconColor =
    tone === 'ok'
      ? 'text-emerald-600'
      : tone === 'warn'
        ? 'text-amber-600'
        : tone === 'bad'
          ? 'text-rose-600'
          : tone === 'brand'
            ? 'text-blue-600'
            : 'text-slate-600'

  const IconComponent = 
    icon === 'globe' ? Globe :
    icon === 'check' ? CheckCircle :
    icon === 'activity' ? Activity :
    icon === 'trash' ? Trash2 :
    Globe

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border-l-4 p-6',
        'flex items-start gap-4',
        borderColor
      )}
    >
      {/* Icon */}
      <div className={cn('rounded-full p-3', iconBgColor)}>
        <IconComponent className={cn('w-6 h-6', iconColor)} />
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <KpiValue value={value} delta={delta} />
      </div>
    </div>
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
    <div className="mt-1 flex items-end justify-between gap-2">
      <div className={cn('text-2xl font-bold text-slate-800 tabular-nums transition', pulse && 'scale-[1.02]')}>
        {value}
      </div>
      {deltaText ? <div className={cn('text-xs font-semibold tabular-nums', deltaTone)}>{deltaText}</div> : null}
    </div>
  )
}

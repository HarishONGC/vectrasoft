import { cn } from '../../app/cn'

export type Status = 'ONLINE' | 'OFFLINE' | 'WARNING'

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const color =
    status === 'ONLINE'
      ? 'bg-ok'
      : status === 'OFFLINE'
        ? 'bg-bad'
        : 'bg-warn'

  return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', color, className)} />
}

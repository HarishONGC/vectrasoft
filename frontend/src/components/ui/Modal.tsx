import type { PropsWithChildren } from 'react'
import { cn } from '../../app/cn'
import { Button } from './Button'

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void; className?: string }>) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-y-auto" onMouseDown={onClose}>
      <div
        className={cn(
          'mx-auto w-full max-w-2xl rounded-2xl bg-surface ring-1 ring-border/80',
          className,
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="text-sm font-semibold">{title}</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

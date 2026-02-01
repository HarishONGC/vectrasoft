import React, { useState } from 'react'
import { cn } from '../../app/cn'

export interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'danger' | 'warning'
  description?: string
  requiresConfirm?: boolean
}

export interface BulkActionsPanelProps {
  selectedCount: number
  actions: BulkAction[]
  onAction: (actionId: string) => void
  onClear: () => void
  isProcessing?: boolean
  processingMessage?: string
  className?: string
}

export const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  selectedCount,
  actions,
  onAction,
  onClear,
  isProcessing = false,
  processingMessage,
  className,
}) => {
  const [expandedAction, setExpandedAction] = useState<string | null>(null)

  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-40 rounded-lg border border-border bg-surface shadow-2xl max-w-md',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-text">
            {selectedCount} location{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={onClear}
          className="rounded p-1 text-muted hover:bg-surface2 hover:text-text"
        >
          ✕
        </button>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="border-b border-border px-4 py-3 bg-blue-500/5">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{processingMessage || 'Processing...'}</span>
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className="space-y-2 p-4">
        {actions.map(action => (
          <div key={action.id}>
            <button
              onClick={() => {
                if (action.requiresConfirm) {
                  setExpandedAction(expandedAction === action.id ? null : action.id)
                } else {
                  onAction(action.id)
                }
              }}
              disabled={isProcessing}
              className={cn(
                'w-full flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-surface2 disabled:opacity-50 disabled:cursor-not-allowed',
                action.variant === 'danger' &&
                  'text-rose-600 hover:bg-rose-500/10',
                action.variant === 'warning' &&
                  'text-amber-600 hover:bg-amber-500/10',
                action.variant !== 'danger' &&
                  action.variant !== 'warning' &&
                  'text-text'
              )}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="flex-1 text-left">{action.label}</span>
              {action.requiresConfirm && expandedAction !== action.id && (
                <span className="text-xs text-muted">→</span>
              )}
            </button>

            {/* Confirmation UI */}
            {action.requiresConfirm && expandedAction === action.id && (
              <div className="mt-2 rounded bg-surface2 p-3 space-y-2 border border-border">
                {action.description && (
                  <p className="text-xs text-muted">{action.description}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedAction(null)}
                    className="flex-1 rounded px-2 py-1 text-xs font-medium text-muted hover:bg-surface hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onAction(action.id)
                      setExpandedAction(null)
                    }}
                    className={cn(
                      'flex-1 rounded px-2 py-1 text-xs font-medium text-white',
                      action.variant === 'danger'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-brand-500 hover:bg-brand-600'
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border flex gap-2 bg-surface2 px-4 py-2">
        <button
          onClick={onClear}
          disabled={isProcessing}
          className="text-xs font-medium text-muted hover:text-text disabled:opacity-50"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}

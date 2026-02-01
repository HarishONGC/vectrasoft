import React, { useState } from 'react'
import { Bookmark, Trash2, Star } from 'lucide-react'
import { cn } from '../../app/cn'
import { Button } from '../ui/Button'

export interface FilterPreset {
  id: string
  name: string
  isDefault: boolean
  createdAt: Date
}

export interface FilterPresetProps {
  presets: FilterPreset[]
  onLoad: (presetId: string) => void
  onSave: (name: string) => void
  onDelete: (presetId: string) => void
  onSetDefault: (presetId: string) => void
  currentCanSave?: boolean
  className?: string
}

export const FilterPreset: React.FC<FilterPresetProps> = ({
  presets,
  onLoad,
  onSave,
  onDelete,
  onSetDefault,
  currentCanSave = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [presetName, setPresetName] = useState('')

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName)
      setPresetName('')
      setShowSaveModal(false)
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <Button
        variant="secondary"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bookmark size={16} />
        Presets
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
          {/* Presets List */}
          <div className="max-h-64 overflow-y-auto">
            {presets.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-muted">
                No saved presets
              </div>
            ) : (
              presets.map(preset => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between px-3 py-2 border-b border-border hover:bg-surface2 group"
                >
                  <button
                    onClick={() => {
                      onLoad(preset.id)
                      setIsOpen(false)
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium text-text group-hover:text-brand-600">
                      {preset.name}
                    </div>
                    <div className="text-xs text-muted">
                      {preset.createdAt.toLocaleDateString()}
                    </div>
                  </button>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {preset.isDefault && (
                      <span className="text-xs px-2 py-1 rounded bg-brand-500/10 text-brand-600 font-medium">
                        Default
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        if (!preset.isDefault) {
                          onSetDefault(preset.id)
                        }
                      }}
                      title={preset.isDefault ? 'Already default' : 'Set as default'}
                      className={cn(
                        'rounded p-1 transition-colors',
                        preset.isDefault
                          ? 'text-brand-500'
                          : 'text-muted hover:bg-surface hover:text-brand-600'
                      )}
                    >
                      <Star size={14} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onDelete(preset.id)
                      }}
                      className="rounded p-1 text-muted hover:bg-surface hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Save Current Preset */}
          {!showSaveModal ? (
            <div className="border-t border-border p-2">
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!currentCanSave}
                className="w-full rounded px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + Save Current Filters
              </button>
            </div>
          ) : (
            <div className="border-t border-border p-3 space-y-2">
              <input
                type="text"
                placeholder="Preset name..."
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
                className="w-full rounded border border-border bg-surface2 px-2 py-1.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSaveModal(false)
                    setPresetName('')
                  }}
                  className="flex-1 rounded px-2 py-1 text-xs font-medium text-muted hover:bg-surface2 hover:text-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!presetName.trim()}
                  className="flex-1 rounded bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

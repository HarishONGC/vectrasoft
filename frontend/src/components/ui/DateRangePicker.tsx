import React, { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { cn } from '../../app/cn'

export interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (range: { start: Date | null; end: Date | null }) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  presets?: boolean
}

type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year'

const getPresetRange = (preset: Preset): { start: Date; end: Date } => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 86400000 - 1) }
    case 'week': {
      const start = new Date(today)
      start.setDate(start.getDate() - start.getDay())
      const end = new Date(start.getTime() + 7 * 86400000 - 1)
      return { start, end }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      return { start, end }
    }
    case 'quarter': {
      const q = Math.floor(today.getMonth() / 3)
      const start = new Date(today.getFullYear(), q * 3, 1)
      const end = new Date(today.getFullYear(), (q + 1) * 3, 0, 23, 59, 59)
      return { start, end }
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1)
      const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59)
      return { start, end }
    }
  }
}

const formatDate = (date: Date | null): string => {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const parseDate = (input: string): Date | null => {
  const date = new Date(input)
  return isNaN(date.getTime()) ? null : date
}

export const DateRangePicker = React.forwardRef<
  HTMLDivElement,
  DateRangePickerProps
>(
  (
    {
      startDate,
      endDate,
      onChange,
      placeholder = 'Select date range...',
      className,
      disabled = false,
      presets = true,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [startInput, setStartInput] = useState(formatDate(startDate))
    const [endInput, setEndInput] = useState(formatDate(endDate))

    const displayText = startDate && endDate
      ? `${formatDate(startDate)} → ${formatDate(endDate)}`
      : placeholder

    const handlePreset = (preset: Preset) => {
      const range = getPresetRange(preset)
      onChange({ start: range.start, end: range.end })
      setStartInput(formatDate(range.start))
      setEndInput(formatDate(range.end))
      setIsOpen(false)
    }

    const handleApply = () => {
      const start = parseDate(startInput)
      const end = parseDate(endInput)

      if (start && end && start <= end) {
        onChange({ start, end })
        setIsOpen(false)
      }
    }

    const handleClear = () => {
      onChange({ start: null, end: null })
      setStartInput('')
      setEndInput('')
    }

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors',
            'hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-brand-400/40',
            isOpen && 'ring-2 ring-brand-400/40',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <Calendar size={16} className="text-muted" />
          <span className={cn('flex-1 text-left', !startDate && 'text-muted')}>
            {displayText}
          </span>
          {startDate && endDate && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                handleClear()
              }}
              className="rounded p-1 text-muted hover:bg-surface2 hover:text-text"
            >
              <X size={16} />
            </button>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-surface shadow-lg p-4 space-y-4">
            {/* Presets */}
            {presets && (
              <div className="grid grid-cols-5 gap-2">
                {(
                  [
                    { preset: 'today', label: 'Today' },
                    { preset: 'week', label: 'Week' },
                    { preset: 'month', label: 'Month' },
                    { preset: 'quarter', label: 'Quarter' },
                    { preset: 'year', label: 'Year' },
                  ] as const
                ).map(({ preset, label }) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className="rounded bg-surface2 px-2 py-1 text-xs font-medium text-muted hover:bg-brand-500/10 hover:text-brand-600 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Date Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startInput}
                  onChange={e => setStartInput(e.target.value)}
                  className="w-full rounded border border-border bg-surface2 px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endInput}
                  onChange={e => setEndInput(e.target.value)}
                  className="w-full rounded border border-border bg-surface2 px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded px-2 py-1.5 text-xs font-medium text-muted hover:bg-surface2"
              >
                Cancel
              </button>
              {startDate && endDate && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 rounded px-2 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded bg-brand-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DateRangePicker.displayName = 'DateRangePicker'

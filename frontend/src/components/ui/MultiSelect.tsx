import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '../../app/cn'

export interface MultiSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  maxTags?: number
  className?: string
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      values,
      onChange,
      placeholder = 'Select items...',
      searchable = true,
      clearable = true,
      maxTags = 3,
      className,
      disabled = false,
      onOpenChange,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    // Filter options based on search
    const filteredOptions = searchable
      ? options.filter(opt =>
          opt.label.toLowerCase().includes(searchInput.toLowerCase())
        )
      : options

    // Get selected labels
    const selectedOptions = options.filter(opt => values.includes(opt.value))
    const displayCount = selectedOptions.length > maxTags
      ? maxTags - 1
      : selectedOptions.length

    // Handle option toggle
    const handleToggle = (value: string) => {
      const newValues = values.includes(value)
        ? values.filter(v => v !== value)
        : [...values, value]
      onChange(newValues)
    }

    // Handle clear all
    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange([])
    }

    // Handle dropdown toggle
    const handleToggleDropdown = () => {
      const newOpen = !isOpen
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false)
          onOpenChange?.(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
          document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, onOpenChange])

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    return (
      <div ref={setRefs} className={cn('relative w-full', className)}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-left text-text transition-colors',
            'hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-brand-400/40',
            isOpen && 'ring-2 ring-brand-400/40',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted">{placeholder}</span>
            ) : (
              <>
                {selectedOptions.slice(0, displayCount).map(opt => (
                  <span
                    key={opt.value}
                    className="flex items-center gap-1 rounded bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-600"
                  >
                    {opt.icon && <span>{opt.icon}</span>}
                    {opt.label}
                  </span>
                ))}
                {selectedOptions.length > maxTags && (
                  <span className="flex items-center gap-1 rounded bg-surface2 px-2 py-1 text-xs font-medium text-muted">
                    +{selectedOptions.length - (maxTags - 1)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {clearable && values.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded p-1 text-muted hover:bg-surface2 hover:text-text"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={cn(
                'transition-transform text-muted',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-full min-w-[200px] rounded-lg border border-border bg-surface shadow-lg">
            {/* Search Input */}
            {searchable && (
              <div className="border-b border-border p-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full rounded border border-border bg-surface2 px-2 py-1.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-center text-sm text-muted">
                  No options found
                </div>
              ) : (
                filteredOptions.map(option => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface2',
                      values.includes(option.value) && 'bg-brand-500/5'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={values.includes(option.value)}
                      onChange={() => handleToggle(option.value)}
                      className="rounded border-border bg-surface text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    {option.icon && <span>{option.icon}</span>}
                    <span className="text-text">{option.label}</span>
                  </label>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-3 py-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onOpenChange?.(false)
                }}
                className="flex-1 rounded px-2 py-1 text-xs font-medium text-muted hover:bg-surface2 hover:text-text"
              >
                Done
              </button>
              {values.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onChange([])
                    setSearchInput('')
                  }}
                  className="flex-1 rounded px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-500/10"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'

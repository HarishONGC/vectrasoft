import { memo, useCallback, useState } from 'react'
import { Search, X, Lightbulb } from 'lucide-react'
import { cn } from '../../app/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onAdvancedToggle?: (enabled: boolean) => void
  advancedEnabled?: boolean
  className?: string
  showSyntaxHints?: boolean
}

const syntaxHints = [
  { prefix: 'region:', example: 'region:north', description: 'Filter by region' },
  { prefix: 'status:', example: 'status:active', description: 'Filter by status' },
  { prefix: 'sla:', example: 'sla:high', description: 'Filter by SLA level' },
  { prefix: 'cameras:', example: 'cameras:>5', description: 'Filter by camera count' },
  { prefix: 'health:', example: 'health:<80', description: 'Filter by health score' },
  { prefix: 'city:', example: 'city:london', description: 'Filter by city' },
]

const SyntaxHintPanel = memo(
  ({ visible, query }: { visible: boolean; query: string }) => {
    if (!visible) return null

    // Show hints if user has started typing a filter prefix
    const matchingHints = syntaxHints.filter(
      (h) => !query || query.toLowerCase().includes(h.prefix.toLowerCase()) || query.includes(':')
    )

    return (
      <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Advanced Search Syntax
            </span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {matchingHints.length > 0 ? (
              matchingHints.map((hint) => (
                <div key={hint.prefix} className="p-2 hover:bg-gray-50 rounded cursor-help">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">
                      {hint.example}
                    </code>
                    <span className="text-xs text-gray-600">{hint.description}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-2">
                Try: region:, status:, sla:, cameras:, health:, city:
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Combine filters:</span> region:north status:active cameras:{'>'}5
            </p>
          </div>
        </div>
      </div>
    )
  }
)
SyntaxHintPanel.displayName = 'SyntaxHintPanel'

export const SearchInput = memo(
  ({
    value,
    onChange,
    placeholder = 'Search locations...',
    onAdvancedToggle,
    advancedEnabled = false,
    className,
    showSyntaxHints = true,
  }: SearchInputProps) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleClear = useCallback(() => {
      onChange('')
    }, [onChange])

    const handleAdvancedToggle = useCallback(() => {
      onAdvancedToggle?.(!advancedEnabled)
    }, [advancedEnabled, onAdvancedToggle])

    const hasSyntax = value.includes(':')

    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
            isFocused
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <Search
            size={18}
            className={cn(
              'flex-shrink-0',
              isFocused ? 'text-blue-600' : 'text-gray-400'
            )}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 text-gray-900"
            aria-label="Search locations"
            spellCheck="false"
          />

          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}

          {onAdvancedToggle && (
            <div className="hidden sm:block border-l border-gray-200 pl-2">
              <button
                onClick={handleAdvancedToggle}
                className={cn(
                  'px-2 py-0.5 text-xs font-semibold rounded transition-colors',
                  advancedEnabled
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                aria-pressed={advancedEnabled}
                title="Toggle advanced search syntax"
              >
                {hasSyntax || advancedEnabled ? '∑' : 'Σ'}
              </button>
            </div>
          )}
        </div>

        {/* Syntax Hints Panel */}
        {showSyntaxHints && isFocused && advancedEnabled && (
          <SyntaxHintPanel visible={true} query={value} />
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

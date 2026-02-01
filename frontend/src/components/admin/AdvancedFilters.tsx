import { memo, useCallback, useState, useMemo } from 'react'
import { RotateCcw, Check } from 'lucide-react'
import { cn } from '../../app/cn'
import { Modal } from '../ui/Modal'
import { MultiSelect } from '../ui/MultiSelect'
import { DateRangePicker } from '../ui/DateRangePicker'

interface FilterValue {
  status?: string[]
  region?: string[]
  sla?: string[]
  city?: string[]
  cameraCountMin?: number
  cameraCountMax?: number
  healthMin?: number
  healthMax?: number
  createdAfter?: Date
  createdBefore?: Date
  lastUpdateAfter?: Date
  lastUpdateBefore?: Date
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterValue
  onApply: (filters: FilterValue) => void
  availableRegions?: string[]
  availableCities?: string[]
  statusOptions?: { label: string; value: string }[]
  slaOptions?: { label: string; value: string }[]
  isLoading?: boolean
}

const defaultStatusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Offline', value: 'offline' },
]

const defaultSlaOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const RangeSlider = memo(
  ({
    label,
    min,
    max,
    value,
    onChange,
    unit = '',
  }: {
    label: string
    min: number
    max: number
    value?: { min: number; max: number }
    onChange: (v: { min: number; max: number }) => void
    unit?: string
  }) => {
    const currentMin = value?.min ?? min
    const currentMax = value?.max ?? max

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">{label}</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={min}
            max={max}
            value={currentMin}
            onChange={(e) =>
              onChange({
                min: Math.min(Number(e.currentTarget.value), currentMax),
                max: currentMax,
              })
            }
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={`${label} minimum`}
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="number"
            min={min}
            max={max}
            value={currentMax}
            onChange={(e) =>
              onChange({
                min: currentMin,
                max: Math.max(Number(e.currentTarget.value), currentMin),
              })
            }
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={`${label} maximum`}
          />
          {unit && <span className="text-gray-600 text-sm">{unit}</span>}
        </div>
      </div>
    )
  }
)
RangeSlider.displayName = 'RangeSlider'

export const AdvancedFilters = memo(
  ({
    isOpen,
    onClose,
    filters,
    onApply,
    availableRegions = ['North', 'South', 'East', 'West', 'Central'],
    availableCities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
    statusOptions = defaultStatusOptions,
    slaOptions = defaultSlaOptions,
    isLoading = false,
  }: AdvancedFiltersProps) => {
    const [localFilters, setLocalFilters] = useState<FilterValue>(filters)

    const statusCount = useMemo(
      () => Object.values(localFilters).filter(Boolean).length,
      [localFilters]
    )

    const handleReset = useCallback(() => {
      setLocalFilters({})
    }, [])

    const handleApply = useCallback(() => {
      onApply(localFilters)
      onClose()
    }, [localFilters, onApply, onClose])

    const handleStatusChange = useCallback((values: string[]) => {
      setLocalFilters((prev) => ({
        ...prev,
        status: values.length > 0 ? values : undefined,
      }))
    }, [])

    const handleRegionChange = useCallback((values: string[]) => {
      setLocalFilters((prev) => ({
        ...prev,
        region: values.length > 0 ? values : undefined,
      }))
    }, [])

    const handleCityChange = useCallback((values: string[]) => {
      setLocalFilters((prev) => ({
        ...prev,
        city: values.length > 0 ? values : undefined,
      }))
    }, [])

    const handleSlaChange = useCallback((values: string[]) => {
      setLocalFilters((prev) => ({
        ...prev,
        sla: values.length > 0 ? values : undefined,
      }))
    }, [])

    const handleCameraCountChange = useCallback(
      (v: { min: number; max: number }) => {
        setLocalFilters((prev) => ({
          ...prev,
          cameraCountMin: v.min,
          cameraCountMax: v.max,
        }))
      },
      []
    )

    const handleHealthChange = useCallback(
      (v: { min: number; max: number }) => {
        setLocalFilters((prev) => ({
          ...prev,
          healthMin: v.min,
          healthMax: v.max,
        }))
      },
      []
    )

    const handleCreatedDateChange = useCallback(
      (range: { start: Date | null; end: Date | null }) => {
        setLocalFilters((prev) => ({
          ...prev,
          createdAfter: range.start ?? undefined,
          createdBefore: range.end ?? undefined,
        }))
      },
      []
    )

    const handleLastUpdateChange = useCallback(
      (range: { start: Date | null; end: Date | null }) => {
        setLocalFilters((prev) => ({
          ...prev,
          lastUpdateAfter: range.start ?? undefined,
          lastUpdateBefore: range.end ?? undefined,
        }))
      },
      []
    )

    return (
      <Modal open={isOpen} onClose={onClose} title="Advanced Filters" className="max-w-4xl">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Status
            </label>
            <MultiSelect
              options={statusOptions}
              values={localFilters.status || []}
              onChange={handleStatusChange}
              placeholder="Select statuses..."
            />
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Region
            </label>
            <MultiSelect
              options={availableRegions.map((r) => ({ label: r, value: r }))}
              values={localFilters.region || []}
              onChange={handleRegionChange}
              placeholder="Select regions..."
            />
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              City
            </label>
            <MultiSelect
              options={availableCities.map((c) => ({ label: c, value: c }))}
              values={localFilters.city || []}
              onChange={handleCityChange}
              placeholder="Select cities..."
            />
          </div>

          {/* SLA Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              SLA
            </label>
            <MultiSelect
              options={slaOptions}
              values={localFilters.sla || []}
              onChange={handleSlaChange}
              placeholder="Select SLA levels..."
            />
          </div>

          {/* Camera Count Range */}
          <RangeSlider
            label="Camera Count"
            min={0}
            max={100}
            value={
              localFilters.cameraCountMin !== undefined
                ? {
                    min: localFilters.cameraCountMin,
                    max: localFilters.cameraCountMax ?? 100,
                  }
                : undefined
            }
            onChange={handleCameraCountChange}
            unit="cameras"
          />

          {/* Health Score Range */}
          <RangeSlider
            label="Health Score"
            min={0}
            max={100}
            value={
              localFilters.healthMin !== undefined
                ? {
                    min: localFilters.healthMin,
                    max: localFilters.healthMax ?? 100,
                  }
                : undefined
            }
            onChange={handleHealthChange}
            unit="%"
          />

          {/* Created Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Created Date
            </label>
            <DateRangePicker
              startDate={localFilters.createdAfter || null}
              endDate={localFilters.createdBefore || null}
              onChange={handleCreatedDateChange}
            />
          </div>

          {/* Last Update Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Last Updated
            </label>
            <DateRangePicker
              startDate={localFilters.lastUpdateAfter || null}
              endDate={localFilters.lastUpdateBefore || null}
              onChange={handleLastUpdateChange}
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            disabled={isLoading || statusCount === 0}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors',
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <Check size={16} />
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    )
  }
)

AdvancedFilters.displayName = 'AdvancedFilters'

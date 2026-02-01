import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../app/cn'
import { LocationRow } from './LocationRow'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import type { Location } from '../../api/types'

type LocationAdminRow = Location & {
  status?: 'active' | 'inactive' | 'maintenance' | 'offline' | 'disabled'
  health?: number
  healthTrend?: number
  cameraCount?: number
  alertCount?: number
  sla?: string
  lastUpdate?: string
}

interface Column {
  id: string
  label: string
  sortable?: boolean
  visible: boolean
  width?: string
}

interface EnhancedTableProps {
  locations: LocationAdminRow[]
  isLoading?: boolean
  selectedIds: Set<string>
  onSelectChange: (ids: Set<string>) => void
  onEdit: (location: LocationAdminRow) => void
  onDelete: (id: string) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string, order: 'asc' | 'desc') => void
  className?: string
}

const defaultColumns: Column[] = [
  { id: 'select', label: '', visible: true },
  { id: 'name', label: 'Location', sortable: true, visible: true },
  { id: 'status', label: 'Status', sortable: true, visible: true },
  { id: 'health', label: 'Health', sortable: true, visible: true },
  { id: 'cameras', label: 'Cameras', sortable: true, visible: true },
  { id: 'region', label: 'Region', sortable: true, visible: true },
  { id: 'sla', label: 'SLA', sortable: true, visible: true },
  { id: 'alerts', label: 'Alerts', sortable: true, visible: true },
  { id: 'actions', label: '', visible: true },
]

const TableHeader = memo(
  ({
    columns,
    sortBy,
    sortOrder,
    onSort,
    selectedCount,
    totalCount,
    onSelectAll,
  }: {
    columns: Column[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    onSort?: (column: string, order: 'asc' | 'desc') => void
    selectedCount: number
    totalCount: number
    onSelectAll: (select: boolean) => void
  }) => {
    const selectAllRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (!selectAllRef.current) return
      selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < totalCount
    }, [selectedCount, totalCount])

    return (
      <thead className="sticky top-0 bg-white border-b-2 border-gray-200 z-10">
        <tr>
          {columns.map((column) => {
            if (!column.visible) return null

            if (column.id === 'select') {
              return (
                <th key={column.id} className="w-10 px-4 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={selectedCount === totalCount && totalCount > 0}
                    onChange={(e) => onSelectAll(e.currentTarget.checked)}
                    className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    aria-label="Select all locations"
                  />
                </th>
              )
            }

            if (column.id === 'actions') {
              return (
                <th key={column.id} className="w-20 px-4 py-3">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {column.label}
                  </span>
                </th>
              )
            }

            const isSorted = sortBy === column.id
            const isAsc = sortOrder === 'asc'

            return (
              <th key={column.id} className="px-4 py-3 text-left">
                <button
                  onClick={() => {
                    if (!onSort || !column.sortable) return
                    onSort(column.id, isSorted && isAsc ? 'desc' : 'asc')
                  }}
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide',
                    column.sortable ? 'cursor-pointer hover:text-gray-900' : 'cursor-default'
                  )}
                  disabled={!column.sortable}
                >
                  {column.label}
                  {column.sortable && isSorted && (
                    <span className="ml-1">
                      {isAsc ? (
                        <ChevronUp size={14} className="text-blue-600" />
                      ) : (
                        <ChevronDown size={14} className="text-blue-600" />
                      )}
                    </span>
                  )}
                </button>
              </th>
            )
          })}
        </tr>
      </thead>
    )
  }
)
TableHeader.displayName = 'TableHeader'

const ColumnVisibilityMenu = memo(
  ({
    columns,
    onToggle,
    isOpen,
  }: {
    columns: Column[]
    onToggle: (columnId: string) => void
    isOpen: boolean
  }) => {
    if (!isOpen) return null

    return (
      <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px]">
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-600 uppercase px-2 py-1.5 tracking-wide">
            Columns
          </p>
          {columns
            .filter((c) => c.id !== 'select' && c.id !== 'actions')
            .map((column) => (
              <button
                key={column.id}
                onClick={() => onToggle(column.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded transition-colors text-sm"
              >
                {column.visible ? (
                  <Eye size={14} className="text-gray-600" />
                ) : (
                  <EyeOff size={14} className="text-gray-400" />
                )}
                <span className={column.visible ? 'text-gray-900' : 'text-gray-500'}>
                  {column.label}
                </span>
              </button>
            ))}
        </div>
      </div>
    )
  }
)
ColumnVisibilityMenu.displayName = 'ColumnVisibilityMenu'

export const EnhancedTable = memo(
  ({
    locations,
    isLoading = false,
    selectedIds,
    onSelectChange,
    onEdit,
    onDelete,
    sortBy,
    sortOrder = 'asc',
    onSort,
    className,
  }: EnhancedTableProps) => {
    const [columns, setColumns] = useState<Column[]>(defaultColumns)
    const [columnMenuOpen, setColumnMenuOpen] = useState(false)

    const visibleColumns = useMemo(
      () => columns.filter((c) => c.visible),
      [columns]
    )

    const handleSelectLocation = useCallback(
      (id: string) => {
        const newIds = new Set(selectedIds)
        if (newIds.has(id)) {
          newIds.delete(id)
        } else {
          newIds.add(id)
        }
        onSelectChange(newIds)
      },
      [selectedIds, onSelectChange]
    )

    const handleSelectAll = useCallback(
      (select: boolean) => {
        if (select) {
          onSelectChange(new Set(locations.map((l) => l.id)))
        } else {
          onSelectChange(new Set())
        }
      },
      [locations, onSelectChange]
    )

    const handleToggleColumn = useCallback((columnId: string) => {
      setColumns((prev) =>
        prev.map((c) => (c.id === columnId ? { ...c, visible: !c.visible } : c))
      )
    }, [])

    if (isLoading) {
      return <SkeletonLoader variant="table" rows={10} cols={visibleColumns.length} />
    }

    return (
      <div className={cn('rounded-lg border border-gray-200 overflow-hidden', className)}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <TableHeader
              columns={visibleColumns}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
              selectedCount={selectedIds.size}
              totalCount={locations.length}
              onSelectAll={handleSelectAll}
            />

            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-12 text-center">
                    <p className="text-gray-500">No locations found</p>
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <LocationRow
                    key={location.id}
                    location={location}
                    isSelected={selectedIds.has(location.id)}
                    onSelect={handleSelectLocation}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    columns={visibleColumns.map((c) => c.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination hint */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {selectedIds.size > 0 ? (
              <>
                <span className="font-semibold">{selectedIds.size}</span> of{' '}
                <span className="font-semibold">{locations.length}</span> selected
              </>
            ) : (
              <>
                Showing <span className="font-semibold">{locations.length}</span> locations
              </>
            )}
          </p>
          <div className="relative">
            <button
              onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1"
              aria-label="Toggle column visibility"
            >
              Manage Columns
            </button>
            <ColumnVisibilityMenu
              columns={columns}
              onToggle={handleToggleColumn}
              isOpen={columnMenuOpen}
            />
          </div>
        </div>
      </div>
    )
  }
)
EnhancedTable.displayName = 'EnhancedTable'

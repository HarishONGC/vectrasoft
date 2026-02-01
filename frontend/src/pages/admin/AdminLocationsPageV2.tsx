import { useState, useMemo, useCallback } from 'react'
import { Plus, BarChart3, Filter, Trash2, MapPin, Target, Download } from 'lucide-react'
import type { Location } from '../../api/types'
import {
  useCreateLocation,
  useDeleteLocation,
  useLocationsAdmin,
  useUpdateLocation,
} from '../../api/hooks'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'

import { EnhancedTable } from '../../components/admin/EnhancedTable'
import { KpiCard } from '../../components/admin/KpiCard'
import { SearchInput } from '../../components/admin/SearchInput'
import { AdvancedFilters } from '../../components/admin/AdvancedFilters'
import { BulkActionsPanel, type BulkAction } from '../../components/admin/BulkActionsPanel'
import { FilterPreset } from '../../components/admin/FilterPreset'
import { useLocationFilters, type LocationWithMetrics } from '../../hooks/useLocationFilters'
import { Badge } from '../../components/ui/Badge'

type LocationWithAdmin = LocationWithMetrics & {
  status?: 'active' | 'disabled'
  alertCount?: number
  sla?: string
  lastUpdate?: string
}

interface LocationFormData extends Partial<Location> {
  name: string
  city: string
  region?: string
  sla?: string
}

export function AdminLocationsPageV2() {
  const [showDeleted, setShowDeleted] = useState(false)
  const { data: locations = [], isLoading } = useLocationsAdmin({ includeDeleted: showDeleted })

  const createLoc = useCreateLocation()
  const updateLoc = useUpdateLocation()
  const deleteLoc = useDeleteLocation()

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter & Search Logic
  const locationsWithMetrics: LocationWithAdmin[] = useMemo(
    () =>
      locations.map((loc) => {
        const anyLoc = loc as Location & {
          cameraCount?: number
          alertCount?: number
          health?: number
        }
        return {
          ...loc,
          status: loc.active ? 'active' : 'disabled',
          health: anyLoc.health ?? 0,
          cameraCount: anyLoc.cameraCount ?? 0,
          alertCount: anyLoc.alertCount ?? 0,
          sla: loc.slaPriority?.toLowerCase(),
          lastUpdate: loc.createdAt,
          onlineCount: 0,
        }
      }),
    [locations]
  )

  const {
    filteredLocations,
    filters,
    setFilters,
    hasActiveFilters,
    clearFilters,
  } = useLocationFilters(locationsWithMetrics, {
    search: searchQuery,
    advancedMode,
  })

  // Sort
  const sortedLocations = useMemo(() => {
    const sorted = [...filteredLocations]
    sorted.sort((a, b) => {
      let aVal = (a as any)[sortBy]
      let bVal = (b as any)[sortBy]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredLocations, sortBy, sortOrder])

  // Compute Stats
  const stats = useMemo(() => {
    const activeCount = locations.filter((l) => l.active).length
    const totalHealth = locationsWithMetrics.reduce((sum, l) => sum + (l.health || 0), 0)
    const avgHealth = locationsWithMetrics.length > 0 ? Math.round(totalHealth / locationsWithMetrics.length) : 0
    const totalCameras = locationsWithMetrics.reduce((sum, l) => sum + (l.cameraCount || 0), 0)
    const alertCount = locationsWithMetrics.reduce((sum, l) => sum + (l.alertCount || 0), 0)

    return {
      total: locations.length,
      activeCount,
      avgHealth,
      totalCameras,
      alertCount,
    }
  }, [locations, locationsWithMetrics])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    city: '',
    region: '',
    sla: 'medium',
  })

  // Form Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingLocation(null)
    setFormData({ name: '', city: '', region: '', sla: 'medium' })
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      city: location.city ?? '',
      region: location.region ?? '',
      sla: location.slaPriority?.toLowerCase() ?? 'medium',
    })
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to delete this location?')) {
        deleteLoc.mutate(id)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [deleteLoc]
  )

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.city) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const payload: Partial<Location> = {
        name: formData.name,
        city: formData.city,
        region: formData.region || undefined,
        slaPriority: formData.sla ? (formData.sla.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') : undefined,
      }

      if (editingLocation) {
        await updateLoc.mutateAsync({ id: editingLocation.id, payload })
      } else {
        await createLoc.mutateAsync(payload)
      }
      setIsModalOpen(false)
      setFormData({ name: '', city: '', region: '', sla: 'medium' })
    } catch (error) {
      alert('Error saving location')
    }
  }, [formData, editingLocation, updateLoc, createLoc])

  // Bulk Actions
  const bulkActions: BulkAction[] = useMemo(
    () => [
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 size={16} />,
        variant: 'danger',
        requiresConfirm: true,
        description: `Delete ${selectedIds.size} location(s)?`,
      },
      {
        id: 'assign-region',
        label: 'Assign Region',
        icon: <MapPin size={16} />,
      },
      {
        id: 'update-sla',
        label: 'Update SLA',
        icon: <Target size={16} />,
      },
      {
        id: 'export',
        label: 'Export',
        icon: <Download size={16} />,
      },
    ],
    [selectedIds.size]
  )

  const handleBulkAction = useCallback(
    async (actionId: string) => {
      const selectedLocations = locationsWithMetrics.filter((l) => selectedIds.has(l.id))

      switch (actionId) {
        case 'delete':
          if (window.confirm(`Delete ${selectedIds.size} location(s)?`)) {
            for (const location of selectedLocations) {
              await deleteLoc.mutateAsync(location.id)
            }
            setSelectedIds(new Set())
          }
          break

        case 'export':
          const csv = [
            ['ID', 'Name', 'City', 'Region', 'Status', 'Health', 'Cameras'],
            ...selectedLocations.map((l) => [
              l.id,
              l.name,
              l.city,
              l.region || '',
              l.active ? 'active' : 'disabled',
              l.health || 0,
              l.cameraCount || 0,
            ]),
          ]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n')

          const blob = new Blob([csv], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `locations-export-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
          break
      }
    },
    [locationsWithMetrics, selectedIds, deleteLoc]
  )

  const advancedFiltersValue = useMemo(
    () => ({
      status: filters.statuses,
      region: filters.regions,
      city: filters.cities,
      sla: filters.slaPriorities.map((v) => v.toLowerCase()),
      cameraCountMin: filters.cameraCountMin ?? undefined,
      cameraCountMax: filters.cameraCountMax ?? undefined,
      healthMin: filters.healthMin ?? undefined,
      healthMax: filters.healthMax ?? undefined,
      createdAfter: filters.dateRange.start ?? undefined,
      createdBefore: filters.dateRange.end ?? undefined,
    }),
    [filters]
  )

  return (
    <div className="min-h-full p-3 sm:p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage CCTV monitoring locations</p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus size={18} />
          New Location
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Locations"
          value={stats.total}
          status="info"
          icon={<BarChart3 size={20} />}
        />
        <KpiCard
          label="Active"
          value={stats.activeCount}
          status="success"
          comparison={`${stats.total > 0 ? Math.round((stats.activeCount / stats.total) * 100) : 0}% uptime`}
        />
        <KpiCard
          label="Avg Health"
          value={stats.avgHealth}
          unit="%"
          status={stats.avgHealth > 75 ? 'success' : stats.avgHealth > 50 ? 'warning' : 'error'}
        />
        <KpiCard
          label="Cameras"
          value={stats.totalCameras}
          status="info"
        />
        <KpiCard
          label="Active Alerts"
          value={stats.alertCount}
          status={stats.alertCount > 0 ? 'error' : 'success'}
        />
      </div>

      {/* Search & Filters Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search locations..."
              advancedEnabled={advancedMode}
              onAdvancedToggle={setAdvancedMode}
              className="flex-1"
            />

            <button
              onClick={() => setAdvancedFiltersOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-1 bg-blue-100 text-blue-700">Active</Badge>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setShowDeleted((prev) => !prev)}
              className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
            </button>
          </div>

          <FilterPreset
            presets={[]}
            onLoad={() => undefined}
            onSave={(preset) => console.log('Save preset:', preset)}
            onDelete={() => undefined}
            onSetDefault={() => undefined}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <EnhancedTable
          locations={sortedLocations}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(col, order) => {
            setSortBy(col)
            setSortOrder(order)
          }}
        />
      </Card>

      {/* Bulk Actions Panel */}
      {selectedIds.size > 0 && (
        <BulkActionsPanel
          selectedCount={selectedIds.size}
          actions={bulkActions}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
        filters={advancedFiltersValue}
        onApply={(next) => {
          setFilters((prev) => ({
            ...prev,
            regions: next.region ?? [],
            cities: next.city ?? [],
            statuses: (next.status ?? []) as any,
            slaPriorities: (next.sla ?? []).map((v) => v.toUpperCase()) as any,
            cameraCountMin: next.cameraCountMin ?? null,
            cameraCountMax: next.cameraCountMax ?? null,
            healthMin: next.healthMin ?? null,
            healthMax: next.healthMax ?? null,
            dateRange: {
              start: next.createdAfter ?? null,
              end: next.createdBefore ?? null,
            },
          }))
        }}
        availableRegions={['North', 'South', 'East', 'West', 'Central']}
        availableCities={['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow']}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocation ? 'Edit Location' : 'New Location'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.currentTarget.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Location name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.currentTarget.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Region
              </label>
              <select
                value={formData.region || ''}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.currentTarget.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select region...</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              SLA Level
            </label>
            <select
              value={formData.sla || 'medium'}
              onChange={(e) =>
                setFormData({ ...formData, sla: e.currentTarget.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createLoc.isPending || updateLoc.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {editingLocation ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Building,
  Activity,
  Globe,
  CheckCircle,
} from 'lucide-react'
import type { Location } from '../../api/types'
import {
  useCreateLocation,
  useDeleteLocation,
  useRecoverLocation,
  useLocationsAdmin,
  useUpdateLocation,
} from '../../api/hooks'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'

export function AdminLocationsPage() {
  const [showDeleted, setShowDeleted] = useState(false)
  const { data: locations = [], isLoading } = useLocationsAdmin({ includeDeleted: showDeleted })
  
  const createLoc = useCreateLocation()
  const updateLoc = useUpdateLocation()
  const deleteLoc = useDeleteLocation()
  const recoverLoc = useRecoverLocation()

  // State
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterSla, setFilterSla] = useState<string>('ALL')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState<Partial<Location>>({})

  // Compute Stats
  const stats = useMemo(() => {
    const total = locations.length
    const active = locations.filter(l => l.active && !l.deletedAt).length
    const deleted = locations.filter(l => l.deletedAt).length
    const highSla = locations.filter(l => l.slaPriority === 'HIGH' && !l.deletedAt).length
    return { total, active, deleted, highSla }
  }, [locations])

  // Filter Logic
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // Filter by Deleted
      if (!showDeleted && loc.deletedAt) return false
      
      // Filter by Search
      const searchLower = search.toLowerCase()
      const matchesSearch = 
        loc.name.toLowerCase().includes(searchLower) ||
        loc.code.toLowerCase().includes(searchLower) ||
        (loc.city && loc.city.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false

      // Filter by Type
      if (filterType !== 'ALL' && loc.locationType !== filterType) return false

      // Filter by SLA
      if (filterSla !== 'ALL' && loc.slaPriority !== filterSla) return false

      return true
    }).sort((a, b) => {
        // Sort deleted to bottom if mixed, otherwise by name
        if (a.deletedAt && !b.deletedAt) return 1
        if (!a.deletedAt && b.deletedAt) return -1
        return a.name.localeCompare(b.name)
    })
  }, [locations, search, filterType, filterSla, showDeleted])

  // Handlers
  const handleOpenCreate = () => {
    setEditingLocation(null)
    setFormData({
      active: true,
      slaPriority: 'MEDIUM',
      locationType: 'SITE',
    } as any)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (loc: Location) => {
    setEditingLocation(loc)
    setFormData({ ...loc })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingLocation) {
        await updateLoc.mutateAsync({ id: editingLocation.id, payload: formData })
      } else {
        await createLoc.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save location', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      await deleteLoc.mutateAsync(id)
    }
  }

  const handleRecover = async (id: string) => {
    await recoverLoc.mutateAsync(id)
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} locations?`)) return
    
    // Process serially to avoid overwhelming backend/network
    for (const id of selectedIds) {
      await deleteLoc.mutateAsync(id)
    }
    setSelectedIds(new Set())
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredLocations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredLocations.map(l => l.id)))
    }
  }

  if (isLoading) return <div className="min-h-full p-3 sm:p-4 text-center text-muted">Loading locations...</div>

  return (
    <div className="min-h-full p-3 sm:p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-text">Locations Management</h1>
           <div className="text-sm text-muted">Manage enterprise sites, warehouses, and offices.</div>
        </div>
        <div className="flex gap-2">
            <Button 
                variant={showDeleted ? 'primary' : 'secondary'}
                onClick={() => setShowDeleted(!showDeleted)}
                className="gap-2"
            >
                {showDeleted ? <CheckCircle size={16} /> : <Trash2 size={16} />}
                {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
            </Button>
            <Button variant="primary" onClick={handleOpenCreate} className="gap-2">
                <Plus size={16} /> Add Location
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-4 border-l-4 border-l-blue-500">
          <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
            <Globe size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Total Locations</div>
            <div className="text-2xl font-bold text-text">{stats.total}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4 border-l-4 border-l-emerald-500">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                <CheckCircle size={24} />
            </div>
            <div>
                <div className="text-sm font-medium text-muted">Active Sites</div>
                <div className="text-2xl font-bold text-text">{stats.active}</div>
            </div>
        </Card>
        <Card className="flex items-center gap-4 p-4 border-l-4 border-l-brand-500">
            <div className="rounded-full bg-brand-500/10 p-3 text-brand-500">
                <Activity size={24} />
            </div>
            <div>
                <div className="text-sm font-medium text-muted">High SLA</div>
                <div className="text-2xl font-bold text-text">{stats.highSla}</div>
            </div>
        </Card>
        <Card className="flex items-center gap-4 p-4 border-l-4 border-l-rose-500">
            <div className="rounded-full bg-rose-500/10 p-3 text-rose-500">
                <Trash2 size={24} />
            </div>
            <div>
                <div className="text-sm font-medium text-muted">Deleted</div>
                <div className="text-2xl font-bold text-text">{stats.deleted}</div>
            </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <Input 
                    placeholder="Search locations..." 
                    className="pl-9"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <Select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                className="w-full md:w-40"
            >
                <option value="ALL">All Types</option>
                <option value="PLANT">Plant</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="OFFICE">Office</option>
                <option value="SITE">Site</option>
            </Select>
            <Select 
                value={filterSla}
                onChange={e => setFilterSla(e.target.value)}
                className="w-full md:w-40"
            >
                <option value="ALL">All SLA</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
            </Select>
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-surface2 px-3 py-1.5 rounded-md border border-border">
                <span className="text-sm text-text">{selectedIds.size} selected</span>
                <Button 
                    variant="danger" 
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleBulkDelete}
                >
                    Delete Selected
                </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-surface2 text-xs font-semibold uppercase text-muted border-b border-border">
              <th className="px-4 py-3 w-10">
                <input 
                    type="checkbox" 
                    className="rounded border-border bg-surface text-brand-500 focus:ring-brand-500"
                    checked={filteredLocations.length > 0 && selectedIds.size === filteredLocations.length}
                    onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3">Location Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Region/City</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLocations.map(loc => {
                const isDeleted = !!loc.deletedAt
                return (
                <tr 
                    key={loc.id} 
                    className={`hover:bg-surface2 transition-colors ${isDeleted ? 'opacity-60 bg-rose-500/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input 
                        type="checkbox" 
                        className="rounded border-border bg-surface text-brand-500 focus:ring-brand-500"
                        checked={selectedIds.has(loc.id)}
                        onChange={() => toggleSelection(loc.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded bg-surface2 p-1.5 text-muted">
                            {isDeleted ? <Trash2 size={14} /> : <Building size={14} />}
                        </div>
                        <div>
                            <div className="font-medium text-text">
                                {loc.name}
                                {isDeleted && <span className="ml-2 text-xs text-rose-400 font-bold">(Deleted)</span>}
                            </div>
                            <div className="font-mono text-xs text-muted">{loc.code}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{loc.locationType || 'SITE'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={loc.active ? 'ok' : 'neutral'}>
                        {loc.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge 
                        tone={loc.slaPriority === 'HIGH' ? 'brand' : loc.slaPriority === 'MEDIUM' ? 'warn' : 'neutral'}
                    >
                        {loc.slaPriority || 'LOW'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text">{loc.city || '-'}</div>
                    <div className="text-xs text-muted">{loc.state}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(loc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {!isDeleted ? (
                            <>
                                <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(loc)}>
                                    <Edit2 size={14} />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => handleDelete(loc.id)}>
                                    <Trash2 size={14} />
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => handleRecover(loc.id)}>
                                <RotateCcw size={12} /> Recover
                            </Button>
                        )}
                    </div>
                  </td>
                </tr>
            )})}
            {filteredLocations.length === 0 && (
                <tr>
                    <td colSpan={8} className="p-8 text-center text-muted">
                        No locations found matching your criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        className="max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-muted">Location Name</label>
                    <Input
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Headquarters"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-muted">Location Code</label>
                    <Input
                        value={formData.code || ''}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. HQ-01"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-muted">Type</label>
                    <Select
                        value={formData.locationType || 'SITE'}
                        onChange={e => setFormData({ ...formData, locationType: e.target.value as any })}
                    >
                        <option value="PLANT">Plant</option>
                        <option value="WAREHOUSE">Warehouse</option>
                        <option value="OFFICE">Office</option>
                        <option value="SITE">Site</option>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-muted">City</label>
                        <Input
                            value={formData.city || ''}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-muted">State/Province</label>
                        <Input
                            value={formData.state || ''}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-muted">SLA Priority</label>
                    <Select
                        value={formData.slaPriority || 'MEDIUM'}
                        onChange={e => setFormData({ ...formData, slaPriority: e.target.value as any })}
                    >
                        <option value="HIGH">High (24/7 Monitoring)</option>
                        <option value="MEDIUM">Medium (Business Hours)</option>
                        <option value="LOW">Low (Best Effort)</option>
                    </Select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-muted">Primary Contact</label>
                    <Input
                        value={formData.primaryContactName || ''}
                        onChange={e => setFormData({ ...formData, primaryContactName: e.target.value })}
                        placeholder="Name"
                    />
                </div>
                 <div>
                    <label className="mb-1 block text-sm font-medium text-muted">Contact Phone</label>
                    <Input
                        value={formData.primaryContactPhone || ''}
                        onChange={e => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                        placeholder="+1 ..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-muted">Latitude</label>
                        <Input
                            type="number"
                            step="any"
                            value={formData.latitude || ''}
                            onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-muted">Longitude</label>
                        <Input
                            type="number"
                            step="any"
                            value={formData.longitude || ''}
                            onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-muted">Timezone</label>
                    <Select
                        value={formData.timezone || 'UTC'}
                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                    >
                         <option value="UTC">UTC (Universal)</option>
                         <option value="America/New_York">Eastern Time (US)</option>
                         <option value="America/Chicago">Central Time (US)</option>
                         <option value="America/Denver">Mountain Time (US)</option>
                         <option value="America/Los_Angeles">Pacific Time (US)</option>
                         <option value="Europe/London">London</option>
                         <option value="Asia/Tokyo">Tokyo</option>
                    </Select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                     <input 
                        type="checkbox"
                        id="active-check"
                        className="rounded border-border bg-surface"
                        checked={formData.active ?? true}
                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                     />
                     <label htmlFor="active-check" className="text-sm font-medium text-text">Active Location</label>
                </div>
            </div>
            
            <div className="md:col-span-2">
                 <label className="mb-1 block text-sm font-medium text-muted">Notes</label>
                 <textarea
                    className="w-full rounded-lg bg-surface2 px-3 py-2 text-sm text-text border border-border/80 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
                {editingLocation ? 'Update Location' : 'Create Location'}
            </Button>
        </div>
      </Modal>
    </div>
  )
}

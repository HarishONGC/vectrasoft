import { useMemo, useEffect, useState } from 'react'

export interface FilterState {
  searchInput: string
  searchMode: 'simple' | 'advanced'
  regions: string[]
  cities: string[]
  statuses: ('active' | 'disabled' | 'archived')[]
  slaPriorities: ('HIGH' | 'MEDIUM' | 'LOW')[]
  locationTypes: ('SITE' | 'PLANT' | 'WAREHOUSE' | 'OFFICE')[]
  cameraCountMin: number | null
  cameraCountMax: number | null
  healthMin: number | null
  healthMax: number | null
  dateRange: {
    start: Date | null
    end: Date | null
  }
  showDeleted: boolean
  sortBy: 'name' | 'created' | 'health' | 'cameras'
  sortOrder: 'asc' | 'desc'
}

export interface LocationWithMetrics {
  id: string
  name: string
  code: string
  region?: string
  city?: string
  active: boolean
  slaPriority?: 'HIGH' | 'MEDIUM' | 'LOW'
  locationType?: 'PLANT' | 'WAREHOUSE' | 'OFFICE' | 'SITE'
  createdAt: string
  deletedAt?: string
  cameraCount: number
  onlineCount: number
  health: number
  lastActivityAt?: string
}

/**
 * Parse advanced filter syntax from search input
 * Examples:
 *   - "region:south" → { regions: ['south'] }
 *   - "status:active sla:high" → { statuses: ['active'], slaPriorities: ['HIGH'] }
 *   - "cameras:>5" → { cameraCountMin: 5 }
 */
export function parseAdvancedSearch(input: string): Partial<FilterState> {
  const result: Partial<FilterState> = {}

  if (!input.trim()) return result

  const tokens = input.toLowerCase().split(/\s+/)

  for (const token of tokens) {
    if (token.includes(':')) {
      const [key, value] = token.split(':')

      switch (key) {
        case 'region':
          result.regions = [value]
          break
        case 'city':
          result.cities = [value]
          break
        case 'status':
          if (value === 'active' || value === 'disabled' || value === 'archived') {
            result.statuses = [value]
          }
          break
        case 'sla':
          if (value === 'high' || value === 'medium' || value === 'low') {
            result.slaPriorities = [value.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW']
          }
          break
        case 'type':
          if (
            value === 'site' ||
            value === 'plant' ||
            value === 'warehouse' ||
            value === 'office'
          ) {
            result.locationTypes = [value.toUpperCase() as any]
          }
          break
        case 'cameras':
          if (value.startsWith('>')) {
            const num = parseInt(value.slice(1), 10)
            if (!isNaN(num)) result.cameraCountMin = num
          } else if (value.startsWith('<')) {
            const num = parseInt(value.slice(1), 10)
            if (!isNaN(num)) result.cameraCountMax = num
          }
          break
        case 'health':
          if (value.startsWith('<')) {
            const num = parseInt(value.slice(1), 10)
            if (!isNaN(num)) result.healthMax = num
          } else if (value.startsWith('>')) {
            const num = parseInt(value.slice(1), 10)
            if (!isNaN(num)) result.healthMin = num
          }
          break
      }
    }
  }

  return result
}

/**
 * Apply all filters to a location list
 */
export function applyFilters(
  locations: LocationWithMetrics[],
  filters: FilterState
): LocationWithMetrics[] {
  return locations.filter(loc => {
    // Filter by deleted status
    if (!filters.showDeleted && loc.deletedAt) return false
    if (filters.showDeleted && !loc.deletedAt) return false

    // Filter by search
    if (filters.searchInput.trim()) {
      const searchLower = filters.searchInput.toLowerCase()

      if (filters.searchMode === 'advanced') {
        // Check advanced syntax matches
        if (filters.regions.length > 0 && !filters.regions.includes(loc.region || '')) {
          return false
        }
        if (filters.cities.length > 0 && !filters.cities.includes(loc.city || '')) {
          return false
        }
        if (
          filters.statuses.length > 0 &&
          !filters.statuses.includes(loc.active ? 'active' : 'disabled')
        ) {
          return false
        }
      } else {
        // Simple search: name, code, city
        const matchesSearch =
          loc.name.toLowerCase().includes(searchLower) ||
          loc.code.toLowerCase().includes(searchLower) ||
          (loc.city && loc.city.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }
    }

    // Filter by regions
    if (filters.regions.length > 0 && !filters.regions.includes(loc.region || '')) {
      return false
    }

    // Filter by cities
    if (filters.cities.length > 0 && !filters.cities.includes(loc.city || '')) {
      return false
    }

    // Filter by status
    if (filters.statuses.length > 0) {
      const locStatus = loc.active ? 'active' : 'disabled'
      if (!filters.statuses.includes(locStatus as any)) {
        return false
      }
    }

    // Filter by SLA priority
    if (
      filters.slaPriorities.length > 0 &&
      !filters.slaPriorities.includes(loc.slaPriority || 'LOW')
    ) {
      return false
    }

    // Filter by location type
    if (
      filters.locationTypes.length > 0 &&
      !filters.locationTypes.includes(loc.locationType || 'SITE')
    ) {
      return false
    }

    // Filter by camera count
    if (
      filters.cameraCountMin !== null &&
      loc.cameraCount < filters.cameraCountMin
    ) {
      return false
    }
    if (
      filters.cameraCountMax !== null &&
      loc.cameraCount > filters.cameraCountMax
    ) {
      return false
    }

    // Filter by health
    if (filters.healthMin !== null && loc.health < filters.healthMin) {
      return false
    }
    if (filters.healthMax !== null && loc.health > filters.healthMax) {
      return false
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      const createdDate = new Date(loc.createdAt)
      if (filters.dateRange.start && createdDate < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && createdDate > filters.dateRange.end) {
        return false
      }
    }

    return true
  })
}

/**
 * Sort filtered locations
 */
export function sortLocations(
  locations: LocationWithMetrics[],
  sortBy: FilterState['sortBy'],
  sortOrder: FilterState['sortOrder']
): LocationWithMetrics[] {
  const sorted = [...locations]

  const multiplier = sortOrder === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * multiplier
      case 'created':
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          multiplier
        )
      case 'health':
        return (a.health - b.health) * multiplier
      case 'cameras':
        return (a.cameraCount - b.cameraCount) * multiplier
      default:
        return 0
    }
  })

  return sorted
}

/**
 * React hook: Filter and sort locations
 */
export function useFilteredLocations(
  locations: LocationWithMetrics[],
  filters: FilterState
) {
  return useMemo(() => {
    const filtered = applyFilters(locations, filters)
    return sortLocations(filtered, filters.sortBy, filters.sortOrder)
  }, [locations, filters])
}

/**
 * React hook: Debounced filters (for expensive calculations)
 */
export function useDebouncedFilters(
  filters: FilterState,
  delay: number = 300
): FilterState {
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, delay)

    return () => clearTimeout(timer)
  }, [filters, delay])

  return debouncedFilters
}

/**
 * Format filter state for URL query params
 */
export function encodeFilterState(filters: FilterState): string {
  const params = new URLSearchParams()

  if (filters.searchInput) params.set('search', filters.searchInput)
  if (filters.regions.length > 0) params.set('regions', filters.regions.join(','))
  if (filters.cities.length > 0) params.set('cities', filters.cities.join(','))
  if (filters.statuses.length > 0) params.set('statuses', filters.statuses.join(','))
  if (filters.slaPriorities.length > 0)
    params.set('sla', filters.slaPriorities.join(','))
  if (filters.locationTypes.length > 0)
    params.set('types', filters.locationTypes.join(','))
  if (filters.cameraCountMin !== null) params.set('camMin', filters.cameraCountMin.toString())
  if (filters.cameraCountMax !== null) params.set('camMax', filters.cameraCountMax.toString())
  if (filters.healthMin !== null) params.set('healthMin', filters.healthMin.toString())
  if (filters.healthMax !== null) params.set('healthMax', filters.healthMax.toString())
  if (filters.dateRange.start)
    params.set('dateStart', filters.dateRange.start.toISOString())
  if (filters.dateRange.end) params.set('dateEnd', filters.dateRange.end.toISOString())
  if (filters.showDeleted) params.set('deleted', '1')
  params.set('sort', filters.sortBy)
  params.set('order', filters.sortOrder)

  return params.toString()
}

/**
 * Decode filter state from URL query params
 */
export function decodeFilterState(queryString: string): Partial<FilterState> {
  const params = new URLSearchParams(queryString)
  const filters: Partial<FilterState> = {}

  if (params.has('search')) filters.searchInput = params.get('search') || ''
  if (params.has('regions'))
    filters.regions = (params.get('regions') || '').split(',').filter(Boolean)
  if (params.has('cities'))
    filters.cities = (params.get('cities') || '').split(',').filter(Boolean)
  if (params.has('statuses'))
    filters.statuses = (params.get('statuses') || '').split(',') as any
  if (params.has('sla'))
    filters.slaPriorities = (params.get('sla') || '').split(',') as any
  if (params.has('types'))
    filters.locationTypes = (params.get('types') || '').split(',') as any
  if (params.has('camMin'))
    filters.cameraCountMin = parseInt(params.get('camMin') || '0', 10)
  if (params.has('camMax'))
    filters.cameraCountMax = parseInt(params.get('camMax') || '9999', 10)
  if (params.has('healthMin'))
    filters.healthMin = parseInt(params.get('healthMin') || '0', 10)
  if (params.has('healthMax'))
    filters.healthMax = parseInt(params.get('healthMax') || '100', 10)
  if (params.has('dateStart'))
    filters.dateRange = {
      start: new Date(params.get('dateStart') || ''),
      end: filters.dateRange?.end ?? null,
    }
  if (params.has('dateEnd'))
    filters.dateRange = {
      start: filters.dateRange?.start ?? null,
      end: new Date(params.get('dateEnd') || ''),
    }
  if (params.has('deleted')) filters.showDeleted = true
  if (params.has('sort')) filters.sortBy = (params.get('sort') || 'name') as any
  if (params.has('order')) filters.sortOrder = (params.get('order') || 'asc') as any

  return filters
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.searchInput.trim() !== '' ||
    filters.regions.length > 0 ||
    filters.cities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.slaPriorities.length > 0 ||
    filters.locationTypes.length > 0 ||
    filters.cameraCountMin !== null ||
    filters.cameraCountMax !== null ||
    filters.healthMin !== null ||
    filters.healthMax !== null ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null
  )
}

/**
 * Create default filter state
 */
export function createDefaultFilterState(): FilterState {
  return {
    searchInput: '',
    searchMode: 'simple',
    regions: [],
    cities: [],
    statuses: [],
    slaPriorities: [],
    locationTypes: [],
    cameraCountMin: null,
    cameraCountMax: null,
    healthMin: null,
    healthMax: null,
    dateRange: { start: null, end: null },
    showDeleted: false,
    sortBy: 'name',
    sortOrder: 'asc',
  }
}

export function useLocationFilters(
  locations: LocationWithMetrics[],
  options: { search?: string; advancedMode?: boolean }
) {
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState())

  useEffect(() => {
    setFilters((prev) => {
      const searchInput = options.search ?? ''
      const searchMode = options.advancedMode ? 'advanced' : 'simple'
      const advanced = options.advancedMode ? parseAdvancedSearch(searchInput) : {}
      return {
        ...prev,
        searchInput,
        searchMode,
        ...advanced,
      }
    })
  }, [options.search, options.advancedMode])

  const filteredLocations = useFilteredLocations(locations, filters)
  const clearFilters = () => setFilters(createDefaultFilterState())

  return {
    filteredLocations,
    filters,
    setFilters,
    hasActiveFilters: hasActiveFilters(filters),
    clearFilters,
  }
}

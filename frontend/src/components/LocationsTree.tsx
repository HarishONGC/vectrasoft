import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../app/cn'
import type { Camera, Location } from '../api/types'

export function LocationsTree({
  locations,
  cameras,
  selectedLocationId,
  onSelect,
}: {
  locations: Location[]
  cameras: Camera[]
  selectedLocationId: string | 'ALL'
  onSelect: (id: string | 'ALL') => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const countsByLocation = new Map<string, { total: number; online: number; offline: number; warn: number }>()
  for (const loc of locations) countsByLocation.set(loc.id, { total: 0, online: 0, offline: 0, warn: 0 })
  
  // Calculate totals
  let totalOnline = 0
  let totalOffline = 0
  let totalWarn = 0
  
  for (const cam of cameras) {
    const entry = countsByLocation.get(cam.locationId)
    if (!entry) continue
    entry.total++
    if (cam.status === 'ONLINE') {
      entry.online++
      totalOnline++
    } else if (cam.status === 'OFFLINE') {
      entry.offline++
      totalOffline++
    } else if (cam.status === 'WARNING') {
      entry.warn++
      totalWarn++
    }
  }

  const zonesByLocation = useMemo(() => {
    const map = new Map<string, Array<{ zone: string; count: number }>>()
    for (const loc of locations) map.set(loc.id, [])

    const tmp = new Map<string, Map<string, number>>()
    for (const cam of cameras) {
      if (!tmp.has(cam.locationId)) tmp.set(cam.locationId, new Map())
      const z = cam.zone?.trim() || 'Unassigned'
      const m = tmp.get(cam.locationId)!
      m.set(z, (m.get(z) ?? 0) + 1)
    }

    for (const [locId, zones] of tmp) {
      map.set(
        locId,
        [...zones.entries()]
          .map(([zone, count]) => ({ zone, count }))
          .sort((a, b) => b.count - a.count || a.zone.localeCompare(b.zone)),
      )
    }

    return map
  }, [cameras, locations])

  const item = (active: boolean) =>
    cn(
      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface2',
      active && 'bg-surface2 border border-border',
    )

  return (
    <div className="space-y-1">
      <button className={item(selectedLocationId === 'ALL')} onClick={() => onSelect('ALL')}>
        <span className="flex items-center gap-2 font-semibold">
          <MapPin size={16} className="text-muted" /> All Locations
        </span>
        <div className="flex items-center gap-1">
          {totalOnline > 0 ? (
            <div className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-emerald-500/15">
              <div className="h-2 w-2 rounded-sm bg-emerald-500"></div>
              <span className="text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{totalOnline}</span>
            </div>
          ) : null}
          {totalWarn > 0 ? (
            <div className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-amber-500/15">
              <div className="h-2 w-2 rounded-sm bg-amber-500"></div>
              <span className="text-[11px] font-semibold tabular-nums text-amber-700 dark:text-amber-300">{totalWarn}</span>
            </div>
          ) : null}
          {totalOffline > 0 ? (
            <div className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-rose-500/15">
              <div className="h-2 w-2 rounded-sm bg-rose-500"></div>
              <span className="text-[11px] font-semibold tabular-nums text-rose-700 dark:text-rose-300">{totalOffline}</span>
            </div>
          ) : null}
        </div>
      </button>

      {locations.map((loc) => {
        const c = countsByLocation.get(loc.id) ?? { total: 0, online: 0, offline: 0, warn: 0 }
        const isExpanded = expanded[loc.id] ?? (selectedLocationId === loc.id)
        const zones = zonesByLocation.get(loc.id) ?? []
        return (
          <div key={loc.id} className="space-y-1">
            <div className={item(selectedLocationId === loc.id)}>
              <button className="min-w-0 flex-1 text-left" onClick={() => onSelect(loc.id)}>
                <span className="block truncate font-bold">{loc.name}</span>
                <span className="block text-xs font-medium text-muted">{loc.code}{loc.region ? ` • ${loc.region}` : ''}</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {c.online > 0 ? (
                    <div className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-emerald-500/15">
                      <div className="h-2 w-2 rounded-sm bg-emerald-500"></div>
                      <span className="text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{c.online}</span>
                    </div>
                  ) : null}
                  {c.warn > 0 ? (
                    <div className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-amber-500/15">
                      <div className="h-2 w-2 rounded-sm bg-amber-500"></div>
                      <span className="text-[11px] font-semibold tabular-nums text-amber-700 dark:text-amber-300">{c.warn}</span>
                    </div>
                  ) : null}
                  {c.offline > 0 ? (
                    <div className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-rose-500/15">
                      <div className="h-2 w-2 rounded-sm bg-rose-500"></div>
                      <span className="text-[11px] font-semibold tabular-nums text-rose-700 dark:text-rose-300">{c.offline}</span>
                    </div>
                  ) : null}
                </div>
                <button
                  className="rounded-md p-1 text-muted hover:bg-surface2"
                  aria-label={isExpanded ? 'Collapse areas' : 'Expand areas'}
                  onClick={() => setExpanded((s) => ({ ...s, [loc.id]: !isExpanded }))}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            {isExpanded && zones.length > 0 ? (
              <div className="ml-4 space-y-1 border-l border-border pl-3">
                {zones.slice(0, 8).map((z) => (
                  <div key={z.zone} className="flex items-center justify-between rounded-lg px-2 py-1 text-xs text-muted">
                    <span className="truncate font-medium">{z.zone}</span>
                    <span className="tabular-nums font-semibold">{z.count}</span>
                  </div>
                ))}
                {zones.length > 8 ? (
                  <div className="px-2 text-[11px] text-muted">+ {zones.length - 8} more areas</div>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

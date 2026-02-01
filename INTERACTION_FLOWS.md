# Admin Locations Management - Interaction Flows & Wireframes

## Visual Wireframe Guide

### 1. Enhanced Sidebar Navigation Layout

```
┌─────────────────────────────────────┐
│  ADMIN  │                           │
├─────────────────────────────────────┤
│  [+ Add Location] [+ Add Camera]    │
├─────────────────────────────────────┤
│  📹 CAMERAS                         │
│     Cameras: 1,247  Offline: 12 🔴 │
│     ↳ 🟡 6 Warnings                 │
├─────────────────────────────────────┤
│  INVENTORY                          │
│  ├─ 📍 Locations          [→ 45]   │
│  ├─ 📷 Cameras           [→ 1,247]│
│  └─ 🗂️  Archived Sites      [→ 8]  │
├─────────────────────────────────────┤
│  OPERATIONS                         │
│  ├─ ⚙️  Settings          [→]       │
│  ├─ 📋 Audit Log          [→]       │
│  └─ 📊 System Health      [→]       │
├─────────────────────────────────────┤
│  QUICK STATS                        │
│  ├─ SLA Breaches    3  ⚠️           │
│  ├─ Sites Down      1  🔴           │
│  ├─ Pending Tasks   5  📋           │
│  └─ Last Sync    2min ago ✓         │
└─────────────────────────────────────┘

Status Indicators:
🟢 ONLINE  🟡 WARNING  🔴 OFFLINE  ⚪ UNKNOWN
```

**Interaction**: 
- Click section headers to collapse/expand
- Hover on badges to see details
- Quick stats refresh every 10 seconds
- Active page highlighted with left border accent

---

### 2. Locations Page Layout (Full Width)

```
╔═════════════════════════════════════════════════════════════════════════╗
║  📍 Locations Management                                               ║
║  Manage enterprise sites, warehouses, and offices.                     ║
║                              [Show Deleted] [+ Add Location]           ║
╚═════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ 📍 Total    │  │ ✓ Active    │  │ ⚡ High SLA │  │ ⚠️ Issues  │   │
│  │ 45          │  │ 42          │  │ 28          │  │ 3           │   │
│  │ ↑ 2 today   │  │ ↓ 1 offline │  │ ↑ 1 new     │  │ ↓ 1 fixed   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
│  [🔍 Search locations... ✕] [Region ▼] [SLA ▼] [Status ▼] [🗓️ Range] │
│  [Saved Presets ▼]  [⚙️ Columns ▼]  [🗺️ Map View]                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ ☐  Location Name         │ Type │ Active │ SLA  │ 📹 Cam. │ Health % │
├─────────────────────────┼──────┼────────┼──────┼─────────┼──────────┤
│ ☑ Headquarters - HQ01   │ SITE │ ✓ Yes  │ HIGH │ 45/45   │ 100% ✓  │
│   Employee: John Doe    │      │        │      │ ↻ 5min  │         │
├─────────────────────────┼──────┼────────┼──────┼─────────┼──────────┤
│ ☐ Warehouse A - WA-01   │ WAREHOUSE│ ✓  │ MEDIUM│ 23/25  │ 92% ⚡  │
│   Employee: Jane Smith  │      │        │      │ ↻ 2min  │         │
├─────────────────────────┼──────┼────────┼──────┼─────────┼──────────┤
│ ☐ Plant B - PB-02       │ PLANT│ ✗ No   │ HIGH │ 12/12   │ 75% ⚠️  │
│   Employee: Bob Johnson │      │        │      │ ↻ 8min  │         │
└──────────────────────────────────────────────────────────────────────────┘

        [📄 Export] [🗑️ Delete] [♻️ Recover] [➕ Add]

[< Previous] [1 / 10] [Next >] Per Page: [25▼]


Bulk Actions (when selected):
╔════════════════════════════════════════════════════════════════════════╗
║ ✓ 3 locations selected  [Assign Region ▼] [SLA ▼] [Enable/Disable ▼] ║
║ [Export Selected] [Archive] [Delete]  [✕ Clear Selection]             ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

### 3. Advanced Filter Panel (Expanded)

```
┌────────────────────────────────────────────┐
│ FILTERS                              [Reset]│
├────────────────────────────────────────────┤
│ Search                                     │
│ [🔍 Advanced syntax: region:south status:active...] │
│                                            │
│ Region/City                                │
│ ☑ North  ☐ South  ☐ East  ☐ West         │
│ [📍 Add custom city filter...]             │
│                                            │
│ Status                                     │
│ ☑ Active  ☑ Disabled  ☐ Archived          │
│                                            │
│ SLA Priority                               │
│ ☐ HIGH  ☑ MEDIUM  ☑ LOW                   │
│                                            │
│ Location Type                              │
│ ☑ Site  ☐ Plant  ☑ Warehouse  ☐ Office   │
│                                            │
│ Cameras Count                              │
│ [>  ] [at least]                          │
│                                            │
│ Health Threshold                           │
│ [< ] [percent]                            │
│                                            │
│ Modified Date                              │
│ [From:          ] [To:          ]          │
│                                            │
│ SAVED PRESETS                              │
│ ┌────────────────────────────────────────┐│
│ │ ► Critical Sites (SLA:HIGH, Health:<80)││
│ │ ► Active North (Region:North, Active) ││
│ │ ► New Sites (Last 30 days)            ││
│ │ [+ Save Current Filter as Preset]     ││
│ └────────────────────────────────────────┘│
│                                            │
│ [Apply Filters] [Clear All] [✕ Close]    │
└────────────────────────────────────────────┘
```

---

### 4. Location Details Modal

```
╔═════════════════════════════════════════════════════════════╗
║ LOCATION DETAILS & EDIT                               [✕]  ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║ 📍 LOCATION INFORMATION                                     ║
║ ┌──────────────────────────────────────────────────────┐   ║
║ │ Name:            [Headquarters        ]              │   ║
║ │ Code:            [HQ-01               ]              │   ║
║ │ Type:            [SITE              ▼]              │   ║
║ │ Active:          [✓] Yes                             │   ║
║ └──────────────────────────────────────────────────────┘   ║
║                                                             ║
║ 📍 LOCATION                                                 ║
║ ┌──────────────────────────────────────────────────────┐   ║
║ │ Region:          [South               ]              │   ║
║ │ City:            [Austin              ]              │   ║
║ │ State:           [TX                 ]              │   ║
║ │ Latitude:        [30.2672             ]              │   ║
║ │ Longitude:       [-97.7431            ]              │   ║
║ │ Timezone:        [America/Chicago   ▼]              │   ║
║ └──────────────────────────────────────────────────────┘   ║
║                                                             ║
║ 🎯 SLA & MONITORING                                         ║
║ ┌──────────────────────────────────────────────────────┐   ║
║ │ SLA Priority:    [HIGH             ▼]              │   ║
║ │ Health Target:   [99%                ]              │   ║
║ │ Escalation:      [After 15 minutes    ]              │   ║
║ └──────────────────────────────────────────────────────┘   ║
║                                                             ║
║ 👤 CONTACT INFORMATION                                      ║
║ ┌──────────────────────────────────────────────────────┐   ║
║ │ Contact Name:    [John Doe           ]              │   ║
║ │ Phone:           [+1-512-555-0123    ]              │   ║
║ │ Email:           [john@corp.example  ]              │   ║
║ │ Backup Contact:  [Jane Smith         ]              │   ║
║ └──────────────────────────────────────────────────────┘   ║
║                                                             ║
║ 📝 NOTES                                                    ║
║ ┌──────────────────────────────────────────────────────┐   ║
║ │ High-security facility. 24/7 monitoring required.   │   ║
║ │ Main entrance, parking lot, server room.            │   ║
║ └──────────────────────────────────────────────────────┘   ║
║                                                             ║
║ 🔐 COMPLIANCE & AUDIT                                       ║
║ ┌──────────────────────────────────────────────────────┐   ║
║ │ Created:          2024-06-15 by Admin User          │   ║
║ │ Last Modified:    2025-01-28 by Admin User          │   ║
║ │ Audit Trail:      [View 23 audit events ▶]          │   ║
║ │ IP Activity:      Last access from 192.168.1.50    │   ║
║ └──────────────────────────────────────────────────────┘   ║
║                                                             ║
║ 📊 LINKED RESOURCES                                         ║
║ ├─ 45 Cameras (42 Online, 3 Warning)  [View ▶]            ║
║ ├─ 12 Users with Access  [View ▶]                         ║
║ └─ 156 Audit Events  [View ▶]                             ║
║                                                             ║
║ [Cancel] [⏮️ Previous] [Next ➤] [🔄 Refresh] [✓ Save]     ║
╚═════════════════════════════════════════════════════════════╝
```

---

### 5. Bulk Operations Modal

```
╔═════════════════════════════════════════════════════════════╗
║ BULK ACTION: Update SLA Priority                      [✕]  ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║ OPERATION PREVIEW                                           ║
║ ┌─────────────────────────────────────────────────────┐   ║
║ │ Affecting 12 locations:                             │   ║
║ │                                                     │   ║
║ │ ✓ Headquarters (HQ-01)   MEDIUM → HIGH            │   ║
║ │ ✓ Warehouse A (WA-01)    LOW → HIGH               │   ║
║ │ ✓ Plant B (PB-02)        LOW → HIGH               │   ║
║ │ ... and 9 more                                     │   ║
║ │                                                     │   ║
║ │ [Expand All] [Show Failures Only]                  │   ║
║ └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║ ACTION CONFIGURATION                                        ║
║ ┌─────────────────────────────────────────────────────┐   ║
║ │ New SLA Priority:  [HIGH ▼]                         │   ║
║ │ Reason/Notes:      [Critical infrastructure...]    │   ║
║ │ Schedule:          [Immediate] [Schedule ▼]       │   ║
║ └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║ ⚠️ WARNINGS                                                 ║
║ │ • This will escalate 12 sites to 24/7 monitoring   │   ║
║ │ • Cost impact: +$1,500/month estimated             │   ║
║ │ • Team notifications will be sent                   │   ║
║                                                             ║
║ [Cancel] [Review Changes] [⏱️ Schedule for Later] [Execute] ║
╚═════════════════════════════════════════════════════════════╝
```

---

### 6. Delete Confirmation with Recovery Options

```
╔═════════════════════════════════════════════════════════════╗
║ ⚠️  DELETE LOCATION                                     [✕] ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║ Are you sure you want to delete this location?             ║
║                                                             ║
║ Location: Headquarters (HQ-01)                             ║
║ Cameras: 45 (42 online, 3 offline)                         ║
║ Created: June 15, 2024                                     ║
║ Last Activity: 2 minutes ago                               ║
║                                                             ║
║ ⚠️ This will:                                               ║
║   • Soft-delete the location (hidden by default)           ║
║   • Keep associated cameras (5 will become orphaned)       ║
║   • Preserve all audit records                             ║
║   • Allow recovery within 30 days                          ║
║                                                             ║
║ Recovery Window: 30 days (Until: Feb 28, 2025)            ║
║ After that: Permanent deletion (no recovery)               ║
║                                                             ║
║ ☐ Yes, I understand the implications                      ║
║ ☐ Yes, I want permanent deletion (no recovery option)     ║
║                                                             ║
║ [Cancel] [Delete (Soft)] [Delete (Permanent)]             ║
╚═════════════════════════════════════════════════════════════╝
```

---

### 7. Location Intelligence Map View

```
╔════════════════════════════════════════════════════════════════╗
║ LOCATION INTELLIGENCE MAP                               [↗]  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🗺️  [Map View] [Satellite] [Hybrid] [Zoom: 100%] [📍 Reset]  ║
║  [Cluster] [Status Legend] [Heat Map]                         ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 🟢 Active (42)    🟡 Warning (3)    🔴 Offline (2)       │ ║
║  │ ⚪ Archived (0)                                             │ ║
║  │                                                          │ ║
║  │  ▲                                                       │ ║
║  │  │                                                       │ ║
║  │  │       🟢(45 cam) 🟡(5 cam)                           │ ║
║  │  │     🟢(23)   🟢(12) 🔴(8)                            │ ║
║  │  │ 🟢(3)   🟢(78)     🟡(2)                             │ ║
║  │  │                                                       │ ║
║  │  │         🟢(31)         🟢(41)                        │ ║
║  │  │                                                       │ ║
║  │  ├─────────────────────────────────────────────► N      │ ║
║  │                                                          │ ║
║  │  [Hover to preview] [Click for details]                 │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  SELECTED LOCATION: Headquarters (HQ-01)                      ║
║  ├─ Status: 🟢 Online (42/45 cameras)                         ║
║  ├─ Health: 100% ✓                                            ║
║  ├─ Region: South                                             ║
║  ├─ SLA: HIGH  ⚡                                               ║
║  └─ [View Details] [Edit] [Expand]                            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 8. Toast Notifications & Undo

```
┌───────────────────────────────┐
│ ✓ Deleted 3 locations         │
│ [↶ Undo (expires in 2:00)]   │
└───────────────────────────────┘

┌───────────────────────────────┐
│ ⚠️ 1 location failed to delete │
│ [View Details] [Retry]        │
└───────────────────────────────┘

┌───────────────────────────────┐
│ ⏳ Processing bulk action...   │
│ 3/12 completed [███░░░░░░░░]  │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 🔄 2 changes pending sync      │
│ [Retry] [View Changes]        │
└───────────────────────────────┘
```

---

## State Management Architecture

### Filter State Structure

```typescript
interface FilterState {
  // Search & Text
  searchInput: string
  searchMode: 'simple' | 'advanced'
  
  // Multi-selects
  regions: string[]
  cities: string[]
  statuses: ('active' | 'disabled' | 'archived')[]
  slaPriorities: ('HIGH' | 'MEDIUM' | 'LOW')[]
  locationTypes: ('SITE' | 'PLANT' | 'WAREHOUSE' | 'OFFICE')[]
  
  // Ranges
  cameraCountMin: number | null
  cameraCountMax: number | null
  healthMin: number | null
  healthMax: number | null
  
  // Date ranges
  dateRange: {
    start: Date | null
    end: Date | null
    preset?: 'today' | 'week' | 'month' | 'year'
  }
  
  // Display options
  showDeleted: boolean
  sortBy: 'name' | 'created' | 'health' | 'cameras'
  sortOrder: 'asc' | 'desc'
  pageSize: 25 | 50 | 100
  currentPage: number
  
  // Saved preset
  presetId?: string
  presetName?: string
}
```

### Table State Structure

```typescript
interface TableState {
  // Selection
  selectedIds: Set<string>
  selectedAll: boolean
  
  // Sorting
  sortColumn: string | null
  sortOrder: 'asc' | 'desc'
  multiSort?: Array<{ column: string; order: 'asc' | 'desc' }>
  
  // Visibility
  visibleColumns: {
    id: boolean
    name: boolean
    type: boolean
    status: boolean
    sla: boolean
    cameras: boolean
    health: boolean
    lastActivity: boolean
    created: boolean
  }
  
  // Virtual scrolling
  scrollOffset: number
  visibleStartIndex: number
  visibleEndIndex: number
  
  // Pagination
  currentPage: number
  pageSize: number
  totalRows: number
}
```

### UI State Structure

```typescript
interface UIState {
  // Modals
  activeModal: null | 'edit' | 'delete' | 'bulk-action' | 'details' | 'map'
  editingLocationId: string | null
  
  // Bulk operations
  bulkAction: null | 'delete' | 'sla-update' | 'region-assign' | 'archive' | 'export'
  bulkProgress: { current: number; total: number; status: 'pending' | 'processing' | 'complete' | 'error' }
  
  // Sidebar
  sidebarCollapsed: boolean
  expandedSections: {
    inventory: boolean
    operations: boolean
    system: boolean
  }
  
  // Toast notifications
  toasts: Toast[]
  
  // Loading states
  isLoading: boolean
  loadingLocation: string | null
}
```

---

## Database Query Optimization

### Efficient Queries

```typescript
// Instead of:
SELECT locations.* FROM locations
  WHERE active = true

// Use:
SELECT 
  id, name, code, slaPriority, active,
  (SELECT COUNT(*) FROM cameras WHERE locationId = locations.id) as cameraCount,
  (SELECT COUNT(*) FROM cameras WHERE locationId = locations.id AND status = 'ONLINE') as onlineCount
FROM locations
WHERE active = true
ORDER BY name
LIMIT 25 OFFSET 0

// With indexes:
CREATE INDEX idx_locations_active_name ON locations(active, name);
CREATE INDEX idx_cameras_locationid_status ON cameras(locationId, status);
```

### Caching Strategy

```typescript
// Cache filters for 10 seconds
const cachedLocationsList = useMemo(() => {
  return locationsList
}, [locationsList, filters])

// Debounce expensive calculations
const debouncedFilteredLocations = useDebouncedValue(
  calculateFilteredLocations(locations, filters),
  500
)
```

---

## Error Handling & Recovery

### Error States

```typescript
type ErrorState = 
  | { type: 'network'; message: string; retry: () => void }
  | { type: 'validation'; field: string; message: string }
  | { type: 'conflict'; message: string; resolve: () => void }
  | { type: 'permission'; message: string; elevate?: () => void }
  | { type: 'server'; message: string; code?: string }

// Display strategy:
// - Network errors: Top toast with retry
// - Validation: Inline field errors
// - Conflicts: Modal with conflict resolution
// - Permission: Toast + disabled state
// - Server: Modal with error details + contact support
```

---

**Version**: 1.0
**Last Updated**: January 30, 2026
**Target Implementation**: 4-week sprint

# CCTV Dashboard - Admin Locations Management Design System

**Version 1.0** | Enterprise-Grade Location & Camera Management UI

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Visual Design System](#visual-design-system)
3. [Component Architecture](#component-architecture)
4. [Interaction Patterns](#interaction-patterns)
5. [Performance Strategy](#performance-strategy)
6. [Accessibility Standards](#accessibility-standards)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Design Philosophy

### Core Principles

1. **Enterprise First**: Built for administrators managing 100+ locations
2. **Efficiency**: Minimize clicks for common tasks
3. **Data Density**: Balance information visibility with readability
4. **Scalability**: Design scales from 10 to 1000+ locations without redesign
5. **Compliance**: Audit trails, soft deletes, recovery options, role-based access
6. **Performance**: Sub-100ms interactions for typical operations

### Design Goals

- **Admin Productivity**: 40% faster site onboarding
- **Error Reduction**: Confirmation dialogs + undo operations
- **Bulk Operations**: Handle 50+ items in single operation
- **Mobile-Responsive**: Functional on tablets (1024px+)
- **Future-Ready**: AI analytics, predictive maintenance, auto-discovery

---

## Visual Design System

### Color Tokens

```
Semantic Colors:
- Primary/Brand:     #0066CC (Corporate Blue) → UI interactions
- Success/OK:        #00A651 (Emerald) → Active, online, healthy
- Warning:           #F57C00 (Orange) → High SLA, attention needed
- Critical/Bad:      #DC3545 (Rose Red) → Offline, errors, dangerous
- Info:              #1976D2 (Info Blue) → Information, helpful tips
- Neutral:           #6B7280 (Gray) → Disabled, secondary content

Surface Colors:
- Surface:           #FFFFFF (White) → Main background
- Surface2:          #F9FAFB (Lighter Gray) → Secondary backgrounds, hover states
- Surface3:          #F3F4F6 (Even lighter) → Tertiary backgrounds

Text Colors:
- text:              #1F2937 (Dark Gray) → Primary text
- text-secondary:    #6B7280 (Medium Gray) → Secondary text
- muted:             #9CA3AF (Light Gray) → Disabled, placeholder text

Borders:
- border:            #E5E7EB → Standard dividers
- border-light:      #F3F4F6 → Subtle dividers
- border-focus:      #0066CC → Focus states
```

### Typography

```
Scale (line-height: 1.5):
- Display:  32px, 700 (Page titles)
- H1:       24px, 700 (Section headers)
- H2:       20px, 600 (Subsection headers)
- H3:       16px, 600 (Component headers)
- Body:     14px, 400 (Content, table data)
- Small:    12px, 400 (Hints, secondary info, badges)
- Tiny:     11px, 500 (UI labels)

Font Stack:
- Default: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif
- Mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace

Font Weights:
- Light:    300
- Regular:  400
- Medium:   500
- Semibold: 600
- Bold:     700
```

### Spacing Grid

```
Base Unit: 4px

Scale (multiples of 4px):
- xs:   4px    (0.25rem)
- sm:   8px    (0.5rem)
- md:   12px   (0.75rem)
- lg:   16px   (1rem)
- xl:   20px   (1.25rem)
- 2xl:  24px   (1.5rem)
- 3xl:  32px   (2rem)
- 4xl:  40px   (2.5rem)
- 5xl:  48px   (3rem)

Margins/Padding:
- Cards: lg padding (16px), md gap (12px)
- Sections: 3xl margin (32px)
- Input spacing: md (12px) horizontal, sm (8px) vertical
```

### Responsive Breakpoints

```
Mobile:     < 640px
Tablet:     640px - 1024px  
Desktop:    1024px - 1536px
Wide:       > 1536px

Admin UI Optimized For: ≥ 1024px (Assumes multi-monitor setup)
```

---

## Component Architecture

### Component Hierarchy

```
AdminLayout
├── TopBar (Fixed)
├── Sidebar (Collapsible)
│   ├── Logo & Toggle
│   ├── Quick Actions (Add Location, Add Camera)
│   ├── Status Counters (Total Cameras, Offline)
│   ├── Navigation Sections
│   │   ├── Inventory (Locations, Cameras)
│   │   ├── Operations (Settings, Audit)
│   │   └── System (Health, API)
│   └── Footer (Admin info, help link)
└── MainContent
    └── AdminLocationsPage
        ├── Header Section
        │   ├── Page Title & Description
        │   └── Quick Actions (Show Deleted, Add Location)
        ├── KPI Cards Section
        │   ├── Total Locations (↑/↓ indicator)
        │   ├── Active Sites (↑/↓ indicator)
        │   ├── High SLA Sites (↑/↓ indicator)
        │   ├── Sites With Issues (↑/↓ indicator)
        │   └── Archived/Deleted (↑/↓ indicator)
        ├── Filter Section
        │   ├── Smart Search (supports queries like "region:south status:active")
        │   ├── Region / City Filter (multi-select)
        │   ├── SLA Priority Filter (multi-select)
        │   ├── Status Filter (multi-select)
        │   ├── Date Range Picker
        │   ├── Saved Presets (saved filters)
        │   └── Clear / Reset Filters
        ├── Data Table
        │   ├── Sticky Header (with column visibility toggle)
        │   ├── Rows with
        │   │   ├── Checkbox (for bulk selection)
        │   │   ├── Location Name & Code
        │   │   ├── Type Badge
        │   │   ├── Status Badge
        │   │   ├── SLA Priority Badge
        │   │   ├── Total Cameras Count
        │   │   ├── Online Cameras Count
        │   │   ├── Location Health %
        │   │   ├── Last Activity Time
        │   │   ├── Created Date
        │   │   └── Actions (Edit, Delete, More menu)
        │   ├── Row Hover Actions (Quick edit, Details)
        │   ├── Virtual Scrolling (for 100+ rows)
        │   ├── Pagination Controls
        │   ├── Page Size Selector (10, 25, 50, 100)
        │   └── Empty State
        ├── Bulk Actions Bar (Sticky)
        │   ├── Selection Count
        │   ├── Bulk Operations
        │   │   ├── Assign Region
        │   │   ├── Update SLA Priority
        │   │   ├── Enable / Disable Sites
        │   │   ├── Export as CSV
        │   │   ├── Archive Locations
        │   │   └── Delete Selected
        │   └── Clear Selection
        ├── Detail Modals
        │   ├── Edit Location Modal (form with validation)
        │   ├── Location Details Modal (read-only overview)
        │   └── Confirmation Dialogs (delete, archive, recover)
        ├── Map View (Optional, Expandable)
        │   ├── Geolocation pins
        │   ├── Color-coded status markers
        │   ├── Click to view site details
        │   └── Zoom/Pan controls
        └── Toast Notifications
            ├── Action confirmations
            ├── Undo options (for soft delete)
            └── Error messages
```

### New Components to Create

#### 1. **MultiSelect** (`components/ui/MultiSelect.tsx`)
```typescript
interface MultiSelectProps {
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
}
```
- Dropdown with checkboxes
- Search filtering
- Tag display
- Clear all option

#### 2. **FilterPreset** (`components/admin/FilterPreset.tsx`)
```typescript
interface FilterPreset {
  id: string
  name: string
  filters: FilterState
  isDefault: boolean
}
```
- Save current filters
- Load saved presets
- Delete presets
- Set as default

#### 3. **DateRangePicker** (`components/ui/DateRangePicker.tsx`)
```typescript
interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (range: { start: Date; end: Date }) => void
  presets?: 'today' | 'week' | 'month' | 'quarter' | 'year'
}
```
- Calendar UI
- Quick range presets
- Custom range entry

#### 4. **BulkActionsPanel** (`components/admin/BulkActionsPanel.tsx`)
```typescript
interface BulkActionsPanelProps {
  selectedCount: number
  actions: BulkAction[]
  onAction: (action: string, payload?: any) => void
  onClear: () => void
}
```
- Sticky positioning
- Action buttons
- Progress indicator for batch operations
- Undo option

#### 5. **LocationHealthCard** (`components/admin/LocationHealthCard.tsx`)
```typescript
interface LocationHealthCardProps {
  location: Location & { cameras: Camera[] }
  trend?: 'up' | 'down' | 'stable'
  onClick?: () => void
}
```
- Camera count
- Online % health
- Trend indicator
- Status dot

#### 6. **LocationIntelligenceMap** (`components/admin/LocationIntelligenceMap.tsx`)
```typescript
interface LocationIntelligenceMapProps {
  locations: (Location & { cameraCount: number; onlineCount: number })[]
  selectedLocationId?: string
  onLocationClick?: (locationId: string) => void
  compact?: boolean
}
```
- Mapbox GL integration (or Leaflet)
- Pins with status coloring
- Cluster support for densely packed areas
- Click handlers

#### 7. **SkeletonLoader** (`components/ui/SkeletonLoader.tsx`)
```typescript
interface SkeletonLoaderProps {
  rows?: number
  cols?: number
  variant?: 'card' | 'table' | 'list'
  animate?: boolean
}
```
- Pulsing skeleton UI
- Multiple variants
- Customizable dimensions

#### 8. **SortableColumn** (`components/ui/SortableColumn.tsx`)
```typescript
interface SortableColumnProps {
  label: string
  sortKey: string
  sortOrder?: 'asc' | 'desc' | null
  onSort?: (key: string, order: 'asc' | 'desc') => void
}
```
- Click to sort
- Visual indicators (↑ ↓)
- Multi-column sort support

#### 9. **ContextMenu** (`components/ui/ContextMenu.tsx`)
```typescript
interface ContextMenuProps {
  trigger: React.ReactNode
  items: { label: string; icon?: React.ReactNode; onClick: () => void }[]
  position?: 'top' | 'bottom' | 'left' | 'right'
}
```
- Right-click actions
- Keyboard accessible
- Tooltip support

#### 10. **StatusTrend** (`components/ui/StatusTrend.tsx`)
```typescript
interface StatusTrendProps {
  current: number
  previous: number
  format?: 'number' | 'percent'
  direction?: 'up' | 'down'
}
```
- Arrow indicator (↑ ↓)
- Percentage change
- Color coding (green up, red down)

---

## Interaction Patterns

### Smart Search Syntax

Users can type natural search queries with optional syntax:

```
Examples:
- "Database Server" → Search by name
- "region:south" → Filter by region
- "region:south status:active" → Compound query
- "sla:high active:true" → Multiple filters
- "last24h" → Recently modified
- "offline" → Status filter

Supported Keywords:
- region:{value}
- city:{value}
- status:{active|disabled|archived}
- sla:{high|medium|low}
- type:{plant|warehouse|office|site}
- cameras:>{number} (e.g., "cameras:>5")
- health:<{number} (e.g., "health:<80")
```

### Bulk Operations Flow

```
1. User selects rows via checkboxes
2. Bulk Actions Panel appears (sticky, bottom-right)
   ├── Show selection count
   ├── Preview affected locations
   └── Display available actions
3. User selects bulk action
4. Pre-action preview/confirmation modal
   ├── Show impacted locations
   ├── Preview changes
   └── Confirm or cancel
5. Execute operation
   ├── Show progress bar
   ├── Batch process serially (to avoid overwhelming backend)
   └── Show results (successes/failures)
6. Post-action notification
   ├── Toast confirmation
   ├── Undo option (for 2 minutes)
   └── Log in audit trail
```

### Delete & Recovery Flow

```
Soft Delete (Standard):
├── Confirmation dialog with location details
├── Checkbox: "Confirm permanent deletion after 30 days"
└── Execute (location marked as deleted, hidden by default)

Show Deleted View:
├── Toggle "Show Deleted" button
├── Display deleted locations with visual indication
├── Show recovery action button
└── Display days until permanent deletion

Recovery:
├── User clicks "Recover" on deleted location
├── Confirm recovery
└── Location restored to active state
```

### Column Visibility Toggle

```
Header → Settings Icon → Column Visibility Popup
├── Checkbox list of columns
├── Drag to reorder (optional)
├── Save preference to localStorage
└── Show/hide columns dynamically
```

### Filter Presets

```
Save Current Filters:
├── Click "Save Preset" button
├── Enter preset name
├── Option to set as default
└── Saved to localStorage

Load Preset:
├── Click "Presets" dropdown
├── Show list of saved presets
├── Option to delete or set as default
└── Apply filter state
```

---

## Performance Strategy

### 1. **Virtual Scrolling (React Window)**

```typescript
// For tables with 100+ rows
<FixedSizeList
  height={600}
  itemCount={locations.length}
  itemSize={48}
  width="100%"
>
  {({ index, style }) => (
    <LocationRow
      location={locations[index]}
      style={style}
    />
  )}
</FixedSizeList>
```

- Only render visible rows (~15-20 on screen)
- Dramatically improves DOM performance
- Smooth scrolling with keyboard navigation

### 2. **Debounced Search**

```typescript
const debouncedSearch = useDebouncedValue(
  searchInput,
  500 // 500ms delay
)

// Triggers API call only after user stops typing
useEffect(() => {
  performSearch(debouncedSearch)
}, [debouncedSearch])
```

- Reduces API calls by 80%
- Sub-500ms perceived responsiveness

### 3. **Skeleton Loaders**

```
Page Load:
├── Show skeleton KPI cards (placeholder)
├── Show skeleton table header + 10 rows
├── Display SkeletonLoader component
└── Fade-in actual data when ready (smooth transition)

Pagination:
├── Keep current data visible
├── Show skeleton for new page rows below
└── Swap data in place (no jarring transition)
```

### 4. **Lazy Loading**

```typescript
// Lazy load LocationIntelligenceMap component
const LocationMap = lazy(() =>
  import('./LocationIntelligenceMap').then(m => ({
    default: m.LocationIntelligenceMap
  }))
)

// Show placeholder until component loads
<Suspense fallback={<MapSkeletonLoader />}>
  <LocationMap locations={locations} />
</Suspense>
```

### 5. **Optimistic UI Updates**

```typescript
// User action immediate feedback
function handleBulkDelete(ids: string[]) {
  // 1. Immediately update UI
  setLocations(l => l.filter(loc => !ids.includes(loc.id)))
  
  // 2. Show toast with undo option
  showUndoToast('Deleted 5 locations', () => {
    setLocations(originalLocations)
  })
  
  // 3. Execute API call in background
  deleteMutation.mutateAsync(ids)
    .catch(() => {
      // Revert on error
      setLocations(originalLocations)
      showErrorToast('Failed to delete locations')
    })
}
```

### 6. **Memoization Strategy**

```typescript
// Prevent unnecessary re-renders
const MemoizedLocationRow = React.memo(
  LocationRow,
  (prev, next) => prev.location.id === next.location.id
)

// Memoized selectors
const selectActiveLocations = useMemo(
  () => locations.filter(l => l.active),
  [locations]
)
```

### 7. **CSS Containment**

```css
/* Scope CSS recalculations to component boundaries */
.table-row {
  contain: layout style paint;
}

.kpi-card {
  contain: content;
}
```

### 8. **Image Optimization**

```typescript
// Lazy load map tiles only when map is visible
const mapVisible = useInView(mapRef)

if (!mapVisible) return <MapPlaceholder />
return <LocationIntelligenceMap ... />
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter to activate buttons/links
   - Escape to close modals/dropdowns
   - Arrow keys for list/table navigation
   - Space to toggle checkboxes

2. **Screen Reader Support**
   ```typescript
   <button aria-label="Delete location">
     <Trash2 size={16} />
   </button>
   
   <table role="table" aria-label="Locations management">
     <thead role="rowgroup">
       <tr role="row">
         <th scope="col">Name</th>
       </tr>
     </thead>
   </table>
   ```

3. **Color Contrast**
   - Minimum 4.5:1 for text on background
   - Use pattern + color for status (not color-only)
   - Example: "● ONLINE" (dot + text)

4. **Focus Indicators**
   ```css
   button:focus-visible {
     outline: 2px solid #0066CC;
     outline-offset: 2px;
   }
   ```

5. **Form Accessibility**
   - Label every input with `<label for="...">`
   - Error messages linked to inputs via `aria-describedby`
   - Required fields marked with asterisk + `aria-required="true"`

6. **Dynamic Content**
   - Use ARIA Live Regions for toast notifications
   - Announce loading states
   - Describe status changes

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [x] Design system documentation (this file)
- [ ] Create component library (MultiSelect, DateRangePicker, etc.)
- [ ] Enhance AdminLayout with new sidebar features

### Phase 2: Core Features (Week 2)
- [ ] Redesign AdminLocationsPage with KPI cards
- [ ] Implement advanced filters + smart search
- [ ] Add bulk operations panel
- [ ] Implement table improvements (sticky header, column visibility)

### Phase 3: Intelligence & Performance (Week 3)
- [ ] Add LocationIntelligenceMap
- [ ] Implement virtual scrolling
- [ ] Add skeleton loaders
- [ ] Optimize with debouncing + memoization

### Phase 4: Polish & Refinement (Week 4)
- [ ] Accessibility audit + fixes
- [ ] Performance profiling + optimization
- [ ] Mobile responsiveness refinement
- [ ] Comprehensive testing

### Phase 5: Future Extensions (Post-MVP)
- [ ] AI analytics dashboard
- [ ] Predictive maintenance alerts
- [ ] Camera auto-discovery
- [ ] Network topology visualization
- [ ] Real-time collaboration (multi-user editing)

---

## Key Metrics & Success Criteria

### User Experience
- Page load time: < 2 seconds (for 1000+ locations)
- Search response: < 500ms
- Bulk operation: < 1 second feedback
- Mobile accessibility: 95%+ touch target size compliance

### Admin Productivity
- Add location: < 1 minute
- Bulk operations: 40% fewer clicks than current
- Site onboarding: 50% faster than current

### Scalability
- Support 1000+ locations without redesign
- Support 10,000+ cameras across portfolio
- Maintain < 3 second load time at scale

### Code Quality
- 100% TypeScript coverage
- 90%+ unit test coverage
- Zero accessibility violations (WCAG 2.1 AA)
- < 100 kb bundle size for new components

---

## References & Dependencies

### UI Libraries
- **React Window**: Virtual scrolling for large lists
- **Mapbox GL** or **Leaflet**: Map visualization
- **date-fns**: Date formatting and calculations
- **zustand** or **jotai**: State management for filters
- **react-hook-form**: Form management
- **zod** or **yup**: Schema validation

### Performance Tools
- React DevTools Profiler
- Lighthouse CI
- Bundle analyzer (webpack-bundle-analyzer)

### Testing
- Vitest / Jest: Unit tests
- React Testing Library: Component tests
- Playwright / Cypress: E2E tests
- Axe: Accessibility testing

---

**Last Updated**: January 30, 2026
**Design Lead**: Enterprise Admin UI Team
**Version Control**: Component versions tracked in package.json

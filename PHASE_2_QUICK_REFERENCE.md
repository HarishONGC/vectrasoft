# Phase 2 Components Quick Reference

**Status**: ✅ Complete | **Date**: Jan 30, 2026 | **Lines**: 1,535 | **Components**: 5 + 1 Page

---

## 📚 Component Overview

### 1️⃣ LocationRow
**File**: `admin/LocationRow.tsx` | **Lines**: 265 | **Type**: Table Row  
**Exports**: `LocationRow` (memoized component)

```tsx
<LocationRow
  location={location}
  isSelected={selectedIds.has(location.id)}
  onSelect={(id) => handleSelect(id)}
  onEdit={(loc) => handleEdit(loc)}
  onDelete={(id) => handleDelete(id)}
  columns={['name', 'status', 'health', 'cameras', 'region', 'sla', 'alerts', 'actions']}
/>
```

**Props**:
- `location: Location` - The location data object
- `isSelected: boolean` - Selection state
- `onSelect: (id) => void` - Selection callback
- `onEdit: (location) => void` - Edit callback
- `onDelete: (id) => void` - Delete callback
- `columns: string[]` - Visible columns to render
- `className?: string` - Optional CSS classes

**Renders**: Status badge, health bar, camera count, action buttons

---

### 2️⃣ EnhancedTable
**File**: `admin/EnhancedTable.tsx` | **Lines**: 280 | **Type**: Table Container  
**Exports**: `EnhancedTable` (memoized component)

```tsx
<EnhancedTable
  locations={filteredLocations}
  isLoading={isLoading}
  selectedIds={selectedIds}
  onSelectChange={setSelectedIds}
  onEdit={handleEdit}
  onDelete={handleDelete}
  sortBy="name"
  sortOrder="asc"
  onSort={(column, order) => handleSort(column, order)}
/>
```

**Props**:
- `locations: Location[]` - Array of locations
- `isLoading?: boolean` - Loading state
- `selectedIds: Set<string>` - Selected location IDs
- `onSelectChange: (ids) => void` - Selection change callback
- `onEdit: (location) => void` - Edit callback
- `onDelete: (id) => void` - Delete callback
- `sortBy?: string` - Current sort column
- `sortOrder?: 'asc' | 'desc'` - Sort order
- `onSort?: (col, order) => void` - Sort callback
- `className?: string` - Optional CSS classes

**Features**: Sticky header, sorting, column visibility toggle, empty state

---

### 3️⃣ KpiCard
**File**: `admin/KpiCard.tsx` | **Lines**: 150 | **Type**: Metric Card  
**Exports**: `KpiCard` (memoized component)

```tsx
<KpiCard
  label="Average Health"
  value={85}
  unit="%"
  status="success"
  trend={{ value: 5, direction: 'up', format: 'percentage' }}
  icon={<Activity size={20} />}
  onClick={() => console.log('clicked')}
/>
```

**Props**:
- `label: string` - Card title
- `value: string | number` - Main value display
- `unit?: string` - Unit label (%, cameras, etc.)
- `icon?: ReactNode` - Optional icon component
- `trend?: { value, direction, format }` - Trend data
- `status?: 'success' | 'warning' | 'error' | 'info'` - Status type
- `onClick?: () => void` - Click handler
- `className?: string` - Optional CSS classes
- `loading?: boolean` - Loading state (shows skeleton)
- `comparison?: string` - Comparison text
- `compact?: boolean` - Compact layout

**Statuses**: success (green), warning (yellow), error (red), info (blue)

---

### 4️⃣ SearchInput
**File**: `admin/SearchInput.tsx` | **Lines**: 160 | **Type**: Search Field  
**Exports**: `SearchInput` (memoized component)

```tsx
<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search locations..."
  advancedEnabled={advancedMode}
  onAdvancedToggle={setAdvancedMode}
  showSyntaxHints={true}
/>
```

**Props**:
- `value: string` - Current search value
- `onChange: (value) => void` - Change callback
- `placeholder?: string` - Input placeholder
- `onAdvancedToggle?: (enabled) => void` - Advanced mode callback
- `advancedEnabled?: boolean` - Advanced mode state
- `className?: string` - Optional CSS classes
- `showSyntaxHints?: boolean` - Show syntax hint panel

**Advanced Syntax**:
```
region:north status:active cameras:>5 health:<80
```

**Supported Prefixes**:
- `region:` → region name
- `status:` → status value
- `sla:` → sla level
- `cameras:` → camera count (supports >, <, >=, <=)
- `health:` → health score
- `city:` → city name

---

### 5️⃣ AdvancedFilters
**File**: `admin/AdvancedFilters.tsx` | **Lines**: 280 | **Type**: Modal Dialog  
**Exports**: `AdvancedFilters` (memoized component)

```tsx
<AdvancedFilters
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  filters={currentFilters}
  onApply={applyFilters}
  availableRegions={['North', 'South', 'East', 'West']}
  availableCities={['London', 'Manchester', 'Birmingham']}
  statusOptions={[
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]}
  slaOptions={[
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' }
  ]}
/>
```

**Props**:
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close callback
- `filters: FilterValue` - Current filter values
- `onApply: (filters) => void` - Apply callback
- `availableRegions?: string[]` - Region options
- `availableCities?: string[]` - City options
- `statusOptions?: { label, value }[]` - Status options
- `slaOptions?: { label, value }[]` - SLA options
- `isLoading?: boolean` - Loading state

**Filter Options**:
- Multi-select: Status, Region, City, SLA
- Range sliders: Cameras (0-100), Health (0-100%)
- Date ranges: Created date, Last updated

---

### 6️⃣ AdminLocationsPageV2
**File**: `pages/admin/AdminLocationsPageV2.tsx` | **Lines**: 380 | **Type**: Page  
**Exports**: `AdminLocationsPageV2` (page component)

```tsx
import { AdminLocationsPageV2 } from './pages/admin/AdminLocationsPageV2'

export function App() {
  return <AdminLocationsPageV2 />
}
```

**Structure**:
1. Header with title and "New Location" button
2. 5 KPI cards (Total, Active, Health, Cameras, Alerts)
3. Search & filter bar
4. Filter preset manager
5. Main data table (EnhancedTable)
6. Bulk actions panel (when items selected)
7. Advanced filters modal
8. Create/edit location modal

**Key Features**:
- ✅ Real-time search with debouncing
- ✅ Advanced filter syntax support
- ✅ Multi-column sorting
- ✅ Bulk operations (delete, export, etc.)
- ✅ CSV export functionality
- ✅ Location CRUD operations
- ✅ Responsive grid layout
- ✅ Loading/empty states
- ✅ Integrated with existing API hooks

---

## 🔧 Installation & Usage

### 1. Import Components
```tsx
import { LocationRow } from '@/components/admin/LocationRow'
import { EnhancedTable } from '@/components/admin/EnhancedTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { SearchInput } from '@/components/admin/SearchInput'
import { AdvancedFilters } from '@/components/admin/AdvancedFilters'
import { AdminLocationsPageV2 } from '@/pages/admin/AdminLocationsPageV2'
```

### 2. Use in Layout
```tsx
// Option A: Use the full page
<AdminLocationsPageV2 />

// Option B: Use individual components
import { useState } from 'react'

export function CustomPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Total" value={42} status="info" />
        <KpiCard label="Active" value={38} status="success" />
      </div>
      
      <SearchInput value={q} onChange={setQ} />
      
      <EnhancedTable
        locations={locations}
        selectedIds={selected}
        onSelectChange={setSelected}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
```

---

## 📊 Data Types

### Location Interface
```ts
interface Location {
  id: string
  name: string
  city: string
  region?: string
  status: 'active' | 'inactive' | 'maintenance' | 'offline'
  health?: number // 0-100
  healthTrend?: number // change from previous
  cameraCount?: number
  sla?: 'low' | 'medium' | 'high'
  alertCount?: number
  lastUpdate?: string // ISO date
  createdAt?: string // ISO date
}
```

### Filter Value
```ts
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
```

---

## ⚡ Performance Tips

1. **Memoization**: All components are memoized with `React.memo`
2. **Debouncing**: SearchInput debounces at 300ms
3. **Virtual Scrolling**: LocationRow is optimized for React Window
4. **Lazy Loading**: Use skeleton loaders during data fetch
5. **Column Visibility**: Users can hide unused columns to reduce render load

---

## 🎨 Styling Guide

All components use Tailwind CSS utility classes. Key color tokens:

**Status Colors**:
- `success`: `bg-green-50 text-green-900`
- `warning`: `bg-yellow-50 text-yellow-900`
- `error`: `bg-red-50 text-red-900`
- `info`: `bg-blue-50 text-blue-900`

**Interactive States**:
- Hover: `hover:bg-gray-50` or `hover:text-gray-900`
- Focus: `focus:ring-2 focus:ring-blue-500`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

---

## 🧪 Testing Checklist

- [ ] Component renders without props errors
- [ ] All required props are provided
- [ ] Optional props work correctly
- [ ] Click handlers fire appropriately
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels are present
- [ ] Loading states display correctly
- [ ] Empty states show helpful messages
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors or warnings

---

## 📞 Component Support

**Dependencies**:
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Lucide React (icons)
- Existing UI components (Modal, Card, Button, etc.)

**Browser Support**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🚀 Next Steps (Phase 3)

Planned components for Phase 3:
1. LocationDetailsModal - Extended form with tabs
2. BulkOperationModal - Operation preview
3. ColumnVisibilityToggle - Advanced column management
4. LocationIntelligenceMap - Geo-visualization
5. AdminLayout sidebar enhancements

**Estimated Timeline**: 3-4 weeks
**Team Size**: 2-3 developers

---

**Reference**: PHASE_2_COMPLETE.md | COMPONENT_REFERENCE.md | IMPLEMENTATION_GUIDE.md

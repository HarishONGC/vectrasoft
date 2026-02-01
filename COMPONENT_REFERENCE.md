# Admin Locations Management - Component Reference Guide

## Complete Component Inventory

### ✅ Completed Components

#### UI Components (foundational)

1. **MultiSelect** (`components/ui/MultiSelect.tsx`)
   - Multi-option selection with checkboxes
   - Search filtering
   - Tag display with overflow handling
   - Clear individual or all options
   - Custom icons support

2. **DateRangePicker** (`components/ui/DateRangePicker.tsx`)
   - Date range selection
   - Quick presets (Today, Week, Month, Quarter, Year)
   - Custom date input
   - Accessible calendar UI
   - Clear/reset functionality

3. **SkeletonLoader** (`components/ui/SkeletonLoader.tsx`)
   - Multiple variants: card, table, list, kpi
   - Customizable dimensions
   - Pulsing animation
   - Responsive design

4. **StatusTrend** (`components/ui/StatusTrend.tsx`)
   - Trend indicator with icons (↑ ↓ -)
   - Percentage change display
   - Color-coded (green/red/neutral)
   - Multiple size options

#### Admin Components

5. **BulkActionsPanel** (`components/admin/BulkActionsPanel.tsx`)
   - Sticky bottom-right positioning
   - Selection counter
   - Action buttons with icons
   - Confirmation prompts for dangerous actions
   - Processing status display
   - Undo toast integration

6. **FilterPreset** (`components/admin/FilterPreset.tsx`)
   - Save/load filter configurations
   - Set default preset
   - Delete presets
   - LocalStorage persistence
   - Timestamp tracking

#### Utility Hooks

7. **useLocationFilters** (`hooks/useLocationFilters.ts`)
   - Advanced filter parsing
   - Filter + sort + pagination logic
   - URL state serialization
   - Debounced filtering
   - Filter status detection

---

## 📋 TODO Components (Ready for Implementation)

### High Priority (Week 2-3)

#### 1. **LocationRow** Component
**Location**: `components/admin/LocationRow.tsx`
**Purpose**: Memoized table row component with virtual scrolling support
**Props**:
```typescript
interface LocationRowProps {
  location: LocationWithMetrics
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  visibleColumns: string[]
  style?: React.CSSProperties
}
```

**Features**:
- Checkbox for selection
- Row hover actions
- Column visibility support
- Memo optimized for virtual scrolling
- Keyboard navigation support

#### 2. **EnhancedTable** Component
**Location**: `components/admin/EnhancedTable.tsx`
**Purpose**: Full-featured data table with advanced capabilities
**Props**:
```typescript
interface EnhancedTableProps {
  columns: TableColumn[]
  data: LocationWithMetrics[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onSort?: (column: string, order: 'asc' | 'desc') => void
  pageSize?: number
  currentPage?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  virtual?: boolean
  loading?: boolean
}
```

**Features**:
- Sticky header (on scroll)
- Column resizing
- Column visibility toggle
- Virtual scrolling (optional)
- Row hover actions
- Responsive table layout

#### 3. **KpiCard** Component
**Location**: `components/admin/KpiCard.tsx`
**Purpose**: Enhanced KPI card with trends and micro-animations
**Props**:
```typescript
interface KpiCardProps {
  title: string
  value: number | string
  trend?: { current: number; previous?: number }
  icon: React.ComponentType<{ size: number }>
  color: 'blue' | 'emerald' | 'brand' | 'amber' | 'rose'
  subtitle?: string
  onClick?: () => void
  className?: string
}
```

**Features**:
- Icon + color combination
- Trend indicator (↑ ↓)
- Border accent color
- Micro-animations on update
- Clickable for drill-down

#### 4. **AdvancedFilters** Component
**Location**: `components/admin/AdvancedFilters.tsx`
**Purpose**: Modal dialog for advanced filter configuration
**Props**:
```typescript
interface AdvancedFiltersProps {
  open: boolean
  onClose: () => void
  filters: FilterState
  onApply: (filters: FilterState) => void
  onReset: () => void
}
```

**Features**:
- All filter options in organized sections
- Camera count range slider
- Health threshold range slider
- Date range picker
- Location type checkboxes
- Apply/Reset/Cancel buttons

#### 5. **SearchInput** Component
**Location**: `components/admin/SearchInput.tsx`
**Purpose**: Specialized search with syntax hints
**Props**:
```typescript
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onAdvancedMode?: (enabled: boolean) => void
  showSyntaxHint?: boolean
}
```

**Features**:
- Syntax help tooltip
- Example queries
- Clear button
- Debounce support
- Icon + styling

#### 6. **ColumnVisibilityToggle** Component
**Location**: `components/admin/ColumnVisibilityToggle.tsx`
**Purpose**: Dropdown to show/hide table columns
**Props**:
```typescript
interface ColumnVisibilityToggleProps {
  columns: TableColumn[]
  onVisibilityChange: (columnId: string, visible: boolean) => void
  onResetDefaults: () => void
}
```

**Features**:
- Checkbox for each column
- Drag to reorder (optional)
- Reset to defaults button
- Persist to localStorage

#### 7. **LocationDetailsModal** Component
**Location**: `components/admin/LocationDetailsModal.tsx`
**Purpose**: Full-featured edit modal for location details
**Props**:
```typescript
interface LocationDetailsModalProps {
  open: boolean
  location: Location | null
  onClose: () => void
  onSave: (updates: Partial<Location>) => void
  mode: 'view' | 'edit'
}
```

**Features**:
- Tabbed interface (Info, SLA, Contact, Compliance)
- Form validation
- Required field indicators
- Audit trail display
- Related resources section

#### 8. **BulkOperationModal** Component
**Location**: `components/admin/BulkOperationModal.tsx`
**Purpose**: Modal for bulk operations with preview
**Props**:
```typescript
interface BulkOperationModalProps {
  open: boolean
  action: BulkAction | null
  selectedCount: number
  previewData: LocationWithMetrics[]
  onConfirm: () => void
  onCancel: () => void
}
```

**Features**:
- Action preview with affected locations
- Configuration UI for action parameters
- Warnings/impact analysis
- Progress indicator

#### 9. **LocationHealthCard** Component
**Location**: `components/admin/LocationHealthCard.tsx`
**Purpose**: Compact health status card for a location
**Props**:
```typescript
interface LocationHealthCardProps {
  location: LocationWithMetrics
  trend?: 'up' | 'down' | 'stable'
  compact?: boolean
  onClick?: () => void
}
```

**Features**:
- Camera count
- Online percentage
- Health status bar
- Trend indicator
- Click to expand

#### 10. **UndoToast** Component
**Location**: `components/ui/UndoToast.tsx`
**Purpose**: Toast notification with undo action
**Props**:
```typescript
interface UndoToastProps {
  message: string
  onUndo: () => void
  duration?: number
  autoClose?: boolean
}
```

**Features**:
- Action message
- Undo button
- Auto-dismiss timer
- Smooth animation
- Multiple toasts support

---

## 🗺️ Optional/Future Components

### Medium Priority (Post-MVP)

#### 11. **LocationIntelligenceMap** Component
**Location**: `components/admin/LocationIntelligenceMap.tsx`
**Purpose**: Geolocation map with location pins and status
**Dependencies**: `mapbox-gl` or `leaflet`
**Features**:
- Pin markers with status coloring
- Cluster support
- Zoom/pan controls
- Click to view details
- Heat map (status distribution)

#### 12. **TimelineView** Component
**Location**: `components/admin/TimelineView.tsx`
**Purpose**: Historical timeline of changes
**Features**:
- Event timeline
- Filter by event type
- Expandable details
- Export timeline

#### 13. **ExportDialog** Component
**Location**: `components/admin/ExportDialog.tsx`
**Purpose**: Export selected locations to CSV/PDF/Excel
**Features**:
- Format selection (CSV, PDF, Excel)
- Column selection
- Date range filter
- Email option

#### 14. **NotificationCenter** Component
**Location**: `components/admin/NotificationCenter.tsx`
**Purpose**: Centralized notifications and alerts
**Features**:
- Alert queue
- Prioritization
- Auto-dismiss
- Action buttons

#### 15. **NetworkTopologyView** Component
**Location**: `components/admin/NetworkTopologyView.tsx`
**Purpose**: Visual network diagram of locations and cameras
**Dependencies**: `d3.js` or `vis-network`
**Features**:
- Node layout (locations, cameras)
- Connection visualization
- Status coloring
- Interactive zoom/pan

---

## 🔄 Component Dependencies Graph

```
App
├── AdminLayout
│   ├── TopBar
│   └── Sidebar
│       ├── FilterPreset ✅
│       └── Navigation
│
└── AdminLocationsPage (To be created)
    ├── KpiCard (To be created)
    ├── SearchInput (To be created)
    ├── FilterPreset ✅
    ├── AdvancedFilters (To be created)
    ├── EnhancedTable (To be created)
    │   └── LocationRow (To be created)
    │       ├── MultiSelect ✅
    │       └── StatusTrend ✅
    ├── ColumnVisibilityToggle (To be created)
    ├── BulkActionsPanel ✅
    │   └── BulkOperationModal (To be created)
    ├── LocationDetailsModal (To be created)
    │   └── DateRangePicker ✅
    ├── LocationIntelligenceMap (Optional)
    ├── SkeletonLoader ✅
    └── UndoToast (To be created)
```

---

## 📦 Integration Timeline

### Week 1: Foundation ✅
- [x] MultiSelect, DateRangePicker, SkeletonLoader, StatusTrend
- [x] BulkActionsPanel, FilterPreset
- [x] useLocationFilters hook
- [x] Documentation

### Week 2: Core Components
- [ ] LocationRow (virtual scrolling support)
- [ ] EnhancedTable (main data display)
- [ ] KpiCard (dashboard metrics)
- [ ] AdvancedFilters modal
- [ ] SearchInput component

### Week 3: Features & Polish
- [ ] LocationDetailsModal (form handling)
- [ ] BulkOperationModal (previews)
- [ ] ColumnVisibilityToggle
- [ ] UndoToast integration
- [ ] LocationHealthCard

### Week 4: Optimization & Testing
- [ ] Performance profiling
- [ ] Accessibility audit
- [ ] E2E testing
- [ ] Bug fixes
- [ ] Documentation review

---

## 🎨 Component Styling Guide

### Consistent Patterns

#### Button Variants
```
primary:   Brand blue, solid
secondary: Light gray, outline
ghost:     No background, hover underline
danger:    Red, solid, for destructive actions
warning:   Orange, for caution actions
```

#### Status Colors
```
OK/Online:     Emerald green #00A651
Warning:       Orange #F57C00
Critical/Bad:  Rose red #DC3545
Offline:       Gray #6B7280
```

#### Sizing
```
Compact (sm):     8px padding, 12px font
Standard (md):    12px padding, 14px font
Large (lg):       16px padding, 16px font
```

#### Border Radius
```
Cards:       lg (0.5rem)
Buttons:     lg (0.5rem)
Inputs:      lg (0.5rem)
Pills:       full (9999px)
```

---

## 🧪 Testing Strategy

### Unit Tests per Component
```
- Props validation
- Event handlers
- Conditional rendering
- Edge cases (empty, null, undefined)
```

### Integration Tests
```
- Multi-component workflows
- State management (Context/Redux)
- API integration
- Filter + Sort + Pagination
```

### E2E Tests
```
- Complete user journeys
- Mobile responsiveness
- Performance (load time, scroll)
- Accessibility (keyboard, screen reader)
```

---

## 📖 Component Storybook Setup

**File**: `stories/Admin.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { EnhancedTable } from './EnhancedTable'

const meta: Meta<typeof EnhancedTable> = {
  component: EnhancedTable,
  tags: ['autodocs'],
  argTypes: {
    // Define controls for component props
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: mockLocations,
    columns: defaultColumns,
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    data: [],
  },
}
```

---

## 🚀 Performance Checklist per Component

- [ ] Memoization (React.memo for list items)
- [ ] useCallback for event handlers
- [ ] useMemo for expensive calculations
- [ ] Debouncing for user input
- [ ] Virtual scrolling for large lists
- [ ] Code splitting (lazy loading)
- [ ] Image optimization
- [ ] CSS containment

---

**Last Updated**: January 30, 2026
**Status**: Phase 1 Complete, Ready for Phase 2
**Next**: LocationRow & EnhancedTable implementation

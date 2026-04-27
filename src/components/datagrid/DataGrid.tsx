'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnSizingState,
  ExpandedState,
  Row,
  ColumnPinningState,
} from '@tanstack/react-table'
import { useIntelligentColumnSizing, COLUMN_SIZING_PRESETS } from '@/hooks/useIntelligentColumnSizing'
import { useDebouncedValue } from '@/hooks/useDebounce'
// Import new pagination and selection components
import { PaginationControls, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from './controls/PaginationControls'
import { SelectionCell as SelectionCheckbox } from './cells/SelectionCell'
import { ActionsMenu } from './controls/menu'
import { AutoResizeButton } from './controls/AutoResizeButton'
// Virtual scrolling
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Upload,
  Filter,
  ListFilter,
  Mic, Search,
  Grid3X3,
  BarChart3,
  PieChart,
  TrendingUp,
  Eye,
  EyeOff,
  Settings,
  MoreHorizontal,
  LayoutGrid,
  List,
  Pin,
  PinOff,
  GripVertical,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { DatePicker } from '@/components/forms/date-picker/DatePicker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui'
import { Dropdown } from '@/components'
import { Badge } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Skeleton } from '@/components/ui/feedback/skeleton'

// Advanced Filter Modal
import { AdvancedFilterModal } from './controls/menu/filter/AdvancedFilterModal'
// Column Chooser Modal
import { ColumnChooserModal } from './controls/menu/column/ColumnChooserModal'
// Data Visualization Component (Chart View)
import { ChartView as DataVisualization } from './controls/menu/view/ChartView'
// Export/Import - Now handled via ActionsMenu (ExportSection/ImportSection)
// Draggable Column Header
import { DraggableColumnHeader } from './columns/DraggableColumnHeader'
// Draggable Row Component
import { DraggableRow } from './rows/DraggableRow'
import { CellRenderer } from './cells/CellRenderer'
// Card View Component
import { CardView } from './controls/menu/view/CardView'
// Column Context Menu Component
import { ColumnContextMenu } from './columns/ColumnContextMenu'
// Baccha Search Components
import { InlineSearchCell } from './search/InlineSearchCell'
import { SearchNavigator, useSearchNavigation } from './search/SearchNavigator'
import { SearchHighlighter, fuzzyMatch } from './search/SearchHighlighter'
import { SearchNewModal } from './search/SearchNewModal'
import { useSearchPreferences } from '@/contexts/SearchPreferencesContext'
import { advancedSearch } from './search/advancedSearch'
// Expandable Row Component
import { ExpandableRow, ExpansionToggleCell, ProcessBreakdown } from './rows/ExpandableRow'
// Summary Row Component
import { SummaryRow } from './rows/SummaryRow'
// Filter Row Component
import { FilterRow } from './rows/FilterRow'

export interface DataGridProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  onRowClick?: (row: TData) => void
  onRowSelect?: (selectedRows: TData[]) => void
  onImport?: (data: TData[]) => void
  selectedRowIds?: string[]
  getRowId?: (row: TData) => string
  getRowProps?: (row: TData) => { className?: string; style?: React.CSSProperties }
  // All/Selected view functionality
  enableViewToggle?: boolean
  viewMode?: 'all' | 'selected'
  onViewModeChange?: (mode: 'all' | 'selected') => void
  enableVirtualization?: boolean
  enableColumnResizing?: boolean
  enableColumnReordering?: boolean
  enableColumnFreezing?: boolean
  frozenColumns?: string[] // Array of column IDs to freeze
  enableGrouping?: boolean
  enableExport?: boolean
  enableImport?: boolean
  enableVisualization?: boolean
  enableStickyActions?: boolean
  enableRowSelection?: boolean
  enableSorting?: boolean
  defaultSortBy?: string // Column ID to sort by initially (e.g., "DepartmentSequenceNo")
  defaultSortOrder?: 'asc' | 'desc' // Sort order for initial sort (default: 'asc')
  initialColumnVisibility?: Record<string, boolean> // Initial column visibility state (e.g., { DepartmentSequenceNo: false })
  enableSearch?: boolean
  enableFiltering?: boolean
  enableColumnVisibility?: boolean
  pageSize?: number
  stickyHeader?: boolean
  className?: string
  title?: string
  description?: string
  headerActions?: React.ReactNode
  preToggleActions?: React.ReactNode
  loading?: boolean
  hideHeader?: boolean
  compactHeader?: boolean // Use compact header with actions menu (default: true). Set false for legacy full header.
  columnResizeMode?: 'onChange' | 'onEnd'
  style?: React.CSSProperties
  compactMode?: boolean // Fit grid height to content with tighter constraints (modals/dialogs). Default is standard mode with calc(100vh - 300px)
  minHeight?: number | string
  maxHeight?: number | string
  rowHeight?: number
  // Baccha Search props
  mainColumns?: string // Comma-separated list of main column keys for Baccha Search
  enableBacchaSearch?: boolean
  searchType?: 'advanced' | 'new' // Search UI type: 'advanced' = current inline, 'new' = top header modal style. If not specified, uses user preference
  // NEW: Pagination props
  enablePagination?: boolean
  paginationPageSize?: number
  paginationPageSizeOptions?: number[]
  // NEW: Circular checkboxes
  circularCheckboxes?: boolean
  // NEW: Auto-resize
  enableAutoResize?: boolean
  // NEW: Row selection modes
  rowSelectionMode?: 'single' | 'multi'
  enableRowClickSelection?: boolean
  enableCtrlClickMultiSelect?: boolean
  enableShiftClickRange?: boolean
  singleSelectionStyle?: 'radio' | 'highlight'
  // NEW: Row reordering
  enableRowReordering?: boolean
  onRowOrderChange?: (reorderedData: TData[]) => void
  hideSelectionInSelectedView?: boolean
  // NEW: Row Expansion - Expandable rows for detailed breakdown
  renderSubComponent?: (row: Row<TData>) => React.ReactNode
  getRowCanExpand?: (row: Row<TData>) => boolean
  // NEW: Date Filter
  enableDateFilter?: boolean
  dateFrom?: Date | null
  dateTo?: Date | null
  onDateFromChange?: (date: Date | null) => void
  onDateToChange?: (date: Date | null) => void
  // NEW: Summary/Footer row
  enableSummary?: boolean
  summaryConfig?: import('./utils/grid-types').SummaryConfig<TData>
  // NEW: Filter Row (DevExtreme-style per-column filtering)
  enableFilterRow?: boolean
}

export function DataGrid<TData>({
  data,
  columns: initialColumns,
  onRowClick,
  onRowSelect,
  onImport,
  selectedRowIds = [],
  getRowId,
  getRowProps,
  enableViewToggle = false,
  viewMode = 'all',
  onViewModeChange,
  enableVirtualization = true,
  enableColumnResizing = true,
  enableColumnReordering = true,
  enableColumnFreezing = false,
  frozenColumns = [],
  enableGrouping = false,
  enableExport = true,
  enableImport = true,
  enableVisualization = true,
  enableStickyActions = false,
  enableRowSelection = true,
  enableSorting = true,
  defaultSortBy,
  defaultSortOrder = 'asc',
  initialColumnVisibility,
  enableSearch = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  pageSize = 50,
  stickyHeader = true,
  className = '',
  title,
  description,
  headerActions,
  preToggleActions,
  loading = false,
  hideHeader = false,
  compactHeader = true,
  columnResizeMode = 'onChange',
  style,
  compactMode = false,
  minHeight = 120,
  maxHeight = "calc(100vh - 300px)", // Default: standard mode, responsive to screen height
  rowHeight = 24.75,
  // Baccha Search props
  mainColumns,
  enableBacchaSearch = true,
  searchType,
  // NEW: Pagination props
  enablePagination = true,
  paginationPageSize = DEFAULT_PAGE_SIZE,
  paginationPageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  // NEW: Circular checkboxes
  circularCheckboxes = true,
  // NEW: Auto-resize
  enableAutoResize = true,
  // NEW: Row selection modes
  rowSelectionMode = 'multi',
  enableRowClickSelection = true,
  enableCtrlClickMultiSelect = true,
  enableShiftClickRange = true,
  singleSelectionStyle = 'radio',
  // NEW: Row reordering
  enableRowReordering = false,
  onRowOrderChange,
  hideSelectionInSelectedView = true,
  // NEW: Row Expansion
  renderSubComponent,
  getRowCanExpand,
  // NEW: Date Filter
  enableDateFilter = false,
  // NEW: Summary/Footer row
  enableSummary = false,
  summaryConfig,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  // NEW: Filter Row
  enableFilterRow = false,
}: DataGridProps<TData>) {
  // Get user search preferences
  const { defaultSearchType } = useSearchPreferences()

  // Determine which search type to use: explicit prop > user preference > 'advanced' fallback
  const effectiveSearchType = searchType || defaultSearchType || 'advanced'

  // Normalize columns: ensure all columns have explicit IDs for consistent drag/drop behavior
  // This fixes the issue where some columns have only accessorKey (auto-generated ID)
  // and others have explicit ID, causing drag/drop to fail inconsistently
  const normalizedColumns = useMemo(() => {
    return initialColumns.map((col, index) => {
      // If column already has an id, use it
      if (col.id) {
        return col
      }

      // If column has accessorKey, use it as id
      if ((col as any).accessorKey) {
        return {
          ...col,
          id: (col as any).accessorKey as string
        }
      }

      // Fallback: generate unique id from index and header
      const header = typeof col.header === 'string' ? col.header : `column`
      return {
        ...col,
        id: `${header.toLowerCase().replace(/\s+/g, '-')}-${index}`
      }
    })
  }, [initialColumns])

  // Create initial row selection state from selectedRowIds
  const initialRowSelection = useMemo(() => {
    const selection: Record<string, boolean> = {}
    data.forEach((row, index) => {
      // Use getRowId if provided, otherwise fall back to .id or index
      const rowId = getRowId ? getRowId(row) : ((row as any).id || index.toString())
      if (selectedRowIds.includes(rowId)) {
        // ✅ FIX: Use rowId as key (not index) when getRowId is provided
        // TanStack Table expects ID-based selection when getRowId is configured
        selection[rowId] = true
      }
    })
    return selection
  }, [selectedRowIds, data, getRowId])

  // Row reordering state - must be declared before filteredData
  const [reorderedData, setReorderedData] = useState<TData[] | null>(null)

  // Row Expansion state
  const [expanded, setExpanded] = useState<ExpandedState>({})

  // Filter data based on view mode if view toggle is enabled
  const filteredData = useMemo(() => {
    // Use reordered data if available and reordering is enabled (in selected view OR when viewToggle is disabled)
    const useReorderedData = enableRowReordering && (viewMode === 'selected' || !enableViewToggle) && reorderedData
    const baseData = useReorderedData ? reorderedData : data

    if (!enableViewToggle || viewMode === 'all') {
      return baseData
    }

    // If in 'selected' mode, filter to only show selected rows
    if (selectedRowIds.length === 0) {
      return [] // Show empty grid when no selections in 'selected' mode
    }

    // Filter for selected view
    const selectedIdsSet = new Set(selectedRowIds)
    const filtered = baseData.filter(item => {
      const itemId = getRowId ? getRowId(item) : (item as any).id || baseData.indexOf(item).toString()
      return selectedIdsSet.has(itemId)
    })

    return filtered
  }, [enableViewToggle, viewMode, data, selectedRowIds, getRowId, enableRowReordering, reorderedData])

  // Intelligent column sizing based on cell content only
  const { enhancedColumns: intelligentColumns, autoResizeAllColumns } = useIntelligentColumnSizing(
    filteredData,
    normalizedColumns,
    COLUMN_SIZING_PRESETS.standard
  )

  // State management
  const [sorting, setSorting] = useState<SortingState>(() => {
    // Initialize with default sort if provided
    if (defaultSortBy) {
      return [{ id: defaultSortBy, desc: defaultSortOrder === 'desc' }]
    }
    return []
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility || {})
  const [rowSelection, setRowSelection] = useState(initialRowSelection)
  const [globalFilter, setGlobalFilter] = useState('')
  const [frozenColumnsState, setFrozenColumnsState] = useState<Set<string>>(new Set(frozenColumns))

  // Column Pinning State
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: frozenColumns || [],
    right: ['actions'] // Auto-pin actions column to the right
  })

  // NEW: Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: enablePagination ? paginationPageSize : filteredData.length,
  })

  // Sync frozen columns state with prop changes (but allow user overrides)
  useEffect(() => {
    if (frozenColumns && frozenColumns.length > 0) {
      setFrozenColumnsState(prev => {
        const newSet = new Set(prev)
        frozenColumns.forEach(colId => newSet.add(colId))
        return newSet
      })
    }
  }, [frozenColumns])

  // Baccha Search state
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({})
  const [isColumnSearchActive, setIsColumnSearchActive] = useState<Record<string, boolean>>({})

  // Search navigation
  const searchInputRef = useRef<HTMLInputElement>(null)
  const {
    navigationState,
    updateSearchResults,
    navigate: navigateSearch,
    selectRow: selectSearchRow,
    clearNavigation
  } = useSearchNavigation()

  // Parse main columns from comma-separated string
  const mainColumnsArray = useMemo(() => {
    if (!mainColumns) return []
    return mainColumns.split(',').map(col => col.trim()).filter(Boolean)
  }, [mainColumns])

  // ✅ DISABLED: This was causing selection to reset on every change
  // Let the DataGrid manage its own selection state internally
  // Parent component gets notified via onRowSelect callback
  /*
  React.useEffect(() => {
    if (!selectedRowIds || selectedRowIds.length === 0) return

    const newSelection: Record<string, boolean> = {}
    data.forEach((row, index) => {
      const rowId = (row as any).id || index.toString()
      if (selectedRowIds.includes(rowId)) {
        newSelection[index.toString()] = true
      }
    })

    const newKeys = Object.keys(newSelection).sort().join(',')
    const currentKeys = Object.keys(rowSelection).filter(k => rowSelection[k]).sort().join(',')

    if (newKeys !== currentKeys) {
      setRowSelection(newSelection)
    }
  }, [selectedRowIds])
  */

  // Ensure toggle visibility is always stable
  const toggleShouldBeVisible = useMemo(() => {
    return Boolean(enableViewToggle && enableRowSelection)
  }, [enableViewToggle, enableRowSelection])

  // Safe selectedRowIds count to prevent undefined errors
  const safeSelectedCount = useMemo(() => {
    const count = Array.isArray(selectedRowIds) ? selectedRowIds.length : 0
    // console.log('🔢 [DataGrid] safeSelectedCount recalculated:', {
    //   count,
    //   selectedRowIds,
    //   isArray: Array.isArray(selectedRowIds)
    // })
    return count
  }, [selectedRowIds])

  // Note: selectedRowIds sync is disabled to allow internal selection state management
  // If external control is needed, this logic can be re-enabled with proper conflict resolution

  // Preserve row selection state during view mode transitions
  const stableRowSelection = useMemo(() => {
    if (!enableViewToggle) return rowSelection

    // In 'selected' mode, ensure selection state remains consistent
    if (viewMode === 'selected' && selectedRowIds.length > 0) {
      const preservedSelection: Record<string, boolean> = {}

      // Map selected IDs to their indices in filtered data
      filteredData.forEach((item, index) => {
        const itemId = getRowId ? getRowId(item) : (item as any).id || data.indexOf(item).toString()
        if (selectedRowIds.includes(itemId)) {
          preservedSelection[index.toString()] = true
        }
      })

      return preservedSelection
    }

    return rowSelection
  }, [enableViewToggle, viewMode, selectedRowIds, filteredData, rowSelection, getRowId, data])

  // Helper function to format dates as "12 Oct, 2025"
  const formatDateCell = (dateString: any) => {
    if (!dateString) return '-'

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      const day = date.getDate()
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const year = date.getFullYear()
      return `${day} ${month}, ${year}`
    } catch {
      return dateString
    }
  }

  // Create columns with selection column if needed
  const enhancedColumns = useMemo(() => {
    let baseColumns = intelligentColumns || normalizedColumns

    // Auto-format date columns (columns ending with "Date")
    baseColumns = baseColumns.map((col: any) => {
      const accessorKey = col.accessorKey as string
      const header = col.header as string

      // Check if column name ends with "Date" or header contains "Date"
      const isDateColumn =
        (accessorKey && (accessorKey.endsWith('Date') || accessorKey.toLowerCase().includes('date'))) ||
        (typeof header === 'string' && header.toLowerCase().includes('date'))

      // If it's a date column and doesn't have a custom cell renderer, add date formatting
      if (isDateColumn && !col.cell) {
        return {
          ...col,
          cell: ({ row }: any) => {
            const value = row.getValue(accessorKey)
            const formattedValue = formatDateCell(value)
            // Center the dash if it's an empty value
            return (
              <span className={formattedValue === '-' ? 'flex justify-center w-full' : ''}>
                {formattedValue}
              </span>
            )
          }
        }
      }

      return col
    })

    // Hide selection column in Selected view if hideSelectionInSelectedView is true
    const shouldHideSelection = hideSelectionInSelectedView && viewMode === 'selected'

    if (!enableRowSelection || shouldHideSelection) return baseColumns

    // Check if there's already a selection column
    const hasSelectionColumn = baseColumns.some(col =>
      col.id === 'select' ||
      (col as any).accessorKey === 'select' ||
      ((col as any).meta && (col as any).meta.isSelectColumn)
    )

    if (hasSelectionColumn) {
      return baseColumns
    }

    const selectionColumn = {
      id: 'select',
      header: ({ table }: any) => (
        <div className="w-full h-full flex items-center justify-center">
          {rowSelectionMode === 'multi' ? (
            <SelectionCheckbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={(checked) => {
                table.toggleAllRowsSelected(checked)
              }}
              circular={circularCheckboxes}
              mode="checkbox"
            />
          ) : (
            <div className="w-5 h-5" /> /* Empty space in single mode */
          )}
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="w-full h-full flex items-center justify-center">
          <SelectionCheckbox
            checked={row.getIsSelected()}
            onChange={(checked) => {
              row.toggleSelected(checked)
            }}
            circular={circularCheckboxes}
            mode={rowSelectionMode === 'single' ? 'radio' : 'checkbox'}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30, // 1.875rem (30px ÷ 16)
      minSize: 30,
      maxSize: 30,
    }

    return [selectionColumn, ...baseColumns]
  }, [intelligentColumns, normalizedColumns, enableRowSelection, hideSelectionInSelectedView, viewMode, rowSelectionMode, circularCheckboxes])

  // For column reordering, we need mutable state - but keep it simple
  const [reorderedColumns, setReorderedColumns] = useState<typeof enhancedColumns | null>(null)

  // Use reordered columns if available, otherwise use enhanced columns
  const columns = reorderedColumns || enhancedColumns

  // Search hook - handles all search state and logic (must be after columns definition)
  const {
    searchValue,
    setSearchValue,
    currentSearchTerm,
    selectedDuringSearch,
    debouncedSearchValue,
    handleGlobalSearchChange,
    handleRowSelectionChange
  } = advancedSearch({
    data,
    columns,
    mainColumnsArray,
    enableSearch,
    totalSearchResults: navigationState.totalResults,
    updateSearchResults,
    clearNavigation,
    setGlobalFilter
  })

  // Reset reordered columns when data changes (simple trigger)
  const columnsLength = enhancedColumns.length
  useEffect(() => {
    if (reorderedColumns && reorderedColumns.length !== columnsLength) {
      setReorderedColumns(null)
    }
  }, [columnsLength, reorderedColumns])
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [showColumnChooser, setShowColumnChooser] = useState(false)
  const [currentView, setCurrentView] = useState<'grid' | 'chart' | 'cards' | 'lists'>('grid')

  // Column sizing state - initialize with explicit sizes from column definitions for SSR consistency
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    const initialSizing: ColumnSizingState = {}
    columns.forEach((col: any) => {
      // Only set size if explicitly defined in column
      if (col.id && col.size !== undefined) {
        initialSizing[col.id] = col.size
      }
    })
    return initialSizing
  })

  // Track selected rows during search - now handled by useDataGridSearch hook

  // Track last clicked row for Shift+Click range selection
  const [lastClickedRowIndex, setLastClickedRowIndex] = React.useState<number | null>(null)

  // Auto-sizing calculation (FIXED: Now includes summary row, borders, and proper height calculations)
  const calculateOptimalHeight = useMemo(() => {
    // Only enable auto-sizing in compactMode (for modals/dialogs)
    // Default mode uses flex with minHeight/maxHeight
    if (!compactMode) return null

    // When search/filter is active, maintain minimum height to prevent grid collapse
    const hasActiveSearch = globalFilter && globalFilter.trim().length > 0
    const minRowsForSearch = 8 // Minimum rows to show when searching to prevent collapse
    const actualDataLength = filteredData.length
    const dataLength = hasActiveSearch
      ? Math.max(Math.min(actualDataLength, pageSize), minRowsForSearch)
      : Math.min(actualDataLength, pageSize)

    // ========================================
    // HEIGHT COMPONENTS (All in pixels)
    // ========================================

    // 1. Toolbar/Header height
    const toolbarHeight = hideHeader ? 0 : (compactHeader ? 48 : 60)

    // 2. Table header row height
    const headerRowHeight = 44 // From DraggableColumnHeader (h-11 = 2.75rem = 44px)

    // 3. Filter row height (if enabled): h-8 = 32px
    const filterRowHeight = enableFilterRow ? 32 : 0

    // 4. Data rows height
    const dataRowsHeight = dataLength * rowHeight

    // 5. Summary row height (if enabled)
    const summaryRowCount = (enableSummary && summaryConfig)
      ? (Array.isArray(summaryConfig) ? summaryConfig.length : 1)
      : 0
    const summaryRowHeight = summaryRowCount * 24.75 // Summary rows use py-1 same as data rows (~24.75px)

    // 6. Pagination height (if enabled)
    const paginationHeight = enablePagination ? 56 : 0

    // 7. Borders and spacing
    const borderAndSpacing = 4 // Top and bottom borders (2px each)

    // Total content height
    const contentHeight =
      toolbarHeight +
      headerRowHeight +
      filterRowHeight +
      dataRowsHeight +
      summaryRowHeight +
      paginationHeight +
      borderAndSpacing

    // ========================================
    // HEIGHT LOGIC
    // ========================================

    // Minimum height for empty/1 row grids: 150px
    const minCompactHeight = 150

    // Special handling for no data
    if (dataLength === 0) {
      return Math.max(minCompactHeight, contentHeight)
    }

    // Special handling for 1 row
    if (dataLength === 1) {
      return Math.max(minCompactHeight, contentHeight)
    }

    // Threshold: ~10 rows before scrolling kicks in
    const compactThreshold = 10
    if (dataLength <= compactThreshold) {
      // Show exactly what's needed (no scrolling)
      return contentHeight
    } else {
      // Use configured max height for larger datasets (allow scrolling): 500px default
      const maxHeightValue = typeof maxHeight === 'number' ? maxHeight : 500
      return Math.min(contentHeight, maxHeightValue)
    }
  }, [compactMode, filteredData.length, pageSize, hideHeader, compactHeader, maxHeight, rowHeight, enablePagination, enableSummary, summaryConfig, globalFilter, enableFilterRow])

  // Column context menu state
  const [contextMenu, setContextMenu] = useState<{
    column: any
    isVisible: boolean
    position: { x: number; y: number }
  }>({
    column: null,
    isVisible: false,
    position: { x: 0, y: 0 }
  })

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Custom filter function for advanced filters
  const advancedFilterFn = React.useCallback((row: any, columnId: string, filterValue: any) => {
    if (!filterValue) return true
    // Plain string from inline FilterRow — treat as case-insensitive contains
    if (typeof filterValue === 'string') {
      const cellString = String(row.getValue(columnId) ?? '')
      return cellString.toLowerCase().includes(filterValue.toLowerCase())
    }
    if (typeof filterValue !== 'object') return true

    const { operator, value, type } = filterValue
    const cellValue = row.getValue(columnId)
    const cellString = String(cellValue || '')

    // Handle 'type' field (from Quick Filter)
    if (type && !operator) {
      switch (type) {
        case 'contains':
          return cellString.toLowerCase().includes(String(value).toLowerCase())
        case 'equals':
          return cellString.toLowerCase() === String(value).toLowerCase()
        case 'starts_with':
          return cellString.toLowerCase().startsWith(String(value).toLowerCase())
        case 'greater_than':
          return Number(cellValue) > Number(value)
        case 'less_than':
          return Number(cellValue) < Number(value)
        case 'in':
          // Check if cellValue is in the array of values
          return Array.isArray(value) && value.map(v => String(v)).includes(cellString)
        default:
          return true
      }
    }

    // Handle different operators (from Advanced Filter)
    switch (operator) {
      case 'contains':
        return cellString.toLowerCase().includes(String(value).toLowerCase())
      case 'not_contains':
        return !cellString.toLowerCase().includes(String(value).toLowerCase())
      case 'equals':
        return cellValue == value
      case 'not_equals':
        return cellValue != value
      case 'starts_with':
        return cellString.toLowerCase().startsWith(String(value).toLowerCase())
      case 'ends_with':
        return cellString.toLowerCase().endsWith(String(value).toLowerCase())
      case 'is_empty':
        return !cellValue || cellString.trim() === ''
      case 'is_not_empty':
        return cellValue && cellString.trim() !== ''
      case 'greater_than':
        return Number(cellValue) > Number(value)
      case 'greater_than_equal':
        return Number(cellValue) >= Number(value)
      case 'less_than':
        return Number(cellValue) < Number(value)
      case 'less_than_equal':
        return Number(cellValue) <= Number(value)
      case 'between':
        return Number(cellValue) >= Number(value[0]) && Number(cellValue) <= Number(value[1])
      case 'not_between':
        return Number(cellValue) < Number(value[0]) || Number(cellValue) > Number(value[1])
      case 'is_true':
        return cellValue === true || cellValue === 'true' || cellValue === 1
      case 'is_false':
        return cellValue === false || cellValue === 'false' || cellValue === 0
      default:
        return true
    }
  }, [])

  // Table instance with intelligent selection handler
  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: getRowId || ((row) => (row as any).id || data.indexOf(row).toString()),
    defaultColumn: {
      size: 150, // Ensure consistent default size for SSR/CSR
      minSize: 30,
      maxSize: 2000, // High limit allows users to drag columns wider than auto-calculated width
      filterFn: 'advancedFilter' as any, // Use custom filter function for all columns
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      advancedFilter: advancedFilterFn,
    },
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    getRowCanExpand: getRowCanExpand || (() => !!renderSubComponent),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater)

      // Track selections and deselections for intelligent search clearing
      if (typeof updater === 'function') {
        const newSelection = updater(rowSelection)
        const oldKeys = Object.keys(rowSelection).filter(key => rowSelection[key])
        const newKeys = Object.keys(newSelection).filter(key => newSelection[key])

        // Find newly selected and deselected rows
        const newlySelected = newKeys.filter(key => !oldKeys.includes(key))
        const newlyDeselected = oldKeys.filter(key => !newKeys.includes(key))

        if (currentSearchTerm.trim()) {
          // Handle newly selected rows
          newlySelected.forEach(rowIndexStr => {
            const rowIndex = parseInt(rowIndexStr, 10)
            const rowData = filteredData[rowIndex]
            const rowId = (rowData as any)?.id || rowIndexStr
            handleRowSelectionChange(rowId, true)
          })

          // Handle newly deselected rows
          newlyDeselected.forEach(rowIndexStr => {
            const rowIndex = parseInt(rowIndexStr, 10)
            const rowData = filteredData[rowIndex]
            const rowId = (rowData as any)?.id || rowIndexStr
            handleRowSelectionChange(rowId, false)
          })
        }
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: stableRowSelection,
      globalFilter,
      columnSizing,
      expanded,
      columnPinning,
      ...(enablePagination && { pagination }),
    },
    onColumnPinningChange: setColumnPinning,
    enableRowSelection: true,
    enableMultiRowSelection: rowSelectionMode === 'multi',
    enableColumnResizing: enableColumnResizing,
    columnResizeMode: columnResizeMode,
  })

  // Table rows
  const { rows } = table.getRowModel()

  // Virtual scrolling setup
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 20, // Balanced overscan - not too high to avoid performance hit
    enabled: enableVirtualization && currentView === 'grid',
    // Remove measureElement for better performance - we already know the rowHeight
  })

  // Column reordering handler
  const handleColumnReorder = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    // Use accessor keys for matching since that's what we're using as IDs
    const activeIndex = columns.findIndex((col) =>
      (col as any).accessorKey === active.id || col.id === active.id
    )
    const overIndex = columns.findIndex((col) =>
      (col as any).accessorKey === over.id || col.id === over.id
    )

    if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
      setReorderedColumns((prevColumns) => {
        const currentColumns = prevColumns || enhancedColumns
        return arrayMove(currentColumns, activeIndex, overIndex)
      })
    }
  }, [columns, enhancedColumns])

  // Row reordering handler
  const handleRowReorder = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const currentData = reorderedData || filteredData
    const activeIndex = currentData.findIndex(item => {
      const itemId = getRowId ? getRowId(item) : (item as any).id
      return itemId === active.id
    })
    const overIndex = currentData.findIndex(item => {
      const itemId = getRowId ? getRowId(item) : (item as any).id
      return itemId === over.id
    })

    if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
      const newData = arrayMove(currentData, activeIndex, overIndex)
      setReorderedData(newData)
      onRowOrderChange?.(newData)
    }
  }, [filteredData, reorderedData, getRowId, onRowOrderChange])

  // Selected rows data - use getSelectedRowModel() to get ALL selected rows, not just filtered ones
  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map(row => row.original)
  }, [table, rowSelection])

  // Notify parent of selected rows
  React.useEffect(() => {
    onRowSelect?.(selectedRows)
  }, [selectedRows, onRowSelect])

  // Filtered and sorted data for visualization
  const processedData = useMemo(() => {
    return table.getFilteredRowModel().rows.map(row => row.original)
  }, [table])

  const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'json') => {
    // Export functionality will be implemented in ExportImportButtons
  }

  const handleImport = (importedData: TData[]) => {
    // Pass imported data to parent component
    onImport?.(importedData)
  }

  // Row click handler for selection
  const handleRowClick = useCallback((row: Row<TData>, rowIndex: number, event: React.MouseEvent) => {
    if (!enableRowClickSelection) return

    // Prevent selection if clicking on a button or input (but allow checkbox clicks)
    const target = event.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }

    // Prevent selection if clicking on an editable cell (double-click area)
    if (target.closest('[data-editable-cell="true"]')) {
      return
    }

    // ✅ FIX: Don't block row clicks in Selected view - only block if clicking the row itself (not checkbox)
    // The checkbox click should always work, even in Selected view
    if (viewMode === 'selected' && !target.closest('input[type="checkbox"]')) {
      return
    }

    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey

    if (rowSelectionMode === 'single') {
      // Single mode: just toggle this row
      row.toggleSelected()
      setLastClickedRowIndex(rowIndex)
    } else {
      // Multi mode
      if (isShift && enableShiftClickRange && lastClickedRowIndex !== null) {
        // Shift+Click: select range
        const start = Math.min(lastClickedRowIndex, rowIndex)
        const end = Math.max(lastClickedRowIndex, rowIndex)
        const allRows = table.getRowModel().rows

        for (let i = start; i <= end; i++) {
          if (allRows[i]) {
            allRows[i].toggleSelected(true)
          }
        }
      } else if (isCtrlOrCmd && enableCtrlClickMultiSelect) {
        // Ctrl+Click: toggle individual row
        row.toggleSelected()
        setLastClickedRowIndex(rowIndex)
      } else {
        // Regular click: toggle this row only
        row.toggleSelected()
        setLastClickedRowIndex(rowIndex)
      }
    }
  }, [enableRowClickSelection, viewMode, rowSelectionMode, enableShiftClickRange, enableCtrlClickMultiSelect, lastClickedRowIndex, table])

  // Keyboard handler for Space key selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Removed spacebar row selection - was causing performance issues and unwanted behavior

      // Ctrl+A to select all rows - but ONLY if not in an input/textarea/contenteditable
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && rowSelectionMode === 'multi') {
        const target = event.target as HTMLElement
        const isInputField = target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable

        // Only handle Ctrl+A for grid if user is NOT in an input field
        // This allows standard browser Ctrl+A to work in input fields
        if (!isInputField) {
          event.preventDefault()
          table.toggleAllRowsSelected(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [table, rowSelectionMode])

  // Context menu handlers
  const handleColumnRightClick = useCallback((header: any, event: React.MouseEvent) => {
    setContextMenu({
      column: header.column,
      isVisible: true,
      position: { x: event.clientX, y: event.clientY }
    })
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isVisible: false }))
  }, [])

  const handleApplyColumnFilter = useCallback((columnId: string, filterType: string, value: any) => {
    const column = table.getColumn(columnId)
    if (!column) return

    switch (filterType) {
      case 'contains':
        column.setFilterValue(value)
        break
      case 'equals':
        column.setFilterValue((old: any) => ({ type: 'equals', value }))
        break
      case 'starts_with':
        column.setFilterValue((old: any) => ({ type: 'starts_with', value }))
        break
      case 'greater_than':
        column.setFilterValue((old: any) => ({ type: 'greater_than', value: Number(value) }))
        break
      case 'less_than':
        column.setFilterValue((old: any) => ({ type: 'less_than', value: Number(value) }))
        break
      case 'in':
        column.setFilterValue((old: any) => ({ type: 'in', value }))
        break
      default:
        column.setFilterValue(value)
    }
  }, [table])

  const handleAdvancedFilter = (filters: any) => {
    // Apply advanced filters by converting to column filters
    const newColumnFilters: ColumnFiltersState = filters.map((filter: any) => ({
      id: filter.column,
      value: {
        operator: filter.operator,
        value: filter.value,
        type: filter.type
      }
    }))

    setColumnFilters(newColumnFilters)
    setShowAdvancedFilter(false)
  }

  // Baccha Search handlers
  const handleColumnSearch = useCallback((columnId: string, searchTerm: string) => {
    setColumnSearches(prev => ({
      ...prev,
      [columnId]: searchTerm
    }))

    setIsColumnSearchActive(prev => ({
      ...prev,
      [columnId]: searchTerm.length > 0
    }))

    // Apply column-specific filter
    const column = table.getColumn(columnId)
    if (column) {
      column.setFilterValue(searchTerm || undefined)
    }
  }, [table])

  const handleClearColumnSearch = useCallback((columnId: string) => {
    setColumnSearches(prev => {
      const newSearches = { ...prev }
      delete newSearches[columnId]
      return newSearches
    })

    setIsColumnSearchActive(prev => ({
      ...prev,
      [columnId]: false
    }))

    // Clear column filter
    const column = table.getColumn(columnId)
    if (column) {
      column.setFilterValue(undefined)
    }
  }, [table])

  // Clear ALL filters (global search + column filters)
  const handleClearAllFilters = useCallback(() => {
    // Clear global filter/search
    setGlobalFilter('')
    setSearchValue('')
    clearNavigation()

    // Clear all column filters
    setColumnFilters([])

    // Clear column search states
    setColumnSearches({})
    setIsColumnSearchActive({})
  }, [setGlobalFilter, clearNavigation])

  // Navigation handlers
  const handleSearchNavigation = useCallback((direction: 'up' | 'down') => {
    navigateSearch(direction)
  }, [navigateSearch])

  const handleSearchSelection = useCallback((rowId: string) => {

    // Find the row in the current filtered view
    const filteredRows = table.getRowModel().rows
    const targetRow = filteredRows.find(row => {
      const currentRowId = (row.original as any).id || row.id
      return currentRowId === rowId
    })

    if (targetRow) {
      const isCurrentlySelected = targetRow.getIsSelected()
      const newSelectionState = !isCurrentlySelected

      // Toggle selection - this will trigger handleRowSelectionChange via table callback
      targetRow.toggleSelected(newSelectionState)

      // Optionally call onRowClick if provided
      if (onRowClick) {
        onRowClick(targetRow.original)
      }
    }
  }, [table, onRowClick])

  // No default height class - rely on maxHeight style for responsiveness
  const hasHeightClass = className && /h-\[|h-\d|h-full|h-screen|h-auto/.test(className)
  const finalClassName = `border border-[rgb(var(--bd-default))] rounded-lg overflow-hidden flex flex-col ${className || ''}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={finalClassName}
      style={{
        ...style
      }}
    >
      {/* Header Row - 20% more height for better balance */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 py-2 sm:py-1.5 px-2 sm:px-3 border-b border-bd-default bg-bg-subtle">
          {/* Left side - Title, and Pre-toggle Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {title && (
              <h3 className="text-sm sm:text-base font-medium text-fg-default truncate">
                {title}
              </h3>
            )}
            {headerActions && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {headerActions}
              </div>
            )}
            {/* Pre-toggle Actions - Moved to left side */}
            {preToggleActions && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {preToggleActions}
              </div>
            )}
          </div>

          {/* Right side - Reordered Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            {/* All/Selected Toggle - Pill-shaped Segmented Control with Enhanced Stability */}
            {toggleShouldBeVisible && (
              <div key="view-toggle" className="inline-flex items-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))] p-0.5">
                <button
                  onClick={() => {
                    try {
                      onViewModeChange?.('all')
                    } catch (error) {
                      console.error('Error switching to All view:', error)
                    }
                  }}
                  className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 whitespace-nowrap ${viewMode === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--fg-default))]'
                    }`}
                  aria-label="View all items"
                >
                  All
                </button>
                <button
                  onClick={() => {
                    try {
                      // Always allow switching to selected mode, even with 0 selections
                      // This prevents the toggle from becoming unresponsive
                      onViewModeChange?.('selected')
                    } catch (error) {
                      console.error('Error switching to Selected view:', error)
                    }
                  }}
                  className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 whitespace-nowrap ${viewMode === 'selected'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--fg-default))]'
                    }`}
                  aria-label={`View selected items (${safeSelectedCount} selected)`}
                >
                  <span className="hidden sm:inline">Selected </span>({safeSelectedCount})
                </button>
              </div>
            )}

            {/* Date Filters - Left of Search */}
            {enableDateFilter && (
              <div>
                <DatePicker
                  mode="range"
                  value={{
                    from: dateFrom || undefined,
                    to: dateTo || undefined
                  }}
                  onChange={(range) => {
                    if (range && typeof range === 'object' && 'from' in range) {
                      onDateFromChange?.(range.from || null)
                      onDateToChange?.(range.to || null)
                    }
                  }}
                  placeholder="Select date range..."
                  showFromTo={true}
                  className="[&_input]:!h-8 [&_input]:text-xs"
                />
              </div>
            )}

            {/* Unified Search + Filters + Actions Pill */}
            {compactHeader ? (
              <>
                {enableSearch ? (
                  <>
                    {/* White pill: Mic input | divider | Filters | divider | More actions */}
                    <div className="flex items-center bg-white border border-[rgb(var(--bd-default))] rounded-full shadow-sm overflow-visible">
                      {/* Mic + Search Input */}
                      <div className="relative min-w-0 w-40 sm:w-52 md:w-64 lg:w-80">
                        <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[rgb(var(--fg-muted))] pointer-events-none z-10" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Type or speak to search..."
                          value={searchValue}
                          onChange={(e) => handleGlobalSearchChange(e.target.value)}
                          className="w-full pl-10 pr-3 h-9 text-sm bg-transparent border-0 outline-none focus:outline-none placeholder:text-[rgb(var(--fg-subtle))] text-[rgb(var(--fg-default))]"
                        />
                      </div>

                      {/* Divider */}
                      <div className="w-px h-5 bg-[rgb(var(--bd-default))] flex-shrink-0" />

                      {/* Filters button */}
                      <button
                        onClick={() => setShowAdvancedFilter(true)}
                        className={`flex items-center gap-1.5 px-3 h-9 text-xs whitespace-nowrap transition-colors hover:bg-[rgb(var(--bg-hover))] flex-shrink-0 ${columnFilters.length > 0 ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--fg-muted))]'}`}
                      >
                        <ListFilter className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Filters</span>
                        {columnFilters.length > 0 && (
                          <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 bg-[rgb(var(--color-primary))] text-white rounded-full text-[10px] font-medium">
                            {columnFilters.length}
                          </span>
                        )}
                      </button>

                      {/* Divider */}
                      <div className="w-px h-5 bg-[rgb(var(--bd-default))] flex-shrink-0" />

                      {/* More Actions */}
                      <ActionsMenu
                  enableVisualization={enableVisualization}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  enableExport={enableExport}
                  enableImport={enableImport}
                  data={filteredData}
                  filename="data-export"
                  onImportComplete={(importedData) => { if (onImport) { onImport(importedData) } }}
                  enableColumnVisibility={enableColumnVisibility}
                  onOpenColumnChooser={() => setShowColumnChooser(true)}
                  enableAutoResize={enableAutoResize}
                  onAutoResize={() => { if (autoResizeAllColumns) { autoResizeAllColumns(table) } }}
                  enableDateFilter={enableDateFilter}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={onDateFromChange}
                  onDateToChange={onDateToChange}
                  enableFiltering={enableFiltering}
                  onOpenAdvancedFilter={() => setShowAdvancedFilter(true)}
                  activeFiltersCount={columnFilters.length}
                        triggerClassName="h-9 w-9 p-0 cursor-pointer border-0 shadow-none bg-transparent hover:bg-[rgb(var(--bg-hover))] rounded-r-full flex-shrink-0"
                      />
                    </div>

                    {/* Clear All - outside pill */}
                    {(globalFilter || columnFilters.length > 0) && (
                      <button
                        onClick={handleClearAllFilters}
                        className="flex items-center gap-1 h-7 px-2 text-xs text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--color-primary))] transition-colors"
                        title="Clear all filters"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Clear
                      </button>
                    )}
                  </>
                ) : (
                  /* No search - standalone actions */
                  <ActionsMenu
                  enableVisualization={enableVisualization}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  enableExport={enableExport}
                  enableImport={enableImport}
                  data={filteredData}
                  filename="data-export"
                  onImportComplete={(importedData) => { if (onImport) { onImport(importedData) } }}
                  enableColumnVisibility={enableColumnVisibility}
                  onOpenColumnChooser={() => setShowColumnChooser(true)}
                  enableAutoResize={enableAutoResize}
                  onAutoResize={() => { if (autoResizeAllColumns) { autoResizeAllColumns(table) } }}
                  enableDateFilter={enableDateFilter}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={onDateFromChange}
                  onDateToChange={onDateToChange}
                  enableFiltering={enableFiltering}
                  onOpenAdvancedFilter={() => setShowAdvancedFilter(true)}
                  activeFiltersCount={columnFilters.length}
                  />
                )}
              </>
            ) : (
              /* LEGACY FULL HEADER: Show all buttons */
              <>
                {/* View Toggle - Second - Compact Dropdown */}
                {enableVisualization && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-9 h-8 p-0">
                        {currentView === 'grid' && <Grid3X3 className="h-4 w-4" />}
                        {currentView === 'cards' && <LayoutGrid className="h-4 w-4" />}
                        {currentView === 'lists' && <List className="h-4 w-4" />}
                        {currentView === 'chart' && <BarChart3 className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setCurrentView('grid')}>
                        <Grid3X3 className="mr-2 h-4 w-4" />
                        <span>Grid</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('cards')}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Cards</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('lists')}>
                        <List className="mr-2 h-4 w-4" />
                        <span>Lists</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('chart')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Charts</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Export/Import removed from legacy header - use compact header with ActionsMenu instead */}

                {/* Enhanced Column Chooser - Fourth */}
                {enableColumnVisibility && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-9 h-8 p-0">
                        <LayoutGrid className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
                      {(() => {
                        const allColumns = table.getAllColumns().filter((column) => column.getCanHide())
                        const frozenColumns = allColumns.filter((column) =>
                          frozenColumnsState.has(column.id) && column.id !== 'select'
                        )
                        const availableColumns = allColumns.filter((column) =>
                          !frozenColumnsState.has(column.id)
                        )

                        return (
                          <div className="space-y-1">
                            {/* Bulk Actions Header */}
                            <div className="px-3 py-2 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[rgb(var(--fg-default))]">Column Management</span>
                                <div className="flex items-center space-x-1">
                                  {frozenColumns.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))] cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setFrozenColumnsState(new Set())
                                      }}
                                      title="Unfreeze all columns"
                                    >
                                      Unfreeze All
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))] cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      autoResizeAllColumns?.(table)
                                    }}
                                    title="Auto-size all columns to fit content"
                                  >
                                    Auto-size
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Frozen Columns Section */}
                            {enableColumnFreezing && frozenColumns.length > 0 && (
                              <div className="px-2 py-1">
                                <div className="bg-[rgb(var(--color-primary-subtle))] rounded-md p-1 space-y-0.5">
                                  {frozenColumns.map((column) => (
                                    <div key={column.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-[rgb(var(--bg-selected))]/50 rounded group cursor-pointer">
                                      <div className="flex items-center space-x-2 flex-1">
                                        <input
                                          type="checkbox"
                                          checked={column.getIsVisible()}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            column.toggleVisibility(e.target.checked)
                                          }}
                                          className="w-3 h-3 rounded border-[rgb(var(--bd-default))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-[rgb(var(--fg-default))] capitalize truncate">
                                          {column.id}
                                        </span>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] hover:bg-[rgb(var(--bg-selected))] opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const newFrozenColumns = new Set(frozenColumnsState)
                                          newFrozenColumns.delete(column.id)
                                          setFrozenColumnsState(newFrozenColumns)
                                        }}
                                        title="Unfreeze this column"
                                      >
                                        <PinOff className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Available Columns Section */}
                            {availableColumns.length > 0 && (
                              <div className="px-2 py-1">
                                <div className="space-y-0.5">
                                  {availableColumns.map((column) => {
                                    const isSelectColumn = column.id === 'select'

                                    return (
                                      <div key={column.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-[rgb(var(--bg-subtle))] rounded group cursor-pointer">
                                        <div className="flex items-center space-x-2 flex-1">
                                          <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={(e) => {
                                              e.stopPropagation()
                                              column.toggleVisibility(e.target.checked)
                                            }}
                                            className="w-3 h-3 rounded border-[rgb(var(--bd-default))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] cursor-pointer"
                                          />
                                          <span className="text-sm text-[rgb(var(--fg-default))] capitalize truncate">
                                            {column.id}
                                          </span>
                                        </div>

                                        {enableColumnFreezing && !isSelectColumn && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-[rgb(var(--color-icon))] hover:text-[rgb(var(--color-icon-hover))] hover:bg-[rgb(var(--bg-hover))] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const newFrozenColumns = new Set(frozenColumnsState)
                                              newFrozenColumns.add(column.id)
                                              setFrozenColumnsState(newFrozenColumns)
                                            }}
                                            title="Freeze this column to the left"
                                          >
                                            <Pin className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        )
                      })()}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}

            {/* Auto-resize button - only show in legacy header or when compact is disabled */}
            {!compactHeader && enableAutoResize && (
              <AutoResizeButton
                onAutoResize={() => {
                  if (autoResizeAllColumns) {
                    autoResizeAllColumns(table)
                  }
                }}
              />
            )}

            {/* Selected Rows Info */}
          </div>
        </div>
      )}

      {/* Main Content - Table directly below header */}
      <div className="overflow-hidden bg-bg-surface flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Data Grid - Header and Body Separated */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {(() => {
                  // Determine if row reordering is active
                  // Allow reordering when: 1) viewMode is 'selected', OR 2) viewToggle is disabled (simple mode)
                  const isRowReorderingActive = enableRowReordering && (viewMode === 'selected' || !enableViewToggle) && !loading && table.getRowModel().rows.length > 0
                  return (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={isRowReorderingActive ? handleRowReorder : handleColumnReorder}
                      modifiers={isRowReorderingActive ? [restrictToVerticalAxis] : [restrictToHorizontalAxis]}
                    >
                      {/* Single table with sticky header - cleaner approach */}
                      <div
                        ref={tableContainerRef}
                        className={`${compactMode ? '' : 'flex-1'} scrollbar-thin relative`}
                        style={{
                          overscrollBehavior: 'contain',
                          WebkitOverflowScrolling: 'touch',
                          overflowX: 'auto',
                          overflowY: compactMode && data.length === 0 ? 'hidden' : 'auto',
                          // Removed scrollBehavior: 'smooth' - can cause lag with virtualization
                          willChange: 'scroll-position',
                          ...(calculateOptimalHeight && { height: `${calculateOptimalHeight}px` }),
                          ...(!compactMode && {
                            // Default mode: use standard minHeight/maxHeight (grid won't collapse due to flex-1)
                            minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
                            maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
                          })
                        }}
                      >
                        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                          <colgroup>
                            {/* Add drag handle column when row reordering is active */}
                            {isRowReorderingActive && (
                              <col style={{ width: '1.875rem', minWidth: '1.875rem', maxWidth: '1.875rem' }} />
                            )}
                            {table.getHeaderGroups()[0]?.headers.map((header) => (
                              <col key={header.id} style={{ width: `${header.getSize()}px` }} suppressHydrationWarning />
                            ))}
                          </colgroup>
                          <thead className="bg-[color-mix(in_srgb,rgb(var(--color-primary))_10%,white)] dark:bg-[color-mix(in_srgb,rgb(var(--color-primary))_10%,rgb(var(--bg-surface)))] sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => {
                              // Only use SortableContext for column reordering when row reordering is NOT active
                              if (isRowReorderingActive) {
                                return (
                                  <tr key={headerGroup.id} className="border-b border-[rgb(var(--bd-default))]">
                                    {/* Drag Handle Header Column */}
                                    <th
                                      className="text-center relative after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-[1px] after:bg-[rgb(var(--bd-medium))]"
                                      style={{
                                        width: '1.875rem',
                                        minWidth: '1.875rem',
                                        maxWidth: '1.875rem',
                                      }}
                                    >
                                    </th>
                                    {headerGroup.headers.map((header, headerIndex) => {
                                      const isFrozen = frozenColumnsState.has(header.id)
                                      const isPinnedRight = header.column.getIsPinned() === 'right'

                                      // Check if this is the last column
                                      const isLastColumn = headerIndex === headerGroup.headers.length - 1

                                      // Check if this is the last frozen column
                                      const isLastFrozenColumn = isFrozen && (
                                        headerIndex === headerGroup.headers.length - 1 ||
                                        !frozenColumnsState.has(headerGroup.headers[headerIndex + 1]?.id)
                                      )

                                      // Check if this is the first right-pinned column
                                      const isFirstPinnedRight = isPinnedRight && (
                                        headerIndex === 0 ||
                                        headerGroup.headers[headerIndex - 1]?.column.getIsPinned() !== 'right'
                                      )

                                      // Calculate left position for frozen columns
                                      let leftPosition = 0
                                      if (isFrozen) {
                                        // Sum up widths of all previous frozen columns
                                        for (let i = 0; i < headerIndex; i++) {
                                          const prevHeader = headerGroup.headers[i]
                                          if (frozenColumnsState.has(prevHeader.id)) {
                                            leftPosition += prevHeader.getSize()
                                          }
                                        }
                                      }

                                      // Calculate right position for right-pinned columns
                                      let rightPosition = 0
                                      if (isPinnedRight) {
                                        for (let i = headerIndex + 1; i < headerGroup.headers.length; i++) {
                                          const nextHeader = headerGroup.headers[i]
                                          if (nextHeader.column.getIsPinned() === 'right') {
                                            rightPosition += nextHeader.getSize()
                                          }
                                        }
                                      }

                                      return (
                                        <DraggableColumnHeader
                                          key={header.id}
                                          header={header}
                                          enableReordering={enableColumnReordering}
                                          enableResizing={enableColumnResizing}
                                          enableFreezing={enableColumnFreezing}
                                          isFrozen={isFrozen}
                                          isLastFrozen={isLastFrozenColumn}
                                          isFirstPinnedRight={isFirstPinnedRight}
                                          isLastColumn={isLastColumn}
                                          onRightClick={handleColumnRightClick}
                                          onFilterClick={handleColumnRightClick}
                                          style={{
                                            ...(isFrozen && {
                                              position: 'sticky',
                                              left: `${leftPosition}px`,
                                              zIndex: 11,
                                              transform: 'translateZ(0)',
                                              willChange: 'transform'
                                            }),
                                            ...(isPinnedRight && {
                                              position: 'sticky',
                                              right: `${rightPosition}px`,
                                              zIndex: 12,
                                              backgroundColor: 'color-mix(in srgb, rgb(var(--color-primary)) 10%, white)',
                                              transform: 'translateZ(0)',
                                              willChange: 'transform'
                                            })
                                          }}
                                        />
                                      )
                                    })}
                                  </tr>
                                )
                              } else {
                                // Column reordering mode - use SortableContext
                                return (
                                  <SortableContext
                                    key={headerGroup.id}
                                    items={headerGroup.headers.map(header => header.column.id)}
                                    strategy={horizontalListSortingStrategy}
                                  >
                                    <tr className="border-b border-[rgb(var(--bd-default))]">
                                      {headerGroup.headers.map((header, headerIndex) => {
                                        const isFrozen = frozenColumnsState.has(header.id)
                                        const isPinnedRight = header.column.getIsPinned() === 'right'

                                        // Check if this is the last column
                                        const isLastColumn = headerIndex === headerGroup.headers.length - 1

                                        // Check if this is the last frozen column
                                        const isLastFrozenColumn = isFrozen && (
                                          headerIndex === headerGroup.headers.length - 1 ||
                                          !frozenColumnsState.has(headerGroup.headers[headerIndex + 1]?.id)
                                        )

                                        // Check if this is the first right-pinned column
                                        const isFirstPinnedRight = isPinnedRight && (
                                          headerIndex === 0 ||
                                          headerGroup.headers[headerIndex - 1]?.column.getIsPinned() !== 'right'
                                        )

                                        // Calculate left position for frozen columns
                                        let leftPosition = 0
                                        if (isFrozen) {
                                          // Sum up widths of all previous frozen columns
                                          for (let i = 0; i < headerIndex; i++) {
                                            const prevHeader = headerGroup.headers[i]
                                            if (frozenColumnsState.has(prevHeader.id)) {
                                              leftPosition += prevHeader.getSize()
                                            }
                                          }
                                        }

                                        // Calculate right position for right-pinned columns
                                        let rightPosition = 0
                                        if (isPinnedRight) {
                                          for (let i = headerIndex + 1; i < headerGroup.headers.length; i++) {
                                            const nextHeader = headerGroup.headers[i]
                                            if (nextHeader.column.getIsPinned() === 'right') {
                                              rightPosition += nextHeader.getSize()
                                            }
                                          }
                                        }

                                        return (
                                          <DraggableColumnHeader
                                            key={header.id}
                                            header={header}
                                            enableReordering={enableColumnReordering}
                                            enableResizing={enableColumnResizing}
                                            enableFreezing={enableColumnFreezing}
                                            isFrozen={isFrozen}
                                            isLastFrozen={isLastFrozenColumn}
                                            isFirstPinnedRight={isFirstPinnedRight}
                                            isLastColumn={isLastColumn}
                                            onRightClick={handleColumnRightClick}
                                            onFilterClick={handleColumnRightClick}
                                            style={{
                                              ...(isFrozen && {
                                                position: 'sticky',
                                                left: `${leftPosition}px`,
                                                zIndex: 11,
                                                transform: 'translateZ(0)',
                                                willChange: 'transform'
                                              }),
                                              ...(isPinnedRight && {
                                                position: 'sticky',
                                                right: `${rightPosition}px`,
                                                zIndex: 12,
                                                backgroundColor: 'color-mix(in srgb, rgb(var(--color-primary)) 10%, white)',
                                                transform: 'translateZ(0)',
                                                willChange: 'transform'
                                              })
                                            }}
                                          />
                                        )
                                      })}
                                    </tr>
                                  </SortableContext>
                                )
                              }
                            })}

                            {/* Filter Row - DevExtreme-style per-column filtering */}
                            {enableFilterRow && (
                              <FilterRow
                                table={table}
                                frozenColumnsState={frozenColumnsState}
                                isRowReorderingActive={isRowReorderingActive}
                              />
                            )}
                          </thead>
                          <tbody>
                            {/* Determine if row reordering is active */}
                            {(() => {
                              // Allow reordering when: 1) viewMode is 'selected', OR 2) viewToggle is disabled (simple mode)
                              const isRowReorderingActive = enableRowReordering && (viewMode === 'selected' || !enableViewToggle) && !loading && table.getRowModel().rows.length > 0
                              const showDragHandle = isRowReorderingActive

                              return (
                                <>
                                  {/* Loading state - Skeleton rows */}
                                  {loading ? (
                                    <>
                                      {Array.from({ length: Math.min(pageSize || 10, 10) }).map((_, skeletonIndex) => (
                                        <tr key={`skeleton-${skeletonIndex}`} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                                          {showDragHandle && (
                                            <td className="p-2 border-b border-[rgb(var(--bd-subtle))]" style={{ width: '2.5rem' }}>
                                              <Skeleton width="20px" height="14px" />
                                            </td>
                                          )}
                                          {table.getVisibleFlatColumns().map((column, colIndex) => (
                                            <td key={column.id} className="p-2 border-b border-[rgb(var(--bd-subtle))]">
                                              <Skeleton
                                                width={colIndex === 0 ? '60%' : '85%'}
                                                height="14px"
                                              />
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </>
                                  ) : table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                      <td colSpan={table.getVisibleFlatColumns().length + (showDragHandle ? 1 : 0)} className={compactMode ? 'py-6' : 'py-48'}>
                                        {/* Empty cell - actual "No data" message is positioned absolutely below */}
                                      </td>
                                    </tr>
                                  ) : isRowReorderingActive ? (
                                    /* Row reordering mode - DndContext is at table level */
                                    <SortableContext
                                      items={rows.map(row => (row.original as any).id || row.id)}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      {rows.map((row, rowIndex) => {
                                        const rowId = (row.original as any).id || row.id
                                        const isHighlighted = navigationState.highlightedRowId === rowId
                                        const isSelected = row.getIsSelected()

                                        return (
                                          <DraggableRow
                                            key={row.id}
                                            row={row}
                                            rowIndex={rowIndex}
                                            enableBacchaSearch={enableBacchaSearch}
                                            mainColumnsArray={mainColumnsArray}
                                            frozenColumnsState={frozenColumnsState}
                                            isHighlighted={isHighlighted}
                                            isSelected={isSelected}
                                            onRowClick={(e) => handleRowClick(row, rowIndex, e)}
                                            onRowDoubleClick={() => onRowClick?.(row.original)}
                                            showDragHandle={showDragHandle}
                                            navigationState={navigationState}
                                            columnSearches={columnSearches}
                                            isColumnSearchActive={isColumnSearchActive}
                                            onColumnSearch={handleColumnSearch}
                                            onClearColumnSearch={handleClearColumnSearch}
                                            SearchHighlighter={SearchHighlighter}
                                            InlineSearchCell={InlineSearchCell}
                                          />
                                        )
                                      })}
                                    </SortableContext>
                                  ) : (
                                    /* Virtualized row rendering */
                                    <>
                                      {enableVirtualization && currentView === 'grid' ? (
                                        <>
                                          {/* Padding for virtual scroll offset */}
                                          {rowVirtualizer.getVirtualItems().length > 0 && (
                                            <tr>
                                              <td
                                                colSpan={table.getVisibleFlatColumns().length}
                                                style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }}
                                              />
                                            </tr>
                                          )}

                                          {/* Render only visible rows */}
                                          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                            const row = rows[virtualRow.index]
                                            const rowIndex = virtualRow.index
                                            const rowId = (row.original as any).id || row.id
                                            const isHighlighted = navigationState.highlightedRowId === rowId
                                            const isSelected = row.getIsSelected()

                                            return (
                                              <ExpandableRow
                                                key={row.id}
                                                row={row}
                                                renderSubComponent={renderSubComponent}
                                                onRowClick={(e) => handleRowClick(row, rowIndex, e)}
                                                onRowDoubleClick={() => onRowClick?.(row.original)}
                                                className={`
                                  cursor-pointer group
                                  transition-colors duration-150 ease-out
                                  ${isHighlighted
                                                    ? 'border-2 border-[rgb(var(--color-primary))] bg-gradient-to-r from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 shadow-lg relative'
                                                    : isSelected
                                                      ? 'bg-[color-mix(in_srgb,rgb(var(--color-primary))_8%,rgb(var(--bg-surface)))] shadow-sm hover:bg-[color-mix(in_srgb,rgb(var(--color-primary))_15%,rgb(var(--bg-surface)))]'
                                                      : 'hover:bg-[color-mix(in_srgb,rgb(var(--color-primary))_5%,rgb(var(--bg-surface)))]'
                                                  }
                                `}
                                              >
                                                {row.getVisibleCells().map((cell, cellIndex) => (
                                                  <CellRenderer
                                                    key={cell.id}
                                                    cell={cell}
                                                    cellIndex={cellIndex}
                                                    row={row}
                                                    enableBacchaSearch={enableBacchaSearch}
                                                    mainColumnsArray={mainColumnsArray}
                                                    frozenColumnsState={frozenColumnsState}
                                                    navigationState={navigationState}
                                                    columnSearches={columnSearches}
                                                    isColumnSearchActive={isColumnSearchActive}
                                                    onColumnSearch={handleColumnSearch}
                                                    onClearColumnSearch={handleClearColumnSearch}
                                                    SearchHighlighter={SearchHighlighter}
                                                    InlineSearchCell={InlineSearchCell}
                                                    isSelected={isSelected}
                                                  />
                                                ))}
                                              </ExpandableRow>
                                            )
                                          })}

                                          {/* Bottom padding for virtual scroll */}
                                          {rowVirtualizer.getVirtualItems().length > 0 && (
                                            <tr>
                                              <td
                                                colSpan={table.getVisibleFlatColumns().length}
                                                style={{
                                                  height: `${rowVirtualizer.getTotalSize() -
                                                    (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0)
                                                    }px`,
                                                }}
                                              />
                                            </tr>
                                          )}
                                        </>
                                      ) : (
                                        /* Non-virtualized rendering (fallback) */
                                        rows.map((row, rowIndex) => {
                                          const rowId = (row.original as any).id || row.id
                                          const isHighlighted = navigationState.highlightedRowId === rowId
                                          const isSelected = row.getIsSelected()

                                          return (
                                            <ExpandableRow
                                              key={row.id}
                                              row={row}
                                              renderSubComponent={renderSubComponent}
                                              onRowClick={(e) => handleRowClick(row, rowIndex, e)}
                                              onRowDoubleClick={() => onRowClick?.(row.original)}
                                              rowHeight={rowHeight}
                                              className={`
                                      cursor-pointer group
                                      transition-colors duration-150 ease-out
                                      ${isHighlighted
                                                  ? 'border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/20 shadow-lg relative z-10'
                                                  : isSelected
                                                    ? 'bg-[rgb(var(--bg-selected))] shadow-sm hover:bg-[rgb(var(--bg-hover))]'
                                                    : 'hover:bg-[rgb(var(--bg-hover))]'
                                                }
                                    `}
                                            >
                                              {row.getVisibleCells().map((cell, cellIndex) => (
                                                <CellRenderer
                                                  key={cell.id}
                                                  cell={cell}
                                                  cellIndex={cellIndex}
                                                  row={row}
                                                  enableBacchaSearch={enableBacchaSearch}
                                                  mainColumnsArray={mainColumnsArray}
                                                  frozenColumnsState={frozenColumnsState}
                                                  navigationState={navigationState}
                                                  columnSearches={columnSearches}
                                                  isColumnSearchActive={isColumnSearchActive}
                                                  onColumnSearch={handleColumnSearch}
                                                  onClearColumnSearch={handleClearColumnSearch}
                                                  SearchHighlighter={SearchHighlighter}
                                                  InlineSearchCell={InlineSearchCell}
                                                  isSelected={isSelected}
                                                />
                                              ))}
                                            </ExpandableRow>
                                          )
                                        })
                                      )}
                                    </>
                                  )}
                                </>
                              )
                            })()}
                          </tbody>

                          {/* Summary/Footer Row */}
                          {enableSummary && summaryConfig && (
                            <SummaryRow
                              table={table}
                              data={processedData}
                              config={summaryConfig}
                              enableRowSelection={enableRowSelection}
                              showDragHandle={isRowReorderingActive}
                            />
                          )}
                        </table>

                        {/* Absolutely positioned "No data" message - always centered in viewport */}
                        {table.getRowModel().rows.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[rgb(var(--fg-muted))] text-sm sm:text-base">
                              No data available
                            </span>
                          </div>
                        )}
                      </div>
                    </DndContext>
                  )
                })()}
              </div>

            </motion.div>
          ) : currentView === 'cards' ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Card View */}
              <CardView
                data={table.getFilteredRowModel().rows.map(row => row.original)}
                columns={columns}
                onRowClick={onRowClick}
                selectedRows={selectedRows}
                onRowSelect={(item, selected) => {
                  const rowIndex = table.getFilteredRowModel().rows.findIndex(row => row.original === item)
                  if (rowIndex !== -1) {
                    table.getFilteredRowModel().rows[rowIndex].toggleSelected(selected)
                  }
                }}
              />
            </motion.div>
          ) : currentView === 'lists' ? (
            <motion.div
              key="lists"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Lists View */}
              <div className="space-y-1">
                {table.getFilteredRowModel().rows.map((row, index) => (
                  <div
                    key={row.id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border
                      ${row.getIsSelected()
                        ? 'bg-accent-subtle border-accent'
                        : 'bg-bg-surface border-bd-default hover:bg-accent-subtle/50'
                      }
                      transition-all duration-200 cursor-pointer
                    `}
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row.original)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {enableRowSelection && (
                        <Checkbox
                          checked={row.getIsSelected()}
                          onChange={(e) => row.toggleSelected(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          {row.getVisibleCells().slice(0, 3).map((cell) => (
                            <div key={cell.id} className="min-w-0">
                              <div className="text-sm font-medium text-fg-default truncate">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                              <div className="text-xs text-fg-muted truncate">
                                {cell.column.columnDef.header?.toString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {row.getVisibleCells().slice(3).map((cell) => (
                        <div key={cell.id} className="text-xs text-fg-muted">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Data Visualization */}
              <DataVisualization
                data={processedData}
                columns={columns}
                title="Data Insights"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilterModal
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApply={handleAdvancedFilter}
        columns={columns}
        data={data}
      />

      {/* Column Chooser Modal */}
      <ColumnChooserModal
        isOpen={showColumnChooser}
        onClose={() => setShowColumnChooser(false)}
        table={table}
        frozenColumnsState={frozenColumnsState}
        setFrozenColumnsState={setFrozenColumnsState}
        enableColumnFreezing={enableColumnFreezing}
        autoResizeAllColumns={autoResizeAllColumns}
      />

      {/* Column Context Menu */}
      {contextMenu.column && (
        <ColumnContextMenu
          column={contextMenu.column}
          data={data}
          isVisible={contextMenu.isVisible}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          onApplyFilter={handleApplyColumnFilter}
        />
      )}

      {/* Pagination Controls */}
      {enablePagination && currentView === 'grid' && (
        <PaginationControls
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          totalRows={filteredData.length}
          pageSizeOptions={paginationPageSizeOptions}
          onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
          onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
        />
      )}
    </motion.div>
  )
}
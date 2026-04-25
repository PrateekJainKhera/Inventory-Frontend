'use client'

import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui'
import { Button } from '@/components/ui'
import { MoreVertical } from 'lucide-react'
import { ViewSection } from './view/ViewSection'
import { ExportSection } from './export/ExportSection'
import { ImportSection } from './import/ImportSection'
import { ColumnSection } from './column/ColumnSection'
import { FilterSection } from './filter/FilterSection'

interface ActionsMenuProps<TData> {
  // View options
  enableVisualization?: boolean
  currentView: 'grid' | 'chart' | 'cards' | 'lists'
  onViewChange: (view: 'grid' | 'chart' | 'cards' | 'lists') => void

  // Export/Import
  enableExport?: boolean
  enableImport?: boolean
  data: TData[]
  filename?: string
  onImportComplete: (data: TData[]) => void

  // Column management
  enableColumnVisibility?: boolean
  onOpenColumnChooser: () => void

  // Auto-resize
  enableAutoResize?: boolean
  onAutoResize?: () => void

  // Date filter
  enableDateFilter?: boolean
  dateFrom?: Date | null
  dateTo?: Date | null
  onDateFromChange?: (date: Date | null) => void
  onDateToChange?: (date: Date | null) => void

  // Advanced filter
  enableFiltering?: boolean
  onOpenAdvancedFilter: () => void
  activeFiltersCount?: number

  // Custom trigger styling (for unified pill layout)
  triggerClassName?: string
}

export function ActionsMenu<TData>({
  enableVisualization = true,
  currentView,
  onViewChange,
  enableExport = true,
  enableImport = true,
  data,
  filename,
  onImportComplete,
  enableColumnVisibility = true,
  onOpenColumnChooser,
  enableAutoResize = true,
  onAutoResize,
  enableDateFilter = false,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  enableFiltering = true,
  onOpenAdvancedFilter,
  activeFiltersCount = 0,
  triggerClassName
}: ActionsMenuProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={triggerClassName ?? "h-8 w-8 p-0 cursor-pointer"}
          title="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 [&_[role=menuitem]]:cursor-pointer">
        {/* View Options */}
        {enableVisualization && (
          <ViewSection currentView={currentView} onViewChange={onViewChange} />
        )}

        {/* Export */}
        {enableExport && <ExportSection data={data} filename={filename} />}

        {/* Import */}
        {enableImport && <ImportSection onImport={onImportComplete} />}

        {/* Column Management & Auto-resize */}
        <ColumnSection
          enableColumnVisibility={enableColumnVisibility}
          onOpenColumnChooser={onOpenColumnChooser}
          enableAutoResize={enableAutoResize}
          onAutoResize={onAutoResize}
        />

        {/* Date Filter & Advanced Filters */}
        <FilterSection
          enableDateFilter={enableDateFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          enableFiltering={enableFiltering}
          onOpenAdvancedFilter={onOpenAdvancedFilter}
          activeFiltersCount={activeFiltersCount}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Copy,
  Settings,
  MoreHorizontal,
  ChevronRight,
  X,
  Check,
  Search,
  Calculator,
  BarChart3,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  ArrowUpDown,
  Move,
} from 'lucide-react'
import { Column } from '@tanstack/react-table'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { Dropdown } from '@/components'
import { Separator } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface ColumnContextMenuProps<TData> {
  column: Column<TData, unknown>
  data: TData[]
  isVisible: boolean
  position: { x: number; y: number }
  onClose: () => void
  onApplyFilter: (columnId: string, filterType: string, value: any) => void
}

interface ColumnStats {
  totalCount: number
  uniqueCount: number
  nullCount: number
  dataType: 'string' | 'number' | 'date' | 'boolean'
  min?: any
  max?: any
  avg?: number
  sum?: number
  uniqueValues: any[]
}

export function ColumnContextMenu<TData>({
  column,
  data,
  isVisible,
  position,
  onClose,
  onApplyFilter,
}: ColumnContextMenuProps<TData>) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [quickFilterValue, setQuickFilterValue] = useState('')
  const [columnStats, setColumnStats] = useState<ColumnStats | null>(null)
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set())

  const columnId = column.id
  const columnHeader = typeof column.columnDef.header === 'string' 
    ? column.columnDef.header 
    : columnId

  // Calculate column statistics
  useEffect(() => {
    if (isVisible && data.length > 0) {
      const values = data.map(row => (row as any)[columnId]).filter(val => val != null)
      const uniqueValues = [...new Set(values.map(v => String(v)))].sort()
      
      let dataType: ColumnStats['dataType'] = 'string'
      let min, max, avg, sum
      
      if (values.length > 0) {
        const firstValue = values[0]
        if (typeof firstValue === 'boolean') {
          dataType = 'boolean'
        } else if (typeof firstValue === 'number') {
          dataType = 'number'
          min = Math.min(...values as number[])
          max = Math.max(...values as number[])
          sum = (values as number[]).reduce((a, b) => a + b, 0)
          avg = sum / values.length
        } else if (firstValue instanceof Date || (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
          dataType = 'date'
          const dates = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()))
          if (dates.length > 0) {
            min = new Date(Math.min(...dates.map(d => d.getTime())))
            max = new Date(Math.max(...dates.map(d => d.getTime())))
          }
        }
      }

      setColumnStats({
        totalCount: data.length,
        uniqueCount: uniqueValues.length,
        nullCount: data.length - values.length,
        dataType,
        min,
        max,
        avg,
        sum,
        uniqueValues: uniqueValues.slice(0, 100), // Limit for performance
      })
    }
  }, [isVisible, data, columnId])

  const handleQuickFilter = (filterType: string, value?: any) => {
    onApplyFilter(columnId, filterType, value || quickFilterValue)
    onClose()
  }

  const handleValueFilter = () => {
    if (selectedValues.size > 0) {
      onApplyFilter(columnId, 'in', Array.from(selectedValues))
      onClose()
    }
  }

  const copyColumnValues = () => {
    const values = data.map(row => (row as any)[columnId]).join('\n')
    navigator.clipboard.writeText(values)
    onClose()
  }

  const copyUniqueValues = () => {
    if (columnStats) {
      const uniqueText = columnStats.uniqueValues.join('\n')
      navigator.clipboard.writeText(uniqueText)
      onClose()
    }
  }

  if (!isVisible) return null

  const menuItems = [
    // Sorting
    {
      id: 'sort',
      label: 'Sort',
      icon: ArrowUpDown,
      hasSubmenu: true,
      submenu: [
        {
          id: 'sort-asc',
          label: 'Sort Ascending',
          icon: SortAsc,
          action: () => {
            column.toggleSorting(false)
            onClose()
          }
        },
        {
          id: 'sort-desc',
          label: 'Sort Descending',
          icon: SortDesc,
          action: () => {
            column.toggleSorting(true)
            onClose()
          }
        },
        {
          id: 'clear-sort',
          label: 'Clear Sort',
          icon: X,
          action: () => {
            column.clearSorting()
            onClose()
          }
        }
      ]
    },
    
    // Filtering
    {
      id: 'filter',
      label: 'Filter',
      icon: Filter,
      hasSubmenu: true,
      submenu: [
        {
          id: 'quick-filter',
          label: 'Quick Filter',
          icon: Search,
          custom: true
        },
        {
          id: 'value-filter',
          label: 'Filter by Values',
          icon: Check,
          custom: true
        },
        { id: 'separator' },
        {
          id: 'clear-filter',
          label: 'Clear Filter',
          icon: X,
          action: () => {
            column.setFilterValue(undefined)
            onClose()
          }
        }
      ]
    },

    // Column Operations
    {
      id: 'column-ops',
      label: 'Column',
      icon: Settings,
      hasSubmenu: true,
      submenu: [
        {
          id: 'hide-column',
          label: column.getIsVisible() ? 'Hide Column' : 'Show Column',
          icon: column.getIsVisible() ? EyeOff : Eye,
          action: () => {
            column.toggleVisibility()
            onClose()
          }
        },
        {
          id: 'pin-left',
          label: 'Pin Left',
          icon: Pin,
          action: () => {
            column.pin('left')
            onClose()
          }
        },
        {
          id: 'pin-right',
          label: 'Pin Right',
          icon: Pin,
          action: () => {
            column.pin('right')
            onClose()
          }
        },
        {
          id: 'unpin',
          label: 'Unpin',
          icon: PinOff,
          action: () => {
            column.pin(false)
            onClose()
          }
        },
        { id: 'separator' },
        {
          id: 'resize-auto',
          label: 'Auto Resize',
          icon: Move,
          action: () => {
            // Auto resize logic would go here
            onClose()
          }
        }
      ]
    },

    // Statistics & Analysis
    {
      id: 'stats',
      label: 'Statistics',
      icon: BarChart3,
      hasSubmenu: true,
      submenu: [
        {
          id: 'column-stats',
          label: 'Column Stats',
          icon: Calculator,
          custom: true
        }
      ]
    },

    { id: 'separator' },

    // Copy Operations
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      hasSubmenu: true,
      submenu: [
        {
          id: 'copy-values',
          label: 'Copy All Values',
          icon: Copy,
          action: copyColumnValues
        },
        {
          id: 'copy-unique',
          label: 'Copy Unique Values',
          icon: Copy,
          action: copyUniqueValues
        },
        {
          id: 'copy-header',
          label: 'Copy Header',
          icon: Copy,
          action: () => {
            navigator.clipboard.writeText(columnHeader)
            onClose()
          }
        }
      ]
    }
  ]

  const renderSubmenu = () => {
    const activeItem = menuItems.find(item => item.id === activeSubmenu)
    if (!activeItem?.submenu) return null

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px] max-w-[400px]"
      >
        {activeItem.submenu.map((item, index) => {
          if (item.id === 'separator') {
            return <Separator key={index} className="my-1" />
          }

          if (item.custom) {
            // Render custom components
            if (item.id === 'quick-filter') {
              return (
                <div key={item.id} className="p-2 border-b">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-[rgb(var(--fg-default))]">Quick Filter</div>
                    <Input
                      placeholder={`Filter ${columnHeader}...`}
                      value={quickFilterValue}
                      onChange={(e) => setQuickFilterValue(e.target.value)}
                      className="w-full h-7 text-xs"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickFilter('contains')}
                        disabled={!quickFilterValue}
                        className="h-6 text-xs px-2"
                      >
                        Contains
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickFilter('equals')}
                        disabled={!quickFilterValue}
                        className="h-6 text-xs px-2"
                      >
                        Equals
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickFilter('starts_with')}
                        disabled={!quickFilterValue}
                        className="h-6 text-xs px-2"
                      >
                        Starts With
                      </Button>
                      {columnStats?.dataType === 'number' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickFilter('greater_than')}
                            disabled={!quickFilterValue}
                            className="h-6 text-xs px-2"
                          >
                            &gt;
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickFilter('less_than')}
                            disabled={!quickFilterValue}
                            className="h-6 text-xs px-2"
                          >
                            &lt;
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            }

            if (item.id === 'value-filter' && columnStats) {
              return (
                <div key={item.id} className="p-2 border-b">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[rgb(var(--fg-default))]">Filter by Values</div>
                      <Badge variant="secondary" className="text-xs">
                        {columnStats.uniqueCount} unique
                      </Badge>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {columnStats.uniqueValues.map((value) => (
                        <div key={value} className="flex items-center space-x-2 hover:bg-[rgb(var(--bg-subtle))] cursor-pointer px-1 py-0.5 rounded">
                          <Checkbox
                            checked={selectedValues.has(value)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedValues)
                              if (e.target.checked) {
                                newSelected.add(value)
                              } else {
                                newSelected.delete(value)
                              }
                              setSelectedValues(newSelected)
                            }}
                            className="cursor-pointer"
                          />
                          <span className="text-xs truncate flex-1">{value}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleValueFilter}
                      disabled={selectedValues.size === 0}
                      className="w-full h-7 text-xs"
                    >
                      Apply Filter ({selectedValues.size})
                    </Button>
                  </div>
                </div>
              )
            }

            if (item.id === 'column-stats' && columnStats) {
              return (
                <div key={item.id} className="p-2 space-y-2">
                  <div className="text-sm font-medium text-[rgb(var(--fg-default))]">Column Statistics</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[rgb(var(--fg-muted))]">Total:</span>
                        <span className="font-medium">{columnStats.totalCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[rgb(var(--fg-muted))]">Unique:</span>
                        <span className="font-medium">{columnStats.uniqueCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[rgb(var(--fg-muted))]">Null:</span>
                        <span className="font-medium">{columnStats.nullCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[rgb(var(--fg-muted))]">Type:</span>
                        <Badge variant="outline" className="text-xs h-4">
                          {columnStats.dataType}
                        </Badge>
                      </div>
                    </div>
                    {columnStats.dataType === 'number' && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--fg-muted))]">Min:</span>
                          <span className="font-medium">{columnStats.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--fg-muted))]">Max:</span>
                          <span className="font-medium">{columnStats.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--fg-muted))]">Avg:</span>
                          <span className="font-medium">{columnStats.avg?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--fg-muted))]">Sum:</span>
                          <span className="font-medium">{columnStats.sum?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          }

          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-[rgb(var(--bg-subtle))] flex items-center space-x-3 transition-colors"
            >
              {Icon && <Icon className="h-4 w-4 text-[rgb(var(--fg-muted))]" />}
              <span className="flex-1">{item.label}</span>
            </button>
          )
        })}
      </motion.div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 50,
        }}
        className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] py-1"
      >
        {/* Header */}
        <div className="px-3 py-2 border-b bg-gray-50">
          <div className="text-sm font-medium text-[rgb(var(--fg-default))] truncate mb-2">
            {columnHeader}
          </div>
          <Input
            placeholder={`Search ${columnHeader}...`}
            value={quickFilterValue}
            onChange={(e) => setQuickFilterValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickFilterValue) {
                handleQuickFilter('contains')
              }
            }}
            className="h-7 text-xs"
          />
        </div>

        {/* Menu Items */}
        <div className="relative">
          {menuItems.map((item, index) => {
            if (item.id === 'separator') {
              return <Separator key={index} className="my-1" />
            }

            const Icon = item.icon
            return (
              <button
                key={item.id}
                onMouseEnter={() => item.hasSubmenu ? setActiveSubmenu(item.id) : setActiveSubmenu(null)}
                onClick={item.hasSubmenu ? undefined : (item as any).action}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-[rgb(var(--bg-subtle))] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  {Icon && <Icon className="h-4 w-4 text-[rgb(var(--fg-muted))]" />}
                  <span>{item.label}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronRight className="h-4 w-4 text-[rgb(var(--fg-muted))] group-hover:text-[rgb(var(--fg-default))]" />
                )}
              </button>
            )
          })}

          {/* Submenu */}
          <AnimatePresence>
            {activeSubmenu && renderSubmenu()}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Trash2, Calendar } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Dropdown } from '@/components'
import { Badge } from '@/components/ui'
import { Separator } from '@/components/ui'
import { DatePicker, DateRange } from '@/components/forms/date-picker/DatePicker'
import { Footer } from '@/components/layout/footer'
import { Save, XCircle, Check } from 'lucide-react'

export interface FilterCondition {
  id: string
  column: string
  operator: string
  value: any
  type: 'string' | 'number' | 'date' | 'boolean' | 'multi-select'
}

interface AdvancedFilterModalProps<TData> {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterCondition[]) => void
  columns: ColumnDef<TData>[]
  data: TData[]
}

const STRING_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

const NUMBER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'greater_than_equal', label: 'Greater than or equal' },
  { value: 'less_than', label: 'Less than' },
  { value: 'less_than_equal', label: 'Less than or equal' },
  { value: 'between', label: 'Between' },
  { value: 'not_between', label: 'Not between' },
]

const DATE_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'this_year', label: 'This year' },
]

const BOOLEAN_OPERATORS = [
  { value: 'is_true', label: 'Is true' },
  { value: 'is_false', label: 'Is false' },
]

export function AdvancedFilterModal<TData>({
  isOpen,
  onClose,
  onApply,
  columns,
  data,
}: AdvancedFilterModalProps<TData>) {
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [matchType, setMatchType] = useState<'all' | 'any'>('all')

  // Extract column information
  const filterableColumns = useMemo(() => {
    return columns
      .filter((col) => (col as any).accessorKey || col.id)
      .map((col) => {
        const key = (col as any).accessorKey as string || col.id!
        
        // Determine column type by analyzing sample data
        const sampleValues = data.slice(0, 100).map(row => (row as any)[key]).filter(val => val != null)
        let type: FilterCondition['type'] = 'string'
        
        if (sampleValues.length > 0) {
          const firstValue = sampleValues[0]
          if (typeof firstValue === 'boolean') {
            type = 'boolean'
          } else if (typeof firstValue === 'number') {
            type = 'number'
          } else if (firstValue instanceof Date || (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
            type = 'date'
          }
        }

        // Get unique values for multi-select
        const uniqueValues = [...new Set(sampleValues.map(val => String(val)))].sort()

        // Get header label - handle both string and function headers
        let label = key
        if (typeof col.header === 'function') {
          // For function headers, use the column id/key as label
          label = key
        } else if (typeof col.header === 'string') {
          label = col.header
        }

        return {
          key,
          label,
          type,
          uniqueValues: uniqueValues.slice(0, 50), // Limit to 50 options
        }
      })
  }, [columns, data])

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: filterableColumns[0]?.key || '',
      operator: 'contains',
      value: '',
      type: filterableColumns[0]?.type || 'string',
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId))
  }

  const updateFilter = (filterId: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map(f => f.id === filterId ? { ...f, ...updates } : f))
  }

  const getOperators = (type: FilterCondition['type']) => {
    switch (type) {
      case 'number':
        return NUMBER_OPERATORS
      case 'date':
        return DATE_OPERATORS
      case 'boolean':
        return BOOLEAN_OPERATORS
      default:
        return STRING_OPERATORS
    }
  }

  const renderValueInput = (filter: FilterCondition) => {
    const columnInfo = filterableColumns.find(col => col.key === filter.column)
    
    if (!columnInfo) return null

    // No input needed for certain operators
    if (['is_empty', 'is_not_empty', 'is_true', 'is_false', 'last_7_days', 'last_30_days', 'this_month', 'this_year'].includes(filter.operator)) {
      return null
    }

    switch (filter.type) {
      case 'boolean':
        return (
          <Dropdown
            options={[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' },
            ]}
            value={filter.value?.toString()}
            onValueChange={(value) => updateFilter(filter.id, { value: value === 'true' })}
            placeholder="Select value"
          />
        )

      case 'number':
        if (['between', 'not_between'].includes(filter.operator)) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filter.value?.min || ''}
                onChange={(e) => updateFilter(filter.id, {
                  value: { ...filter.value, min: parseFloat(e.target.value) }
                })}
              />
              <span className="text-gray-400">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filter.value?.max || ''}
                onChange={(e) => updateFilter(filter.id, {
                  value: { ...filter.value, max: parseFloat(e.target.value) }
                })}
              />
            </div>
          )
        }
        return (
          <Input
            type="number"
            placeholder="Enter value"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: parseFloat(e.target.value) })}
          />
        )

      case 'date':
        if (['between'].includes(filter.operator)) {
          return (
            <DatePicker
              mode="range"
              value={filter.value || {}}
              onChange={(range) => updateFilter(filter.id, { value: range })}
              placeholder="Select date range..."
              showFromTo={true}
            />
          )
        }
        return (
          <DatePicker
            mode="single"
            value={filter.value ? new Date(filter.value) : undefined}
            onChange={(date) => updateFilter(filter.id, { value: date })}
            placeholder="Select date..."
          />
        )

      default:
        // For string type, show multi-select if there are limited unique values
        if (columnInfo.uniqueValues.length <= 20 && columnInfo.uniqueValues.length > 2) {
          return (
            <div>
              <Dropdown
                options={columnInfo.uniqueValues.map(value => ({
                  value,
                  label: value,
                }))}
                value={Array.isArray(filter.value) ? filter.value[0] || '' : filter.value || ''}
                onValueChange={(value) => updateFilter(filter.id, { value })}
                placeholder="Select value..."
              />
              {Array.isArray(filter.value) && filter.value.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filter.value.map((value) => (
                    <Badge key={value} variant="secondary" className="text-xs">
                      {value}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => {
                          const currentValues = (filter.value as string[]) || []
                          updateFilter(filter.id, { value: currentValues.filter(v => v !== value) })
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <Input
            type="text"
            placeholder="Enter value"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          />
        )
    }
  }

  const handleApply = () => {
    onApply(filters)
  }

  const handleClear = () => {
    setFilters([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 bg-white overflow-hidden border-0 shadow-2xl" hideCloseButton>
        {/* Header with gradient */}
        <DialogHeader className="flex-shrink-0 px-6 py-3.5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-base font-semibold text-gray-900">
                Advanced Filters
              </DialogTitle>
              {filters.length > 0 && (
                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                  {filters.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              {filters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-sm px-3 py-1.5 h-8 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-200"
                >
                  Clear
                </Button>
              )}
              <button
                onClick={onClose}
                className="close-btn-md"
                aria-label="Close filter modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 space-y-3">
          {/* Quick Filters - Compact */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Quick Add</h3>
              <span className="text-xs text-gray-400">Click column to add filter</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {filterableColumns.slice(0, 12).map((col) => {
                  const isActive = filters.some(f => f.column === col.key)
                  return (
                    <Button
                      key={col.key}
                      variant={isActive ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (!isActive) {
                          const newFilters = [...filters, {
                            id: Date.now().toString(),
                            column: col.key,
                            operator: col.type === 'string' ? 'contains' : 'equals',
                            value: '',
                            type: col.type,
                          }]
                          setFilters(newFilters)
                        }
                      }}
                      className={`justify-start text-xs h-8 px-2.5 font-medium ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isActive}
                    >
                      <span className="truncate">{col.label}</span>
                    </Button>
                  )
                })}
            </div>
          </div>

          <Separator />

          {/* Match Type - Inline */}
          <div className="flex items-center gap-3 py-1">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Match:</span>
            <Dropdown
              options={[
                { value: 'all', label: 'ALL (AND)' },
                { value: 'any', label: 'ANY (OR)' },
              ]}
              value={matchType}
              onValueChange={(value) => setMatchType(value as 'all' | 'any')}
            />
            <span className="text-xs text-gray-500">
              {matchType === 'all' ? 'All must match' : 'At least one'}
            </span>
          </div>

          <Separator />

          {/* Filter Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Conditions</h3>
              <Button onClick={addFilter} size="sm" variant="outline" className="h-8 text-xs font-medium">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2.5">
              {filters.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">No filters added</p>
                  <p className="text-xs text-gray-400 mt-1">Use Quick Add above or click "Add"</p>
                </div>
              ) : (
                filters.map((filter, index) => (
                  <motion.div
                    key={filter.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-12 gap-2.5 p-3 border border-gray-200 rounded-md bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {/* AND/OR Connector */}
                    {index > 0 && (
                      <div className="col-span-1 flex items-center justify-center">
                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0.5">
                          {matchType.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    {index === 0 && <div className="col-span-1" />}

                    {/* Column */}
                    <div className="col-span-4">
                      <Label className="text-xs font-medium text-gray-600 mb-1">Column</Label>
                      <Dropdown
                        options={filterableColumns.map((col) => ({
                          value: col.key,
                          label: col.label,
                        }))}
                        value={filter.column}
                        onValueChange={(value) => {
                          const columnValue = typeof value === 'string' ? value : value[0] || ''
                          const columnInfo = filterableColumns.find(col => col.key === columnValue)
                          updateFilter(filter.id, {
                            column: columnValue,
                            type: columnInfo?.type || 'string',
                            operator: 'contains',
                            value: '',
                          })
                        }}
                        placeholder="Select column"
                      />
                    </div>

                    {/* Operator */}
                    <div className="col-span-3">
                      <Label className="text-xs font-medium text-gray-600 mb-1">Operator</Label>
                      <Dropdown
                        options={getOperators(filter.type)}
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(filter.id, { operator: typeof value === 'string' ? value : value[0] || '', value: '' })}
                        placeholder="Select"
                      />
                    </div>

                    {/* Value */}
                    <div className="col-span-3">
                      <Label className="text-xs font-medium text-gray-600 mb-1">Value</Label>
                      {renderValueInput(filter)}
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex items-end justify-center pb-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        aria-label="Remove filter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <Footer
          variant="modal"
          gradient={true}
          actions={
            <>
              <Button
                variant="action-cancel"
                onClick={onClose}
                icon={XCircle}
              >
                Cancel
              </Button>
              <Button
                variant="action-apply"
                icon={Check}
                onClick={handleApply}
                disabled={filters.length === 0}
              >
                Apply Filters ({filters.length})
              </Button>
            </>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
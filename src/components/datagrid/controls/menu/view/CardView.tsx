'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, MoreHorizontal, Eye, LayoutGrid } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui'
import { Checkbox } from '@/components/ui'

interface CardViewProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  onRowClick?: (item: TData) => void
  selectedRows: TData[]
  onRowSelect?: (item: TData, selected: boolean) => void
}

export function CardView<TData>({
  data,
  columns,
  onRowClick,
  selectedRows,
  onRowSelect,
}: CardViewProps<TData>) {
  const isSelected = (item: TData) => {
    return selectedRows.some(selected => (selected as any).id === (item as any).id)
  }

  const handleCardDoubleClick = (item: TData) => {
    if (onRowClick) {
      onRowClick(item)
    }
  }

  const handleCheckboxChange = (item: TData, checked: boolean) => {
    if (onRowSelect) {
      onRowSelect(item, checked)
    }
  }

  const getDisplayValue = (item: TData, columnKey: string) => {
    const value = (item as any)[columnKey]
    
    if (typeof value === 'boolean') {
      return value ? (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Yes
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          No
        </Badge>
      )
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    
    return value?.toString() || '-'
  }

  const getFieldLabel = (column: ColumnDef<TData>) => {
    if (typeof column.header === 'string') {
      return column.header
    }
    return (column as any).accessorKey as string || column.id || 'Field'
  }

  // Filter out selection and action columns for card display
  const displayColumns = columns.filter(col => 
    col.id !== 'select' && 
    col.id !== 'actions' && 
    (col as any).accessorKey !== 'actions'
  ).slice(0, 6) // Limit to first 6 fields for clean card layout

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-sm">No records to display in card view</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {data.map((item, index) => (
            <motion.div
              key={(item as any).id || index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ 
                y: -4, 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
              }}
              className="group"
            >
              <Card className="cursor-pointer transition-all duration-200 hover:border-blue-300 relative overflow-hidden">
                {/* Selection Checkbox */}
                <div className="absolute top-3 right-3 z-10">
                  <Checkbox
                    checked={isSelected(item)}
                    onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                    className="bg-white border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Card Header with Primary Field */}
                <CardHeader className="pb-3" onDoubleClick={() => handleCardDoubleClick(item)}>
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate pr-8">
                    {displayColumns.length > 0 && getDisplayValue(item, (displayColumns[0] as any).accessorKey as string)}
                  </CardTitle>
                  {displayColumns.length > 1 && (
                    <p className="text-sm text-gray-600 truncate">
                      {getDisplayValue(item, (displayColumns[1] as any).accessorKey as string)}
                    </p>
                  )}
                </CardHeader>

                {/* Card Content with Key Fields */}
                <CardContent className="space-y-3" onDoubleClick={() => handleCardDoubleClick(item)}>
                  {displayColumns.slice(2).map((column) => {
                    const fieldKey = (column as any).accessorKey as string
                    const fieldValue = getDisplayValue(item, fieldKey)
                    const fieldLabel = getFieldLabel(column)

                    return (
                      <div key={fieldKey} className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {fieldLabel}
                        </span>
                        <div className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">
                          {fieldValue}
                        </div>
                      </div>
                    )
                  })}

                  {/* Card Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardDoubleClick(item)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle delete action
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white border border-gray-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCardDoubleClick(item)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCardDoubleClick(item)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>

                {/* Selection Indicator */}
                {isSelected(item) && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-white rounded-full"
                      />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
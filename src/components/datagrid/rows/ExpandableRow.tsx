'use client'

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Row, flexRender } from '@tanstack/react-table'

// ==========================================
// EXPANDABLE ROW COMPONENT
// ==========================================
// This component wraps a table row and adds expansion functionality
// It works with TanStack Table's built-in expansion features

interface ExpandableRowProps<TData> {
  row: Row<TData>
  renderSubComponent?: (row: Row<TData>) => React.ReactNode
  onRowClick?: (e: React.MouseEvent) => void
  onRowDoubleClick?: () => void
  className?: string
  rowHeight?: number
  children: React.ReactNode
}

export function ExpandableRow<TData>({
  row,
  renderSubComponent,
  onRowClick,
  onRowDoubleClick,
  className = '',
  rowHeight,
  children
}: ExpandableRowProps<TData>) {
  return (
    <>
      {/* Main Row */}
      <tr
        className={className}
        onClick={onRowClick}
        onDoubleClick={onRowDoubleClick}
        style={rowHeight ? { height: `${rowHeight}px` } : undefined}
      >
        {children}
      </tr>

      {/* Expanded Row Content */}
      {row.getIsExpanded() && renderSubComponent && (
        <tr>
          <td colSpan={row.getVisibleCells().length} className="p-0 bg-gray-50 border-b">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {renderSubComponent(row)}
              </motion.div>
            </AnimatePresence>
          </td>
        </tr>
      )}
    </>
  )
}

// ==========================================
// EXPANSION TOGGLE CELL
// ==========================================
// This component renders the toggle button for expandable rows

interface ExpansionToggleCellProps<TData> {
  row: Row<TData>
}

export function ExpansionToggleCell<TData>({ row }: ExpansionToggleCellProps<TData>) {
  if (!row.getCanExpand()) {
    return null
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        row.getToggleExpandedHandler()()
      }}
      className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
      aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
    >
      {row.getIsExpanded() ? (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronRight className="h-4 w-4 text-gray-600" />
      )}
    </button>
  )
}

// ==========================================
// PROCESS BREAKDOWN COMPONENT
// ==========================================
// Reusable component for displaying process details in expanded rows

interface ProcessBreakdownProps {
  processes: Array<{
    name: string
    totalCost: number
    unitCost: number
  }>
}

export function ProcessBreakdown({ processes }: ProcessBreakdownProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {processes.map((process, index) => (
        <div
          key={index}
          className="flex flex-col p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-sm font-medium text-gray-700 mb-2">{process.name}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">
              ₹{process.totalCost.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-sm text-gray-600">₹{process.unitCost.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

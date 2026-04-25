'use client'

import React from 'react'
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react'
import { calculatePaginationInfo, generatePageNumbers, formatNumber } from '../utils/grid-helpers'
import { Dropdown } from '@/components'

// Default pagination configuration
export const DEFAULT_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 200, 500]

interface PaginationControlsProps {
  pageIndex: number
  pageSize: number
  totalRows: number
  pageSizeOptions?: number[]
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function PaginationControls({
  pageIndex,
  pageSize,
  totalRows,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const { startRow, endRow, totalPages, hasNextPage, hasPreviousPage } =
    calculatePaginationInfo(totalRows, pageIndex, pageSize)

  const pageNumbers = generatePageNumbers(pageIndex, totalPages)

  if (totalRows === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-[rgb(var(--bg-subtle))] border-t border-[rgb(var(--bd-default))] gap-4">
      {/* Left: Showing X-Y of Z entries */}
      <div className="text-sm text-[rgb(var(--fg-default))] flex-shrink-0">
        Showing{' '}
        <span className="font-medium">{formatNumber(startRow)}</span>
        {' - '}
        <span className="font-medium">{formatNumber(endRow)}</span>
        {' of '}
        <span className="font-medium">{formatNumber(totalRows)}</span>
        {' entries'}
      </div>

      {/* Center: Page navigation */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={!hasPreviousPage}
          className="p-1.5 rounded hover:bg-[rgb(var(--bd-default))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!hasPreviousPage}
          className="p-1.5 rounded hover:bg-[rgb(var(--bd-default))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-[rgb(var(--fg-muted))]">
                  ...
                </span>
              )
            }

            const isCurrentPage = page === pageIndex

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors
                  ${isCurrentPage
                    ? 'bg-[color-mix(in_srgb,rgb(var(--color-primary))_10%,white)] text-[rgb(var(--fg-default))] font-semibold border border-[rgb(var(--color-primary))]/30'
                    : 'text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bd-default))]'
                  }
                `}
              >
                {page + 1}
              </button>
            )
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded hover:bg-[rgb(var(--bd-default))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded hover:bg-[rgb(var(--bd-default))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
        </button>
      </div>

      {/* Right: Page size selector */}
      <div className="flex items-center gap-2 text-sm text-[rgb(var(--fg-default))] flex-shrink-0">
        <span className="hidden sm:inline">Show:</span>
        <Dropdown
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          options={pageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          placeholder="Rows"
          className="w-[6rem] h-[1.75rem] text-sm"
          searchable={false}
        />
        <span className="hidden sm:inline">rows</span>
      </div>
    </div>
  )
}
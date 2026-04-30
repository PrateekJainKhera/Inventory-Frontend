'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { DataGrid } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import {
  MOCK_GRN_APPROVAL_LIST,
  type GRNListItem,
} from '@/data/mock/grn'
import GRNDetailModal from './GRNDetailModal'

type FilterType = 'pending' | 'approved'

function GRNApprovalContent() {
  const alerts = useGlobalAlert()
  const [filterType, setFilterType] = useState<FilterType>('pending')
  const [grnList, setGrnList] = useState<GRNListItem[]>([...MOCK_GRN_APPROVAL_LIST])
  const [selectedGRN, setSelectedGRN] = useState<GRNListItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [gridKey, setGridKey] = useState(0)

  const filtered = useMemo(() => {
    return filterType === 'pending'
      ? grnList.filter(g => !g.ApprovedBy)
      : grnList.filter(g => !!g.ApprovedBy)
  }, [grnList, filterType])

  const filterCounts = useMemo(() => ({
    pending:  grnList.filter(g => !g.ApprovedBy).length,
    approved: grnList.filter(g => !!g.ApprovedBy).length,
  }), [grnList])

  const handleFilterChange = (f: FilterType) => {
    setFilterType(f)
    setSelectedGRN(null)
    setGridKey(k => k + 1)
  }

  const handleViewDetails = useCallback((row: GRNListItem) => {
    setSelectedGRN(row)
    setIsDetailOpen(true)
  }, [])

  const handleAction = useCallback((transactionId: number, action: 'Approve' | 'UnApprove') => {
    setGrnList(prev => prev.map(g => {
      if (g.TransactionID !== transactionId) return g
      if (action === 'Approve') {
        return { ...g, ApprovedBy: 'Admin', ApprovalDate: new Date().toISOString().slice(0, 10) }
      }
      return { ...g, ApprovedBy: null, ApprovalDate: null }
    }))
    setIsDetailOpen(false)
    setSelectedGRN(null)
    setGridKey(k => k + 1)
    alerts.showSuccess(
      'Success',
      action === 'Approve' ? 'GRN approved successfully.' : 'GRN approval reversed.'
    )
  }, [alerts])

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo((): ColumnDef<GRNListItem>[] => {
    const base: ColumnDef<GRNListItem>[] = [
      { accessorKey: 'MaxVoucherNo',        header: 'Ref. GRN No.',    size: 140 },
      { accessorKey: 'LedgerName',          header: 'Supplier Name',   size: 200 },
      { accessorKey: 'ReceiptVoucherNo',    header: 'GRN No.',         size: 140 },
      { accessorKey: 'ReceiptVoucherDate',  header: 'GRN Date',        size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'PurchaseVoucherNo',   header: 'P.O. No.',        size: 130 },
      { accessorKey: 'PurchaseVoucherDate', header: 'P.O. Date',       size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'DeliveryNoteNo',      header: 'D.N. No.',        size: 110 },
      { accessorKey: 'DeliveryNoteDate',    header: 'D.N. Date',       size: 110, cell: ({ getValue }) => getValue() ? formatDate(getValue() as string) : '' },
      { accessorKey: 'GateEntryNo',         header: 'Gate Entry No.',  size: 120 },
      { accessorKey: 'GateEntryDate',       header: 'Gate Entry Date', size: 120, cell: ({ getValue }) => getValue() ? formatDate(getValue() as string) : '' },
      { accessorKey: 'LRNoVehicleNo',       header: 'LR No./Vehicle',  size: 140 },
      { accessorKey: 'Transporter',         header: 'Transporter',     size: 140 },
      { accessorKey: 'ReceiverName',        header: 'Received By',     size: 130 },
      { accessorKey: 'CreatedBy',           header: 'Created By',      size: 120 },
      { accessorKey: 'Narration',           header: 'Narration',       size: 180 },
      { accessorKey: 'ProductionUnitName',  header: 'Production Unit', size: 130 },
      { accessorKey: 'CompanyName',         header: 'Company',         size: 160 },
    ]

    if (filterType === 'approved') {
      base.push(
        { accessorKey: 'ApprovedBy',    header: 'Approved By',    size: 120 },
        { accessorKey: 'ApprovalDate',  header: 'Approval Date',  size: 120, cell: ({ getValue }) => getValue() ? formatDate(getValue() as string) : '' },
      )
    }

    return base
  }, [filterType])

  // ── Filter toggle buttons (matches PO Approval style) ─────────────────────
  const filterToggleButtons = (
    <div className="inline-flex items-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))]">
      {([
        { key: 'pending'  as FilterType, icon: AlertCircle, label: 'Pending Receipt Note' },
        { key: 'approved' as FilterType, icon: CheckCircle, label: 'Approved Receipt Note' },
      ]).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => handleFilterChange(key)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors',
            filterType === key
              ? 'bg-[rgb(var(--color-primary))] text-white'
              : 'text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bg-subtle))]'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          <span className={cn(
            'ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
            filterType === key
              ? 'bg-white/25 text-white'
              : 'bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] border border-[rgb(var(--bd-default))]'
          )}>
            {filterCounts[key]}
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-hidden py-3 px-4 bg-[rgb(var(--bg-default))]"
    >
      <DataGrid
        className="flex-1 min-h-0"
        key={gridKey}
        data={filtered}
        columns={columns}
        getRowId={row => String(row.TransactionID)}
        preToggleActions={filterToggleButtons}
        rowSelectionMode="single"
        onRowSelect={rows => { if (rows.length === 1) handleViewDetails(rows[0]) }}
        enableSearch={true}
        enableBacchaSearch={true}
        enableFilterRow={true}
        enableExport={true}
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableColumnFreezing={true}
        enablePagination={true}
      />

      {selectedGRN && (
        <GRNDetailModal
          isOpen={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedGRN(null); setGridKey(k => k + 1) }}
          grn={selectedGRN}
          filterType={filterType}
          onAction={handleAction}
        />
      )}
    </motion.div>
  )
}

export default function GRNApprovalPage() {
  return (
    <Suspense>
      <GRNApprovalContent />
    </Suspense>
  )
}
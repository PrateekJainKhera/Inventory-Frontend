'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { DataGrid } from '@/components/datagrid'
import { createActionsColumn } from '@/components/datagrid/columns/ActionsColumn'
import { cn, formatDate } from '@/lib/utils'
import { MOCK_REQUISITIONS, type RequisitionRecord } from '@/data/mock/purchaseRequisition'
import RequisitionDetailModal from './RequisitionDetailModal'

type FilterType = 'unapproved' | 'approved' | 'cancelled'

function RequisitionApprovalContent() {
  const alerts = useGlobalAlert()
  const [filterType, setFilterType] = useState<FilterType>('unapproved')
  const [requisitions, setRequisitions] = useState<RequisitionRecord[]>([...MOCK_REQUISITIONS])
  const [selectedReq, setSelectedReq] = useState<RequisitionRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filtered = useMemo(() => {
    switch (filterType) {
      case 'unapproved':
        return requisitions.filter(r => !r.AuditApproved && !r.IsAuditCancelled && !r.IsCancelled)
      case 'approved':
        return requisitions.filter(r => r.AuditApproved && !r.IsAuditCancelled && !r.IsCancelled)
      case 'cancelled':
        return requisitions.filter(r => r.IsAuditCancelled || r.IsCancelled)
    }
  }, [requisitions, filterType])

  const handleFilterChange = (f: FilterType) => {
    setFilterType(f)
    setSelectedReq(null)
  }

  const handleRowSelect = useCallback((rows: RequisitionRecord[]) => {
    setSelectedReq(rows.length > 0 ? rows[rows.length - 1] : null)
  }, [])

  const handleViewDetails = useCallback((row: RequisitionRecord) => {
    setSelectedReq(row)
    setIsDetailOpen(true)
  }, [])

  const handleApprovalAction = useCallback((transactionId: number, action: 'Approve' | 'UnApprove' | 'Cancel' | 'UnCancel') => {
    setRequisitions(prev => prev.map(r => {
      if (r.TransactionID !== transactionId) return r
      switch (action) {
        case 'Approve':
          return { ...r, AuditApproved: true, IsVoucherItemApproved: true, ApprovedBy: 'Current User', IsAuditCancelled: false, IsCancelled: false }
        case 'UnApprove':
          return { ...r, AuditApproved: false, IsVoucherItemApproved: false, ApprovedBy: '' }
        case 'Cancel':
          return { ...r, IsAuditCancelled: true, IsCancelled: true }
        case 'UnCancel':
          return { ...r, IsAuditCancelled: false, IsCancelled: false }
      }
    }))
    setIsDetailOpen(false)
    setSelectedReq(null)
    const actionLabels: Record<string, string> = { Approve: 'approved', UnApprove: 'un-approved', Cancel: 'cancelled', UnCancel: 'un-cancelled' }
    alerts.showSuccess('Success', `Requisition ${actionLabels[action]} successfully`)
  }, [alerts])

  const columns = useMemo((): ColumnDef<RequisitionRecord>[] => {
    const base: ColumnDef<RequisitionRecord>[] = [
      { accessorKey: 'VoucherNo',           header: 'Requisition No.',  size: 120 },
      { accessorKey: 'VoucherDate',          header: 'Requisition Date', size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemCode',             header: 'Item Code',        size: 80  },
      { accessorKey: 'ItemGroupName',        header: 'Item Group',       size: 120 },
      { accessorKey: 'ItemSubGroupName',     header: 'Sub Group',        size: 120 },
      { accessorKey: 'ItemName',             header: 'Item Name',        size: 250 },
      { accessorKey: 'RefJobCardContentNo',  header: 'Ref. J.C. No.',    size: 120 },
      { accessorKey: 'PurchaseQty',          header: 'Requisition Qty',  size: 120, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'StockUnit',            header: 'UOM',              size: 80  },
      { accessorKey: 'ExpectedDeliveryDate', header: 'Expected Date',    size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemNarration',        header: 'Item Remark',      size: 200 },
      { accessorKey: 'CreatedBy',            header: 'Created By',       size: 120 },
      { accessorKey: 'ProductionUnitName',   header: 'Production Unit',  size: 150 },
    ]

    if (filterType === 'approved') {
      base.push({ accessorKey: 'ApprovedBy', header: 'Approved By', size: 120 })
    }

    base.push(
      createActionsColumn<RequisitionRecord>({
        onView: handleViewDetails,
        showView: true,
        showEdit: false,
        showDelete: false,
        mode: 'buttons',
        primaryActions: ['view'],
      })
    )

    return base
  }, [filterType, handleViewDetails])

  const filterToggleButtons = (
    <div className="inline-flex items-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))]">
      {([
        { key: 'unapproved' as FilterType, icon: AlertCircle, label: 'Unapproved' },
        { key: 'approved'   as FilterType, icon: CheckCircle, label: 'Approved'   },
        { key: 'cancelled'  as FilterType, icon: X,           label: 'Cancelled'  },
      ]).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => handleFilterChange(key)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors',
            filterType === key
              ? 'bg-[rgb(var(--color-primary))] text-white'
              : 'text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-subtle))]'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
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
        data={filtered}
        columns={columns}
        getRowId={(row) => String(row.TransactionID)}
        preToggleActions={filterToggleButtons}
        enableRowSelection={true}
        rowSelectionMode="single"
        onRowSelect={handleRowSelect}
        enableSearch={true}
        enableBacchaSearch={true}
        enableFilterRow={true}
        enableExport={true}
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableColumnFreezing={true}
        enablePagination={true}
        paginationPageSize={10}
        paginationPageSizeOptions={[10, 20, 50]}
      />

      <RequisitionDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedReq(null) }}
        requisition={selectedReq}
        filterType={filterType}
        onAction={handleApprovalAction}
      />

      {/* FAB */}
      <button
        onClick={() => selectedReq && setIsDetailOpen(true)}
        disabled={!selectedReq}
        title="View Requisition Details"
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
      >
        <FileText className="h-5 w-5" />
      </button>
    </motion.div>
  )
}

export default function RequisitionApprovalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    }>
      <RequisitionApprovalContent />
    </Suspense>
  )
}
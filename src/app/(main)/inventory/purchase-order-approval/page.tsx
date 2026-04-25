'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { DataGrid } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import { MOCK_PO_APPROVAL_LIST, type POListView } from '@/data/mock/purchaseOrder'
import PODetailModal from './PODetailModal'

type FilterType = 'unapproved' | 'approved' | 'cancelled'

function POApprovalContent() {
  const alerts = useGlobalAlert()
  const [filterType, setFilterType] = useState<FilterType>('unapproved')
  const [orders, setOrders] = useState<POListView[]>([...MOCK_PO_APPROVAL_LIST])
  const [selectedOrder, setSelectedOrder] = useState<POListView | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filtered = useMemo(() => {
    switch (filterType) {
      case 'unapproved':
        return orders.filter(o => !o.ApprovedBy && !o.IsCancelled)
      case 'approved':
        return orders.filter(o => !!o.ApprovedBy && !o.IsCancelled)
      case 'cancelled':
        return orders.filter(o => o.IsCancelled)
    }
  }, [orders, filterType])

  const filterCounts = useMemo(() => ({
    unapproved: orders.filter(o => !o.ApprovedBy && !o.IsCancelled).length,
    approved:   orders.filter(o => !!o.ApprovedBy && !o.IsCancelled).length,
    cancelled:  orders.filter(o => o.IsCancelled).length,
  }), [orders])

  const handleFilterChange = (f: FilterType) => {
    setFilterType(f)
    setSelectedOrder(null)
  }

  const handleRowSelect = useCallback((rows: POListView[]) => {
    setSelectedOrder(rows.length > 0 ? rows[rows.length - 1] : null)
  }, [])

  const handleViewDetails = useCallback((row: POListView) => {
    setSelectedOrder(row)
    setIsDetailOpen(true)
  }, [])

  const handleApprovalAction = useCallback((
    transactionId: number,
    action: 'Approve' | 'UnApprove' | 'Cancel' | 'UnCancel',
    remark?: string,
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.TransactionID !== transactionId) return o
      switch (action) {
        case 'Approve':
          return { ...o, ApprovedBy: 'Admin', ApprovalDate: new Date().toISOString().split('T')[0], IsCancelled: false, CancellationRemark: null }
        case 'UnApprove':
          return { ...o, ApprovedBy: null, ApprovalDate: null }
        case 'Cancel':
          return { ...o, IsCancelled: true, CancellationRemark: remark ?? '', ApprovedBy: null, ApprovalDate: null }
        case 'UnCancel':
          return { ...o, IsCancelled: false, CancellationRemark: null }
      }
    }))
    setIsDetailOpen(false)
    setSelectedOrder(null)
    const actionLabels: Record<string, string> = { Approve: 'approved', UnApprove: 'un-approved', Cancel: 'cancelled', UnCancel: 'un-cancelled' }
    alerts.showSuccess('Success', `Purchase Order ${actionLabels[action]} successfully`)
  }, [alerts])

  const columns = useMemo((): ColumnDef<POListView>[] => {
    const base: ColumnDef<POListView>[] = [
      { accessorKey: 'LedgerName',            header: 'Supplier',           size: 180 },
      { accessorKey: 'VoucherNo',             header: 'PO No.',             size: 120 },
      { accessorKey: 'VoucherDate',           header: 'PO Date',            size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemCode',              header: 'Item Code',          size: 80  },
      { accessorKey: 'ItemName',              header: 'Item Name',          size: 280 },
      { accessorKey: 'PurchaseOrderQuantity', header: 'Order Qty',          size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'PurchaseUnit',          header: 'Unit',               size: 70  },
      { accessorKey: 'PurchaseRate',          header: 'Rate',               size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'GrossAmount',           header: 'Gross Amt',          size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'DiscountAmount',        header: 'Disc. Amt',          size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'BasicAmount',           header: 'Basic Amt',          size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'GSTTaxAmount',          header: 'GST Amt',            size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'NetAmount',             header: 'Net Amt',            size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'RefJobCardContentNo',   header: 'Ref. J.C. No.',      size: 110 },
      { accessorKey: 'CreatedBy',             header: 'Created By',         size: 100 },
      { accessorKey: 'ProductionUnitName',    header: 'Production Unit',    size: 130 },
      { accessorKey: 'CompanyName',           header: 'Company',            size: 130 },
    ]

    if (filterType === 'approved') {
      base.push(
        { accessorKey: 'ApprovedBy',   header: 'Approved By',   size: 110 },
        { accessorKey: 'ApprovalDate', header: 'Approval Date', size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
      )
    } else {
      base.push(
        { accessorKey: 'LastPODate', header: 'Last PO Date', size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
      )
    }

    return base
  }, [filterType])

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
      className="py-3 px-4 bg-[rgb(var(--bg-default))] min-h-screen"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1" />
        <h1 className="flex-1 text-center text-xl font-bold text-[rgb(var(--fg-default))]">
          Purchase Order Approval
        </h1>
        <div className="flex-1" />
      </div>

      <DataGrid
        data={filtered}
        columns={columns}
        getRowId={(row) => String(row.TransactionID)}
        preToggleActions={filterToggleButtons}
        enableRowSelection={true}
        rowSelectionMode="single"
        onRowSelect={handleRowSelect}
        onRowClick={handleViewDetails}
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

      <PODetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedOrder(null) }}
        order={selectedOrder}
        filterType={filterType}
        onAction={handleApprovalAction}
      />

      {/* FAB */}
      <button
        onClick={() => selectedOrder && setIsDetailOpen(true)}
        disabled={!selectedOrder}
        title="View PO Details"
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
      >
        <FileText className="h-5 w-5" />
      </button>
    </motion.div>
  )
}

export default function POApprovalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    }>
      <POApprovalContent />
    </Suspense>
  )
}
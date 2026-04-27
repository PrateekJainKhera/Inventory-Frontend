'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Plus, List, FileText, Trash2, Edit, Printer, Eye, XCircle, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Badge } from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import {
  derivePendingRequisitions,
  MOCK_PURCHASE_ORDERS,
  type PurchaseOrderItem,
} from '@/data/mock/purchaseOrder'
import { markRequisitionsAsPOCreated } from '@/data/mock/purchaseRequisition'
import PurchaseOrderModal from './PurchaseOrderModal'

type ViewMode = 'requisitions' | 'orders'
type StatusFilter = 'all' | 'approval-pending' | 'approved' | 'cancelled' | 'closed'

function PurchaseOrderContent() {
  const alerts = useGlobalAlert()

  const [viewMode, setViewMode] = useState<ViewMode>('requisitions')
  const [requisitions, setRequisitions] = useState<PurchaseOrderItem[]>(() => derivePendingRequisitions())
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([...MOCK_PURCHASE_ORDERS])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedRequisitionIds, setSelectedRequisitionIds] = useState<Set<number>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrderItem | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'close'>('create')

  // ── Filtered orders ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    switch (statusFilter) {
      case 'approval-pending': return orders.filter(o => !o.VoucherItemApproved && !o.VoucherCancelled && !o.ManuallyClosed)
      case 'approved':         return orders.filter(o => o.VoucherItemApproved && !o.VoucherCancelled && !o.ManuallyClosed)
      case 'cancelled':        return orders.filter(o => o.VoucherCancelled)
      case 'closed':           return orders.filter(o => o.ManuallyClosed && !o.VoucherCancelled)
      default:                 return orders
    }
  }, [orders, statusFilter])

  const statusCounts = useMemo(() => ({
    all: orders.length,
    'approval-pending': orders.filter(o => !o.VoucherItemApproved && !o.VoucherCancelled && !o.ManuallyClosed).length,
    approved:  orders.filter(o => o.VoucherItemApproved && !o.VoucherCancelled && !o.ManuallyClosed).length,
    cancelled: orders.filter(o => o.VoucherCancelled).length,
    closed:    orders.filter(o => o.ManuallyClosed && !o.VoucherCancelled).length,
  }), [orders])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRowSelect = useCallback((rows: PurchaseOrderItem[]) => {
    setSelectedRequisitionIds(new Set(rows.map(r => r.TransactionID)))
  }, [])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    setSelectedRequisitionIds(new Set())
  }, [])

  const handleCreatePO = useCallback(() => {
    setEditingOrder(null)
    setModalMode('create')
    setIsModalOpen(true)
  }, [])

  const handleView = useCallback((order: PurchaseOrderItem) => {
    setEditingOrder(order)
    setModalMode('view')
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((order: PurchaseOrderItem) => {
    setEditingOrder(order)
    setModalMode('edit')
    setIsModalOpen(true)
  }, [])

  const handleClosePO = useCallback((order: PurchaseOrderItem) => {
    setEditingOrder(order)
    setModalMode('close')
    setIsModalOpen(true)
  }, [])

  const handlePrint = useCallback((order: PurchaseOrderItem) => {
    alerts.showInfo('Print', `Printing Purchase Order ${order.VoucherNo}`)
  }, [alerts])

  const handleDelete = useCallback((order: PurchaseOrderItem) => {
    alerts.showConfirmation(
      'Delete Purchase Order',
      `Are you sure you want to delete ${order.VoucherNo}?`,
      () => {
        setOrders(prev => prev.filter(o => o.TransactionID !== order.TransactionID))
        alerts.showSuccess('Deleted', 'Purchase Order deleted successfully')
      }
    )
  }, [alerts])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setEditingOrder(null)
    setSelectedRequisitionIds(new Set())
  }, [])

  const handleModalSuccess = useCallback(() => {
    if (viewMode === 'requisitions' && selectedRequisitionIds.size > 0) {
      markRequisitionsAsPOCreated([...selectedRequisitionIds])
      setRequisitions(derivePendingRequisitions())
      setSelectedRequisitionIds(new Set())
    }
    alerts.showSuccess('Success', 'Purchase Order created successfully')
  }, [alerts, viewMode, selectedRequisitionIds])

  // ── Pending Requisitions columns ───────────────────────────────────────────
  const requisitionColumns = useMemo((): ColumnDef<PurchaseOrderItem>[] => [
    { accessorKey: 'VoucherNo',           header: 'Req. No.',           size: 130 },
    { accessorKey: 'VoucherDate',         header: 'Req. Date',          size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ItemCode',            header: 'Item Code',          size: 100 },
    { accessorKey: 'ItemGroupName',       header: 'Item Group',         size: 120 },
    { accessorKey: 'ItemSubGroupName',    header: 'Sub Group',          size: 120 },
    { accessorKey: 'ItemName',            header: 'Item Name',          size: 250 },
    { accessorKey: 'RefJobCardContentNo', header: 'Job Card No.',       size: 130 },
    { accessorKey: 'RequiredQuantity',    header: 'Req. Qty',           size: 100, cell: ({ getValue }) => Number(getValue() ?? 0).toFixed(2) },
    { accessorKey: 'PurchaseQuantityComp',header: 'Pending Qty',        size: 110, cell: ({ getValue }) => Number(getValue() ?? 0).toFixed(2) },
    { accessorKey: 'PurchaseQuantity',    header: 'Purchase Qty',       size: 110, cell: ({ getValue }) => Number(getValue() ?? 0).toFixed(2) },
    { accessorKey: 'CreatedBy',           header: 'Created By',         size: 130 },
    { accessorKey: 'ItemNarration',       header: 'Item Remark',        size: 150 },
    { accessorKey: 'Narration',           header: 'Remark',             size: 150 },
    { accessorKey: 'ProductionUnitName',  header: 'Production Unit',    size: 140 },
    { accessorKey: 'CompanyName',         header: 'Company Name',       size: 200 },
  ], [])

  // ── Purchase Orders columns (dynamic by status) ────────────────────────────
  const orderColumns = useMemo((): ColumnDef<PurchaseOrderItem>[] => {
    const base: ColumnDef<PurchaseOrderItem>[] = [
      { accessorKey: 'LedgerName',          header: 'Supplier Name',      size: 200 },
      { accessorKey: 'VoucherNo',           header: 'P.O. No.',           size: 120 },
      { accessorKey: 'VoucherDate',         header: 'P.O. Date',          size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemCode',            header: 'Item Code',          size: 100 },
      { accessorKey: 'ItemGroupName',       header: 'Item Group',         size: 120 },
      { accessorKey: 'ItemSubGroupName',    header: 'Sub Group',          size: 120 },
      { accessorKey: 'ItemName',            header: 'Item Name',          size: 250 },
      { accessorKey: 'PurchaseQuantity',    header: 'P.O. Qty',           size: 100, cell: ({ getValue }) => Number(getValue() ?? 0).toFixed(2) },
      { accessorKey: 'PurchaseUnit',        header: 'Unit',               size: 80  },
    ]

    if (statusFilter === 'approved') {
      base.push(
        { accessorKey: 'ReceiptQty', header: 'Receipt Qty', size: 100, cell: ({ getValue }) => Number(getValue() ?? 0).toFixed(2) },
        { accessorKey: 'PendingQty', header: 'Pending Qty', size: 100, cell: ({ getValue }) => Number(getValue() ?? 0).toFixed(2) },
      )
    }

    base.push(
      { accessorKey: 'ExpectedDeliveryDate', header: 'Expected Delivery', size: 140, cell: ({ getValue }) => getValue() ? formatDate(getValue() as string) : '' },
      { accessorKey: 'NetAmount',            header: 'Net Amount',        size: 130, cell: ({ getValue }) => `₹${Number(getValue() ?? 0).toFixed(2)}` },
      { accessorKey: 'RefJobCardContentNo',  header: 'Job Card No.',      size: 130 },
      { accessorKey: 'CreatedBy',            header: 'Created By',        size: 120 },
      { accessorKey: 'ApprovedBy',           header: 'Approved By',       size: 120 },
      { accessorKey: 'PurchaseReference',    header: 'Purchase Ref.',     size: 140 },
      { accessorKey: 'Narration',            header: 'Remark',            size: 150 },
      { accessorKey: 'ProductionUnitName',   header: 'Production Unit',   size: 140 },
      { accessorKey: 'CompanyName',          header: 'Company Name',      size: 200 },
    )

    if (statusFilter === 'approved')  base.push({ accessorKey: 'ApprovalRemark', header: 'Approval Remark', size: 180 })
    if (statusFilter === 'cancelled') base.push({ accessorKey: 'CancelRemark',   header: 'Cancelled Remark', size: 180 })
    if (statusFilter === 'closed')    base.push({ accessorKey: 'ClosedRemark',   header: 'Closed Remark',   size: 180 })

    // Status badge column
    base.push({
      id: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => {
        const o = row.original
        if (o.VoucherCancelled)  return <Badge variant="danger">Cancelled</Badge>
        if (o.ManuallyClosed)    return <Badge variant="secondary">Closed</Badge>
        if (o.VoucherItemApproved) return <Badge variant="success">Approved</Badge>
        return <Badge variant="warning">Pending</Badge>
      }
    })

    // Actions column
    base.push({
      id: 'actions',
      header: 'Actions',
      size: 160,
      cell: ({ row }) => {
        const order = row.original
        const isEditable = !order.VoucherItemApproved && !order.VoucherCancelled && !order.ManuallyClosed
        const showClose = statusFilter === 'approved' && order.VoucherItemApproved && !order.VoucherCancelled && !order.ManuallyClosed
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handlePrint(order) }}
              className="p-1 rounded hover:text-[rgb(var(--color-info))] hover:bg-[rgb(var(--color-info))]/10 transition-colors"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleView(order) }}
              className="p-1 rounded hover:text-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))]/10 transition-colors"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            {isEditable && (
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(order) }}
                className="p-1 rounded hover:text-orange-500 hover:bg-orange-50 transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {showClose && (
              <button
                onClick={(e) => { e.stopPropagation(); handleClosePO(order) }}
                className="p-1 rounded hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Close PO"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
            {isEditable && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(order) }}
                className="p-1 rounded hover:text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      }
    })

    return base
  }, [statusFilter, handlePrint, handleView, handleEdit, handleClosePO, handleDelete])

  // ── Status filter pills (migration-matched colors) ────────────────────────
  const statusFilterBar = (
    <div className="flex flex-wrap gap-1.5">
      {([
        { key: 'all',              label: 'All',       count: statusCounts.all,
          active: 'bg-gray-900 text-white shadow-sm',
          inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
        { key: 'approval-pending', label: 'Pending',   count: statusCounts['approval-pending'],
          active: 'bg-yellow-600 text-white shadow-sm',
          inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
        { key: 'approved',         label: 'Approved',  count: statusCounts.approved,
          active: 'bg-green-600 text-white shadow-sm',
          inactive: 'bg-green-50 text-green-700 hover:bg-green-100' },
        { key: 'cancelled',        label: 'Cancelled', count: statusCounts.cancelled,
          active: 'bg-red-600 text-white shadow-sm',
          inactive: 'bg-red-50 text-red-700 hover:bg-red-100' },
        { key: 'closed',           label: 'Closed',    count: statusCounts.closed,
          active: 'bg-gray-600 text-white shadow-sm',
          inactive: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
      ] as { key: StatusFilter; label: string; count: number; active: string; inactive: string }[]).map(({ key, label, count, active, inactive }) => (
        <button
          key={key}
          onClick={() => setStatusFilter(key)}
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap',
            statusFilter === key ? active : inactive
          )}
        >
          {label} ({count})
        </button>
      ))}
    </div>
  )

  const selectedCount = selectedRequisitionIds.size

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-3 px-4 bg-[rgb(var(--bg-default))] min-h-screen"
    >
      {/* Page header */}
      <div className="mb-3">
        {/* Title row */}
        <h1 className="text-center text-xl font-bold text-[rgb(var(--fg-default))] mb-2">Purchase Order</h1>

        {/* View toggle row */}
        <div className="flex justify-start">
          <div className="inline-flex items-center justify-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))]">
            <button
              onClick={() => handleViewModeChange('requisitions')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
                viewMode === 'requisitions'
                  ? 'bg-[rgb(var(--color-primary))] text-white'
                  : 'text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-subtle))]'
              )}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Pending Requisitions</span>
              <span className="sm:hidden">Requisitions</span>
            </button>
            <button
              onClick={() => handleViewModeChange('orders')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
                viewMode === 'orders'
                  ? 'bg-[rgb(var(--color-primary))] text-white'
                  : 'text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-subtle))]'
              )}
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Purchase Orders</span>
              <span className="sm:hidden">Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      {viewMode === 'requisitions' ? (
        <DataGrid
          key="requisitions"
          data={requisitions}
          columns={requisitionColumns}
          getRowId={(row) => String(row.TransactionID)}
          title="Pending Requisitions"
          enableRowSelection={true}
          rowSelectionMode="multi"
          onRowSelect={handleRowSelect}
          enableSearch={true}
          enableBacchaSearch={true}
          enableFilterRow={true}
          enableExport={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          enableColumnFreezing={true}
          enablePagination={true}
          paginationPageSize={20}
          paginationPageSizeOptions={[10, 20, 50, 100]}
        />
      ) : (
        <DataGrid
          key="orders"
          data={filteredOrders}
          columns={orderColumns}
          getRowId={(row) => String(row.TransactionID)}
          title="Purchase Orders"
          preToggleActions={statusFilterBar}
          enableRowSelection={false}
          enableSearch={true}
          enableBacchaSearch={true}
          enableFilterRow={true}
          enableExport={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          enableColumnFreezing={true}
          enablePagination={true}
          paginationPageSize={20}
          paginationPageSizeOptions={[10, 20, 50, 100]}
        />
      )}

      {/* Modal */}
      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        orderData={editingOrder}
        selectedRequisitions={
          viewMode === 'requisitions'
            ? requisitions.filter(r => selectedRequisitionIds.has(r.TransactionID))
            : []
        }
        mode={modalMode}
      />
      {/* FAB — only in requisitions view */}
      {viewMode === 'requisitions' && (
        <button
          onClick={handleCreatePO}
          disabled={selectedCount === 0}
          title="Create Purchase Order"
          className="fixed bottom-6 right-6 z-50 h-11 px-4 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Create PO{selectedCount > 0 ? ` (${selectedCount})` : ''}</span>
        </button>
      )}
    </motion.div>
  )
}

export default function PurchaseOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    }>
      <PurchaseOrderContent />
    </Suspense>
  )
}
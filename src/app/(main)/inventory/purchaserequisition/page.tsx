'use client'

import { useState, useMemo, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Plus, List, FileText, Loader2, RefreshCw } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Badge } from '@/components/ui'
import type { BadgeProps } from '@/components/ui'
import { DataGrid, createActionsColumn } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import { PurchaseRequisitionModal } from './PurchaseRequisitionModal'
import {
  MOCK_INDENTS,
  MOCK_REQUISITIONS,
  getRequisitionStatus,
  type IndentItem,
  type RequisitionRecord,
  type RequisitionStatus,
} from '@/data/mock/purchaseRequisition'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'indent' | 'requisitions'
type StatusFilter = 'All' | RequisitionStatus

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<RequisitionStatus, BadgeProps['variant']> = {
  Pending:        'warning',
  Approved:       'success',
  Proceed:        'info',
  'Part Proceed': 'purple',
  Rejected:       'danger',
  Closed:         'secondary',
}

function StatusBadge({ record }: { record: RequisitionRecord }) {
  const status = getRequisitionStatus(record)
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function PurchaseRequisitionPageContent() {
  const alerts = useGlobalAlert()

  const [viewMode, setViewMode] = useState<ViewMode>('indent')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All')
  const [indentData, setIndentData] = useState<IndentItem[]>(MOCK_INDENTS)
  const [requisitionData, setRequisitionData] = useState<RequisitionRecord[]>(MOCK_REQUISITIONS)
  const [selectedIndents, setSelectedIndents] = useState<IndentItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingRequisition, setEditingRequisition] = useState<RequisitionRecord | null>(null)

  // ─── Status counts ──────────────────────────────────────────────────────────

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: requisitionData.length,
      Pending: 0, Approved: 0, Proceed: 0, 'Part Proceed': 0, Rejected: 0, Closed: 0,
    }
    requisitionData.forEach(r => { counts[getRequisitionStatus(r)]++ })
    return counts
  }, [requisitionData])

  // ─── Filtered data ──────────────────────────────────────────────────────────

  const filteredRequisitions = useMemo(() => {
    if (selectedStatus === 'All') return requisitionData
    return requisitionData.filter(r => getRequisitionStatus(r) === selectedStatus)
  }, [requisitionData, selectedStatus])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = () => {
    setEditingRequisition(null)
    setShowModal(true)
  }

  const handleEdit = (row: RequisitionRecord) => {
    setEditingRequisition(row)
    setShowModal(true)
  }

  const handleDelete = (row: RequisitionRecord) => {
    setRequisitionData(prev => prev.filter(r => r.TransactionID !== row.TransactionID))
    alerts.showSuccess('Requisition Deleted', `${row.VoucherNo} has been deleted.`)
  }

  const handleManualClose = (row: RequisitionRecord) => {
    setRequisitionData(prev =>
      prev.map(r => r.TransactionID === row.TransactionID ? { ...r, ManuallyClosed: true } : r)
    )
    alerts.showSuccess('Requisition Closed', `${row.VoucherNo} has been manually closed.`)
  }

  const handleCloseIndent = (row: IndentItem) => {
    setIndentData(prev => prev.filter(i => i._uid !== row._uid))
    alerts.showSuccess('Indent Closed', `Indent ${row.VoucherNo} has been closed.`)
  }

  const handleSave = (data: { header: { voucherNo: string; voucherDate: string; narration: string }; items: any[] }) => {
    if (editingRequisition) {
      setRequisitionData(prev =>
        prev.map(r =>
          r.TransactionID === editingRequisition.TransactionID
            ? {
                ...r,
                VoucherDate: data.header.voucherDate,
                Narration: data.header.narration,
                PurchaseQty: data.items.reduce((s: number, i: any) => s + (i.PurchaseQty || 0), 0),
              }
            : r
        )
      )
      alerts.showSuccess('Requisition Updated', `${editingRequisition.VoucherNo} has been updated.`)
    } else {
      const newRec: RequisitionRecord = {
        TransactionID: Date.now(),
        VoucherNo: data.header.voucherNo,
        VoucherDate: data.header.voucherDate,
        ItemID: data.items[0]?.ItemID ?? 0,
        ItemCode: data.items[0]?.ItemCode ?? '',
        ItemGroupName: data.items[0]?.ItemGroupName ?? '',
        ItemSubGroupName: data.items[0]?.ItemSubGroupName ?? '',
        ItemName: data.items.length > 1
          ? `${data.items[0]?.ItemName} + ${data.items.length - 1} more`
          : (data.items[0]?.ItemName ?? ''),
        RefJobCardContentNo: data.items[0]?.RefJobCardContentNo ?? '',
        JobName: data.items[0]?.JobName ?? '',
        PurchaseQty: data.items.reduce((s: number, i: any) => s + (i.PurchaseQty || 0), 0),
        StockUnit: data.items[0]?.StockUnit ?? '',
        OrderUnit: data.items[0]?.OrderUnit ?? data.items[0]?.StockUnit ?? '',
        POQtyInStockUnit: data.items.reduce((s: number, i: any) => s + (i.PurchaseQty || 0), 0),
        PhysicalStock: data.items[0]?.PhysicalStock ?? 0,
        AllocatedStock: data.items[0]?.AllocatedStock ?? 0,
        ExpectedDeliveryDate: data.items[0]?.ExpectedDeliveryDate ?? '',
        ItemNarration: data.items[0]?.ItemNarration ?? '',
        Narration: data.header.narration,
        CreatedBy: 'Current User',
        ApprovedBy: '',
        ProductionUnitName: 'Unit A – Printing',
        AuditApproved: false, IsAuditCancelled: false, IsVoucherItemApproved: false,
        IsCancelled: false, POCreated: false, ManuallyClosed: false,
      }
      setRequisitionData(prev => [newRec, ...prev])
      alerts.showSuccess('Requisition Created', `${data.header.voucherNo} has been created successfully.`)
    }

    setShowModal(false)
    setEditingRequisition(null)
    setSelectedIndents([])
    if (!editingRequisition) setViewMode('requisitions')
  }

  // ─── Indent columns ─────────────────────────────────────────────────────────

  const indentColumns = useMemo((): ColumnDef<IndentItem>[] => {
    const actionsCol = createActionsColumn<IndentItem>({
      onDelete: (row) => {
        alerts.showConfirmation(
          'Close Indent',
          `Close indent ${row.VoucherNo}? This cannot be undone.`,
          () => handleCloseIndent(row)
        )
      },
      showEdit: false,
      showDelete: true,
      showView: false,
      mode: 'buttons',
      labels: { delete: 'Close' },
      confirmDelete: false,
    })

    return [
      { accessorKey: 'VoucherNo',          header: 'Indent No.' },
      { accessorKey: 'VoucherDate',         header: 'Indent Date',    cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemGroupName',       header: 'Item Group' },
      { accessorKey: 'ItemSubGroupName',    header: 'Sub Group' },
      { accessorKey: 'ItemCode',            header: 'Item Code' },
      { accessorKey: 'ItemName',            header: 'Item Name' },
      { accessorKey: 'RequiredQuantity',    header: 'Indent Qty',          cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'PhysicalStock',       header: 'Stock Qty',           cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'BookedStock',         header: 'Booked Stock',        cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'AllocatedStock',      header: 'Allocated Stock',     cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'FreeStock',           header: 'Free Stock',          cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'StockUnit',           header: 'Stock Unit' },
      { accessorKey: 'OrderUnit',           header: 'Order Unit' },
      { accessorKey: 'POQtyInStockUnit',    header: 'PO Qty (Stock Unit)', cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'JobName',             header: 'Job Name' },
      { accessorKey: 'JobBookingContentNo', header: 'Job Card No' },
      {
        accessorKey: 'Source', header: 'Source',
        cell: ({ getValue }) => {
          const v = getValue() as string
          return (
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
              v === 'Job Card'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            )}>{v}</span>
          )
        },
      },
      { accessorKey: 'PurchaseUnit',        header: 'Purchase Unit' },
      { accessorKey: 'ProductionUnitName',  header: 'Production Unit' },
      actionsCol,
    ]
  }, [indentData])

  // ─── Requisition columns ────────────────────────────────────────────────────

  const requisitionColumns = useMemo((): ColumnDef<RequisitionRecord>[] => {
    const actionsCol = createActionsColumn<RequisitionRecord>({
      onEdit: handleEdit,
      onDelete: (row) => handleDelete(row),
      onArchive: (row) => {
        alerts.showConfirmation(
          'Manual Close',
          `Close ${row.VoucherNo}? No further action will be possible.`,
          () => handleManualClose(row)
        )
      },
      showView: false,
      showEdit: true,
      showDelete: true,
      showArchive: (row) => !row.ManuallyClosed,
      mode: 'mixed',
      primaryActions: ['edit', 'delete'],
      confirmDelete: true,
      labels: { archive: 'Manual Close' },
      deleteConfirmation: {
        title: 'Delete Requisition',
        description: 'Are you sure? This requisition will be permanently deleted.',
      },
    })

    return [
      { accessorKey: 'VoucherNo',           header: 'Req. No.' },
      { accessorKey: 'VoucherDate',          header: 'Req. Date',      cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemCode',             header: 'Item Code' },
      { accessorKey: 'ItemGroupName',        header: 'Item Group' },
      { accessorKey: 'ItemSubGroupName',     header: 'Sub Group' },
      { accessorKey: 'ItemName',             header: 'Item Name' },
      { accessorKey: 'RefJobCardContentNo',  header: 'Job Card No' },
      { accessorKey: 'JobName',              header: 'Job Name' },
      { accessorKey: 'PurchaseQty',          header: 'Purchase Qty',        cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'StockUnit',            header: 'Stock Unit' },
      { accessorKey: 'OrderUnit',            header: 'Order Unit' },
      { accessorKey: 'POQtyInStockUnit',     header: 'PO Qty (Stock Unit)', cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'PhysicalStock',        header: 'Stock Qty',           cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'AllocatedStock',       header: 'Allocated Stock',     cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'ExpectedDeliveryDate', header: 'Expected Date',       cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'ItemNarration',        header: 'Item Remark' },
      { accessorKey: 'Narration',            header: 'Remark' },
      { accessorKey: 'CreatedBy',            header: 'Created By' },
      { accessorKey: 'ApprovedBy',           header: 'Approved By' },
      { accessorKey: 'ProductionUnitName',   header: 'Production Unit' },
      {
        id: 'Status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge record={row.original} />,
      },
      actionsCol,
    ]
  }, [requisitionData])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-3 px-4 bg-[rgb(var(--bg-default))] min-h-screen"
    >
      {/* Page Title */}
      <div className="text-center mb-1 px-3">
        <h1 className="text-xl font-bold text-[rgb(var(--fg-default))]">Purchase Requisition</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-3">
        {/* View tabs */}
        <div className="flex items-center gap-1 bg-[rgb(var(--bg-subtle))] rounded-lg p-1">
          <button
            onClick={() => setViewMode('indent')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              viewMode === 'indent'
                ? 'bg-[rgb(var(--color-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <List className="h-3.5 w-3.5" />
            Indent List
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              viewMode === 'indent' ? 'bg-white/25 text-white' : 'bg-[rgb(var(--bg-default))] text-[rgb(var(--fg-muted))]'
            )}>
              {indentData.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('requisitions')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              viewMode === 'requisitions'
                ? 'bg-[rgb(var(--color-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Requisitions
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              viewMode === 'requisitions' ? 'bg-white/25 text-white' : 'bg-[rgb(var(--bg-default))] text-[rgb(var(--fg-muted))]'
            )}>
              {requisitionData.length}
            </span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIndentData(MOCK_INDENTS)
              setRequisitionData(MOCK_REQUISITIONS)
              alerts.showInfo('Refreshed', 'Data has been refreshed.')
            }}
            className="p-1.5 rounded-md text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bg-subtle))] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Indent List */}
      {viewMode === 'indent' && (
        <DataGrid
          data={indentData}
          columns={indentColumns}
          getRowId={(row) => String(row._uid)}
          title="Indent List"
          enableColumnResizing={true}
          enableColumnReordering={true}
          enableColumnFreezing={true}
          enableVirtualization={false}
          enableRowSelection={true}
          rowSelectionMode="multi"
          enableSearch={true}
          enableBacchaSearch={true}
          enableFilterRow={true}
          enableExport={true}
          enablePagination={true}
          paginationPageSize={10}
          paginationPageSizeOptions={[10, 20, 50, 100]}
          onRowSelect={(rows) => setSelectedIndents(rows as IndentItem[])}
        />
      )}

      {/* Requisitions List */}
      {viewMode === 'requisitions' && (
        <DataGrid
          data={filteredRequisitions}
          columns={requisitionColumns}
          getRowId={(row) => String(row.TransactionID)}
          preToggleActions={
            <div className="inline-flex items-center gap-0.5">
              {(['All', 'Pending', 'Approved', 'Proceed', 'Part Proceed', 'Rejected', 'Closed'] as StatusFilter[]).map(s => {
                const isActive = selectedStatus === s
                const colorMap: Record<string, string> = {
                  All:          'text-gray-700 hover:text-gray-900',
                  Pending:      'text-yellow-600 hover:text-yellow-700',
                  Approved:     'text-green-600 hover:text-green-700',
                  Proceed:      'text-blue-600 hover:text-blue-700',
                  'Part Proceed': 'text-purple-600 hover:text-purple-700',
                  Rejected:     'text-red-600 hover:text-red-700',
                  Closed:       'text-gray-500 hover:text-gray-600',
                }
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                      isActive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : colorMap[s]
                    )}
                  >
                    {s} ({statusCounts[s]})
                  </button>
                )
              })}
            </div>
          }
          enableColumnResizing={true}
          enableColumnReordering={true}
          enableColumnFreezing={true}
          enableVirtualization={false}
          enableRowSelection={false}
          enableSearch={true}
          enableBacchaSearch={true}
          enableFilterRow={true}
          enableExport={true}
          enablePagination={true}
          paginationPageSize={10}
          paginationPageSizeOptions={[10, 20, 50, 100]}
          onRowClick={handleEdit}
        />
      )}

      {/* Modal */}
      {/* FAB */}
      <button
        onClick={handleCreate}
        title="Create Requisition"
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="h-5 w-5" />
      </button>

      <PurchaseRequisitionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingRequisition(null) }}
        onSave={handleSave}
        editingRequisition={editingRequisition}
        preselectedIndents={selectedIndents}
      />
    </motion.div>
  )
}

export default function PurchaseRequisitionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    }>
      <PurchaseRequisitionPageContent />
    </Suspense>
  )
}
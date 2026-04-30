'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, FileText, Plus, Eye } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Badge } from '@/components/ui'
import { DataGrid, createActionsColumn } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import {
  MOCK_PENDING_PO_ITEMS,
  MOCK_GRN_VOUCHERS,
  type PendingPOItem,
  type GRNVoucher,
} from '@/data/mock/grn'
import PurchaseGRNModal from './PurchaseGRNModal'

type ViewMode = 'pending-po' | 'receipt-notes'

function PurchaseGRNContent() {
  const alerts = useGlobalAlert()

  const [viewMode, setViewMode] = useState<ViewMode>('pending-po')
  const [pendingPOs, setPendingPOs] = useState<PendingPOItem[]>([...MOCK_PENDING_PO_ITEMS])
  const [grnVouchers, setGrnVouchers] = useState<GRNVoucher[]>([...MOCK_GRN_VOUCHERS])
  const [selectedPOIds, setSelectedPOIds] = useState<Set<number>>(new Set())
  const [selectedGRNIds, setSelectedGRNIds] = useState<Set<number>>(new Set())
  const [poGridKey, setPoGridKey] = useState(0)
  const [grnGridKey, setGrnGridKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<PendingPOItem[]>([])
  const [editingReceipt, setEditingReceipt] = useState<GRNVoucher | null>(null)

  const handleRowSelect = useCallback((rows: PendingPOItem[]) => {
    setSelectedPOIds(new Set(rows.map(r => r.TransactionID)))
  }, [])

  const handleCreateGRN = useCallback(() => {
    const selected = pendingPOs.filter(p => selectedPOIds.has(p.TransactionID))
    if (selected.length === 0) return
    const firstSupplierId = selected[0].LedgerID
    if (selected.some(p => p.LedgerID !== firstSupplierId)) {
      alerts.showError('Validation', 'All selected PO lines must be from the same supplier.')
      return
    }
    setSelectedOrders(selected)
    setEditingReceipt(null)
    setModalOpen(true)
  }, [alerts, pendingPOs, selectedPOIds])

  const handleEditGRN = useCallback((receipt: GRNVoucher) => {
    setSelectedOrders([])
    setEditingReceipt(receipt)
    setModalOpen(true)
  }, [])

  const handleGRNRowSelect = useCallback((rows: GRNVoucher[]) => {
    setSelectedGRNIds(new Set(rows.map(r => r.TransactionID)))
  }, [])

  const handleOpenGRNDetails = useCallback(() => {
    const selected = grnVouchers.filter(v => selectedGRNIds.has(v.TransactionID))
    if (selected.length !== 1) return
    handleEditGRN(selected[0])
  }, [grnVouchers, selectedGRNIds, handleEditGRN])

  const handleDeleteGRN = useCallback((receipt: GRNVoucher) => {
    alerts.showConfirmation(
      'Delete GRN',
      `Are you sure you want to delete ${receipt.ReceiptVoucherNo}?`,
      () => {
        const idx = MOCK_GRN_VOUCHERS.findIndex(v => v.TransactionID === receipt.TransactionID)
        if (idx !== -1) MOCK_GRN_VOUCHERS.splice(idx, 1)
        setGrnVouchers([...MOCK_GRN_VOUCHERS])
        setGrnGridKey(k => k + 1)
        alerts.showSuccess('Deleted', `${receipt.ReceiptVoucherNo} deleted.`)
      }
    )
  }, [alerts])

  const handleModalClose = useCallback((shouldRefresh?: boolean) => {
    setModalOpen(false)
    setEditingReceipt(null)
    setSelectedOrders([])
    if (shouldRefresh) {
      setPendingPOs([...MOCK_PENDING_PO_ITEMS])
      setGrnVouchers([...MOCK_GRN_VOUCHERS])
      setPoGridKey(k => k + 1)
      setGrnGridKey(k => k + 1)
      setSelectedPOIds(new Set())
    }
  }, [])

  const selectedCount = selectedPOIds.size
  const selectedGRNCount = selectedGRNIds.size

  // ── Pending PO columns ────────────────────────────────────────────────────
  const pendingPOColumns = useMemo((): ColumnDef<PendingPOItem>[] => [
    { accessorKey: 'LedgerName',          header: 'Supplier Name',   size: 200 },
    { accessorKey: 'PurchaseVoucherNo',   header: 'P.O. No.',        size: 130 },
    { accessorKey: 'MaxVoucherNo',        header: 'Ref. P.O. No.',   size: 130 },
    { accessorKey: 'PurchaseVoucherDate', header: 'P.O. Date',       size: 100, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ItemCode',            header: 'Item Code',       size: 100 },
    { accessorKey: 'ItemGroupName',       header: 'Item Group',      size: 120 },
    { accessorKey: 'ItemSubGroupName',    header: 'Sub Group',       size: 120 },
    { accessorKey: 'ItemName',            header: 'Item Name',       size: 220 },
    { accessorKey: 'PurchaseUnit',        header: 'Purchase Unit',   size: 100 },
    { accessorKey: 'StockUnit',           header: 'Stock Unit',      size: 90  },
    {
      accessorKey: 'PurchaseOrderQuantity',
      header: 'P.O. Qty',
      size: 90,
      cell: ({ getValue }) => <span className="block text-right">{Number(getValue() ?? 0).toFixed(2)}</span>,
    },
    {
      accessorKey: 'PendingQty',
      header: 'Pending Qty',
      size: 100,
      cell: ({ getValue }) => (
        <span className="block text-right font-semibold text-amber-600">{Number(getValue() ?? 0).toFixed(2)}</span>
      ),
    },
    { accessorKey: 'RefJobCardContentNo', header: 'Ref. J.C. No.',  size: 120 },
    { accessorKey: 'Remark',              header: 'Remark',          size: 150 },
    { accessorKey: 'CreatedBy',           header: 'Created By',      size: 140 },
    { accessorKey: 'ApprovedBy',          header: 'Approved By',     size: 130 },
    { accessorKey: 'ProductionUnitName',  header: 'Production Unit', size: 130 },
    { accessorKey: 'CompanyName',         header: 'Company',         size: 160 },
  ], [])

  // ── Receipt Notes columns ─────────────────────────────────────────────────
  const receiptColumns = useMemo((): ColumnDef<GRNVoucher>[] => [
    { accessorKey: 'ReceiptVoucherNo',   header: 'GRN No.',       size: 130 },
    { accessorKey: 'ReceiptVoucherDate', header: 'GRN Date',      size: 100, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'LedgerName',         header: 'Supplier Name', size: 200 },
    { accessorKey: 'PurchaseVoucherNo',  header: 'P.O. No.',      size: 120 },
    { accessorKey: 'DeliveryNoteNo',     header: 'D.N. No.',      size: 110 },
    { accessorKey: 'GateEntryNo',        header: 'Gate Entry No.',size: 120 },
    { accessorKey: 'LRNoVehicleNo',      header: 'LR / Vehicle',  size: 130 },
    { accessorKey: 'Transporter',        header: 'Transporter',   size: 140 },
    { accessorKey: 'ReceiverName',       header: 'Received By',   size: 140 },
    { accessorKey: 'CreatedBy',          header: 'Created By',    size: 140 },
    {
      id: 'qcStatus',
      header: 'QC Status',
      size: 110,
      cell: ({ row }) => (
        <Badge variant={row.original.IsVoucherItemApproved ? 'success' : 'warning'}>
          {row.original.IsVoucherItemApproved ? 'Approved' : 'Pending QC'}
        </Badge>
      ),
    },
    createActionsColumn<GRNVoucher>({
      onPrint: (v) => alerts.showInfo('Print', `Printing ${v.ReceiptVoucherNo}`),
      onView: (v) => handleEditGRN(v),
      onEdit: (v) => handleEditGRN(v),
      onDelete: (v) => handleDeleteGRN(v),
      showPrint: true,
      showView: true,
      showEdit: (v) => !v.IsVoucherItemApproved,
      showDelete: (v) => !v.IsVoucherItemApproved,
      mode: 'buttons',
      primaryActions: ['print', 'view', 'edit', 'delete'],
      maxVisibleActions: 4,
      confirmDelete: true,
      deleteConfirmation: {
        title: 'Delete GRN',
        description: 'Are you sure you want to delete this GRN? This action cannot be undone.',
      },
    }),
  ], [alerts, handleEditGRN, handleDeleteGRN])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col overflow-hidden py-3 px-3 sm:px-5 bg-[rgb(var(--bg-default))]"
    >
      {/* ── View toggle ── */}
      <div className="mb-3 flex justify-center sm:justify-start">
        {/* View toggle */}
        <div className="inline-flex items-center self-center sm:self-auto justify-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))]">
          <button
            onClick={() => { setViewMode('pending-po'); setSelectedPOIds(new Set()); setSelectedGRNIds(new Set()) }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
              viewMode === 'pending-po'
                ? 'bg-[rgb(var(--color-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <List className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Pending P.O.</span>
            {pendingPOs.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                viewMode === 'pending-po'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {pendingPOs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setViewMode('receipt-notes'); setSelectedPOIds(new Set()); setSelectedGRNIds(new Set()) }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
              viewMode === 'receipt-notes'
                ? 'bg-[rgb(var(--color-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Receipt Notes</span>
            {grnVouchers.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                viewMode === 'receipt-notes'
                  ? 'bg-white/25 text-white'
                  : 'bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))] border border-[rgb(var(--bd-default))]'
              )}>
                {grnVouchers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Selection hint ── */}
      {viewMode === 'pending-po' && (
        <p className="text-[11px] text-[rgb(var(--text-muted))] mb-2 text-center sm:text-left">
          {selectedCount > 0
            ? `${selectedCount} PO line${selectedCount !== 1 ? 's' : ''} selected — tap the button below to create GRN`
            : 'Select one or more PO lines to create a GRN'}
        </p>
      )}
      {viewMode === 'receipt-notes' && (
        <p className="text-[11px] text-[rgb(var(--text-muted))] mb-2 text-center sm:text-left">
          {selectedGRNCount > 0
            ? `${selectedGRNCount} GRN${selectedGRNCount !== 1 ? 's' : ''} selected — tap the button below to open details`
            : 'Select a GRN to open its details'}
        </p>
      )}

      {/* ── Data Grid ── */}
      {viewMode === 'pending-po' ? (
        <DataGrid
          className="flex-1 min-h-0"
          key={`pending-po-${poGridKey}`}
          data={pendingPOs}
          columns={pendingPOColumns}
          getRowId={row => String(row.TransactionID)}
          title="Pending Purchase Orders"
          enableRowSelection
          rowSelectionMode="multi"
          onRowSelect={handleRowSelect}
          enableSearch
          enableBacchaSearch
          enableFilterRow
          enableExport
          enableColumnResizing
          enableColumnReordering
          enableColumnFreezing
          enablePagination
        />
      ) : (
        <DataGrid
          className="flex-1 min-h-0"
          key={`receipt-notes-${grnGridKey}`}
          data={grnVouchers}
          columns={receiptColumns}
          getRowId={row => String(row.TransactionID)}
          title="Receipt Notes"
          enableRowSelection
          rowSelectionMode="multi"
          onRowSelect={handleGRNRowSelect}
          enableSearch
          enableBacchaSearch
          enableFilterRow
          enableExport
          enableColumnResizing
          enableColumnReordering
          enableColumnFreezing
          enablePagination
        />
      )}

      {/* ── Floating Action Buttons ── */}
      <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
        {/* Open Details — Receipt Notes, exactly 1 selected */}
        <AnimatePresence>
          {viewMode === 'receipt-notes' && selectedGRNCount === 1 && (
            <motion.button
              key="open-details"
              initial={{ scale: 0.6, opacity: 0, y: 16 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{ scale: 0.6,    opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleOpenGRNDetails}
              className="pointer-events-auto flex items-center gap-2.5 pl-5 pr-6 py-3.5 bg-[rgb(var(--color-primary))] text-white rounded-full shadow-2xl hover:opacity-90 active:scale-95 transition-all"
              aria-label="Open Details"
            >
              <Eye className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold text-sm tracking-wide">Open Details</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Create GRN — Pending PO, rows selected */}
        <AnimatePresence>
          {viewMode === 'pending-po' && selectedCount > 0 && (
            <motion.button
              key="create-grn"
              initial={{ scale: 0.6, opacity: 0, y: 16 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{ scale: 0.6,    opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleCreateGRN}
              className="pointer-events-auto flex items-center gap-2.5 pl-5 pr-6 py-3.5 bg-[rgb(var(--color-primary))] text-white rounded-full shadow-2xl hover:opacity-90 active:scale-95 transition-all"
              aria-label="Create GRN"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold text-sm tracking-wide">Create GRN</span>
              <span className="bg-white/25 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedCount}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── GRN Modal ── */}
      {modalOpen && (
        <PurchaseGRNModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          selectedOrders={selectedOrders}
          editingReceipt={editingReceipt}
        />
      )}
    </motion.div>
  )
}

export default function PurchaseGRNPage() {
  return (
    <Suspense>
      <PurchaseGRNContent />
    </Suspense>
  )
}
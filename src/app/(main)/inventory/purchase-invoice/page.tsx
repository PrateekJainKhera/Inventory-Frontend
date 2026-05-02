'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { List, FileText, Plus, Edit, Trash2, Printer } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import {
  MOCK_PENDING_GRNS,
  MOCK_PROCESSED_INVOICES,
  genPINo,
  type PendingGRNItem,
  type ProcessedInvoice,
} from '@/data/mock/purchaseInvoice'
import PurchaseInvoiceModal from './PurchaseInvoiceModal'

type ViewMode = 'pending' | 'processed'

export default function PurchaseInvoicePage() {
  const alerts = useGlobalAlert()

  const [viewMode, setViewMode] = useState<ViewMode>('pending')
  const [pendingGRNs, setPendingGRNs] = useState<PendingGRNItem[]>([...MOCK_PENDING_GRNS])
  const [processedInvoices, setProcessedInvoices] = useState<ProcessedInvoice[]>([...MOCK_PROCESSED_INVOICES])
  const [selectedPendingItems, setSelectedPendingItems] = useState<PendingGRNItem[]>([])
  const [selectedProcessedItem, setSelectedProcessedItem] = useState<ProcessedInvoice | null>(null)
  const [pendingGridKey, setPendingGridKey] = useState(0)
  const [processedGridKey, setProcessedGridKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingInvoice, setEditingInvoice] = useState<ProcessedInvoice | null>(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    setSelectedPendingItems([])
    setSelectedProcessedItem(null)
    setPendingGridKey(k => k + 1)
    setProcessedGridKey(k => k + 1)
  }, [])

  const handlePendingRowSelect = useCallback((rows: PendingGRNItem[]) => {
    setSelectedPendingItems(rows)
  }, [])

  const handleProcessedRowSelect = useCallback((rows: ProcessedInvoice[]) => {
    setSelectedProcessedItem(rows[0] ?? null)
  }, [])

  const handleCreateInvoice = useCallback(() => {
    if (selectedPendingItems.length === 0) {
      alerts.showWarning('Warning', 'Please select at least one GRN to create an invoice.')
      return
    }

    const firstLedgerID = selectedPendingItems[0].LedgerID
    if (selectedPendingItems.some(r => r.LedgerID !== firstLedgerID)) {
      alerts.showWarning('Warning', 'Please select records which have the same supplier.')
      return
    }

    const firstCompanyID = selectedPendingItems[0].CompanyID
    if (selectedPendingItems.some(r => r.CompanyID !== firstCompanyID)) {
      alerts.showWarning('Warning', 'Please select records which have the same company.')
      return
    }

    const firstFYear = selectedPendingItems[0].FYear
    if (selectedPendingItems.some(r => r.FYear !== firstFYear)) {
      alerts.showWarning('Warning', 'Please select records from the same financial year.')
      return
    }

    setModalMode('create')
    setEditingInvoice(null)
    setModalOpen(true)
  }, [selectedPendingItems, alerts])

  const handleEditInvoice = useCallback((invoice: ProcessedInvoice) => {
    setEditingInvoice(invoice)
    setModalMode('edit')
    setModalOpen(true)
  }, [])

  const handleDeleteInvoice = useCallback((invoice: ProcessedInvoice) => {
    alerts.showConfirmation(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${invoice.VoucherNo}? This action cannot be undone.`,
      () => {
        setProcessedInvoices(prev => prev.filter(i => i.TransactionID !== invoice.TransactionID))
        setProcessedGridKey(k => k + 1)
        if (selectedProcessedItem?.TransactionID === invoice.TransactionID) {
          setSelectedProcessedItem(null)
        }
        alerts.showSuccess('Deleted', `Invoice ${invoice.VoucherNo} deleted.`)
      }
    )
  }, [alerts, selectedProcessedItem])

  const handleModalSuccess = useCallback((newInvoice?: ProcessedInvoice) => {
    if (modalMode === 'create' && newInvoice) {
      // Remove used GRNs from pending
      const usedIDs = new Set(selectedPendingItems.map(g => g.TransactionID))
      setPendingGRNs(prev => prev.filter(g => !usedIDs.has(g.TransactionID)))
      // Add to processed
      setProcessedInvoices(prev => [newInvoice, ...prev])
      setPendingGridKey(k => k + 1)
      setProcessedGridKey(k => k + 1)
      setSelectedPendingItems([])
    } else if (modalMode === 'edit' && newInvoice) {
      setProcessedInvoices(prev =>
        prev.map(i => i.TransactionID === newInvoice.TransactionID ? newInvoice : i)
      )
      setProcessedGridKey(k => k + 1)
    }
    setModalOpen(false)
    setEditingInvoice(null)
  }, [modalMode, selectedPendingItems])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setEditingInvoice(null)
  }, [])

  // ── Columns ───────────────────────────────────────────────────────────────

  const pendingColumns = useMemo((): ColumnDef<PendingGRNItem>[] => [
    { accessorKey: 'LedgerName',          header: 'Supplier',            size: 220 },
    { accessorKey: 'ReceiptVoucherNo',    header: 'Receipt Note No.',    size: 140 },
    { accessorKey: 'ReceiptVoucherDate',  header: 'Receipt Date',        size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'PurchaseVoucherNo',   header: 'P.O. No.',            size: 120 },
    { accessorKey: 'PurchaseVoucherDate', header: 'P.O. Date',           size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ReceiptQuantity',     header: 'Receipt Qty',         size: 100, cell: ({ getValue }) => <span className="block text-right">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'DeliveryNoteNo',      header: 'Delivery Note No.',   size: 150 },
    { accessorKey: 'DeliveryNoteDate',    header: 'Delivery Note Date',  size: 140, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ReceiverName',        header: 'Received By',         size: 130 },
    { accessorKey: 'Narration',           header: 'Narration',           size: 160 },
    { accessorKey: 'CreatedBy',           header: 'CreatedBy',           size: 120 },
  ], [])

  const processedColumns = useMemo((): ColumnDef<ProcessedInvoice>[] => [
    { accessorKey: 'VoucherNo',      header: 'Purchase Invoice No.',   size: 160 },
    { accessorKey: 'VoucherDate',    header: 'Purchase Invoice Date',  size: 150, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'InvoiceNo',      header: 'Invoice No',             size: 130 },
    { accessorKey: 'InvoiceDate',    header: 'Invoice Date',           size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'SupplierName',   header: 'Supplier',               size: 220 },
    { accessorKey: 'NetAmount',      header: 'Net Amount',             size: 120, cell: ({ getValue }) => <span className="block text-right">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'EWayBillNumber', header: 'EWay Bill Number',       size: 150 },
    { accessorKey: 'EWayBillDate',   header: 'EWay Bill Date',         size: 130, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'CreatedBy',      header: 'Created By',             size: 120 },
    { accessorKey: 'CreatedDate',    header: 'Created Date',           size: 130, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'IsIntegrated',   header: 'Is Integrated',          size: 110, cell: ({ getValue }) => <span className="text-xs">{getValue() ? 'Yes' : ''}</span> },
    { accessorKey: 'FYear',          header: 'FYear',                  size: 100 },
    {
      id: 'actions',
      header: 'Actions',
      size: 110,
      enableSorting: false,
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); handleEditInvoice(invoice) }}
                    className="p-1 rounded transition-colors text-[rgb(var(--fg-default))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-subtle,var(--bg-subtle)))]"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Edit</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); alerts.showInfo('Print', `Printing ${invoice.VoucherNo}`) }}
                    className="p-1 rounded transition-colors text-[rgb(var(--fg-default))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-subtle,var(--bg-subtle)))]"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Print</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteInvoice(invoice) }}
                    className="p-1 rounded transition-colors text-[rgb(var(--fg-default))] hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ], [handleEditInvoice, handleDeleteInvoice, alerts])

  const selectedCount = selectedPendingItems.length

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col overflow-hidden py-3 px-3 sm:px-5 bg-[rgb(var(--bg-default))]"
    >
      {/* ── View toggle ── */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="inline-flex items-center self-center sm:self-auto justify-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))]">
          <button
            onClick={() => handleViewChange('pending')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
              viewMode === 'pending'
                ? 'bg-[rgb(var(--color-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <List className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Pending GRNs</span>
            {pendingGRNs.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                viewMode === 'pending'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {pendingGRNs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleViewChange('processed')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
              viewMode === 'processed'
                ? 'bg-[rgb(var(--color-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Processed Invoices</span>
            {processedInvoices.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                viewMode === 'processed'
                  ? 'bg-white/25 text-white'
                  : 'bg-[rgb(var(--bg-muted))] text-[rgb(var(--fg-muted))] border border-[rgb(var(--bd-default))]'
              )}>
                {processedInvoices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Hint / selection bar ── */}
      {viewMode === 'pending' && (
        <p className="text-[11px] text-[rgb(var(--fg-muted))] mb-2 text-center sm:text-left">
          {selectedCount > 0
            ? `${selectedCount} GRN${selectedCount !== 1 ? 's' : ''} selected — click the button below to create invoice`
            : 'Select one or more GRNs (same supplier & company) to create a Purchase Invoice'}
        </p>
      )}

      {/* ── DataGrid ── */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'pending' ? (
          <DataGrid
            key={pendingGridKey}
            data={pendingGRNs}
            columns={pendingColumns}
            getRowId={row => String(row.TransactionID)}
            enableRowSelection
            onRowSelect={handlePendingRowSelect}
            pageSize={20}
          />
        ) : (
          <DataGrid
            key={processedGridKey}
            data={processedInvoices}
            columns={processedColumns}
            getRowId={row => String(row.TransactionID)}
            enableRowSelection
            onRowSelect={handleProcessedRowSelect}
            pageSize={20}
          />
        )}
      </div>

      {/* ── Action bar (mobile + desktop) ── */}
      {viewMode === 'pending' && (
        <div className="mt-3 flex justify-center sm:justify-end">
          <button
            onClick={handleCreateInvoice}
            disabled={selectedCount === 0}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm',
              selectedCount > 0
                ? 'bg-[rgb(var(--color-primary))] text-white hover:opacity-90'
                : 'bg-[rgb(var(--bg-muted))] text-[rgb(var(--fg-muted))] cursor-not-allowed'
            )}
          >
            <Plus className="h-4 w-4" />
            Create Invoice
            {selectedCount > 0 && (
              <span className="ml-1 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[11px] font-bold">
                {selectedCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <PurchaseInvoiceModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          mode={modalMode}
          selectedGRNs={selectedPendingItems}
          selectedInvoice={editingInvoice}
        />
      )}
    </motion.div>
  )
}
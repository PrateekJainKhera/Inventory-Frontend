'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { DataGrid } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import { MOCK_GRN_QC_ITEMS, type GRNQCListItem, type QCStatus } from '@/data/mock/grnQCApproval'
import GRNQCApprovalModal from './GRNQCApprovalModal'

type Tab = { id: QCStatus; label: string }

const TABS: Tab[] = [
  { id: 'pending',   label: 'Pending Receipt Note QC'   },
  { id: 'processed', label: 'Processed Receipt Note QC' },
  { id: 'hold',      label: 'Hold Receipt Note QC'      },
  { id: 'rejected',  label: 'Rejected Receipt Note QC'  },
]

export default function GRNQCApprovalPage() {
  const [activeTab, setActiveTab] = useState<QCStatus>('pending')
  const [items, setItems] = useState<GRNQCListItem[]>([...MOCK_GRN_QC_ITEMS])
  const [gridKey, setGridKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GRNQCListItem | null>(null)

  const filtered = useMemo(() => items.filter(i => i.Status === activeTab), [items, activeTab])

  const handleRowClick = useCallback((row: GRNQCListItem) => {
    setSelectedItem(row)
    setModalOpen(true)
  }, [])

  const handleNext = useCallback(() => {
    const pending = items.filter(i => i.Status === 'pending')
    if (pending.length === 0) return
    setActiveTab('pending')
    setSelectedItem(pending[0])
    setModalOpen(true)
  }, [items])

  const handleModalClose = useCallback((shouldRefresh?: boolean) => {
    setModalOpen(false)
    setSelectedItem(null)
    if (shouldRefresh) {
      setItems([...MOCK_GRN_QC_ITEMS])
      setGridKey(k => k + 1)
    }
  }, [])

  // ── Common columns ──────────────────────────────────────────────────────────
  const baseColumns = useMemo((): ColumnDef<GRNQCListItem>[] => [
    { accessorKey: 'RefNo',           header: 'Ref. No.',          size: 70 },
    { accessorKey: 'ItemName',        header: 'Item Name',         size: 220 },
    ...(activeTab === 'pending' ? [{ accessorKey: 'ItemCode', header: 'Item Code', size: 100 } as ColumnDef<GRNQCListItem>] : []),
    { accessorKey: 'SupplierName',    header: 'Supplier Name',     size: 210 },
    { accessorKey: 'ReceiptNoteNo',   header: 'Receipt Note No.',  size: 140 },
    { accessorKey: 'ReceiptNoteDate', header: 'Receipt Note Date', size: 130, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'PONo',            header: 'P.O. No.',          size: 120 },
    { accessorKey: 'PODate',          header: 'P.O. Date',         size: 100, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'DNNo',            header: 'D.N. No.',          size: 90 },
    { accessorKey: 'DNDate',          header: 'D.N. Date',         size: 100, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'Transporter',     header: 'Transporter',       size: 130 },
    { accessorKey: 'ReceivedBy',      header: 'Received By',       size: 120 },
    { accessorKey: 'CreatedBy',       header: 'Created By',        size: 110 },
    ...(activeTab !== 'pending' ? [
      { accessorKey: 'ApprovedBy',   header: 'Approved By',   size: 110 } as ColumnDef<GRNQCListItem>,
      { accessorKey: 'ApprovalDate', header: 'Approval Date', size: 115, cell: ({ getValue }: any) => formatDate(getValue() as string) } as ColumnDef<GRNQCListItem>,
    ] : []),
    { accessorKey: 'Remark',          header: 'Remark',            size: 140 },
    ...(activeTab === 'rejected' ? [
      { accessorKey: 'RejectStockAction', header: 'Reject Stock Action', size: 150 } as ColumnDef<GRNQCListItem>,
    ] : []),
  ], [activeTab])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-hidden py-3 px-4 bg-[rgb(var(--bg-default))]"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-3 px-1">
        {/* Radio tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {TABS.map(tab => (
            <label key={tab.id} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="radio"
                name="qcTab"
                value={tab.id}
                checked={activeTab === tab.id}
                onChange={() => setActiveTab(tab.id)}
                className="accent-[#002852] w-3.5 h-3.5"
              />
              <span className={cn('text-xs', activeTab === tab.id ? 'font-semibold text-[rgb(var(--fg-default))]' : 'text-[rgb(var(--fg-muted))]')}>
                {tab.label}
              </span>
            </label>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={items.filter(i => i.Status === 'pending').length === 0}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-[#002852] text-white hover:bg-[#003a75] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={13} /> Next
        </button>
      </div>

      <DataGrid
        key={gridKey}
        className="flex-1 min-h-0"
        data={filtered}
        columns={baseColumns}
        onRowClick={handleRowClick}
        getRowId={row => String(row.id)}
        title={TABS.find(t => t.id === activeTab)?.label ?? ''}
        description={`${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
        enableVirtualization={false}
        enableColumnResizing
        enableFiltering
        enableExport
        pageSize={50}
        stickyHeader
      />

      <GRNQCApprovalModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        item={selectedItem}
      />
    </motion.div>
  )
}
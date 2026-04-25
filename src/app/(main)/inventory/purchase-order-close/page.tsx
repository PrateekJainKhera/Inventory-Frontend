'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { DataGrid } from '@/components/datagrid'
import { cn, formatDate } from '@/lib/utils'
import { MOCK_PO_CLOSE_LIST, type POCloseItem } from '@/data/mock/purchaseOrder'

type FilterType = 'Open' | 'Closed'

function POCloseContent() {
  const alerts = useGlobalAlert()
  const [filterType, setFilterType] = useState<FilterType>('Open')
  const [poList, setPoList] = useState<POCloseItem[]>([...MOCK_PO_CLOSE_LIST])
  const [selectedPOs, setSelectedPOs] = useState<POCloseItem[]>([])
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    return filterType === 'Open'
      ? poList.filter(p => !p.ManuallyClosed)
      : poList.filter(p => p.ManuallyClosed)
  }, [poList, filterType])

  const filterCounts = useMemo(() => ({
    Open:   poList.filter(p => !p.ManuallyClosed).length,
    Closed: poList.filter(p => p.ManuallyClosed).length,
  }), [poList])

  const handleFilterChange = (f: FilterType) => {
    setFilterType(f)
    setSelectedPOs([])
  }

  const handleRowSelect = useCallback((rows: POCloseItem[]) => {
    setSelectedPOs(rows)
  }, [])

  const handleUpdateStatus = () => {
    if (selectedPOs.length === 0) {
      alerts.showWarning('Warning', 'Please select at least one purchase order.')
      return
    }

    const action = filterType === 'Open' ? 'Close' : 'Re-Open'
    alerts.showConfirmation(
      'Confirm',
      `Are you sure you want to ${action.toLowerCase()} the selected ${selectedPOs.length} Purchase Order(s)?`,
      () => {
        setSaving(true)
        setTimeout(() => {
          const selectedIds = new Set(selectedPOs.map(p => p.PurchaseTransactionID))
          setPoList(prev => prev.map(p => {
            if (!selectedIds.has(p.PurchaseTransactionID)) return p
            if (filterType === 'Open') {
              return { ...p, ManuallyClosed: true, ClosedByUser: 'Admin', CompletedDate: new Date().toISOString().split('T')[0] }
            } else {
              return { ...p, ManuallyClosed: false, ClosedByUser: undefined, CompletedDate: undefined }
            }
          }))
          setSelectedPOs([])
          setSaving(false)
          alerts.showSuccess('Success', `Purchase Order(s) ${action.toLowerCase()}d successfully.`)
        }, 500)
      }
    )
  }

  const columns = useMemo((): ColumnDef<POCloseItem>[] => {
    const base: ColumnDef<POCloseItem>[] = [
      { accessorKey: 'VoucherNo',              header: 'P.O. No.',         size: 120 },
      { accessorKey: 'VoucherDate',            header: 'P.O. Date',        size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'LedgerName',             header: 'Supplier Name',    size: 180 },
      { accessorKey: 'ItemGroupName',          header: 'Item Type',        size: 100 },
      { accessorKey: 'ItemSubGroupName',       header: 'Sub Group',        size: 100 },
      { accessorKey: 'ItemCode',               header: 'Item Code',        size: 90  },
      { accessorKey: 'ItemName',               header: 'Item Name',        size: 220 },
      { accessorKey: 'PurchaseQuantity',       header: 'P.O. Qty',         size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
      { accessorKey: 'ReceiptQty',             header: 'Receipt Qty',      size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(3) },
      { accessorKey: 'PendingToReceiveQty',    header: 'Pending Qty',      size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(3) },
      { accessorKey: 'PurchaseUnit',           header: 'Purchase Unit',    size: 90  },
      { accessorKey: 'PurchaseDivision',       header: 'Division',         size: 100 },
      { accessorKey: 'PurchaseReferenceRemark',header: 'Purchase Ref.',    size: 110 },
      { accessorKey: 'Narration',              header: 'Remark',           size: 180 },
      { accessorKey: 'CreatedBy',              header: 'Created By',       size: 110 },
      { accessorKey: 'ApprovedBy',             header: 'Approved By',      size: 110 },
      { accessorKey: 'ProductionUnitName',     header: 'Production Unit',  size: 120 },
      { accessorKey: 'CompanyName',            header: 'Company',          size: 130 },
    ]

    if (filterType === 'Closed') {
      base.push(
        { accessorKey: 'ClosedByUser',   header: 'Closed By',   size: 100 },
        { accessorKey: 'CompletedDate',  header: 'Closed Date',  size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
      )
    }

    return base
  }, [filterType])

  const filterToggleButtons = (
    <div className="inline-flex items-center bg-[rgb(var(--bg-subtle))] rounded-full border border-[rgb(var(--bd-default))]">
      {([
        { key: 'Open'   as FilterType, icon: AlertCircle,   label: 'Open Purchase Orders'   },
        { key: 'Closed' as FilterType, icon: CheckCircle2,  label: 'Closed Purchase Orders' },
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
          Purchase Order Close
        </h1>
        <div className="flex-1" />
      </div>

      <DataGrid
        data={filtered}
        columns={columns}
        getRowId={(row) => `${row.PurchaseTransactionID}-${row.ItemID}`}
        preToggleActions={filterToggleButtons}
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
        paginationPageSize={50}
        paginationPageSizeOptions={[25, 50, 100, 200]}
        title="Purchase Orders"
      />

      {/* FAB */}
      <button
        onClick={handleUpdateStatus}
        disabled={selectedPOs.length === 0 || saving}
        title={filterType === 'Open' ? 'Close Purchase Orders' : 'Re-Open Purchase Orders'}
        className="fixed bottom-6 right-6 z-50 h-11 px-4 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
        <span>
          {filterType === 'Open'
            ? `Close PO${selectedPOs.length > 0 ? ` (${selectedPOs.length})` : ''}`
            : `Re-Open PO${selectedPOs.length > 0 ? ` (${selectedPOs.length})` : ''}`}
        </span>
      </button>
    </motion.div>
  )
}

export default function POClosePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    }>
      <POCloseContent />
    </Suspense>
  )
}
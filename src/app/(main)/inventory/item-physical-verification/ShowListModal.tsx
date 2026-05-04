'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Trash2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import type { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { formatDate } from '@/lib/utils'
import {
  MOCK_VERIFICATION_VOUCHERS,
  type VerificationVoucher,
} from '@/data/mock/itemPhysicalVerification'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ShowListModal({ isOpen, onClose }: Props) {
  const alerts = useGlobalAlert()
  const [vouchers, setVouchers] = useState<VerificationVoucher[]>([])
  const [selected, setSelected] = useState<VerificationVoucher[]>([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVouchers([...MOCK_VERIFICATION_VOUCHERS])
      setSelected([])
    }
  }, [isOpen])

  const handleDelete = useCallback(() => {
    if (selected.length === 0) {
      alerts.showWarning('Warning', 'Please select at least one record to delete.')
      return
    }
    const count = selected.length
    alerts.showConfirmation(
      'Are you sure?',
      `${count} physical verification record${count > 1 ? 's' : ''} will be deleted permanently.`,
      () => {
        setDeleting(true)
        const ids = new Set(selected.map(v => v.TransactionID))
        ids.forEach(id => {
          const idx = MOCK_VERIFICATION_VOUCHERS.findIndex(v => v.TransactionID === id)
          if (idx !== -1) MOCK_VERIFICATION_VOUCHERS.splice(idx, 1)
        })
        setVouchers([...MOCK_VERIFICATION_VOUCHERS])
        setSelected([])
        setDeleting(false)
        alerts.showSuccess('Deleted', `${count} record${count > 1 ? 's' : ''} deleted successfully.`)
      }
    )
  }, [selected, alerts])

  const columnVisibility = useMemo(() => ({ GRNNo: false, GRNDate: false, WtPerPacking: false, UnitPerPacking: false }), [])

  const columns = useMemo<ColumnDef<VerificationVoucher>[]>(() => [
    { accessorKey: 'VoucherNo',         header: 'Voucher No.',     size: 120 },
    { accessorKey: 'VoucherDate',        header: 'Voucher Date',    size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ItemGroupName',      header: 'Group',           size: 100 },
    { accessorKey: 'ItemSubGroupName',   header: 'Sub Group',       size: 100 },
    { accessorKey: 'ItemCode',           header: 'Item Code',       size: 80  },
    { accessorKey: 'ItemName',           header: 'Item Name',       size: 280 },
    { accessorKey: 'StockUnit',          header: 'Unit',            size: 60  },
    { accessorKey: 'OldStockQuantity',   header: 'Old Stock',       size: 90, cell: ({ getValue }) => <span className="block text-right">{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'NewStockQuantity',   header: 'New Stock',       size: 90, cell: ({ getValue }) => <span className="block text-right">{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'AdjustedStockQty',   header: 'Adjusted',        size: 90, cell: ({ getValue }) => { const v = Number(getValue()); return <span className={`block text-right font-medium ${v < 0 ? 'text-red-600' : v > 0 ? 'text-green-600' : ''}`}>{v.toFixed(2)}</span> } },
    { accessorKey: 'ClosingQty',         header: 'Closing',         size: 90, cell: ({ getValue }) => <span className="block text-right">{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'GRNNo',              header: 'Receipt No.',     size: 130 },
    { accessorKey: 'GRNDate',            header: 'Receipt Date',    size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'BatchNo',            header: 'Batch No.',       size: 160 },
    { accessorKey: 'Warehouse',          header: 'Warehouse',       size: 120 },
    { accessorKey: 'Bin',                header: 'Bin',             size: 100 },
    { accessorKey: 'Narration',          header: 'Remark',          size: 150 },
    { accessorKey: 'CreatedBy',          header: 'Created By',      size: 100 },
    { accessorKey: 'WtPerPacking',       header: 'Wt/Packing',      size: 100 },
    { accessorKey: 'UnitPerPacking',     header: 'Unit/Packing',    size: 100 },
    { accessorKey: 'ProductionUnitName', header: 'Production Unit', size: 130 },
    { accessorKey: 'CompanyName',        header: 'Company',         size: 140 },
  ], [])

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="!max-w-[100vw] sm:!max-w-[98vw] w-full h-[100dvh] sm:h-[90vh] p-0 overflow-hidden flex flex-col rounded-none sm:rounded-lg"
        style={{ maxHeight: '100dvh' }}
        hideCloseButton
        disableOutsideClick
      >
        <DialogHeader className="flex-shrink-0 px-4 py-2.5 border-b border-[rgb(var(--bd-default))] flex-row items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-[rgb(var(--fg-default))]">
            Physical Stock Verification — List
          </DialogTitle>
          <button onClick={onClose} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors">
            <X size={16} />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4">
          <DataGrid
            className="h-full"
            data={vouchers}
            columns={columns}
            onRowSelect={setSelected}
            getRowId={row => String(row.TransactionID)}
            enableFiltering
            enableColumnResizing
            enableVirtualization={false}
            rowSelectionMode="multi"
            pageSize={100}
            stickyHeader
            initialColumnVisibility={columnVisibility}
          />
        </div>

        <div className="flex-shrink-0 border-t border-[rgb(var(--bd-default))] px-4 py-2.5 flex items-center justify-between bg-[rgb(var(--bg-subtle))]">
          <span className="text-xs text-[rgb(var(--fg-muted))]">
            {selected.length > 0
              ? `${selected.length} record${selected.length > 1 ? 's' : ''} selected`
              : 'Select rows to delete'}
          </span>
          <button
            onClick={handleDelete}
            disabled={selected.length === 0 || deleting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={12} />
            {deleting ? 'Deleting...' : selected.length > 1 ? `Delete (${selected.length})` : 'Delete'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
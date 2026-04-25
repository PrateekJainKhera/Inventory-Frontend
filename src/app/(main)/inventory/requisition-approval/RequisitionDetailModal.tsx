'use client'

import React, { useMemo, useState } from 'react'
import { X, Check, XCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Button, Input, Label, Textarea,
} from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import { Footer } from '@/components/layout'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { formatDate } from '@/lib/utils'
import { MASTER_ITEMS, type RequisitionRecord } from '@/data/mock/purchaseRequisition'

interface Props {
  isOpen: boolean
  onClose: () => void
  requisition: RequisitionRecord | null
  filterType: 'unapproved' | 'approved' | 'cancelled'
  onAction: (transactionId: number, action: 'Approve' | 'UnApprove' | 'Cancel' | 'UnCancel') => void
}

interface ItemRow {
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  PurchaseQty: number
  PhysicalStock: number
  BookedStock: number
  StockUnit: string
  PurchaseUnit: string
  ExpectedDeliveryDate: string
  ItemNarration: string
  RefJobCardContentNo: string
  LastPurchaseDate: string
}

export default function RequisitionDetailModal({ isOpen, onClose, requisition, filterType, onAction }: Props) {
  const alerts = useGlobalAlert()
  const [saving, setSaving] = useState(false)

  const itemRows = useMemo((): ItemRow[] => {
    if (!requisition) return []
    const master = MASTER_ITEMS.find(m => m.ItemID === requisition.ItemID)
    return [{
      ItemCode: requisition.ItemCode,
      ItemGroupName: requisition.ItemGroupName,
      ItemSubGroupName: requisition.ItemSubGroupName,
      ItemName: requisition.ItemName,
      PurchaseQty: requisition.PurchaseQty,
      PhysicalStock: master?.PhysicalStock ?? 0,
      BookedStock: master?.BookedStock ?? 0,
      StockUnit: requisition.StockUnit,
      PurchaseUnit: master?.PurchaseUnit ?? requisition.StockUnit,
      ExpectedDeliveryDate: requisition.ExpectedDeliveryDate,
      ItemNarration: requisition.ItemNarration,
      RefJobCardContentNo: requisition.RefJobCardContentNo,
      LastPurchaseDate: master?.LastPurchaseDate ?? '',
    }]
  }, [requisition])

  const columns = useMemo((): ColumnDef<ItemRow>[] => [
    { accessorKey: 'ItemCode',             header: 'Item Code',      size: 80  },
    { accessorKey: 'ItemGroupName',        header: 'Item Group',     size: 100 },
    { accessorKey: 'ItemSubGroupName',     header: 'Sub Group',      size: 100 },
    { accessorKey: 'ItemName',             header: 'Item Name',      size: 250 },
    { accessorKey: 'PurchaseQty',          header: 'Purchase Qty',   size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'PhysicalStock',        header: 'Current Stock',  size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'BookedStock',          header: 'Booked Stock',   size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'StockUnit',            header: 'Stock Unit',     size: 80  },
    { accessorKey: 'PurchaseUnit',         header: 'Purchase Unit',  size: 80  },
    { accessorKey: 'ExpectedDeliveryDate', header: 'Expected Date',  size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ItemNarration',        header: 'Item Remark',    size: 150 },
    { accessorKey: 'RefJobCardContentNo',  header: 'Ref. J.C. No.',  size: 120 },
    { accessorKey: 'LastPurchaseDate',     header: 'Last P.O. Date', size: 120, cell: ({ getValue }) => formatDate(getValue() as string) },
  ], [])

  const primaryAction  = filterType === 'approved'  ? 'UnApprove' : 'Approve'
  const secondaryAction = filterType === 'cancelled' ? 'UnCancel'  : 'Cancel'
  const primaryLabel   = filterType === 'approved'  ? 'UnApprove' : 'Approve'
  const secondaryLabel  = filterType === 'cancelled' ? 'UnCancel'  : 'Cancel'

  const handleAction = (action: 'Approve' | 'UnApprove' | 'Cancel' | 'UnCancel') => {
    if (!requisition) return
    const messages: Record<string, string> = {
      Approve:   'Do you want to approve this requisition?',
      UnApprove: 'Do you want to un-approve this requisition?',
      Cancel:    'Do you want to cancel this requisition?',
      UnCancel:  'Do you want to un-cancel this requisition?',
    }
    alerts.showConfirmation('Confirm Action', messages[action], () => {
      setSaving(true)
      setTimeout(() => {
        setSaving(false)
        onAction(requisition.TransactionID, action)
      }, 400)
    })
  }

  if (!requisition) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="master"
        hideCloseButton
        disableOutsideClick
        className="p-0 flex flex-col overflow-hidden"
        aria-describedby="req-detail-desc"
      >
        <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))]">
          <div className="flex items-center justify-between">
            <DialogTitle>Purchase Requisition Details</DialogTitle>
            <span id="req-detail-desc" className="sr-only">View and action on this requisition</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
          {/* Header fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-[rgb(var(--fg-muted))]">Requisition No.</Label>
              <Input value={requisition.VoucherNo} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
            </div>
            <div>
              <Label className="text-xs text-[rgb(var(--fg-muted))]">Date</Label>
              <Input value={formatDate(requisition.VoucherDate)} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
            </div>
            <div>
              <Label className="text-xs text-[rgb(var(--fg-muted))]">Created By</Label>
              <Input value={requisition.CreatedBy} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
            </div>
            {requisition.ApprovedBy && (
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Approved By</Label>
                <Input value={requisition.ApprovedBy} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
            )}
          </div>

          {/* Items grid */}
          <DataGrid
            data={itemRows}
            columns={columns}
            getRowId={(row) => row.ItemCode}
            title="Requisition Items"
            enablePagination={false}
            enableSearch={false}
            enableFilterRow={false}
            enableRowSelection={false}
            enableSorting={false}
            enableExport={false}
            enableColumnVisibility={false}
            enableColumnResizing={true}
          />

          {/* Remark */}
          {requisition.Narration && (
            <div>
              <Label className="text-xs text-[rgb(var(--fg-muted))]">Remark</Label>
              <Textarea
                value={requisition.Narration}
                disabled
                className="h-20 bg-[rgb(var(--bg-subtle))] mt-1 resize-none"
              />
            </div>
          )}
        </div>

        <Footer
          variant="modal"
          padding="compact"
          className="border-t border-[rgb(var(--bd-default))]"
          actions={
            <>
              <Button
                variant="action-save"
                icon={Check}
                onClick={() => handleAction(primaryAction as any)}
                disabled={saving}
              >
                {saving ? 'Processing...' : primaryLabel}
              </Button>
              <Button
                variant="destructive"
                icon={XCircle}
                onClick={() => handleAction(secondaryAction as any)}
                disabled={saving}
              >
                {secondaryLabel}
              </Button>
            </>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
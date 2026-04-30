'use client'

import React, { useMemo, useState } from 'react'
import { X, Check, XCircle, Calendar } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Button, Input, Label, Textarea,
} from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import { Footer } from '@/components/layout'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { formatDate } from '@/lib/utils'
import {
  type POListView,
  type PurchaseOrderDetailItem,
  type PaymentTermsItem,
  type AdditionalChargesItem,
  type DeliveryScheduleItem,
  MOCK_PURCHASE_ORDERS,
  PO_SUPPLIERS,
  PO_CONTACT_PERSONS,
} from '@/data/mock/purchaseOrder'

interface Props {
  isOpen: boolean
  onClose: () => void
  order: POListView | null
  filterType: 'unapproved' | 'approved' | 'cancelled'
  onAction: (transactionId: number, action: 'Approve' | 'UnApprove' | 'Cancel' | 'UnCancel', remark?: string) => void
}

// Build a detail record from the summary (real app would fetch from API)
function buildDetailItems(transactionId: number): PurchaseOrderDetailItem[] {
  const po = MOCK_PURCHASE_ORDERS.find(p => p.TransactionID === transactionId)
  if (!po) return []
  return [{
    TransactionID: po.TransactionID,
    ItemID: po.ItemID ?? 0,
    ItemCode: po.ItemCode ?? '',
    ItemGroupName: po.ItemGroupName ?? '',
    ItemName: po.ItemName ?? '',
    RefJobCardContentNo: po.RefJobCardContentNo ?? '',
    RequiredQuantity: po.RequiredQuantity ?? 0,
    PurchaseQuantity: po.PurchaseQuantity ?? 0,
    StockUnit: po.StockUnit ?? '',
    PurchaseUnit: po.PurchaseUnit ?? '',
    PurchaseRate: po.PurchaseRate ?? 0,
    BasicAmount: po.BasicAmount,
    Disc: 0,
    AfterDisAmt: po.BasicAmount,
    TaxableAmount: po.TaxableAmount,
    TotalAmount: po.NetAmount,
    GSTTaxPercentage: po.GSTTaxPercentage ?? 18,
    CGSTTaxPercentage: po.CGSTTaxPercentage ?? 9,
    SGSTTaxPercentage: po.SGSTTaxPercentage ?? 9,
    IGSTTaxPercentage: po.IGSTTaxPercentage ?? 18,
    CGSTAmt: po.TotalTaxAmount / 2,
    SGSTAmt: po.TotalTaxAmount / 2,
    IGSTAmt: 0,
    HSNCode: po.HSNCode ?? '',
    ProductHSNName: po.ProductHSNName ?? '',
    ExpectedDeliveryDate: po.ExpectedDeliveryDate ?? '',
    Tolerance: 0,
    ItemNarration: po.ItemNarration ?? '',
  }]
}

function buildPaymentTerms(transactionId: number): PaymentTermsItem[] {
  const po = MOCK_PURCHASE_ORDERS.find(p => p.TransactionID === transactionId)
  if (!po?.TermsOfPayment) return []
  return [{ id: 1, TermsDescription: po.TermsOfPayment }]
}

export default function PODetailModal({ isOpen, onClose, order, filterType, onAction }: Props) {
  const alerts = useGlobalAlert()
  const [saving, setSaving] = useState(false)
  const [remarkOpen, setRemarkOpen] = useState(false)
  const [remarkText, setRemarkText] = useState('')
  const [pendingAction, setPendingAction] = useState<'Cancel' | 'UnCancel' | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleItem, setScheduleItem] = useState<PurchaseOrderDetailItem | null>(null)

  const po = useMemo(() => {
    if (!order) return null
    return MOCK_PURCHASE_ORDERS.find(p => p.TransactionID === order.TransactionID) ?? null
  }, [order])

  const detailItems = useMemo(() => order ? buildDetailItems(order.TransactionID) : [], [order])
  const paymentTerms = useMemo(() => order ? buildPaymentTerms(order.TransactionID) : [], [order])

  const supplierLabel = useMemo(() => {
    if (!po) return ''
    return PO_SUPPLIERS.find(s => s.label === po.LedgerName)?.label ?? po.LedgerName
  }, [po])

  const gstTotal = useMemo(() => detailItems.reduce((s, i) => s + (i.CGSTAmt ?? 0) + (i.SGSTAmt ?? 0) + (i.IGSTAmt ?? 0), 0), [detailItems])
  const netTotal = useMemo(() => detailItems.reduce((s, i) => s + (i.TotalAmount ?? 0), 0), [detailItems])
  const basicTotal = useMemo(() => detailItems.reduce((s, i) => s + i.BasicAmount, 0), [detailItems])

  const itemColumns = useMemo((): ColumnDef<PurchaseOrderDetailItem>[] => [
    { accessorKey: 'ItemCode',             header: 'Item Code',         size: 90  },
    { accessorKey: 'ItemGroupName',        header: 'Item Group',        size: 100 },
    { accessorKey: 'ItemName',             header: 'Item Name',         size: 220 },
    { accessorKey: 'RefJobCardContentNo',  header: 'Ref. J.C. No.',     size: 100 },
    { accessorKey: 'RequiredQuantity',     header: 'Req. Qty',          size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'PurchaseQuantity',     header: 'PO Qty',            size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'PurchaseUnit',         header: 'PO Unit',           size: 70  },
    { accessorKey: 'StockUnit',            header: 'Stock Unit',        size: 70  },
    { accessorKey: 'PurchaseRate',         header: 'Rate',              size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'BasicAmount',          header: 'Basic Amt',         size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'Disc',                 header: 'Disc %',            size: 70,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'AfterDisAmt',          header: 'After Disc',        size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'GSTTaxPercentage',     header: 'GST %',             size: 70,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'CGSTAmt',             header: 'CGST Amt',          size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'SGSTAmt',             header: 'SGST Amt',          size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'IGSTAmt',             header: 'IGST Amt',          size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'TotalAmount',          header: 'Total Amt',         size: 90,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'HSNCode',             header: 'HSN Code',          size: 90  },
    { accessorKey: 'ProductHSNName',       header: 'HSN Name',          size: 160 },
    { accessorKey: 'ExpectedDeliveryDate', header: 'Expected Date',     size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'Tolerance',            header: 'Tolerance %',       size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'ItemNarration',        header: 'Item Remark',       size: 150 },
    {
      id: 'schedule',
      header: 'Schedule',
      size: 80,
      cell: ({ row }) => (
        <button
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-[rgb(var(--bd-default))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-muted))] transition-colors"
          onClick={() => { setScheduleItem(row.original); setScheduleOpen(true) }}
        >
          <Calendar className="h-3 w-3" />
          View
        </button>
      ),
    },
  ], [])

  const paymentTermColumns = useMemo((): ColumnDef<PaymentTermsItem>[] => [
    { accessorKey: 'id',               header: '#',             size: 40 },
    { accessorKey: 'TermsDescription', header: 'Payment Terms', size: 300 },
  ], [])

  const chargesColumns = useMemo((): ColumnDef<AdditionalChargesItem>[] => [
    { accessorKey: 'LedgerName',   header: 'Charge',         size: 160 },
    { accessorKey: 'Percentage',   header: 'Percentage',     size: 80,  cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}%` },
    { accessorKey: 'Amount',       header: 'Amount',         size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
    { accessorKey: 'TaxType',      header: 'Tax Type',       size: 80  },
  ], [])

  const primaryAction  = filterType === 'approved'  ? 'UnApprove' : 'Approve'
  const primaryLabel   = filterType === 'approved'  ? 'UnApprove' : 'Approve'
  const secondaryAction = filterType === 'cancelled' ? 'UnCancel'  : 'Cancel'
  const secondaryLabel  = filterType === 'cancelled' ? 'UnCancel'  : 'Cancel'

  const executeAction = (action: 'Approve' | 'UnApprove' | 'Cancel' | 'UnCancel', remark?: string) => {
    if (!order) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      onAction(order.TransactionID, action, remark)
    }, 400)
  }

  const handlePrimary = () => {
    if (!order) return
    const messages: Record<string, string> = {
      Approve:   'Approve this Purchase Order?',
      UnApprove: 'Un-approve this Purchase Order?',
    }
    alerts.showConfirmation('Confirm', messages[primaryAction], () => executeAction(primaryAction as any))
  }

  const handleSecondary = () => {
    if (secondaryAction === 'Cancel') {
      setRemarkText('')
      setPendingAction('Cancel')
      setRemarkOpen(true)
    } else {
      alerts.showConfirmation('Confirm', 'Un-cancel this Purchase Order?', () => executeAction('UnCancel'))
    }
  }

  const submitRemark = () => {
    if (!remarkText.trim()) {
      alerts.showError('Validation', 'Remark is required for cancellation.')
      return
    }
    setRemarkOpen(false)
    executeAction('Cancel', remarkText.trim())
  }

  if (!order || !po) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          size="master"
          hideCloseButton
          disableOutsideClick
          className="p-0 flex flex-col overflow-hidden"
          aria-describedby="po-detail-desc"
        >
          <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Purchase Order Details</DialogTitle>
              <span id="po-detail-desc" className="sr-only">View and action on this purchase order</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">

            {/* Header fields — all read-only */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">PO No.</Label>
                <Input value={po.VoucherNo} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Date</Label>
                <Input value={formatDate(po.VoucherDate)} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Supplier</Label>
                <Input value={supplierLabel} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Contact Person</Label>
                <Input value={PO_CONTACT_PERSONS[0]?.label ?? ''} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Division</Label>
                <Input value={po.PurchaseDivision} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Currency</Label>
                <Input value={po.CurrencyCode} disabled className="bg-[rgb(var(--bg-subtle))] mt-1" />
              </div>
            </div>

            {/* Items DataGrid */}
            <DataGrid
              data={detailItems}
              columns={itemColumns}
              getRowId={(row) => String(row.ItemID)}
              title="Order Items"
              enablePagination={false}
              enableSearch={false}
              enableFilterRow={false}
              enableRowSelection={false}
              enableSorting={false}
              enableExport={false}
              enableColumnVisibility={false}
              enableColumnResizing={true}
            />

            {/* Basic Amount */}
            <div className="flex justify-end">
              <div className="w-56">
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Basic Amount</Label>
                <Input
                  value={basicTotal.toFixed(2)}
                  disabled
                  className="bg-[rgb(var(--bg-subtle))] mt-1 text-right font-semibold"
                />
              </div>
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-2">Payment Terms</p>
                  <DataGrid
                    data={paymentTerms}
                    columns={paymentTermColumns}
                    getRowId={(row) => String(row.id)}
                    enablePagination={false}
                    enableSearch={false}
                    enableFilterRow={false}
                    enableRowSelection={false}
                    enableSorting={false}
                    enableExport={false}
                    enableColumnVisibility={false}
                    enableColumnResizing={false}
                  />
                </div>

                <div>
                  <Label className="text-xs text-[rgb(var(--fg-muted))]">Dealer Name</Label>
                  <Input
                    value=""
                    disabled
                    placeholder="—"
                    className="bg-[rgb(var(--bg-subtle))] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[rgb(var(--fg-muted))]">Mode Of Transport</Label>
                  <Input
                    value={po.ModeOfTransport}
                    disabled
                    className="bg-[rgb(var(--bg-subtle))] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[rgb(var(--fg-muted))]">Delivery At</Label>
                  <Textarea
                    value={po.DeliveryAddress}
                    disabled
                    className="h-20 bg-[rgb(var(--bg-subtle))] mt-1 resize-none"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[rgb(var(--fg-muted))]">Purchase Reference</Label>
                  <Textarea
                    value={po.PurchaseReference}
                    disabled
                    className="h-16 bg-[rgb(var(--bg-subtle))] mt-1 resize-none"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-2">Additional Charges</p>
                  <DataGrid
                    data={[]}
                    columns={chargesColumns}
                    getRowId={(row) => String(row.id)}
                    enablePagination={false}
                    enableSearch={false}
                    enableFilterRow={false}
                    enableRowSelection={false}
                    enableSorting={false}
                    enableExport={false}
                    enableColumnVisibility={false}
                    enableColumnResizing={false}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-[rgb(var(--fg-muted))] w-40 text-right shrink-0">GST Amount</Label>
                    <Input
                      value={gstTotal.toFixed(2)}
                      disabled
                      className="bg-[rgb(var(--bg-subtle))] text-right"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-[rgb(var(--fg-muted))] w-40 text-right shrink-0">Other Charges</Label>
                    <Input
                      value="0.00"
                      disabled
                      className="bg-[rgb(var(--bg-subtle))] text-right"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs font-semibold text-[rgb(var(--fg-default))] w-40 text-right shrink-0">Net Amount</Label>
                    <Input
                      value={netTotal.toFixed(2)}
                      disabled
                      className="bg-[rgb(var(--bg-subtle))] text-right font-bold text-[rgb(var(--color-primary))]"
                    />
                  </div>
                </div>

                {po.Narration && (
                  <div>
                    <Label className="text-xs text-[rgb(var(--fg-muted))]">Narration</Label>
                    <Textarea
                      value={po.Narration}
                      disabled
                      className="h-16 bg-[rgb(var(--bg-subtle))] mt-1 resize-none"
                    />
                  </div>
                )}

                {po.CancelRemark && (
                  <div>
                    <Label className="text-xs text-[rgb(var(--fg-muted))]">Cancel Remark</Label>
                    <Textarea
                      value={po.CancelRemark}
                      disabled
                      className="h-16 bg-[rgb(var(--bg-subtle))] mt-1 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
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
                  onClick={handlePrimary}
                  disabled={saving}
                >
                  {saving ? 'Processing...' : primaryLabel}
                </Button>
                <Button
                  variant="destructive"
                  icon={XCircle}
                  onClick={handleSecondary}
                  disabled={saving}
                >
                  {secondaryLabel}
                </Button>
              </>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Cancel Remark Dialog */}
      <Dialog open={remarkOpen} onOpenChange={(open) => !open && setRemarkOpen(false)}>
        <DialogContent
          hideCloseButton
          disableOutsideClick
          className="p-0 flex flex-col overflow-hidden max-w-md"
          aria-describedby="remark-desc"
        >
          <DialogHeader className="px-5 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Cancel Remark</DialogTitle>
              <span id="remark-desc" className="sr-only">Enter reason for cancellation</span>
              <Button variant="ghost" size="sm" onClick={() => setRemarkOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-5 space-y-3">
            <Label className="text-sm text-[rgb(var(--fg-default))]">Reason for Cancellation <span className="text-red-500">*</span></Label>
            <Textarea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Enter reason..."
              className="h-28 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 px-5 pb-4">
            <Button variant="ghost" onClick={() => setRemarkOpen(false)}>Cancel</Button>
            <Button variant="action-save" onClick={submitRemark}>Confirm Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Schedule View Sub-modal */}
      <Dialog open={scheduleOpen} onOpenChange={(open) => !open && setScheduleOpen(false)}>
        <DialogContent
          hideCloseButton
          disableOutsideClick
          className="p-0 flex flex-col overflow-hidden max-w-lg"
          aria-describedby="schedule-view-desc"
        >
          <DialogHeader className="px-5 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Delivery Schedule — {scheduleItem?.ItemCode}</DialogTitle>
              <span id="schedule-view-desc" className="sr-only">Delivery schedule for item</span>
              <Button variant="ghost" size="sm" onClick={() => setScheduleOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-5">
            {scheduleItem?.ExpectedDeliveryDate ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-[rgb(var(--fg-muted))] border-b border-[rgb(var(--bd-default))] pb-2">
                  <span>Item Code</span><span>Quantity</span><span>Expected Date</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-[rgb(var(--fg-default))]">
                  <span>{scheduleItem.ItemCode}</span>
                  <span>{Number(scheduleItem.PurchaseQuantity).toFixed(2)} {scheduleItem.PurchaseUnit}</span>
                  <span>{formatDate(scheduleItem.ExpectedDeliveryDate)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[rgb(var(--fg-muted))] text-center py-6">No schedule defined for this item.</p>
            )}
          </div>
          <div className="flex justify-end px-5 pb-4">
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
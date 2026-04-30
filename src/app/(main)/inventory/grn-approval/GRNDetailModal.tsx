'use client'

import { useState, useEffect } from 'react'
import { X, Check, XCircle, Printer, FileText } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Button,
} from '@/components/ui'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { formatDate } from '@/lib/utils'
import {
  type GRNListItem,
  type GRNDetailItem,
  MOCK_GRN_DETAIL_ITEMS,
  MOCK_GRN_APPROVAL_LIST,
  MOCK_GRN_VOUCHERS,
} from '@/data/mock/grn'

interface Props {
  isOpen: boolean
  onClose: () => void
  grn: GRNListItem | null
  filterType: 'pending' | 'approved'
  onAction: (transactionId: number, action: 'Approve' | 'UnApprove') => void
}

export default function GRNDetailModal({ isOpen, onClose, grn, filterType, onAction }: Props) {
  const alerts = useGlobalAlert()
  const isPending = filterType === 'pending'

  const [items, setItems] = useState<GRNDetailItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !grn) return
    setItems((MOCK_GRN_DETAIL_ITEMS[grn.TransactionID] ?? []).map(r => ({ ...r })))
    setSaving(false)
  }, [isOpen, grn])

  function updateItem(idx: number, patch: Partial<GRNDetailItem>) {
    setItems(prev => prev.map((r, i) => {
      if (i !== idx) return r
      const merged = { ...r, ...patch }
      if ('ApprovedQuantity' in patch) merged.RejectedQuantity = Math.max(0, merged.ChallanQuantity - merged.ApprovedQuantity)
      if ('RejectedQuantity' in patch) merged.ApprovedQuantity = Math.max(0, merged.ChallanQuantity - merged.RejectedQuantity)
      return merged
    }))
  }

  function validate(): string | null {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.QCApprovalNO.trim()) return `Row ${i + 1} (${item.ItemName}): COA No. is required.`
      if (item.ApprovedQuantity <= 0 && item.RejectedQuantity <= 0)
        return `Row ${i + 1} (${item.ItemName}): Approved Qty or Rejected Qty must be > 0.`
    }
    return null
  }

  async function handleApprove() {
    const err = validate()
    if (err) { alerts.showError('Validation', err); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    if (grn) {
      const listIdx = MOCK_GRN_APPROVAL_LIST.findIndex(v => v.TransactionID === grn.TransactionID)
      if (listIdx !== -1) MOCK_GRN_APPROVAL_LIST[listIdx] = { ...MOCK_GRN_APPROVAL_LIST[listIdx], ApprovedBy: 'Admin', ApprovalDate: new Date().toISOString().slice(0, 10) }
      const vIdx = MOCK_GRN_VOUCHERS.findIndex(v => v.TransactionID === grn.TransactionID)
      if (vIdx !== -1) MOCK_GRN_VOUCHERS[vIdx].IsVoucherItemApproved = 1
      MOCK_GRN_DETAIL_ITEMS[grn.TransactionID] = items.map(i => ({ ...i, IsVoucherItemApproved: 1 }))
      onAction(grn.TransactionID, 'Approve')
    }
    setSaving(false)
    alerts.showSuccess('Success', 'GRN approved successfully.')
    onClose()
  }

  async function handleUnApprove() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    if (grn) {
      const listIdx = MOCK_GRN_APPROVAL_LIST.findIndex(v => v.TransactionID === grn.TransactionID)
      if (listIdx !== -1) MOCK_GRN_APPROVAL_LIST[listIdx] = { ...MOCK_GRN_APPROVAL_LIST[listIdx], ApprovedBy: null, ApprovalDate: null }
      const vIdx = MOCK_GRN_VOUCHERS.findIndex(v => v.TransactionID === grn.TransactionID)
      if (vIdx !== -1) MOCK_GRN_VOUCHERS[vIdx].IsVoucherItemApproved = 0
      if (MOCK_GRN_DETAIL_ITEMS[grn.TransactionID]) {
        MOCK_GRN_DETAIL_ITEMS[grn.TransactionID] = items.map(i => ({ ...i, IsVoucherItemApproved: 0, ApprovedQuantity: 0, RejectedQuantity: 0, QCApprovalNO: '', QCApprovedNarration: '' }))
      }
      onAction(grn.TransactionID, 'UnApprove')
    }
    setSaving(false)
    alerts.showSuccess('Success', 'GRN approval reversed.')
    onClose()
  }

  if (!grn) return null

  const voucher = MOCK_GRN_VOUCHERS.find(v => v.TransactionID === grn.TransactionID)

  const thCls = 'px-2 py-1.5 text-left text-[10px] font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide whitespace-nowrap border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]'
  const tdCls = 'px-2 py-1.5 text-xs text-[rgb(var(--fg-default))] border-b border-[rgb(var(--bd-default))] align-middle'
  const inputCls = 'w-full px-1.5 py-0.5 text-xs border rounded bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]'

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="!max-w-[100vw] sm:!max-w-[95vw] w-full h-[100dvh] sm:h-[90vh] p-0 overflow-hidden flex flex-col rounded-none sm:rounded-lg"
        style={{ maxHeight: '100dvh' }}
        hideCloseButton
        disableOutsideClick
      >
        {/* ── Title bar ── */}
        <DialogHeader className="flex-shrink-0 px-4 py-2.5 border-b border-[rgb(var(--bd-default))] flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-sm font-semibold text-[rgb(var(--fg-default))]">
              GRN QC Approval
            </DialogTitle>
            <span className="text-xs text-[rgb(var(--text-muted))] font-mono">{grn.ReceiptVoucherNo}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {isPending ? 'Pending QC' : 'Approved'}
            </span>
          </div>
          <button onClick={onClose} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors">
            <X size={16} />
          </button>
        </DialogHeader>

        {/* ── Header info strip ── */}
        <div className="flex-shrink-0 flex flex-wrap gap-x-6 gap-y-1 items-center px-4 py-2 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))] text-xs text-[rgb(var(--text-muted))]">
          <span>GRN Date: <strong className="text-[rgb(var(--fg-default))]">{formatDate(grn.ReceiptVoucherDate)}</strong></span>
          <span>Supplier: <strong className="text-[rgb(var(--fg-default))]">{grn.LedgerName}</strong></span>
          <span>P.O. No.: <strong className="text-[rgb(var(--fg-default))]">{grn.PurchaseVoucherNo}</strong></span>
          {voucher?.DeliveryNoteNo && <span>D.N. No.: <strong className="text-[rgb(var(--fg-default))]">{voucher.DeliveryNoteNo}</strong></span>}
          {voucher?.Transporter && <span>Transporter: <strong className="text-[rgb(var(--fg-default))]">{voucher.Transporter}</strong></span>}
          {voucher?.ReceiverName && <span>Received By: <strong className="text-[rgb(var(--fg-default))]">{voucher.ReceiverName}</strong></span>}
          {!isPending && grn.ApprovedBy && (
            <>
              <span className="text-green-700">Approved By: <strong>{grn.ApprovedBy}</strong></span>
              <span className="text-green-700">On: <strong>{formatDate(grn.ApprovalDate ?? '')}</strong></span>
            </>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-[rgb(var(--fg-default))]">
              Batch Details — QC Approval
              {isPending && (
                <span className="ml-2 text-[10px] font-normal text-[rgb(var(--text-muted))]">
                  Enter Approved Qty or Rejected Qty (the other auto-fills). COA No. is required per row.
                </span>
              )}
            </h3>
          </div>

          <div className="border border-[rgb(var(--bd-default))] rounded overflow-auto" style={{ minHeight: 200 }}>
            <table className="w-full border-collapse min-w-[1100px]">
              <thead>
                <tr>
                  <th className={`${thCls} text-center`}>#</th>
                  <th className={thCls}>P.O. No.</th>
                  <th className={thCls}>P.O. Date</th>
                  <th className={thCls}>Item Code</th>
                  <th className={thCls}>Item Group</th>
                  <th className={thCls}>Sub Group</th>
                  <th className={thCls}>Item Name</th>
                  <th className={`${thCls} text-right`}>P.O. Qty</th>
                  <th className={thCls}>P. Unit</th>
                  <th className={`${thCls} text-right`}>Challan Qty</th>
                  <th className={`${thCls} text-right`}>Approved Qty</th>
                  <th className={`${thCls} text-right`}>Rejected Qty</th>
                  <th className={thCls}>COA No. <span className="text-red-400">*</span></th>
                  <th className={thCls}>QC Remark</th>
                  <th className={thCls}>Batch No.</th>
                  <th className={thCls}>S. Unit</th>
                  <th className={thCls}>Warehouse</th>
                  <th className={thCls}>Bin</th>
                  <th className={`${thCls} text-right`}>Tol. %</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-xs text-[rgb(var(--text-muted))]">
                      No batch items found for this GRN
                    </td>
                  </tr>
                )}
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[rgb(var(--bg-subtle))] transition-colors">
                    <td className={`${tdCls} text-center text-[rgb(var(--text-muted))]`}>{idx + 1}</td>
                    <td className={tdCls}>{item.PurchaseVoucherNo}</td>
                    <td className={tdCls}>{formatDate(item.PurchaseVoucherDate)}</td>
                    <td className={tdCls}>{item.ItemCode}</td>
                    <td className={tdCls}>{item.ItemGroupName}</td>
                    <td className={tdCls}>{item.ItemSubGroupName}</td>
                    <td className={`${tdCls} max-w-[160px]`}>
                      <span className="block truncate" title={item.ItemName}>{item.ItemName}</span>
                    </td>
                    <td className={`${tdCls} text-right`}>{item.PurchaseOrderQuantity.toFixed(2)}</td>
                    <td className={tdCls}>{item.PurchaseUnit}</td>
                    <td className={`${tdCls} text-right font-semibold`}>{item.ChallanQuantity.toFixed(2)}</td>
                    {/* Approved Qty */}
                    <td className={tdCls}>
                      {isPending ? (
                        <input type="number" min={0} max={item.ChallanQuantity} step="0.01"
                          value={item.ApprovedQuantity || ''}
                          onChange={e => updateItem(idx, { ApprovedQuantity: Math.min(item.ChallanQuantity, Math.max(0, parseFloat(e.target.value) || 0)) })}
                          className={`${inputCls} w-24 text-right bg-green-50 border-green-200`} />
                      ) : (
                        <span className="block text-right font-medium text-green-700">{item.ApprovedQuantity.toFixed(2)}</span>
                      )}
                    </td>
                    {/* Rejected Qty */}
                    <td className={tdCls}>
                      {isPending ? (
                        <input type="number" min={0} max={item.ChallanQuantity} step="0.01"
                          value={item.RejectedQuantity || ''}
                          onChange={e => updateItem(idx, { RejectedQuantity: Math.min(item.ChallanQuantity, Math.max(0, parseFloat(e.target.value) || 0)) })}
                          className={`${inputCls} w-24 text-right bg-red-50 border-red-200`} />
                      ) : (
                        <span className="block text-right font-medium text-red-600">{item.RejectedQuantity.toFixed(2)}</span>
                      )}
                    </td>
                    {/* COA No. */}
                    <td className={tdCls}>
                      {isPending ? (
                        <input type="text" value={item.QCApprovalNO}
                          onChange={e => updateItem(idx, { QCApprovalNO: e.target.value })}
                          className={`${inputCls} w-28`} placeholder="COA-XXX" />
                      ) : (
                        <span className="font-mono text-[10px]">{item.QCApprovalNO}</span>
                      )}
                    </td>
                    {/* QC Remark */}
                    <td className={tdCls}>
                      {isPending ? (
                        <input type="text" value={item.QCApprovedNarration}
                          onChange={e => updateItem(idx, { QCApprovedNarration: e.target.value })}
                          className={`${inputCls} w-32`} placeholder="QC remark" />
                      ) : (
                        <span>{item.QCApprovedNarration}</span>
                      )}
                    </td>
                    <td className={`${tdCls} font-mono text-[10px] text-[rgb(var(--text-muted))] max-w-[120px]`}>
                      <span className="block truncate" title={item.BatchNo}>{item.BatchNo}</span>
                    </td>
                    <td className={tdCls}>{item.StockUnit}</td>
                    <td className={tdCls}>{item.Warehouse}</td>
                    <td className={tdCls}>{item.Bin}</td>
                    <td className={`${tdCls} text-right`}>{item.PurchaseTolerance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
              <Printer size={13} /> Print
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
              <FileText size={13} /> Transporter Slip
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={onClose}>Close</Button>
            {isPending ? (
              <Button size="sm" onClick={handleApprove} disabled={saving}
                className="text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                <Check size={13} />
                {saving ? 'Approving…' : 'Approve'}
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={handleUnApprove} disabled={saving} className="text-xs gap-1.5">
                <XCircle size={13} />
                {saving ? 'Reversing…' : 'Un-Approve'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
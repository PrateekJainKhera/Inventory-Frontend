'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Plus, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label, Textarea } from '@/components/ui'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { MOCK_QC_APPROVAL_LINES, MOCK_GRN_QC_ITEMS, type GRNQCListItem, type GRNQCApprovalLine } from '@/data/mock/grnQCApproval'
import { cn, formatDate } from '@/lib/utils'
import QCReportDataModal from './QCReportDataModal'

interface Props {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  item: GRNQCListItem | null
}

const thCls = 'px-2 py-2 text-[10px] font-semibold text-white uppercase tracking-wide text-left whitespace-nowrap bg-[#002852] border-r border-white/20 last:border-r-0 sticky top-0 z-10'
const tdCls = 'px-2 py-1.5 text-xs border-r border-[rgb(var(--border-default))] last:border-r-0 whitespace-nowrap'
const inputCls = 'h-7 text-xs border border-[rgb(var(--border-default))] rounded px-2 bg-[rgb(var(--bg-default))] focus:outline-none focus:ring-1 focus:ring-[#002852]'

export default function GRNQCApprovalModal({ isOpen, onClose, item }: Props) {
  const alerts = useGlobalAlert()

  const [lines, setLines] = useState<GRNQCApprovalLine[]>([])
  const [dnNo, setDnNo] = useState('')
  const [gateEntryNo, setGateEntryNo] = useState('')
  const [lrVehicleNo, setLrVehicleNo] = useState('')
  const [transporter, setTransporter] = useState('')
  const [remark, setRemark] = useState('')

  // Reinitialize all fields whenever the modal opens with a new item
  useEffect(() => {
    if (isOpen && item) {
      setLines([...(MOCK_QC_APPROVAL_LINES[item.ReceiptNoteNo] ?? [])])
      setDnNo(item.DNNo ?? '')
      setTransporter(item.Transporter ?? '')
      setRemark(item.Remark ?? '')
      setGateEntryNo('')
      setLrVehicleNo('')
      setQcModalOpen(false)
      setActiveLine(null)
    }
  }, [isOpen, item])

  const [qcModalOpen, setQcModalOpen] = useState(false)
  const [activeLine, setActiveLine] = useState<GRNQCApprovalLine | null>(null)

  const updateLine = useCallback((id: number, field: keyof GRNQCApprovalLine, val: string | number) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l))
  }, [])

  const openQC = (line: GRNQCApprovalLine) => {
    setActiveLine(line)
    setQcModalOpen(true)
  }

  const handleQCClose = (qcNo?: string) => {
    setQcModalOpen(false)
    if (qcNo && activeLine) {
      setLines(prev => prev.map(l => l.id === activeLine.id ? { ...l, RMQCNo: qcNo } : l))
    }
    setActiveLine(null)
  }

  const handleSave = () => {
    for (const l of lines) {
      const total = l.ApprQty + l.HoldQty + l.RejectQty
      if (total !== l.ReceiptQty) {
        alerts.showError('Validation', `${l.ItemName}: Appr + Hold + Reject qty (${total}) must equal Receipt Qty (${l.ReceiptQty}).`)
        return
      }
    }
    // mark as processed in mock data
    const receiptNo = item?.ReceiptNoteNo
    if (receiptNo) {
      MOCK_GRN_QC_ITEMS.forEach(i => {
        if (i.ReceiptNoteNo === receiptNo) {
          i.Status = 'processed'
          i.ApprovedBy = 'Admin'
          i.ApprovalDate = new Date().toISOString().slice(0, 10)
        }
      })
    }
    alerts.showSuccess('Saved', 'QC Approval saved successfully.')
    onClose(true)
  }

  const handleDelete = () => {
    alerts.showConfirmation('Delete', 'Delete this QC approval record?', () => {
      alerts.showSuccess('Deleted', 'Record deleted.')
      onClose(true)
    })
  }

  if (!item) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
        <DialogContent
          className="!max-w-[100vw] sm:!max-w-[98vw] w-full h-[100dvh] sm:h-[96vh] p-0 overflow-hidden flex flex-col rounded-none sm:rounded-lg"
          style={{ maxHeight: '100dvh' }}
          hideCloseButton
          disableOutsideClick
        >
          {/* Title bar */}
          <DialogHeader className="flex-shrink-0 px-4 py-2.5 border-b border-[rgb(var(--bd-default))] flex-row items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-[rgb(var(--fg-default))]">
              Purchase GRN Approval
            </DialogTitle>
            <button onClick={() => onClose()} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors">
              <X size={16} />
            </button>
          </DialogHeader>

          {/* Info strip */}
          <div className="flex-shrink-0 flex items-end gap-3 flex-wrap px-4 py-2.5 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Receipt No.</Label>
              <Input className="h-8 text-xs w-44 bg-[rgb(var(--bg-surface))]" value={item.ReceiptNoteNo} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Receipt Date</Label>
              <Input className="h-8 text-xs w-32 bg-[rgb(var(--bg-surface))]" value={formatDate(item.ReceiptNoteDate)} readOnly />
            </div>
            <div className="space-y-1 flex-1 min-w-[180px] max-w-sm">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Supplier Name</Label>
              <Input className="h-8 text-xs bg-[rgb(var(--bg-surface))]" value={item.SupplierName} readOnly />
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-4">

            {/* Lines grid */}
            <div className="border border-[rgb(var(--border-default))] rounded overflow-auto" style={{ maxHeight: 300 }}>
              <table className="border-collapse" style={{ minWidth: 1400 }}>
                <thead>
                  <tr>
                    <th className={thCls} style={{ minWidth: 120 }}>P.O. No.</th>
                    <th className={thCls} style={{ minWidth: 95 }}>P.O. Date</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Item Code</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Item Group</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Sub Group</th>
                    <th className={thCls} style={{ minWidth: 200 }}>Item Name</th>
                    <th className={thCls} style={{ minWidth: 70 }}>P.O. Qty</th>
                    <th className={thCls} style={{ minWidth: 90 }}>Purchase Unit</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Receipt Qty</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Appr. Qty</th>
                    <th className={thCls} style={{ minWidth: 75 }}>Hold Qty</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Reject Qty</th>
                    <th className={thCls} style={{ minWidth: 90 }}>Add QC Detail</th>
                    <th className={thCls} style={{ minWidth: 110 }}>RM QC No.</th>
                    <th className={thCls} style={{ minWidth: 90 }}>COA No.</th>
                    <th className={thCls} style={{ minWidth: 120 }}>Remark</th>
                    <th className={thCls} style={{ minWidth: 160 }}>Batch No</th>
                    <th className={thCls} style={{ minWidth: 130 }}>Supplier Batch No</th>
                    <th className={thCls} style={{ minWidth: 80 }}>Stock Unit</th>
                    <th className={thCls} style={{ minWidth: 110 }}>Warehouse</th>
                    <th className={thCls} style={{ minWidth: 90 }}>Bin</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, ri) => (
                    <tr key={l.id} className={cn('border-b border-[rgb(var(--border-default))]', ri % 2 === 0 ? 'bg-[rgb(var(--bg-default))]' : 'bg-[rgb(var(--bg-subtle))]')}>
                      <td className={tdCls}>{l.PONo}</td>
                      <td className={tdCls}>{formatDate(l.PODate)}</td>
                      <td className={tdCls}>{l.ItemCode}</td>
                      <td className={tdCls}>{l.ItemGroup}</td>
                      <td className={tdCls}>{l.SubGroup || '-'}</td>
                      <td className={tdCls} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.ItemName}>{l.ItemName}</td>
                      <td className={tdCls + ' text-right'}>{l.POQty}</td>
                      <td className={tdCls}>{l.PurchaseUnit}</td>
                      <td className={tdCls + ' text-right font-medium'}>{l.ReceiptQty}</td>
                      <td className={tdCls}>
                        <input className={cn(inputCls, 'w-16 text-right')} type="number" min={0} value={l.ApprQty} onChange={e => updateLine(l.id, 'ApprQty', Number(e.target.value))} />
                      </td>
                      <td className={tdCls}>
                        <input className={cn(inputCls, 'w-16 text-right')} type="number" min={0} value={l.HoldQty} onChange={e => updateLine(l.id, 'HoldQty', Number(e.target.value))} />
                      </td>
                      <td className={tdCls}>
                        <input className={cn(inputCls, 'w-16 text-right')} type="number" min={0} value={l.RejectQty} onChange={e => updateLine(l.id, 'RejectQty', Number(e.target.value))} />
                      </td>
                      <td className={tdCls + ' text-center'}>
                        <button onClick={() => openQC(l)} className="w-6 h-6 rounded bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors mx-auto">
                          <Plus size={12} />
                        </button>
                      </td>
                      <td className={tdCls}>
                        <span className="text-xs font-mono text-[rgb(var(--fg-default))]">{l.RMQCNo || '-'}</span>
                      </td>
                      <td className={tdCls}>
                        <input className={cn(inputCls, 'w-20')} value={l.COANo} onChange={e => updateLine(l.id, 'COANo', e.target.value)} />
                      </td>
                      <td className={tdCls}>
                        <input className={cn(inputCls, 'w-24')} value={l.Remark} onChange={e => updateLine(l.id, 'Remark', e.target.value)} />
                      </td>
                      <td className={tdCls}>
                        <span className="text-xs text-[rgb(var(--fg-muted))] truncate block" style={{ maxWidth: 155 }} title={l.BatchNo}>{l.BatchNo}</span>
                      </td>
                      <td className={tdCls}>
                        <input className={cn(inputCls, 'w-28')} value={l.SupplierBatchNo} onChange={e => updateLine(l.id, 'SupplierBatchNo', e.target.value)} />
                      </td>
                      <td className={tdCls}>{l.StockUnit}</td>
                      <td className={tdCls}>{l.Warehouse}</td>
                      <td className={tdCls}>{l.Bin}</td>
                    </tr>
                  ))}
                  {lines.length === 0 && (
                    <tr><td colSpan={21} className="py-8 text-center text-xs text-[rgb(var(--fg-muted))]">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[rgb(var(--text-muted))]">D.N. No. / Invoice No.</Label>
                <Input className="h-8 text-xs" value={dnNo} onChange={e => setDnNo(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgb(var(--text-muted))]">D.N. No. / Invoice Date</Label>
                <Input className="h-8 text-xs" value={item.DNDate} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgb(var(--text-muted))]">Gate Entry No.</Label>
                <Input className="h-8 text-xs" placeholder="Gate Entry No." value={gateEntryNo} onChange={e => setGateEntryNo(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgb(var(--text-muted))]">L.R. No. / Vehicle No.</Label>
                <Input className="h-8 text-xs" placeholder="Vehicle No." value={lrVehicleNo} onChange={e => setLrVehicleNo(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgb(var(--text-muted))]">Transporter</Label>
                <Input className="h-8 text-xs" placeholder="Transporter Name" value={transporter} onChange={e => setTransporter(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgb(var(--text-muted))]">Received By</Label>
                <Input className="h-8 text-xs" value={item.ReceivedBy} readOnly />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Remark</Label>
              <Textarea className="text-xs min-h-[56px] resize-none" placeholder="Remark" value={remark} onChange={e => setRemark(e.target.value)} />
            </div>

          </div>

          {/* Footer actions */}
          <div className="flex-shrink-0 border-t border-[rgb(var(--bd-default))] px-4 py-2.5 flex items-center justify-end gap-2 bg-[rgb(var(--bg-subtle))]">
            <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 transition-colors">Save</button>
            <button onClick={handleDelete} className="px-4 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
            <button className="px-4 py-1.5 text-xs font-semibold rounded bg-[#002852] text-white hover:bg-[#003a75] transition-colors flex items-center gap-1.5"><Printer size={12} />Print</button>
            <button className="px-4 py-1.5 text-xs font-semibold rounded border border-[rgb(var(--border-default))] text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bg-subtle))] transition-colors">Transporter Slip</button>
          </div>
        </DialogContent>
      </Dialog>

      <QCReportDataModal
        isOpen={qcModalOpen}
        onClose={handleQCClose}
        line={activeLine}
        receiptNo={item.ReceiptNoteNo}
        receiptDate={formatDate(item.ReceiptNoteDate)}
      />
    </>
  )
}
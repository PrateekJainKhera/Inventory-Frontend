'use client'

import { useState, useMemo } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label } from '@/components/ui'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { makeQCParameters, type QCParameterRow, type GRNQCApprovalLine } from '@/data/mock/grnQCApproval'
import { cn } from '@/lib/utils'

interface Props {
  isOpen: boolean
  onClose: (qcNo?: string) => void
  line: GRNQCApprovalLine | null
  receiptNo: string
  receiptDate: string
}

const thCls = 'px-2 py-2 text-[10px] font-semibold text-white uppercase tracking-wide text-left whitespace-nowrap bg-[#002852] border-r border-white/20 last:border-r-0'
const tdCls = 'px-2 py-1.5 text-xs border-r border-[rgb(var(--border-default))] last:border-r-0 whitespace-nowrap'
const inputCls = 'h-7 text-xs border border-[rgb(var(--border-default))] rounded px-2 bg-[rgb(var(--bg-default))] focus:outline-none focus:ring-1 focus:ring-[#002852] w-full'

let _qcSeq = 128

export default function QCReportDataModal({ isOpen, onClose, line, receiptNo, receiptDate }: Props) {
  const alerts = useGlobalAlert()
  const [noOfSamples, setNoOfSamples] = useState(3)
  const [supplierBatchNo, setSupplierBatchNo] = useState('')
  const [sampleSize, setSampleSize] = useState('0')
  const [coaNo, setCoaNo] = useState('')
  const [inspectionQty, setInspectionQty] = useState(String(line?.ReceiptQty ?? 0))
  const [rows, setRows] = useState<QCParameterRow[]>(() => makeQCParameters(3))

  const voucherNo = useMemo(() => {
    const yr = new Date().getFullYear().toString().slice(2)
    return `QC${String(_qcSeq).padStart(5, '0')}_${yr}_${String(Number(yr) + 1)}`
  }, [])

  const sampleKeys = useMemo(
    () => Array.from({ length: noOfSamples }, (_, i) => `s${i + 1}`),
    [noOfSamples]
  )

  const addSample = () => {
    if (noOfSamples >= 20) return
    const key = `s${noOfSamples + 1}`
    setNoOfSamples(n => n + 1)
    setRows(prev => prev.map(r => ({ ...r, samples: { ...r.samples, [key]: '' } })))
  }

  const removeSample = () => {
    if (noOfSamples <= 1) return
    const key = `s${noOfSamples}`
    setNoOfSamples(n => n - 1)
    setRows(prev => prev.map(r => {
      const { [key]: _, ...rest } = r.samples
      return { ...r, samples: rest }
    }))
  }

  const updateSample = (rowId: number, key: string, val: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r
      const updated = { ...r, samples: { ...r.samples, [key]: val } }
      // recalculate average from numeric samples
      const nums = sampleKeys.map(k => Number(updated.samples[k])).filter(n => !isNaN(n) && updated.samples[sampleKeys[sampleKeys.indexOf(key)] ?? key] !== '')
      const validNums = sampleKeys.map(k => updated.samples[k]).filter(v => v !== '' && !isNaN(Number(v))).map(Number)
      updated.AverageValue = validNums.length > 0 ? (validNums.reduce((a, b) => a + b, 0) / validNums.length).toFixed(2) : ''
      return updated
    }))
  }

  const updateRow = (rowId: number, field: keyof QCParameterRow, val: string) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: val } : r))
  }

  const handleSave = () => {
    _qcSeq++
    alerts.showSuccess('QC Report Saved', `QC No: ${voucherNo}`)
    onClose(voucherNo)
  }

  if (!line) return null

  return (
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
            QC Report Data
          </DialogTitle>
          <button onClick={() => onClose()} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors">
            <X size={16} />
          </button>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-4">

          {/* Header fields row 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Voucher No. <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={voucherNo} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Voucher Date</Label>
              <Input className="h-8 text-xs" value={receiptDate} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Item Code <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={line.ItemCode} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Item Name <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={line.ItemName} readOnly />
            </div>
          </div>

          {/* Header fields row 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Receipt Qty <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={line.ReceiptQty} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Batch No.</Label>
              <Input className="h-8 text-xs" value={line.BatchNo} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Supplier Batch No. <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={supplierBatchNo} onChange={e => setSupplierBatchNo(e.target.value)} placeholder="Enter Supplier Batch No." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Inspection Qty <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={inspectionQty} onChange={e => setInspectionQty(e.target.value)} />
            </div>
          </div>

          {/* Header fields row 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Item Group Name <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={line.ItemGroup} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Item Sub Group Name <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={line.SubGroup} onChange={() => {}} placeholder="Enter Item Sub Group Name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Sample Size <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={sampleSize} onChange={e => setSampleSize(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">No. of Samples <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-2">
                <span className="h-8 flex items-center justify-center px-3 text-sm font-semibold text-[rgb(var(--fg-default))] border border-[rgb(var(--border-default))] rounded bg-[rgb(var(--bg-subtle))] min-w-[40px]">
                  {noOfSamples}
                </span>
                <button onClick={removeSample} disabled={noOfSamples <= 1} className="h-8 w-8 rounded bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-40">
                  <Minus size={13} />
                </button>
                <button onClick={addSample} disabled={noOfSamples >= 20} className="h-8 w-8 rounded bg-green-600 text-white flex items-center justify-center hover:bg-green-700 disabled:opacity-40">
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* COA No */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">COA No. <span className="text-red-500">*</span></Label>
              <Input className="h-8 text-xs" value={coaNo} onChange={e => setCoaNo(e.target.value)} placeholder="Enter COA No." />
            </div>
          </div>

          {/* Parameters table */}
          <div className="border border-[rgb(var(--border-default))] rounded overflow-auto">
            <table className="border-collapse" style={{ minWidth: 900 + noOfSamples * 80 }}>
              <thead>
                <tr>
                  <th className={thCls} style={{ minWidth: 140 }}>Characteristics</th>
                  <th className={thCls} style={{ minWidth: 160 }}>Method of Inspection</th>
                  <th className={thCls} style={{ minWidth: 50 }}>UOM</th>
                  <th className={thCls} style={{ minWidth: 150 }}>Measuring Equipment</th>
                  <th className={thCls} style={{ minWidth: 100 }}>Standard Value</th>
                  <th className={thCls} style={{ minWidth: 110 }}>Acceptance Criteria</th>
                  {sampleKeys.map((k, i) => (
                    <th key={k} className={thCls} style={{ minWidth: 70 }}>Sample {i + 1}</th>
                  ))}
                  <th className={thCls} style={{ minWidth: 90 }}>Avg. Value</th>
                  <th className={thCls} style={{ minWidth: 110 }}>Acceptance Status</th>
                  <th className={thCls} style={{ minWidth: 120 }}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.id} className={cn('border-b border-[rgb(var(--border-default))]', ri % 2 === 0 ? 'bg-[rgb(var(--bg-default))]' : 'bg-[rgb(var(--bg-subtle))]')}>
                    <td className={tdCls}>{row.Characteristics}</td>
                    <td className={tdCls}>{row.MethodOfInspection}</td>
                    <td className={tdCls}>{row.UOM}</td>
                    <td className={tdCls}>{row.MeasuringEquipment}</td>
                    <td className={tdCls}>{row.StandardValue}</td>
                    <td className={tdCls}>{row.AcceptanceCriteria}</td>
                    {sampleKeys.map(k => (
                      <td key={k} className={tdCls}>
                        <input
                          className={inputCls}
                          value={row.samples[k] ?? ''}
                          onChange={e => updateSample(row.id, k, e.target.value)}
                          style={{ width: 62 }}
                        />
                      </td>
                    ))}
                    <td className={tdCls}>
                      <span className="text-xs font-medium">{row.AverageValue}</span>
                    </td>
                    <td className={tdCls}>
                      <select
                        className={cn(inputCls, 'w-24')}
                        value={row.AcceptanceStatus}
                        onChange={e => updateRow(row.id, 'AcceptanceStatus', e.target.value)}
                      >
                        <option value="">-</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className={tdCls}>
                      <input
                        className={cn(inputCls, 'w-28')}
                        value={row.Remark}
                        onChange={e => updateRow(row.id, 'Remark', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[rgb(var(--bd-default))] px-4 py-2.5 flex items-center justify-end gap-2 bg-[rgb(var(--bg-subtle))]">
          <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 transition-colors">Save</button>
          <button className="px-4 py-1.5 text-xs font-semibold rounded bg-[#002852] text-white hover:bg-[#003a75] transition-colors">Print</button>
          <button onClick={() => setRows(makeQCParameters(noOfSamples))} className="px-4 py-1.5 text-xs font-semibold rounded bg-slate-500 text-white hover:bg-slate-600 transition-colors">New</button>
          <button className="px-4 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
          <button onClick={() => onClose()} className="px-4 py-1.5 text-xs font-semibold rounded border border-[rgb(var(--border-default))] text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bg-subtle))] transition-colors">Close</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
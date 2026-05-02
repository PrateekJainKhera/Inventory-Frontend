'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Trash2, MapPin, ChevronUp, ChevronDown, Printer, FileText, Save } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Button, Input, Label, Textarea, Dropdown,
} from '@/components/ui'
import { DatePicker } from '@/components/ui'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import {
  type PendingPOItem,
  type GRNVoucher,
  type GRNBatchDetail,
  GRN_RECEIVERS,
  MOCK_GRN_BATCH_DETAILS,
  MOCK_GRN_VOUCHERS,
  genReceiptNo,
} from '@/data/mock/grn'
import { PO_DIVISIONS } from '@/data/mock/purchaseOrder'
import SelectWarehouseModal from './SelectWarehouseModal'
import SelectGateEntryModal, { type GateEntryItem } from './SelectGateEntryModal'

interface Props {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  selectedOrders: PendingPOItem[]
  editingReceipt: GRNVoucher | null
}

const TODAY = new Date()
const GRID_MIN = 180
const GRID_MAX = 520
const GRID_STEP = 80

function asDate(val: Date | string | { from?: Date; to?: Date } | undefined): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'string' && val) return new Date(val)
  return null
}

function calcSUFromPU(b: GRNBatchDetail, pu: number): number {
  const upp = Number(b.UnitPerPacking)
  if (b.ItemGroupID === 13 || (b.PurchaseUnit === 'MTR' && b.StockUnit === 'SQM')) {
    return b.SizeW && b.SizeW > 0 ? (pu * b.SizeW) / 1000 : pu
  }
  if (b.ItemGroupNameID === -1) {
    return b.ConversionFactor > 0 && upp > 0 ? (pu * b.ConversionFactor) / upp : pu
  }
  if (b.ItemGroupNameID === -6) {
    return b.SizeW && b.SizeW > 0 ? (pu * b.SizeW) / 1000 : pu
  }
  return pu
}

function calcPUFromSU(b: GRNBatchDetail, su: number): number {
  const upp = Number(b.UnitPerPacking)
  if (b.ItemGroupID === 13 || (b.PurchaseUnit === 'MTR' && b.StockUnit === 'SQM')) {
    return b.SizeW && b.SizeW > 0 ? (su * 1000) / b.SizeW : su
  }
  if (b.ItemGroupNameID === -1) {
    return b.ConversionFactor > 0 && upp > 0 ? (su * upp) / b.ConversionFactor : su
  }
  if (b.ItemGroupNameID === -6) {
    return b.SizeW && b.SizeW > 0 ? (su * 1000) / b.SizeW : su
  }
  return su
}

function makeBatchRow(po: PendingPOItem, seq: number): GRNBatchDetail {
  return {
    TransactionID: 0,
    PurchaseTransactionID: po.TransactionID,
    BatchNo: `_${po.PurchaseVoucherNo}_${po.ItemID}_${seq}`,
    SupplierBatchNo: '',
    LedgerID: po.LedgerID,
    ItemID: po.ItemID,
    ItemGroupID: po.ItemGroupID,
    ItemSubGroupID: po.ItemSubGroupID,
    ItemCode: po.ItemCode,
    ItemName: po.ItemName,
    ItemSubGroupName: po.ItemSubGroupName,
    PurchaseVoucherNo: po.PurchaseVoucherNo,
    PurchaseVoucherDate: po.PurchaseVoucherDate,
    PurchaseOrderQuantity: po.PurchaseOrderQuantity,
    PurchaseUnit: po.PurchaseUnit,
    StockUnit: po.StockUnit,
    PurchaseTolerance: po.PurchaseTolerance,
    ConversionFactor: po.ConversionFactor,
    WtPerPacking: po.WtPerPacking,
    ReceiptWtPerPacking: po.WtPerPacking,
    UnitPerPacking: po.UnitPerPacking,
    RefJobCardContentNo: po.RefJobCardContentNo,
    PendingQty: po.PendingQty,
    ReceiptQuantity: 0,
    ReceiptQuantityInPurchaseUnit: 0,
    ChallanQuantity: 0,
    MfgDate: null,
    ExpiryDate: null,
    WarehouseID: 0,
    Warehouse: '',
    Bin: '',
    WarehouseBin: '',
    Remark: po.Remark,
  }
}

export default function PurchaseGRNModal({ isOpen, onClose, selectedOrders, editingReceipt }: Props) {
  const alerts = useGlobalAlert()
  const isEdit = Boolean(editingReceipt)
  const isViewOnly = isEdit && Boolean(editingReceipt?.IsVoucherItemApproved)
  const grnNo = useRef(editingReceipt?.ReceiptVoucherNo ?? genReceiptNo())

  const [grnDate, setGrnDate] = useState<Date>(TODAY)
  const [purchaseDivision, setPurchaseDivision] = useState('')
  const [dnNo, setDnNo] = useState('')
  const [dnDate, setDnDate] = useState<Date | null>(null)
  const [ewayBillNo, setEwayBillNo] = useState('')
  const [ewayBillDate, setEwayBillDate] = useState<Date | null>(null)
  const [gateEntryNo, setGateEntryNo] = useState('')
  const [gateEntryDate, setGateEntryDate] = useState<Date | null>(null)
  const [lrNoVehicleNo, setLrNoVehicleNo] = useState('')
  const [transporter, setTransporter] = useState('')
  const [biltyNo, setBiltyNo] = useState('')
  const [biltyDate, setBiltyDate] = useState<Date | null>(null)
  const [receivedBy, setReceivedBy] = useState('')
  const [narration, setNarration] = useState('')

  const [poLines, setPoLines] = useState<PendingPOItem[]>([])
  const [batchDetails, setBatchDetails] = useState<GRNBatchDetail[]>([])
  const [batchGridHeight, setBatchGridHeight] = useState(240)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [warehouseModalIdx, setWarehouseModalIdx] = useState<number | null>(null)
  const [gateEntryModalOpen, setGateEntryModalOpen] = useState(false)

  const supplierName = isEdit ? (editingReceipt?.LedgerName ?? '') : (selectedOrders[0]?.LedgerName ?? '')


  useEffect(() => {
    if (!isOpen) return
    setIsDirty(false); setConfirmDiscard(false); setSaving(false)
    if (isEdit && editingReceipt) {
      grnNo.current = editingReceipt.ReceiptVoucherNo
      setGrnDate(new Date(editingReceipt.ReceiptVoucherDate))
      setPurchaseDivision(editingReceipt.PurchaseDivision ?? '')
      setDnNo(editingReceipt.DeliveryNoteNo)
      setDnDate(editingReceipt.DeliveryNoteDate ? new Date(editingReceipt.DeliveryNoteDate) : null)
      setEwayBillNo(editingReceipt.EWayBillNumber)
      setEwayBillDate(editingReceipt.EWayBillDate ? new Date(editingReceipt.EWayBillDate) : null)
      setGateEntryNo(editingReceipt.GateEntryNo)
      setGateEntryDate(editingReceipt.GateEntryDate ? new Date(editingReceipt.GateEntryDate) : null)
      setLrNoVehicleNo(editingReceipt.LRNoVehicleNo)
      setTransporter(editingReceipt.Transporter)
      setBiltyNo(editingReceipt.BiltyNo)
      setBiltyDate(editingReceipt.BiltyDate ? new Date(editingReceipt.BiltyDate) : null)
      setReceivedBy(String(editingReceipt.ReceivedBy))
      setNarration(editingReceipt.Narration)
      setBatchDetails(MOCK_GRN_BATCH_DETAILS[editingReceipt.TransactionID] ?? [])
      setPoLines([])
    } else {
      grnNo.current = genReceiptNo()
      setGrnDate(TODAY)
      setPurchaseDivision(selectedOrders[0]?.PurchaseDivision ?? '')
      setDnNo(''); setDnDate(null); setEwayBillNo(''); setEwayBillDate(null)
      setGateEntryNo(''); setGateEntryDate(null); setLrNoVehicleNo(''); setTransporter('')
      setBiltyNo(''); setBiltyDate(null); setReceivedBy(''); setNarration('')
      setBatchDetails([]); setPoLines(selectedOrders)
    }
  }, [isOpen, isEdit, editingReceipt, selectedOrders])

  const markDirty = useCallback(() => setIsDirty(true), [])

  function addBatchRow(po: PendingPOItem) {
    if (batchDetails.some(b => b.PurchaseTransactionID === po.TransactionID)) return
    const seq = batchDetails.filter(b => b.PurchaseTransactionID === po.TransactionID).length + 1
    setBatchDetails(prev => [...prev, makeBatchRow(po, seq)])
    markDirty()
  }

  function updateBatch(idx: number, patch: Partial<GRNBatchDetail>) {
    setBatchDetails(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))
    markDirty()
  }

  function deleteBatch(idx: number) {
    setBatchDetails(prev => prev.filter((_, i) => i !== idx))
    markDirty()
  }

  function handleWarehouseSelect(warehouse: string, bin: string, warehouseID: number) {
    if (warehouseModalIdx === null) return
    updateBatch(warehouseModalIdx, { Warehouse: warehouse, Bin: bin, WarehouseID: warehouseID, WarehouseBin: `${warehouse} — ${bin}` })
    setWarehouseModalIdx(null)
  }

  function handleGateEntrySelect(entry: GateEntryItem) {
    setGateEntryNo(entry.GateEntryNo)
    setGateEntryDate(entry.GateEntryDate ? new Date(entry.GateEntryDate) : null)
    setLrNoVehicleNo(entry.VehicleNo)
    setTransporter(entry.ReceivedFrom)
    setBiltyNo(entry.ReceivedThroughNo)
    setGateEntryModalOpen(false)
    markDirty()
  }

  function validate(): string | null {
    if (!grnDate) return 'GRN Date is required.'
    if (batchDetails.length === 0) return 'Add at least one batch row using the "Batch Detail" button.'
    for (let i = 0; i < batchDetails.length; i++) {
      const b = batchDetails[i]
      if (!b.Warehouse || !b.Bin) return `Row ${i + 1} (${b.ItemName}): Warehouse and Bin are required.`
      if (b.ReceiptQuantity <= 0) return `Row ${i + 1} (${b.ItemName}): Receipt Qty (S.U.) must be > 0.`
    }
    return null
  }

  async function handleSave() {
    const err = validate()
    if (err) { alerts.showError('Validation', err); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    if (isEdit && editingReceipt) {
      const idx = MOCK_GRN_VOUCHERS.findIndex(v => v.TransactionID === editingReceipt.TransactionID)
      if (idx !== -1) {
        MOCK_GRN_VOUCHERS[idx] = {
          ...MOCK_GRN_VOUCHERS[idx],
          ReceiptVoucherDate: grnDate.toISOString().slice(0, 10),
          PurchaseDivision: purchaseDivision,
          DeliveryNoteNo: dnNo, DeliveryNoteDate: dnDate?.toISOString().slice(0, 10) ?? '',
          EWayBillNumber: ewayBillNo, EWayBillDate: ewayBillDate?.toISOString().slice(0, 10) ?? '',
          GateEntryNo: gateEntryNo, GateEntryDate: gateEntryDate?.toISOString().slice(0, 10) ?? '',
          LRNoVehicleNo: lrNoVehicleNo, Transporter: transporter,
          BiltyNo: biltyNo, BiltyDate: biltyDate?.toISOString().slice(0, 10) ?? '',
          ReceivedBy: Number(receivedBy) || 0,
          ReceiverName: GRN_RECEIVERS.find(r => String(r.LedgerID) === receivedBy)?.LedgerName ?? '',
          Narration: narration,
        }
        MOCK_GRN_BATCH_DETAILS[editingReceipt.TransactionID] = batchDetails
      }
      alerts.showSuccess('Success', 'GRN updated successfully.')
    } else {
      const newId = Date.now()
      MOCK_GRN_VOUCHERS.push({
        TransactionID: newId, ReceiptVoucherNo: grnNo.current, MaxVoucherNo: grnNo.current,
        ReceiptVoucherDate: grnDate.toISOString().slice(0, 10),
        LedgerID: selectedOrders[0]?.LedgerID ?? 0, LedgerName: supplierName,
        PurchaseDivision: purchaseDivision,
        PurchaseVoucherNo: selectedOrders[0]?.PurchaseVoucherNo ?? '',
        PurchaseVoucherDate: selectedOrders[0]?.PurchaseVoucherDate ?? '',
        DeliveryNoteNo: dnNo, DeliveryNoteDate: dnDate?.toISOString().slice(0, 10) ?? '',
        EWayBillNumber: ewayBillNo, EWayBillDate: ewayBillDate?.toISOString().slice(0, 10) ?? '',
        GateEntryNo: gateEntryNo, GateEntryDate: gateEntryDate?.toISOString().slice(0, 10) ?? '',
        GateEntryTransactionID: 0, LRNoVehicleNo: lrNoVehicleNo, Transporter: transporter,
        BiltyNo: biltyNo, BiltyDate: biltyDate?.toISOString().slice(0, 10) ?? '',
        ReceivedBy: Number(receivedBy) || 0,
        ReceiverName: GRN_RECEIVERS.find(r => String(r.LedgerID) === receivedBy)?.LedgerName ?? '',
        Narration: narration, CreatedBy: 'Current User', IsVoucherItemApproved: 0,
      })
      MOCK_GRN_BATCH_DETAILS[newId] = batchDetails.map(b => ({ ...b, TransactionID: newId }))
      alerts.showSuccess('Success', 'GRN saved successfully.')
    }
    setSaving(false); setIsDirty(false); onClose(true)
  }

  function handleClear() {
    setDnNo(''); setDnDate(null); setEwayBillNo(''); setEwayBillDate(null)
    setGateEntryNo(''); setGateEntryDate(null); setLrNoVehicleNo(''); setTransporter('')
    setBiltyNo(''); setBiltyDate(null); setReceivedBy(''); setNarration('')
    setBatchDetails([]); setIsDirty(false)
  }

  function handleClose() {
    if (isDirty && !isEdit) { setConfirmDiscard(true); return }
    onClose()
  }

  const receiverOptions = GRN_RECEIVERS.map(r => ({ label: r.LedgerName, value: String(r.LedgerID) }))
  const totalQty = batchDetails.reduce((s, b) => s + b.ReceiptQuantity, 0)

  // Consistent table styles matching other modules (subtle header, standard text)
  const thCls = 'px-2 py-1.5 text-left text-[10px] font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide whitespace-nowrap border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]'
  const tdCls = 'px-2 py-1 text-xs text-[rgb(var(--fg-default))] border-b border-[rgb(var(--bd-default))] align-middle'
  const inputCls = 'w-full px-1.5 py-0.5 text-xs border rounded bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]'

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
        <DialogContent
          className="!max-w-[100vw] sm:!max-w-[98vw] w-full h-[100dvh] sm:h-[96vh] p-0 overflow-hidden flex flex-col rounded-none sm:rounded-lg"
          style={{ maxHeight: '100dvh' }}
          hideCloseButton
          disableOutsideClick
        >
          {/* ── Title bar ── */}
          <DialogHeader className="flex-shrink-0 px-4 py-2.5 border-b border-[rgb(var(--bd-default))] flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-sm font-semibold text-[rgb(var(--fg-default))]">
                {isViewOnly ? 'View GRN' : isEdit ? 'Edit GRN' : 'New Goods Receipt Note'}
              </DialogTitle>
              <span className="text-xs text-[rgb(var(--text-muted))] font-mono">{grnNo.current}</span>
              {isEdit && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  editingReceipt?.IsVoucherItemApproved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {editingReceipt?.IsVoucherItemApproved ? 'Approved' : 'Pending QC'}
                </span>
              )}
            </div>
            <button onClick={handleClose} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors">
              <X size={16} />
            </button>
          </DialogHeader>

          {/* ── Top info strip (non-scrollable) ── */}
          <div className="flex-shrink-0 flex items-end gap-3 flex-wrap px-4 py-2.5 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Receipt No.</Label>
              <Input className="h-8 text-xs w-36 bg-[rgb(var(--bg-surface))]" value={grnNo.current} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Receipt Date <span className="text-red-500">*</span></Label>
              <DatePicker value={grnDate} onChange={d => { setGrnDate(asDate(d) ?? TODAY); markDirty() }} maxDate={TODAY} disabled={isViewOnly} />
            </div>
            <div className="space-y-1 flex-1 min-w-[180px] max-w-xs">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Supplier Name</Label>
              <Input className="h-8 text-xs bg-[rgb(var(--bg-surface))]" value={supplierName} readOnly />
            </div>
            <div className="space-y-1 min-w-[150px]">
              <Label className="text-xs">Purchase Division</Label>
              <Dropdown
                options={PO_DIVISIONS}
                value={purchaseDivision}
                onValueChange={v => { setPurchaseDivision(String(v)); markDirty() }}
                placeholder="Select division"
                size="sm"
                disabled={isViewOnly}
              />
            </div>
            <div className="ml-auto self-end">
              <Button size="sm" variant="outline" className="text-xs gap-1.5" disabled>
                <FileText size={13} /> Upload GRN List
              </Button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-4">

            {/* ── Section 1: PO Lines (create mode) ── */}
            {!isEdit && poLines.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-[rgb(var(--fg-default))]">
                    PO Lines
                    <span className="ml-2 text-[10px] font-normal text-[rgb(var(--text-muted))]">
                      Click "Batch Detail" on a row to add it to the batch grid below
                    </span>
                  </h3>
                </div>
                <div className="border border-[rgb(var(--bd-default))] rounded overflow-auto" style={{ maxHeight: 200 }}>
                  <table className="w-full border-collapse min-w-[1100px]">
                    <thead>
                      <tr>
                        <th className={thCls}>P.O. No.</th>
                        <th className={thCls}>P.O. Date</th>
                        <th className={thCls}>Item Code</th>
                        <th className={thCls}>Sub Group</th>
                        <th className={thCls}>Item Name</th>
                        <th className={`${thCls} text-right`}>P.O. Qty (P.U.)</th>
                        <th className={`${thCls} text-right`}>P.O. Qty (S.U.)</th>
                        <th className={`${thCls} text-right`}>Tol. %</th>
                        <th className={`${thCls} text-right`}>Pending (P.U.)</th>
                        <th className={`${thCls} text-right`}>Pending (S.U.)</th>
                        <th className={thCls}>P. Unit</th>
                        <th className={thCls}>S. Unit</th>
                        <th className={thCls}>P.O. Remark</th>
                        <th className={thCls}>Job Card No.</th>
                        <th className={thCls}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poLines.map(po => {
                        const added = batchDetails.some(b => b.PurchaseTransactionID === po.TransactionID)
                        return (
                          <tr key={po.TransactionID} className="hover:bg-[rgb(var(--bg-subtle))] transition-colors">
                            <td className={tdCls}>{po.PurchaseVoucherNo}</td>
                            <td className={tdCls}>{po.PurchaseVoucherDate}</td>
                            <td className={tdCls}>{po.ItemCode}</td>
                            <td className={tdCls}>{po.ItemSubGroupName}</td>
                            <td className={`${tdCls} max-w-[180px]`}>
                              <span className="block truncate" title={po.ItemName}>{po.ItemName}</span>
                            </td>
                            <td className={`${tdCls} text-right`}>{po.PurchaseOrderQuantity.toFixed(3)}</td>
                            <td className={`${tdCls} text-right`}>{(po.PurchaseOrderQuantity * po.ConversionFactor).toFixed(0)}</td>
                            <td className={`${tdCls} text-right`}>{po.PurchaseTolerance}</td>
                            <td className={`${tdCls} text-right font-medium text-amber-600`}>{po.PendingQty.toFixed(3)}</td>
                            <td className={`${tdCls} text-right font-medium text-amber-600`}>{(po.PendingQty * po.ConversionFactor).toFixed(0)}</td>
                            <td className={tdCls}>{po.PurchaseUnit}</td>
                            <td className={tdCls}>{po.StockUnit}</td>
                            <td className={tdCls}>
                              <span className="block truncate max-w-[100px]" title={po.Remark}>{po.Remark}</span>
                            </td>
                            <td className={tdCls}>{po.RefJobCardContentNo}</td>
                            <td className={tdCls}>
                              {added ? (
                                <span className="text-[10px] text-[rgb(var(--text-muted))] italic">Added</span>
                              ) : (
                                <button
                                  onClick={() => addBatchRow(po)}
                                  className="text-[10px] text-[rgb(var(--color-primary))] hover:underline font-semibold"
                                >
                                  Batch Detail
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Section 2: Batch Stock Details ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[rgb(var(--fg-default))]">
                  Batch Stock Details
                  <span className="ml-2 text-[10px] font-normal text-[rgb(var(--text-muted))]">
                    {batchDetails.length} row{batchDetails.length !== 1 ? 's' : ''}
                    {batchDetails.length > 0 && ` · Total Receipt Qty: ${totalQty.toFixed(3)}`}
                  </span>
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBatchGridHeight(h => Math.min(h + GRID_STEP, GRID_MAX))}
                    className="p-1 rounded border border-[rgb(var(--bd-default))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))] transition-colors"
                    title="Expand"
                  ><ChevronUp size={12} /></button>
                  <button
                    onClick={() => setBatchGridHeight(h => Math.max(h - GRID_STEP, GRID_MIN))}
                    className="p-1 rounded border border-[rgb(var(--bd-default))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))] transition-colors"
                    title="Shrink"
                  ><ChevronDown size={12} /></button>
                </div>
              </div>

              <div className="border border-[rgb(var(--bd-default))] rounded overflow-auto" style={{ height: batchGridHeight }}>
                {batchDetails.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-[rgb(var(--text-muted))]">
                    <MapPin size={24} className="opacity-30" />
                    <p className="text-xs">
                      {isEdit
                        ? 'No batch details found for this GRN'
                        : 'Click "Batch Detail" on a PO line above to add rows here'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full border-collapse min-w-[1300px]">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th className={`${thCls} text-center`}>#</th>
                        <th className={thCls}>P.O. No.</th>
                        <th className={thCls}>Item Code</th>
                        <th className={thCls}>Item Name</th>
                        <th className={`${thCls} text-right`}>Rcpt. Qty (S.U.)</th>
                        <th className={`${thCls} text-right`}>Rcpt. Qty (P.U.)</th>
                        <th className={thCls}>Ref. Batch No.</th>
                        <th className={thCls}>Supp. Batch No.</th>
                        <th className={thCls}>Mfg. Date</th>
                        <th className={thCls}>Expiry Date</th>
                        <th className={`${thCls} text-right`}>Wt/Packing</th>
                        <th className={thCls}>Warehouse — Bin</th>
                        <th className={thCls} />
                      </tr>
                    </thead>
                    <tbody>
                      {batchDetails.map((b, idx) => (
                        <tr key={idx} className="hover:bg-[rgb(var(--bg-subtle))] transition-colors">
                          <td className={`${tdCls} text-center text-[rgb(var(--text-muted))]`}>{idx + 1}</td>
                          <td className={tdCls}>{b.PurchaseVoucherNo}</td>
                          <td className={tdCls}>{b.ItemCode}</td>
                          <td className={`${tdCls} max-w-[160px]`}>
                            <span className="block truncate" title={b.ItemName}>{b.ItemName}</span>
                          </td>
                          <td className={tdCls}>
                            <input type="number" min={0} step="0.001"
                              value={b.ReceiptQuantity || ''}
                              onChange={e => {
                                const su = parseFloat(e.target.value) || 0
                                updateBatch(idx, { ReceiptQuantity: su, ReceiptQuantityInPurchaseUnit: calcPUFromSU(b, su) })
                              }}
                              className={`${inputCls} w-24 text-right`}
                              disabled={isViewOnly} />
                          </td>
                          <td className={tdCls}>
                            <input type="number" min={0} step="0.001"
                              value={b.ReceiptQuantityInPurchaseUnit || ''}
                              onChange={e => {
                                const pu = parseFloat(e.target.value) || 0
                                updateBatch(idx, { ReceiptQuantityInPurchaseUnit: pu, ReceiptQuantity: calcSUFromPU(b, pu) })
                              }}
                              className={`${inputCls} w-24 text-right`}
                              disabled={isViewOnly} />
                          </td>
                          <td className={`${tdCls} max-w-[130px]`}>
                            <span className="block truncate font-mono text-[10px] text-[rgb(var(--text-muted))]" title={b.BatchNo}>{b.BatchNo}</span>
                          </td>
                          <td className={tdCls}>
                            <input type="text" value={b.SupplierBatchNo}
                              onChange={e => updateBatch(idx, { SupplierBatchNo: e.target.value })}
                              className={`${inputCls} w-28`} placeholder="Supp. batch"
                              disabled={isViewOnly} />
                          </td>
                          <td className={tdCls}>
                            <DatePicker
                              value={b.MfgDate ? new Date(b.MfgDate) : undefined}
                              onChange={d => updateBatch(idx, { MfgDate: asDate(d)?.toISOString().slice(0, 10) ?? null })}
                              maxDate={TODAY} disabled={isViewOnly} />
                          </td>
                          <td className={tdCls}>
                            <DatePicker
                              value={b.ExpiryDate ? new Date(b.ExpiryDate) : undefined}
                              onChange={d => updateBatch(idx, { ExpiryDate: asDate(d)?.toISOString().slice(0, 10) ?? null })}
                              disabled={isViewOnly} />
                          </td>
                          <td className={`${tdCls} text-right`}>{b.WtPerPacking.toFixed(3)}</td>
                          <td className={tdCls}>
                            <button
                              onClick={() => !isViewOnly && setWarehouseModalIdx(idx)}
                              disabled={isViewOnly}
                              className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-colors ${
                                isViewOnly
                                  ? 'border-[rgb(var(--bd-default))] text-[rgb(var(--text-muted))] cursor-default'
                                  : b.WarehouseBin
                                    ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5'
                                    : 'border-[rgb(var(--bd-default))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]'
                              }`}
                            >
                              <MapPin size={11} />
                              <span className="truncate max-w-[130px]">{b.WarehouseBin || 'Select Warehouse'}</span>
                            </button>
                          </td>
                          {!isViewOnly && (
                            <td className={`${tdCls} text-center`}>
                              <button onClick={() => deleteBatch(idx)}
                                className="text-[rgb(var(--text-muted))] hover:text-red-500 transition-colors p-0.5 rounded"
                                title="Remove row">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                          {isViewOnly && <td className={tdCls} />}
                        </tr>
                      ))}
                    </tbody>
                    {batchDetails.length > 0 && (
                      <tfoot>
                        <tr className="bg-[rgb(var(--bg-subtle))]">
                          <td colSpan={4} className="px-2 py-1 text-[10px] text-[rgb(var(--text-muted))]">
                            Row Count: {batchDetails.length}
                          </td>
                          <td className="px-2 py-1 text-[10px] font-semibold text-right text-[rgb(var(--fg-default))]">
                            {totalQty.toFixed(3)}
                          </td>
                          <td colSpan={8} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}
              </div>
            </div>

            {/* ── Section 3: Shipping & Transport Details ── */}
            <div>
              <h3 className="text-xs font-semibold text-[rgb(var(--fg-default))] mb-3">Shipping &amp; Transport Details</h3>

              {/* Row 1: Gate Entry select + DN + Eway + Gate Entry fields */}
              <div className="flex items-end gap-3 flex-wrap mb-3">
                {!isViewOnly && (
                  <div className="self-end">
                    <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={() => setGateEntryModalOpen(true)}>
                      Select Gate Entry
                    </Button>
                  </div>
                )}
                <div className="space-y-1 min-w-[120px]">
                  <Label className="text-xs">D.N. No. / Invoice No.</Label>
                  <Input className="h-8 text-xs" value={dnNo} onChange={e => { setDnNo(e.target.value); markDirty() }} placeholder="DN-XXXX" disabled={isViewOnly} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">D.N. Date</Label>
                  <DatePicker value={dnDate ?? undefined} onChange={d => { setDnDate(asDate(d)); markDirty() }} maxDate={TODAY} disabled={isViewOnly} />
                </div>
                <div className="space-y-1 min-w-[120px]">
                  <Label className="text-xs">E-Way Bill No.</Label>
                  <Input className="h-8 text-xs" value={ewayBillNo} onChange={e => { setEwayBillNo(e.target.value); markDirty() }} placeholder="EWB-XXXXXX" disabled={isViewOnly} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-Way Bill Date</Label>
                  <DatePicker value={ewayBillDate ?? undefined} onChange={d => { setEwayBillDate(asDate(d)); markDirty() }} maxDate={TODAY} disabled={isViewOnly} />
                </div>
                <div className="space-y-1 min-w-[110px]">
                  <Label className="text-xs">Gate Entry No.</Label>
                  <Input className="h-8 text-xs" value={gateEntryNo} onChange={e => { setGateEntryNo(e.target.value); markDirty() }} placeholder="GE-XXX" disabled={isViewOnly} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gate Entry Date</Label>
                  <DatePicker value={gateEntryDate ?? undefined} onChange={d => { setGateEntryDate(asDate(d)); markDirty() }} maxDate={TODAY} disabled={isViewOnly} />
                </div>
              </div>

              {/* Row 2: LR No + Bilty */}
              <div className="flex items-end gap-3 flex-wrap mb-3">
                <div className="space-y-1 min-w-[160px]">
                  <Label className="text-xs">LR No. / Vehicle No.</Label>
                  <Input className="h-8 text-xs" value={lrNoVehicleNo} onChange={e => { setLrNoVehicleNo(e.target.value); markDirty() }} placeholder="GJ-01-AA-0000" disabled={isViewOnly} />
                </div>
                <div className="space-y-1 min-w-[110px]">
                  <Label className="text-xs">Bilty No.</Label>
                  <Input className="h-8 text-xs" value={biltyNo} onChange={e => { setBiltyNo(e.target.value); markDirty() }} placeholder="BLT-XXX" disabled={isViewOnly} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bilty Date</Label>
                  <DatePicker value={biltyDate ?? undefined} onChange={d => { setBiltyDate(asDate(d)); markDirty() }} maxDate={TODAY} disabled={isViewOnly} />
                </div>
              </div>

              {/* Row 3: Transporter + Received By + Purchase Division + Remark */}
              <div className="flex items-start gap-3 flex-wrap">
                <div className="space-y-1 min-w-[150px]">
                  <Label className="text-xs">Transporter</Label>
                  <Input className="h-8 text-xs" value={transporter} onChange={e => { setTransporter(e.target.value); markDirty() }} placeholder="Transporter name" disabled={isViewOnly} />
                </div>
                <div className="space-y-1 min-w-[160px]">
                  <Label className="text-xs">Received By</Label>
                  <Dropdown options={receiverOptions} value={receivedBy} onValueChange={v => { setReceivedBy(String(v)); markDirty() }} placeholder="Select receiver" size="sm" disabled={isViewOnly} />
                </div>
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <Label className="text-xs">Narration / Remark</Label>
                  <Textarea className="text-xs resize-none h-[68px]" value={narration} onChange={e => { setNarration(e.target.value); markDirty() }} placeholder="Remarks..." disabled={isViewOnly} />
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
            {!isEdit && !isViewOnly && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={handleClear}>Clear</Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {!isViewOnly && (
                <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs gap-1.5">
                  <Save size={13} />
                  {saving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? 'Update GRN' : 'Save GRN')}
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
                <Printer size={13} /> Print
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
                <FileText size={13} /> Roll Slip
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
                <FileText size={13} /> Transporter Slip
              </Button>
              {isEdit && !editingReceipt?.IsVoucherItemApproved && (
                <Button variant="destructive" size="sm" className="text-xs">Delete</Button>
              )}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onClose()}>Close</Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* ── Sub-modals ── */}
      <SelectGateEntryModal
        isOpen={gateEntryModalOpen}
        onClose={() => setGateEntryModalOpen(false)}
        onSelect={handleGateEntrySelect}
      />

      {warehouseModalIdx !== null && (
        <SelectWarehouseModal
          isOpen
          onClose={() => setWarehouseModalIdx(null)}
          onSelect={handleWarehouseSelect}
          initialWarehouse={batchDetails[warehouseModalIdx]?.Warehouse ?? ''}
          initialBin={batchDetails[warehouseModalIdx]?.Bin ?? ''}
        />
      )}

      {/* ── Discard guard ── */}
      {confirmDiscard && (
        <Dialog open onOpenChange={() => setConfirmDiscard(false)}>
          <DialogContent className="max-w-sm p-0 overflow-hidden">
            <DialogHeader className="px-4 py-3 border-b border-[rgb(var(--bd-default))]">
              <DialogTitle className="text-sm">Discard changes?</DialogTitle>
            </DialogHeader>
            <p className="px-4 py-3 text-xs text-[rgb(var(--fg-default))]">
              You have unsaved batch entries. Are you sure you want to close?
            </p>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setConfirmDiscard(false)}>Stay</Button>
              <Button variant="destructive" size="sm" className="text-xs" onClick={() => { setConfirmDiscard(false); onClose() }}>
                Discard &amp; Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
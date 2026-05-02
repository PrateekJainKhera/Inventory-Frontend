'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Plus, Save, Trash2, RotateCcw, XCircle, ArrowLeft } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Button, Input, Label, Dropdown, DatePicker,
} from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import { createActionsColumn } from '@/components/datagrid/columns/ActionsColumn'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import {
  genPINo,
  MOCK_PI_VOUCHER_TYPES,
  MOCK_PI_SUPPLIERS,
  MOCK_PI_PURCHASE_LEDGERS,
  MOCK_PI_TAXES_LEDGERS,
  MOCK_PI_HSN_GROUPS,
  MOCK_PI_COMPANY_CONFIG,
  MOCK_PENDING_GRNS,
  type PendingGRNItem,
  type ProcessedInvoice,
  type InvoiceLineItem,
  type AdditionalCharge,
  type HSNGroupData,
} from '@/data/mock/purchaseInvoice'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (invoice?: ProcessedInvoice) => void
  mode: 'create' | 'edit'
  selectedGRNs: PendingGRNItem[]
  selectedInvoice: ProcessedInvoice | null
}

const TODAY = new Date()

// ─── Helper: compute converted quantity based on item group ───────────────────
function calcFinalQty(item: InvoiceLineItem): number {
  const { ItemGroupID, ItemGroupNameID, ReceiptQuantity, SizeW, ConversionFactor, UnitPerPacking, PurchaseUnit, StockUnit } = item
  if (ItemGroupID === 13 || (PurchaseUnit === 'MTR' && StockUnit === 'SQM')) {
    if (SizeW > 0) return (ReceiptQuantity * SizeW) / 1000
  }
  if (ItemGroupNameID === -1) {
    if (ConversionFactor > 0 && UnitPerPacking > 0) return (ReceiptQuantity * ConversionFactor) / UnitPerPacking
  }
  if (ItemGroupNameID === -6) {
    if (SizeW > 0) return (ReceiptQuantity * SizeW) / 1000
  }
  return ReceiptQuantity
}

// ─── Helper: build CGST/SGST/IGST charge rows from line-item tax totals ──────
function buildChargesFromItems(items: InvoiceLineItem[]): AdditionalCharge[] {
  const totalCGST = items.reduce((s, i) => s + (i.CGSTAmt || 0), 0)
  const totalSGST = items.reduce((s, i) => s + (i.SGSTAmt || 0), 0)
  const totalIGST = items.reduce((s, i) => s + (i.IGSTAmt || 0), 0)
  const base: Omit<AdditionalCharge, 'LedgerID' | 'LedgerName' | 'ChargesAmount' | 'TotalAmount' | 'GSTLedgerType'> = {
    TaxRatePer: 0, CalculateON: 1, GSTApplicable: false, InAmount: true,
    IsService: false, ProductHSNID: 0, ProductHSNName: '', HSNCode: '',
    GSTTaxPercentage: 0, CGSTTaxPercentage: 0, SGSTTaxPercentage: 0, IGSTTaxPercentage: 0,
    CGSTAmount: 0, SGSTAmount: 0, IGSTAmount: 0, IsCumulative: false, TaxType: '',
  }
  const charges: AdditionalCharge[] = []
  if (totalCGST > 0) charges.push({ ...base, LedgerID: 0, LedgerName: 'CGST', ChargesAmount: totalCGST, TotalAmount: totalCGST, GSTLedgerType: 'CGST' })
  if (totalSGST > 0) charges.push({ ...base, LedgerID: 0, LedgerName: 'SGST', ChargesAmount: totalSGST, TotalAmount: totalSGST, GSTLedgerType: 'SGST' })
  if (totalIGST > 0) charges.push({ ...base, LedgerID: 0, LedgerName: 'IGST', ChargesAmount: totalIGST, TotalAmount: totalIGST, GSTLedgerType: 'IGST' })
  return charges
}

// ─── Helper: compute per-item tax amounts given GST mode ─────────────────────
function computeItemAmounts(item: InvoiceLineItem, isSameState: boolean, gstApplicable: boolean, vtGSTApplicable: boolean): InvoiceLineItem {
  const finalQty = item.ReceiptQuantityComp || item.ReceiptQuantity
  const basicAmt = finalQty * item.PurchaseRate
  const discAmt = (basicAmt * (item.Disc || 0)) / 100
  const afterDisAmt = basicAmt - discAmt
  const taxableAmt = afterDisAmt

  let cgstAmt = 0, sgstAmt = 0, igstAmt = 0
  if (gstApplicable && vtGSTApplicable) {
    if (isSameState) {
      cgstAmt = (taxableAmt * item.CGSTTaxPercentage) / 100
      sgstAmt = (taxableAmt * item.SGSTTaxPercentage) / 100
    } else {
      igstAmt = (taxableAmt * item.IGSTTaxPercentage) / 100
    }
  }

  const totalAmt = taxableAmt + cgstAmt + sgstAmt + igstAmt
  return {
    ...item,
    BasicAmount: Number(basicAmt.toFixed(2)),
    AfterDisAmt: Number(afterDisAmt.toFixed(2)),
    TaxableAmount: Number(taxableAmt.toFixed(2)),
    CGSTAmt: Number(cgstAmt.toFixed(2)),
    SGSTAmt: Number(sgstAmt.toFixed(2)),
    IGSTAmt: Number(igstAmt.toFixed(2)),
    TotalAmount: Number(totalAmt.toFixed(2)),
    LandedAmt: Number(totalAmt.toFixed(2)),
    LandedPrice: finalQty > 0 ? Number((totalAmt / finalQty).toFixed(2)) : 0,
  }
}

export default function PurchaseInvoiceModal({ isOpen, onClose, onSuccess, mode, selectedGRNs, selectedInvoice }: Props) {
  const alerts = useGlobalAlert()

  // ── Header ────────────────────────────────────────────────────────────────
  const [selectedVoucherType, setSelectedVoucherType] = useState<number | null>(null)
  const [isVoucherTypeGSTApplicable, setIsVoucherTypeGSTApplicable] = useState(false)
  const [voucherNo, setVoucherNo] = useState('')
  const [voucherDate, setVoucherDate] = useState<Date>(TODAY)

  // ── Supplier ──────────────────────────────────────────────────────────────
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [mailingName, setMailingName] = useState('')
  const [supplierState, setSupplierState] = useState('')
  const [supplierCountry, setSupplierCountry] = useState('')
  const [supplierStateTin, setSupplierStateTin] = useState(0)
  const [isGSTApplicable, setIsGSTApplicable] = useState(true)

  // ── Purchase Ledger ───────────────────────────────────────────────────────
  const [selectedPurchaseLedger, setSelectedPurchaseLedger] = useState<number | null>(null)

  // ── Bill Details ──────────────────────────────────────────────────────────
  const [billNo, setBillNo] = useState('')
  const [billDate, setBillDate] = useState<Date>(TODAY)
  const [deliveryNoteNo, setDeliveryNoteNo] = useState('')
  const [deliveryNoteDate, setDeliveryNoteDate] = useState<Date>(TODAY)
  const [eWayBillNo, setEWayBillNo] = useState('')
  const [eWayBillDate, setEWayBillDate] = useState<Date>(TODAY)

  // ── TCS ───────────────────────────────────────────────────────────────────
  const [tcsRate, setTcsRate] = useState(0)
  const [tcsAmount, setTcsAmount] = useState(0)

  // ── Narration ─────────────────────────────────────────────────────────────
  const [narration, setNarration] = useState('')

  // ── Responsive ───────────────────────────────────────────────────────────
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  )
  useEffect(() => {
    const check = () => setIsDesktop(window.matchMedia('(min-width: 1024px)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Grids ─────────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([])
  const [selectedChargeLedger, setSelectedChargeLedger] = useState<number | null>(null)

  // ── HSN ───────────────────────────────────────────────────────────────────
  const [hsnModalOpen, setHsnModalOpen] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [hsnSearch, setHsnSearch] = useState('')

  // ── Totals ────────────────────────────────────────────────────────────────
  const [basicAmount, setBasicAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [cgstTotal, setCgstTotal] = useState(0)
  const [sgstTotal, setSgstTotal] = useState(0)
  const [igstTotal, setIgstTotal] = useState(0)
  const [otherChargesAmount, setOtherChargesAmount] = useState(0)
  const [roundOff, setRoundOff] = useState(0)
  const [netAmount, setNetAmount] = useState(0)

  // ── Misc ──────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const companyStateTin = MOCK_PI_COMPANY_CONFIG.CompanyStateTin

  // ── TCS effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    const tcsAmt = tcsRate > 0 ? ((basicAmount + taxAmount + otherChargesAmount) * tcsRate / 100) : 0
    setTcsAmount(Number(tcsAmt.toFixed(2)))
  }, [tcsRate, basicAmount, taxAmount, otherChargesAmount])

  // ── Net amount effect ─────────────────────────────────────────────────────
  useEffect(() => {
    setNetAmount(Number((basicAmount + taxAmount + otherChargesAmount + tcsAmount + roundOff).toFixed(2)))
  }, [basicAmount, taxAmount, otherChargesAmount, tcsAmount, roundOff])

  // ── Core recalculate function ─────────────────────────────────────────────
  const triggerRecalculate = useCallback((items: InvoiceLineItem[]) => {
    const isSameState = companyStateTin === supplierStateTin && isGSTApplicable && isVoucherTypeGSTApplicable
    const recalced = items.map(item => computeItemAmounts(item, isSameState, isGSTApplicable, isVoucherTypeGSTApplicable))

    setLineItems(recalced)

    const totalBasic = recalced.reduce((s, i) => s + i.BasicAmount, 0)
    const totalCGST = recalced.reduce((s, i) => s + i.CGSTAmt, 0)
    const totalSGST = recalced.reduce((s, i) => s + i.SGSTAmt, 0)
    const totalIGST = recalced.reduce((s, i) => s + i.IGSTAmt, 0)
    const totalTax = totalCGST + totalSGST + totalIGST
    const charges = buildChargesFromItems(recalced)
    const totalCharges = charges.reduce((s, c) => s + c.ChargesAmount, 0)

    setAdditionalCharges(charges)
    setBasicAmount(Number(totalBasic.toFixed(2)))
    setTaxAmount(Number(totalTax.toFixed(2)))
    setCgstTotal(Number(totalCGST.toFixed(2)))
    setSgstTotal(Number(totalSGST.toFixed(2)))
    setIgstTotal(Number(totalIGST.toFixed(2)))
    setOtherChargesAmount(Number(totalCharges.toFixed(2)))
  }, [companyStateTin, supplierStateTin, isGSTApplicable, isVoucherTypeGSTApplicable])

  // ── Init on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    // Reset form
    setNarration('')
    setRoundOff(0)
    setTcsRate(MOCK_PI_COMPANY_CONFIG.TCSRate)
    setTcsAmount(0)
    setSelectedChargeLedger(null)

    // Set defaults
    const firstVT = MOCK_PI_VOUCHER_TYPES[0]
    if (firstVT) {
      setSelectedVoucherType(firstVT.VoucherTypeID)
      setIsVoucherTypeGSTApplicable(firstVT.GSTApplicable)
    }
    const firstPL = MOCK_PI_PURCHASE_LEDGERS[0]
    if (firstPL) setSelectedPurchaseLedger(firstPL.LedgerID)

    if (mode === 'create' && selectedGRNs.length > 0) {
      setVoucherNo(genPINo())
      setVoucherDate(TODAY)
      setBillDate(TODAY)
      setDeliveryNoteDate(TODAY)
      setEWayBillDate(TODAY)

      const firstGRN = selectedGRNs[0]
      const supplier = MOCK_PI_SUPPLIERS.find(s => s.LedgerID === firstGRN.LedgerID)
      const localSupStateTin = supplier?.StateTin ?? 0
      const localIsGSTApplicable = supplier?.VatGSTApplicable ?? true
      const localVTGST = firstVT?.GSTApplicable ?? false

      if (supplier) {
        setSelectedSupplier(supplier.LedgerID)
        setSupplierName(supplier.LedgerName)
        setMailingName(supplier.MailingName)
        setSupplierState(supplier.State)
        setSupplierCountry(supplier.Country)
        setSupplierStateTin(localSupStateTin)
        setIsGSTApplicable(localIsGSTApplicable)
      }

      setDeliveryNoteNo([...new Set(selectedGRNs.map(g => g.DeliveryNoteNo).filter(Boolean))].join(', '))
      setEWayBillNo([...new Set(selectedGRNs.map(g => g.EWayBillNumber).filter(Boolean))].join(', '))
      const firstEWBDate = selectedGRNs.find(g => g.EWayBillDate)?.EWayBillDate
      if (firstEWBDate) setEWayBillDate(new Date(firstEWBDate))

      // Build line items and compute amounts using local (non-stale) state values
      const isSameState = companyStateTin === localSupStateTin && localIsGSTApplicable && localVTGST
      const items: InvoiceLineItem[] = selectedGRNs.map(grn => {
        const cgstPer = isSameState ? (grn.GSTTaxPercentage || 0) / 2 : 0
        const sgstPer = isSameState ? (grn.GSTTaxPercentage || 0) / 2 : 0
        const igstPer = !isSameState && localIsGSTApplicable ? (grn.GSTTaxPercentage || 0) : 0
        const cgstAmt = (grn.BasicAmount * cgstPer) / 100
        const sgstAmt = (grn.BasicAmount * sgstPer) / 100
        const igstAmt = (grn.BasicAmount * igstPer) / 100
        return {
          TransactionID: grn.TransactionID,
          PurchaseTransactionID: grn.PurchaseTransactionID,
          ItemID: grn.ItemID,
          ItemGroupID: grn.ItemGroupID,
          ItemGroupNameID: grn.ItemSubGroupID,
          ItemSubGroupID: grn.ItemSubGroupID,
          PurchaseVoucherNo: grn.PurchaseVoucherNo,
          PurchaseVoucherDate: grn.PurchaseVoucherDate,
          ItemCode: grn.ItemCode,
          ItemName: grn.ItemName,
          ProductHSNID: grn.ProductHSNID || 0,
          ProductHSNName: grn.ProductHSNName || '',
          HSNCode: grn.HSNCode || '',
          PurchaseOrderQuantity: grn.ChallanQuantity,
          ChallanQuantity: grn.ChallanQuantity,
          StockUnit: grn.StockUnit,
          ReceiptQuantity: grn.ReceiptQuantity,
          PurchaseRate: grn.PurchaseRate,
          PurchaseUnit: grn.PurchaseUnit,
          ReceiptWtPerPacking: 0,
          ExpectedDeliveryDate: '',
          PurchaseTolerance: 0,
          BasicAmount: grn.BasicAmount,
          UnitPerPacking: 0,
          ConversionFactor: 0,
          SizeW: 0,
          Disc: 0,
          AfterDisAmt: grn.BasicAmount,
          GSTTaxPercentage: grn.GSTTaxPercentage || 0,
          CGSTTaxPercentage: cgstPer,
          SGSTTaxPercentage: sgstPer,
          IGSTTaxPercentage: igstPer,
          CGSTAmt: Number(cgstAmt.toFixed(2)),
          SGSTAmt: Number(sgstAmt.toFixed(2)),
          IGSTAmt: Number(igstAmt.toFixed(2)),
          TaxableAmount: grn.BasicAmount,
          TotalAmount: grn.BasicAmount + cgstAmt + sgstAmt + igstAmt,
          ReceiptQuantityComp: grn.ReceiptQuantity,
          Narration: grn.Narration || '',
          FYear: grn.FYear,
          LandedAmt: grn.BasicAmount + cgstAmt + sgstAmt + igstAmt,
          LandedPrice: grn.ReceiptQuantity > 0 ? (grn.BasicAmount + cgstAmt + sgstAmt + igstAmt) / grn.ReceiptQuantity : 0,
        }
      })

      setLineItems(items)
      const charges = buildChargesFromItems(items)
      setAdditionalCharges(charges)
      const tb = items.reduce((s, i) => s + i.BasicAmount, 0)
      const tCGST = items.reduce((s, i) => s + i.CGSTAmt, 0)
      const tSGST = items.reduce((s, i) => s + i.SGSTAmt, 0)
      const tIGST = items.reduce((s, i) => s + i.IGSTAmt, 0)
      const tt = tCGST + tSGST + tIGST
      const tc = charges.reduce((s, c) => s + c.ChargesAmount, 0)
      setBasicAmount(Number(tb.toFixed(2)))
      setTaxAmount(Number(tt.toFixed(2)))
      setCgstTotal(Number(tCGST.toFixed(2)))
      setSgstTotal(Number(tSGST.toFixed(2)))
      setIgstTotal(Number(tIGST.toFixed(2)))
      setOtherChargesAmount(Number(tc.toFixed(2)))
      setNetAmount(Number((tb + tt + tc).toFixed(2)))
    } else if (mode === 'edit' && selectedInvoice) {
      setVoucherNo(selectedInvoice.VoucherNo)
      setVoucherDate(selectedInvoice.VoucherDate ? new Date(selectedInvoice.VoucherDate) : TODAY)
      setBillNo(selectedInvoice.InvoiceNo || '')
      setBillDate(selectedInvoice.InvoiceDate ? new Date(selectedInvoice.InvoiceDate) : TODAY)
      setDeliveryNoteNo(selectedInvoice.DeliveryNoteNo || '')
      setDeliveryNoteDate(TODAY)
      setEWayBillNo(selectedInvoice.EWayBillNumber || '')
      setEWayBillDate(selectedInvoice.EWayBillDate ? new Date(selectedInvoice.EWayBillDate) : TODAY)

      const supplier = MOCK_PI_SUPPLIERS.find(s => s.LedgerName === selectedInvoice.SupplierName)
      const localSupStateTin = supplier?.StateTin ?? 29
      const localIsGST = supplier?.VatGSTApplicable ?? true
      const localVTGST = firstVT?.GSTApplicable ?? true

      if (supplier) {
        setSelectedSupplier(supplier.LedgerID)
        setSupplierName(supplier.LedgerName)
        setMailingName(supplier.MailingName)
        setSupplierState(supplier.State)
        setSupplierCountry(supplier.Country)
        setSupplierStateTin(localSupStateTin)
        setIsGSTApplicable(localIsGST)
      }

      // Mock items from first 2 pending GRNs as template
      const isSameState = companyStateTin === localSupStateTin && localIsGST && localVTGST
      const mockItems: InvoiceLineItem[] = MOCK_PENDING_GRNS.slice(0, 2).map(grn => {
        const gstPer = 18
        const cgstPer = isSameState ? 9 : 0
        const sgstPer = isSameState ? 9 : 0
        const igstPer = !isSameState ? 18 : 0
        const b = grn.BasicAmount
        const cgstAmt = (b * cgstPer) / 100
        const sgstAmt = (b * sgstPer) / 100
        const igstAmt = (b * igstPer) / 100
        const total = b + cgstAmt + sgstAmt + igstAmt
        return {
          TransactionID: grn.TransactionID + 9000,
          PurchaseTransactionID: grn.PurchaseTransactionID,
          ItemID: grn.ItemID,
          ItemGroupID: grn.ItemGroupID,
          ItemGroupNameID: grn.ItemSubGroupID,
          ItemSubGroupID: grn.ItemSubGroupID,
          PurchaseVoucherNo: grn.PurchaseVoucherNo,
          PurchaseVoucherDate: grn.PurchaseVoucherDate,
          ItemCode: grn.ItemCode,
          ItemName: grn.ItemName,
          ProductHSNID: grn.ProductHSNID || 1,
          ProductHSNName: grn.ProductHSNName || 'Paper (Newsprint)',
          HSNCode: grn.HSNCode || '4801',
          PurchaseOrderQuantity: grn.ChallanQuantity,
          ChallanQuantity: grn.ChallanQuantity,
          StockUnit: grn.StockUnit,
          ReceiptQuantity: grn.ReceiptQuantity,
          PurchaseRate: grn.PurchaseRate,
          PurchaseUnit: grn.PurchaseUnit,
          ReceiptWtPerPacking: 0,
          ExpectedDeliveryDate: '',
          PurchaseTolerance: 0,
          BasicAmount: b,
          UnitPerPacking: 0,
          ConversionFactor: 0,
          SizeW: 0,
          Disc: 0,
          AfterDisAmt: b,
          GSTTaxPercentage: gstPer,
          CGSTTaxPercentage: cgstPer,
          SGSTTaxPercentage: sgstPer,
          IGSTTaxPercentage: igstPer,
          CGSTAmt: Number(cgstAmt.toFixed(2)),
          SGSTAmt: Number(sgstAmt.toFixed(2)),
          IGSTAmt: Number(igstAmt.toFixed(2)),
          TaxableAmount: b,
          TotalAmount: Number(total.toFixed(2)),
          ReceiptQuantityComp: grn.ReceiptQuantity,
          Narration: 'Saved Item',
          FYear: grn.FYear,
          LandedAmt: Number(total.toFixed(2)),
          LandedPrice: grn.ReceiptQuantity > 0 ? Number((total / grn.ReceiptQuantity).toFixed(2)) : 0,
        }
      })

      setLineItems(mockItems)
      const charges = buildChargesFromItems(mockItems)
      setAdditionalCharges(charges)
      const tb = mockItems.reduce((s, i) => s + i.BasicAmount, 0)
      const tCGST = mockItems.reduce((s, i) => s + i.CGSTAmt, 0)
      const tSGST = mockItems.reduce((s, i) => s + i.SGSTAmt, 0)
      const tIGST = mockItems.reduce((s, i) => s + i.IGSTAmt, 0)
      const tt = tCGST + tSGST + tIGST
      const tc = charges.reduce((s, c) => s + c.ChargesAmount, 0)
      setBasicAmount(Number(tb.toFixed(2)))
      setTaxAmount(Number(tt.toFixed(2)))
      setCgstTotal(Number(tCGST.toFixed(2)))
      setSgstTotal(Number(tSGST.toFixed(2)))
      setIgstTotal(Number(tIGST.toFixed(2)))
      setOtherChargesAmount(Number(tc.toFixed(2)))
      setNetAmount(Number((tb + tt + tc).toFixed(2)))
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field change handlers ─────────────────────────────────────────────────

  const handleVoucherTypeChange = useCallback((id: number) => {
    setSelectedVoucherType(id)
    const vt = MOCK_PI_VOUCHER_TYPES.find(v => v.VoucherTypeID === id)
    if (vt) {
      setIsVoucherTypeGSTApplicable(vt.GSTApplicable)
    }
  }, [])

  const handleSupplierChange = useCallback((id: number) => {
    setSelectedSupplier(id)
    const s = MOCK_PI_SUPPLIERS.find(sup => sup.LedgerID === id)
    if (s) {
      setSupplierName(s.LedgerName)
      setMailingName(s.MailingName)
      setSupplierState(s.State)
      setSupplierCountry(s.Country)
      setSupplierStateTin(s.StateTin)
      setIsGSTApplicable(s.VatGSTApplicable)
    }
  }, [])

  // ── Line item handlers ────────────────────────────────────────────────────

  const handleQuantityChange = useCallback((index: number, newQty: number) => {
    setLineItems(prev => {
      const updated = [...prev]
      const item = { ...updated[index], ReceiptQuantity: newQty }
      const finalQty = calcFinalQty(item)
      item.ReceiptQuantityComp = finalQty
      item.BasicAmount = finalQty * item.PurchaseRate
      item.AfterDisAmt = item.BasicAmount - (item.BasicAmount * (item.Disc || 0)) / 100
      item.TaxableAmount = item.AfterDisAmt
      item.CGSTAmt = (item.AfterDisAmt * item.CGSTTaxPercentage) / 100
      item.SGSTAmt = (item.AfterDisAmt * item.SGSTTaxPercentage) / 100
      item.IGSTAmt = (item.AfterDisAmt * item.IGSTTaxPercentage) / 100
      item.TotalAmount = item.TaxableAmount + item.CGSTAmt + item.SGSTAmt + item.IGSTAmt
      item.LandedAmt = item.TotalAmount
      item.LandedPrice = finalQty > 0 ? item.TotalAmount / finalQty : 0
      updated[index] = item
      return updated
    })
  }, [])

  const handleRateChange = useCallback((index: number, newRate: number) => {
    setLineItems(prev => {
      const updated = [...prev]
      const item = { ...updated[index], PurchaseRate: newRate }
      const finalQty = item.ReceiptQuantityComp || item.ReceiptQuantity
      item.BasicAmount = finalQty * newRate
      item.AfterDisAmt = item.BasicAmount - (item.BasicAmount * (item.Disc || 0)) / 100
      item.TaxableAmount = item.AfterDisAmt
      item.CGSTAmt = (item.AfterDisAmt * item.CGSTTaxPercentage) / 100
      item.SGSTAmt = (item.AfterDisAmt * item.SGSTTaxPercentage) / 100
      item.IGSTAmt = (item.AfterDisAmt * item.IGSTTaxPercentage) / 100
      item.TotalAmount = item.TaxableAmount + item.CGSTAmt + item.SGSTAmt + item.IGSTAmt
      item.LandedAmt = item.TotalAmount
      item.LandedPrice = finalQty > 0 ? item.TotalAmount / finalQty : 0
      updated[index] = item
      return updated
    })
  }, [])

  const handleDiscountChange = useCallback((index: number, newDisc: number) => {
    setLineItems(prev => {
      const updated = [...prev]
      const item = { ...updated[index], Disc: newDisc }
      item.AfterDisAmt = item.BasicAmount - (item.BasicAmount * newDisc) / 100
      item.TaxableAmount = item.AfterDisAmt
      item.CGSTAmt = (item.AfterDisAmt * item.CGSTTaxPercentage) / 100
      item.SGSTAmt = (item.AfterDisAmt * item.SGSTTaxPercentage) / 100
      item.IGSTAmt = (item.AfterDisAmt * item.IGSTTaxPercentage) / 100
      const finalQty = item.ReceiptQuantityComp || item.ReceiptQuantity
      item.TotalAmount = item.TaxableAmount + item.CGSTAmt + item.SGSTAmt + item.IGSTAmt
      item.LandedAmt = item.TotalAmount
      item.LandedPrice = finalQty > 0 ? item.TotalAmount / finalQty : 0
      updated[index] = item
      return updated
    })
  }, [])

  const handleNarrationChange = useCallback((index: number, value: string) => {
    setLineItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], Narration: value }
      return updated
    })
  }, [])

  const handleFieldChange = useCallback((index: number, field: keyof InvoiceLineItem, value: unknown) => {
    setLineItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const handleHSNSelect = useCallback((group: HSNGroupData) => {
    if (selectedItemIndex === null) return
    setLineItems(prev => {
      const updated = [...prev]
      const item = { ...updated[selectedItemIndex] }
      const isSameState = companyStateTin === supplierStateTin && isGSTApplicable && isVoucherTypeGSTApplicable
      const cgstPer = isSameState ? group.CGSTTaxPercentage : 0
      const sgstPer = isSameState ? group.SGSTTaxPercentage : 0
      const igstPer = !isSameState && isGSTApplicable ? group.IGSTTaxPercentage : 0
      const afterDis = item.AfterDisAmt || item.BasicAmount
      const cgstAmt = (afterDis * cgstPer) / 100
      const sgstAmt = (afterDis * sgstPer) / 100
      const igstAmt = (afterDis * igstPer) / 100
      const totalAmt = afterDis + cgstAmt + sgstAmt + igstAmt
      const finalQty = item.ReceiptQuantityComp || item.ReceiptQuantity
      updated[selectedItemIndex] = {
        ...item,
        ProductHSNID: group.ProductHSNID,
        ProductHSNName: group.ProductHSNName,
        HSNCode: group.HSNCode,
        GSTTaxPercentage: group.GSTTaxPercentage,
        CGSTTaxPercentage: cgstPer,
        SGSTTaxPercentage: sgstPer,
        IGSTTaxPercentage: igstPer,
        CGSTAmt: Number(cgstAmt.toFixed(2)),
        SGSTAmt: Number(sgstAmt.toFixed(2)),
        IGSTAmt: Number(igstAmt.toFixed(2)),
        TaxableAmount: Number(afterDis.toFixed(2)),
        TotalAmount: Number(totalAmt.toFixed(2)),
        LandedAmt: Number(totalAmt.toFixed(2)),
        LandedPrice: finalQty > 0 ? Number((totalAmt / finalQty).toFixed(2)) : 0,
      }
      return updated
    })
    setHsnModalOpen(false)
    setSelectedItemIndex(null)
  }, [selectedItemIndex, companyStateTin, supplierStateTin, isGSTApplicable, isVoucherTypeGSTApplicable])

  const handleDeleteLineItem = useCallback((item: InvoiceLineItem) => {
    setLineItems(prev => {
      const updated = prev.filter(i => i !== item)
      // Recalculate totals after deletion
      setTimeout(() => triggerRecalculate(updated), 0)
      return updated
    })
  }, [triggerRecalculate])

  // Recalculate all line items (e.g. after supplier/GST state change)
  const recalculateAllTotals = useCallback(() => {
    triggerRecalculate(lineItems)
  }, [triggerRecalculate, lineItems])

  // Re-run full recalculation when GST mode changes
  useEffect(() => {
    if (lineItems.length > 0) recalculateAllTotals()
  }, [supplierStateTin, isGSTApplicable, isVoucherTypeGSTApplicable]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Additional charge handlers ────────────────────────────────────────────

  const handleAddCharge = useCallback(() => {
    if (!selectedChargeLedger) {
      alerts.showWarning('Warning', 'Please select a ledger for the additional charge.')
      return
    }
    const ledger = MOCK_PI_TAXES_LEDGERS.find(l => l.LedgerID === selectedChargeLedger)
    if (!ledger) return
    setAdditionalCharges(prev => [...prev, {
      LedgerID: ledger.LedgerID,
      LedgerName: ledger.LedgerName,
      TaxRatePer: ledger.TaxRatePer,
      CalculateON: ledger.CalculateON,
      GSTApplicable: ledger.GSTApplicable,
      InAmount: false,
      ChargesAmount: 0,
      IsService: false,
      ProductHSNID: 0,
      ProductHSNName: '',
      HSNCode: '',
      GSTTaxPercentage: 0,
      CGSTTaxPercentage: 0,
      SGSTTaxPercentage: 0,
      IGSTTaxPercentage: 0,
      CGSTAmount: 0,
      SGSTAmount: 0,
      IGSTAmount: 0,
      TotalAmount: 0,
      IsCumulative: false,
      TaxType: '',
      GSTLedgerType: ledger.GSTLedgerType,
    }])
    setSelectedChargeLedger(null)
  }, [selectedChargeLedger, alerts])

  const handleChargeTaxRateChange = useCallback((index: number, newRate: number) => {
    setAdditionalCharges(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], TaxRatePer: newRate }
      return updated
    })
  }, [])

  const handleChargeAmountChange = useCallback((index: number, newAmount: number) => {
    setAdditionalCharges(prev => {
      const updated = [...prev]
      const charge = { ...updated[index] }
      charge.ChargesAmount = newAmount

      if (charge.GSTApplicable && charge.GSTTaxPercentage > 0) {
        const isSameState = companyStateTin === supplierStateTin && isGSTApplicable
        charge.CGSTTaxPercentage = isSameState ? charge.GSTTaxPercentage / 2 : 0
        charge.SGSTTaxPercentage = isSameState ? charge.GSTTaxPercentage / 2 : 0
        charge.IGSTTaxPercentage = !isSameState && isGSTApplicable ? charge.GSTTaxPercentage : 0
        charge.CGSTAmount = (newAmount * charge.CGSTTaxPercentage) / 100
        charge.SGSTAmount = (newAmount * charge.SGSTTaxPercentage) / 100
        charge.IGSTAmount = (newAmount * charge.IGSTTaxPercentage) / 100
        charge.TotalAmount = newAmount + charge.CGSTAmount + charge.SGSTAmount + charge.IGSTAmount
      } else {
        charge.TotalAmount = newAmount
      }

      updated[index] = charge
      return updated
    })

    // Update other charges total using additionalCharges from closure
    setOtherChargesAmount(() => {
      return Number(additionalCharges.reduce((sum, ch, idx) => {
        return sum + (idx === index ? newAmount : (ch.ChargesAmount || 0))
      }, 0).toFixed(2))
    })
  }, [companyStateTin, supplierStateTin, isGSTApplicable, additionalCharges])

  const handleDeleteCharge = useCallback((charge: AdditionalCharge) => {
    setAdditionalCharges(prev => {
      const updated = prev.filter(c => c !== charge)
      const total = updated.reduce((s, c) => s + (c.ChargesAmount || 0), 0)
      setOtherChargesAmount(Number(total.toFixed(2)))
      return updated
    })
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!selectedVoucherType) { alerts.showWarning('Warning', 'Please select a voucher type.'); return }
    if (!selectedSupplier) { alerts.showWarning('Warning', 'Please select a supplier.'); return }
    if (!selectedPurchaseLedger) { alerts.showWarning('Warning', 'Please select a purchase ledger.'); return }
    if (!billNo.trim()) { alerts.showWarning('Warning', 'Please enter the supplier invoice number.'); return }
    if (lineItems.length === 0) { alerts.showWarning('Warning', 'No line items found.'); return }

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i]
      if (!item.ReceiptQuantity || item.ReceiptQuantity <= 0) {
        alerts.showWarning('Warning', `Row ${i + 1}: Receipt quantity must be greater than 0.`)
        return
      }
      if (!item.PurchaseRate || item.PurchaseRate <= 0) {
        alerts.showWarning('Warning', `Row ${i + 1}: Purchase rate must be greater than 0.`)
        return
      }
      if (item.Disc < 0 || item.Disc > 100) {
        alerts.showWarning('Warning', `Row ${i + 1}: Discount must be between 0 and 100.`)
        return
      }
      if (!item.ProductHSNID || item.ProductHSNID === 0) {
        alerts.showWarning('Warning', `Row ${i + 1}: Please select HSN group.`)
        return
      }
    }

    if (netAmount <= 0) { alerts.showWarning('Warning', 'Net amount must be greater than 0.'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 600))

    const firstGRN = selectedGRNs[0]
    const newInvoice: ProcessedInvoice = {
      TransactionID: mode === 'create'
        ? Math.floor(Math.random() * 90000) + 10000
        : (selectedInvoice?.TransactionID ?? 0),
      VoucherID: selectedVoucherType,
      VoucherNo: voucherNo,
      VoucherDate: voucherDate.toISOString().split('T')[0],
      PONo: mode === 'create'
        ? [...new Set(selectedGRNs.map(g => g.PurchaseVoucherNo))].join(', ')
        : (selectedInvoice?.PONo ?? ''),
      GRNNo: mode === 'create'
        ? [...new Set(selectedGRNs.map(g => g.ReceiptVoucherNo))].join(', ')
        : (selectedInvoice?.GRNNo ?? ''),
      GRNDate: mode === 'create'
        ? (firstGRN?.ReceiptVoucherDate ?? new Date().toISOString().split('T')[0])
        : (selectedInvoice?.GRNDate ?? ''),
      InvoiceNo: billNo,
      InvoiceDate: billDate.toISOString().split('T')[0],
      SupplierName: supplierName,
      DeliveryNoteNo: deliveryNoteNo,
      DeliveryNoteDate: deliveryNoteDate.toISOString().split('T')[0],
      EWayBillNumber: eWayBillNo,
      EWayBillDate: eWayBillDate.toISOString().split('T')[0],
      CreatedBy: 'Admin',
      CreatedDate: new Date().toISOString().split('T')[0],
      NetAmount: netAmount,
      IsIntegrated: false,
      FYear: firstGRN?.FYear ?? selectedInvoice?.FYear ?? '2024-2025',
      ProductionUnitID: firstGRN?.ProductionUnitID ?? selectedInvoice?.ProductionUnitID ?? 1,
      ProductionUnitName: firstGRN?.ProductionUnitName ?? selectedInvoice?.ProductionUnitName ?? 'Unit 1',
      CompanyID: firstGRN?.CompanyID ?? selectedInvoice?.CompanyID ?? 1,
      CompanyName: firstGRN?.CompanyName ?? selectedInvoice?.CompanyName ?? '',
    }

    setSaving(false)
    alerts.showSuccess('Success', mode === 'create' ? 'Purchase Invoice created successfully.' : 'Purchase Invoice updated successfully.')
    onSuccess(newInvoice)
  }, [
    mode, selectedVoucherType, selectedSupplier, selectedPurchaseLedger, billNo, lineItems, netAmount,
    voucherNo, voucherDate, supplierName, billDate, deliveryNoteNo, deliveryNoteDate,
    eWayBillNo, eWayBillDate, selectedGRNs, selectedInvoice, alerts, onSuccess,
  ])

  const handleClear = useCallback(() => {
    setSelectedVoucherType(null)
    setVoucherNo('')
    setVoucherDate(TODAY)
    setSelectedSupplier(null)
    setSupplierName('')
    setMailingName('')
    setSupplierState('')
    setSupplierCountry('')
    setSelectedPurchaseLedger(null)
    setBillNo('')
    setBillDate(TODAY)
    setDeliveryNoteNo('')
    setDeliveryNoteDate(TODAY)
    setEWayBillNo('')
    setEWayBillDate(TODAY)
    setTcsRate(0)
    setTcsAmount(0)
    setNarration('')
    setRoundOff(0)
    setLineItems([])
    setAdditionalCharges([])
    setBasicAmount(0)
    setTaxAmount(0)
    setOtherChargesAmount(0)
    setNetAmount(0)
  }, [])

  // ── Column definitions ────────────────────────────────────────────────────

  const initialLineItemVisibility = useMemo(() => ({
    TransactionID: false, PurchaseTransactionID: false, ItemID: false,
    ItemGroupID: false, ItemGroupNameID: false, ChallanQuantity: false,
    ReceiptWtPerPacking: false, ExpectedDeliveryDate: false,
    PurchaseTolerance: false, UnitPerPacking: false, ConversionFactor: false,
    SizeW: false, ReceiptQuantityComp: false, LandedAmt: false, FYear: false,
  }), [])

  const initialChargeVisibility = useMemo(() => ({
    IsCumulative: false, TaxType: false, GSTLedgerType: false, LedgerID: false,
  }), [])

  const inlineInput = (
    value: number | string,
    onChange: (v: number) => void,
    opts?: { min?: number; max?: number; step?: string; isText?: boolean }
  ) => (
    <input
      type={opts?.isText ? 'text' : 'number'}
      value={value}
      onChange={e => onChange(opts?.isText ? (e.target.value as unknown as number) : (parseFloat(e.target.value) || 0))}
      className="w-full px-2 py-1 text-xs border rounded text-right"
      style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg-default))', borderColor: 'rgb(var(--bd-default))' }}
      min={opts?.min}
      max={opts?.max}
      step={opts?.step ?? '0.01'}
    />
  )

  const lineItemColumns = useMemo<ColumnDef<InvoiceLineItem>[]>(() => [
    { accessorKey: 'TransactionID', header: 'Txn ID', size: 80 },
    { accessorKey: 'PurchaseTransactionID', header: 'Pur Txn ID', size: 80 },
    { accessorKey: 'ItemID', header: 'Item ID', size: 80 },
    { accessorKey: 'ItemGroupID', header: 'Grp ID', size: 80 },
    { accessorKey: 'ItemGroupNameID', header: 'GrpName ID', size: 80 },
    { accessorKey: 'PurchaseVoucherNo', header: 'P.O. No.', size: 120 },
    { accessorKey: 'PurchaseVoucherDate', header: 'P.O. Date', size: 110 },
    { accessorKey: 'ItemCode', header: 'Item Code', size: 100 },
    { accessorKey: 'ItemName', header: 'Item Name', size: 260 },
    {
      accessorKey: 'ProductHSNName',
      header: 'HSN Group',
      size: 150,
      cell: ({ row }) => (
        <button
          onClick={e => { e.stopPropagation(); setSelectedItemIndex(row.index); setHsnModalOpen(true) }}
          className="text-xs text-blue-600 hover:underline w-full text-left px-1"
        >
          {row.original.ProductHSNName || 'Select HSN'}
        </button>
      ),
    },
    {
      accessorKey: 'HSNCode', header: 'HSN Code', size: 90,
      cell: ({ row }) => (
        <span className="block px-2 py-1 text-xs rounded" style={{ background: 'rgb(var(--bg-muted))', color: 'rgb(var(--fg-default))' }}>
          {row.original.HSNCode || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'PurchaseOrderQuantity', header: 'PO Qty', size: 80,
      cell: ({ row }) => inlineInput(row.original.PurchaseOrderQuantity, v => handleFieldChange(row.index, 'PurchaseOrderQuantity', v)),
    },
    { accessorKey: 'ChallanQuantity', header: 'Challan Qty', size: 80 },
    { accessorKey: 'StockUnit', header: 'Unit', size: 65 },
    {
      accessorKey: 'ReceiptQuantity', header: 'Receipt Qty', size: 100,
      cell: ({ row }) => inlineInput(row.original.ReceiptQuantity, v => {
        handleQuantityChange(row.index, v)
        setTimeout(() => recalculateAllTotals(), 0)
      }),
    },
    {
      accessorKey: 'PurchaseRate', header: 'Rate', size: 90,
      cell: ({ row }) => inlineInput(row.original.PurchaseRate, v => {
        handleRateChange(row.index, v)
        setTimeout(() => recalculateAllTotals(), 0)
      }),
    },
    { accessorKey: 'PurchaseUnit', header: 'Pur Unit', size: 70 },
    { accessorKey: 'ReceiptWtPerPacking', header: 'Wt/Pack', size: 70 },
    { accessorKey: 'ExpectedDeliveryDate', header: 'Exp Del Date', size: 100 },
    { accessorKey: 'PurchaseTolerance', header: 'Tol %', size: 60 },
    { accessorKey: 'BasicAmount', header: 'Basic Amt', size: 100, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'UnitPerPacking', header: 'Unit/Pack', size: 80 },
    { accessorKey: 'ConversionFactor', header: 'Conv Factor', size: 90 },
    { accessorKey: 'SizeW', header: 'Width', size: 70 },
    {
      accessorKey: 'Disc', header: 'Disc %', size: 70,
      cell: ({ row }) => inlineInput(row.original.Disc, v => {
        handleDiscountChange(row.index, v)
        setTimeout(() => recalculateAllTotals(), 0)
      }, { min: 0, max: 100 }),
    },
    { accessorKey: 'AfterDisAmt', header: 'After Disc', size: 90, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    {
      accessorKey: 'GSTTaxPercentage', header: 'GST %', size: 60,
      cell: ({ row }) => inlineInput(row.original.GSTTaxPercentage, v => handleFieldChange(row.index, 'GSTTaxPercentage', v)),
    },
    {
      accessorKey: 'CGSTTaxPercentage', header: 'CGST %', size: 60,
      cell: ({ row }) => inlineInput(row.original.CGSTTaxPercentage, v => handleFieldChange(row.index, 'CGSTTaxPercentage', v)),
    },
    {
      accessorKey: 'SGSTTaxPercentage', header: 'SGST %', size: 60,
      cell: ({ row }) => inlineInput(row.original.SGSTTaxPercentage, v => handleFieldChange(row.index, 'SGSTTaxPercentage', v)),
    },
    {
      accessorKey: 'IGSTTaxPercentage', header: 'IGST %', size: 60,
      cell: ({ row }) => inlineInput(row.original.IGSTTaxPercentage, v => handleFieldChange(row.index, 'IGSTTaxPercentage', v)),
    },
    { accessorKey: 'CGSTAmt', header: 'CGST Amt', size: 80, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'SGSTAmt', header: 'SGST Amt', size: 80, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'IGSTAmt', header: 'IGST Amt', size: 80, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'TaxableAmount', header: 'Taxable', size: 90, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'TotalAmount', header: 'Total Amt', size: 95, cell: ({ getValue }) => <span className="block text-right text-xs font-semibold">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'ReceiptQuantityComp', header: 'Rcpt Qty Comp', size: 100 },
    {
      accessorKey: 'Narration', header: 'Remark', size: 140,
      cell: ({ row }) => (
        <input
          type="text"
          value={row.original.Narration}
          onChange={e => handleNarrationChange(row.index, e.target.value)}
          className="w-full px-2 py-1 text-xs border rounded"
          style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg-default))', borderColor: 'rgb(var(--bd-default))' }}
        />
      ),
    },
    { accessorKey: 'FYear', header: 'F-Year', size: 100 },
    { accessorKey: 'LandedAmt', header: 'Landed Amt', size: 90 },
    {
      accessorKey: 'LandedPrice', header: 'Landed Price', size: 100,
      cell: ({ row }) => inlineInput(row.original.LandedPrice, v => handleFieldChange(row.index, 'LandedPrice', v)),
    },
    createActionsColumn<InvoiceLineItem>({
      onDelete: handleDeleteLineItem,
      showView: false, showEdit: false, showDelete: true,
      mode: 'buttons', primaryActions: ['delete'],
    }),
  ], [handleQuantityChange, handleRateChange, handleDiscountChange, handleNarrationChange, handleFieldChange, handleDeleteLineItem, recalculateAllTotals])

  const chargeColumns = useMemo<ColumnDef<AdditionalCharge>[]>(() => [
    { accessorKey: 'LedgerName', header: 'Tax Ledger', size: 150 },
    {
      accessorKey: 'TaxRatePer', header: 'Tax %', size: 80,
      cell: ({ row }) => inlineInput(row.original.TaxRatePer, v => handleChargeTaxRateChange(row.index, v)),
    },
    { accessorKey: 'CalculateON', header: 'Calc On', size: 70 },
    { accessorKey: 'GSTApplicable', header: 'GST App', size: 80, cell: ({ getValue }) => <span className="text-xs">{getValue() ? 'Yes' : 'No'}</span> },
    { accessorKey: 'InAmount', header: 'In Amt', size: 70, cell: ({ getValue }) => <span className="text-xs">{getValue() ? 'Yes' : 'No'}</span> },
    {
      accessorKey: 'ChargesAmount', header: 'Amount', size: 100,
      cell: ({ row }) => inlineInput(row.original.ChargesAmount, v => handleChargeAmountChange(row.index, v)),
    },
    { accessorKey: 'IsService', header: 'Service', size: 70, cell: ({ getValue }) => <span className="text-xs">{getValue() ? 'Yes' : 'No'}</span> },
    { accessorKey: 'ProductHSNID', header: 'Grp Name', size: 90 },
    { accessorKey: 'HSNCode', header: 'HSN Code', size: 90 },
    { accessorKey: 'GSTTaxPercentage', header: 'GST %', size: 60 },
    { accessorKey: 'CGSTTaxPercentage', header: 'CGST %', size: 60 },
    { accessorKey: 'SGSTTaxPercentage', header: 'SGST %', size: 60 },
    { accessorKey: 'IGSTTaxPercentage', header: 'IGST %', size: 60 },
    { accessorKey: 'CGSTAmount', header: 'CGST Amt', size: 80, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'SGSTAmount', header: 'SGST Amt', size: 80, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'IGSTAmount', header: 'IGST Amt', size: 80, cell: ({ getValue }) => <span className="block text-right text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'TotalAmount', header: 'Total', size: 90, cell: ({ getValue }) => <span className="block text-right text-xs font-semibold">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'IsCumulative', header: 'Cumulative', size: 80 },
    { accessorKey: 'TaxType', header: 'Tax Type', size: 80 },
    { accessorKey: 'GSTLedgerType', header: 'GST Type', size: 80 },
    { accessorKey: 'LedgerID', header: 'Ledger ID', size: 80 },
    createActionsColumn<AdditionalCharge>({
      onDelete: handleDeleteCharge,
      showView: false, showEdit: false, showDelete: true,
      mode: 'buttons', primaryActions: ['delete'],
    }),
  ], [handleChargeTaxRateChange, handleChargeAmountChange, handleDeleteCharge])

  const filteredHSN = useMemo(() =>
    MOCK_PI_HSN_GROUPS.filter(g =>
      !hsnSearch ||
      g.ProductHSNName.toLowerCase().includes(hsnSearch.toLowerCase()) ||
      g.HSNCode.includes(hsnSearch)
    ), [hsnSearch])

  const gstBadge = (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
      supplierStateTin === companyStateTin ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {supplierStateTin === companyStateTin ? 'CGST + SGST (Intra-State)' : 'IGST (Inter-State)'}
    </span>
  )

  if (!isOpen) return null

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT (< 1024px) — full-page overlay with cards
  // ══════════════════════════════════════════════════════════════════════════
  const mobileContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-[rgb(var(--bg-default))]">
      {/* Mobile header */}
      <div className="flex-shrink-0 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-muted))] transition-colors">
            <ArrowLeft className="h-5 w-5 text-[rgb(var(--fg-default))]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[rgb(var(--fg-default))] truncate">
              {mode === 'create' ? 'Create Purchase Invoice' : 'Edit Invoice'}
            </h1>
            {voucherNo && <p className="text-xs font-mono text-[rgb(var(--fg-muted))] truncate">{voucherNo}</p>}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4 pb-24">

          {/* Invoice Details Card */}
          <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">Invoice Details</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Voucher Type</Label>
                  <Dropdown
                    options={MOCK_PI_VOUCHER_TYPES.map(v => ({ value: v.VoucherTypeID, label: v.VoucherTypeName }))}
                    value={selectedVoucherType?.toString()}
                    onValueChange={v => handleVoucherTypeChange(Number(v))}
                    placeholder="Select"
                    disabled={mode === 'edit'}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Voucher No.</Label>
                  <Input value={voucherNo} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Voucher Date</Label>
                  <DatePicker value={voucherDate} onChange={d => d instanceof Date && setVoucherDate(d)} className="w-full" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Purchase Ledger</Label>
                  <Dropdown
                    options={MOCK_PI_PURCHASE_LEDGERS.map(l => ({ value: l.LedgerID, label: l.LedgerName }))}
                    value={selectedPurchaseLedger?.toString()}
                    onValueChange={v => setSelectedPurchaseLedger(Number(v))}
                    placeholder="Select"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Supplier <span className="text-red-500">*</span></Label>
                <Dropdown
                  options={MOCK_PI_SUPPLIERS.map(s => ({ value: s.LedgerID, label: s.LedgerName }))}
                  value={selectedSupplier?.toString()}
                  onValueChange={v => handleSupplierChange(Number(v))}
                  placeholder="Select supplier"
                />
              </div>
              {mailingName && <p className="text-xs text-[rgb(var(--fg-muted))]">{mailingName}</p>}
              {selectedSupplier && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--fg-muted))]">GST:</span>
                  {gstBadge}
                </div>
              )}
              {(supplierState || supplierCountry) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[rgb(var(--fg-muted))]">State: </span><span className="font-medium text-[rgb(var(--fg-default))]">{supplierState || 'N/A'}</span></div>
                  <div><span className="text-[rgb(var(--fg-muted))]">Country: </span><span className="font-medium text-[rgb(var(--fg-default))]">{supplierCountry || 'N/A'}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          {lineItems.length > 0 && (
            <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
                <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">Items ({lineItems.length})</h3>
              </div>
              <div className="p-3 space-y-3">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="relative border border-[rgb(var(--bd-default))] rounded-lg p-3 bg-[rgb(var(--bg-default))]">
                    <button
                      onClick={() => handleDeleteLineItem(item)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="mb-3 pr-8">
                      <p className="text-sm font-bold text-[rgb(var(--fg-default))]">{item.ItemName}</p>
                      <p className="text-xs text-[rgb(var(--fg-muted))] font-mono">{item.ItemCode}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">PO: {item.PurchaseVoucherNo}</span>
                        <span className="text-sm font-bold text-green-600">₹{Number(item.TotalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* HSN */}
                      <div>
                        <Label className="text-xs mb-1 block text-[rgb(var(--fg-muted))]">HSN Group</Label>
                        <button
                          onClick={() => { setSelectedItemIndex(idx); setHsnModalOpen(true) }}
                          className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            item.ProductHSNName ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {item.ProductHSNName || 'Select HSN'}
                        </button>
                        {item.HSNCode && <p className="text-xs text-[rgb(var(--fg-muted))] mt-1">HSN: <span className="font-mono font-bold">{item.HSNCode}</span></p>}
                      </div>

                      {/* Quantities */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs mb-1 block">Receipt Qty</Label>
                          <Input
                            type="number"
                            value={item.ReceiptQuantity}
                            onChange={e => { handleQuantityChange(idx, parseFloat(e.target.value) || 0); setTimeout(() => recalculateAllTotals(), 0) }}
                            className="h-9 text-sm text-right"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Stock Unit</Label>
                          <Input value={item.StockUnit} readOnly disabled className="h-9 text-sm bg-[rgb(var(--bg-muted))]" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Rate</Label>
                          <Input
                            type="number"
                            value={item.PurchaseRate}
                            onChange={e => { handleRateChange(idx, parseFloat(e.target.value) || 0); setTimeout(() => recalculateAllTotals(), 0) }}
                            className="h-9 text-sm text-right"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Pur Unit</Label>
                          <Input value={item.PurchaseUnit} readOnly disabled className="h-9 text-sm bg-[rgb(var(--bg-muted))]" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Disc %</Label>
                          <Input
                            type="number"
                            value={item.Disc}
                            onChange={e => { handleDiscountChange(idx, parseFloat(e.target.value) || 0); setTimeout(() => recalculateAllTotals(), 0) }}
                            className="h-9 text-sm text-right"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">After Disc</Label>
                          <Input value={Number(item.AfterDisAmt || 0).toFixed(2)} readOnly disabled className="h-9 text-sm bg-[rgb(var(--bg-muted))] font-mono" />
                        </div>
                      </div>

                      {/* Tax amounts */}
                      {item.ProductHSNName && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[rgb(var(--bg-subtle))] rounded p-2">
                            <p className="text-[rgb(var(--fg-muted))] mb-0.5">GST {item.GSTTaxPercentage}%</p>
                            <p className="font-mono font-semibold text-[rgb(var(--fg-default))]">
                              CGST: ₹{Number(item.CGSTAmt || 0).toFixed(2)} | SGST: ₹{Number(item.SGSTAmt || 0).toFixed(2)}
                            </p>
                            {item.IGSTAmt > 0 && <p className="font-mono font-semibold text-[rgb(var(--fg-default))]">IGST: ₹{Number(item.IGSTAmt || 0).toFixed(2)}</p>}
                          </div>
                          <div className="bg-[rgb(var(--bg-subtle))] rounded p-2">
                            <p className="text-[rgb(var(--fg-muted))] mb-0.5">Tax Amount</p>
                            <p className="font-mono font-bold text-[rgb(var(--fg-default))]">₹{(item.CGSTAmt + item.SGSTAmt + item.IGSTAmt).toFixed(2)}</p>
                          </div>
                        </div>
                      )}

                      {/* Remark */}
                      <div>
                        <Label className="text-xs mb-1 block">Remark</Label>
                        <Input value={item.Narration} onChange={e => handleNarrationChange(idx, e.target.value)} className="text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Charges */}
          <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">Additional Charges ({additionalCharges.length})</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Dropdown
                  options={MOCK_PI_TAXES_LEDGERS.map(l => ({ value: l.LedgerID, label: l.LedgerName }))}
                  value={selectedChargeLedger?.toString()}
                  onValueChange={v => setSelectedChargeLedger(Number(v))}
                  placeholder="Select Tax Ledger"
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleAddCharge}><Plus className="h-4 w-4" /></Button>
              </div>
              {additionalCharges.map((charge, idx) => (
                <div key={idx} className="border border-[rgb(var(--bd-default))] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-[rgb(var(--fg-default))]">{charge.LedgerName}</p>
                    <button onClick={() => handleDeleteCharge(charge)} className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-1 block">Tax Rate %</Label>
                      <Input type="number" value={charge.TaxRatePer} onChange={e => handleChargeTaxRateChange(idx, parseFloat(e.target.value) || 0)} className="h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Amount</Label>
                      <Input type="number" value={charge.ChargesAmount} onChange={e => handleChargeAmountChange(idx, parseFloat(e.target.value) || 0)} className="h-9 text-sm" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[rgb(var(--fg-muted))] flex gap-3 flex-wrap">
                    <span>GST App: {charge.GSTApplicable ? 'Yes' : 'No'}</span>
                    <span>In Amt: {charge.InAmount ? 'Yes' : 'No'}</span>
                    <span>Total: ₹{Number(charge.TotalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Information */}
          <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">Bill Information</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1 block">Bill No. <span className="text-red-500">*</span></Label><Input value={billNo} onChange={e => setBillNo(e.target.value)} placeholder="INV-2024-001" /></div>
                <div><Label className="text-xs mb-1 block">Bill Date</Label><DatePicker value={billDate} onChange={d => d instanceof Date && setBillDate(d)} className="w-full" /></div>
                <div><Label className="text-xs mb-1 block">Delivery Note No.</Label><Input value={deliveryNoteNo} onChange={e => setDeliveryNoteNo(e.target.value)} /></div>
                <div><Label className="text-xs mb-1 block">Delivery Note Date</Label><DatePicker value={deliveryNoteDate} onChange={d => d instanceof Date && setDeliveryNoteDate(d)} className="w-full" /></div>
                <div><Label className="text-xs mb-1 block">E-Way Bill No.</Label><Input value={eWayBillNo} onChange={e => setEWayBillNo(e.target.value)} /></div>
                <div><Label className="text-xs mb-1 block">E-Way Bill Date</Label><DatePicker value={eWayBillDate} onChange={d => d instanceof Date && setEWayBillDate(d)} className="w-full" /></div>
              </div>
            </div>
          </div>

          {/* TCS */}
          <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">TCS &amp; Other Charges</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1 block">TCS Rate (%)</Label><Input type="number" value={tcsRate} onChange={e => setTcsRate(Number(e.target.value))} className="text-sm" /></div>
                <div><Label className="text-xs mb-1 block">TCS Amount</Label><Input value={tcsAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-sm" /></div>
                <div className="col-span-2"><Label className="text-xs mb-1 block">Other Charges</Label><Input value={otherChargesAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-sm" /></div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">Financial Summary</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Basic Amount', value: basicAmount },
                  { label: 'Tax Amount', value: taxAmount },
                  { label: 'TCS Amount', value: tcsAmount },
                  { label: 'Other Charges', value: otherChargesAmount },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[rgb(var(--bg-subtle))] rounded-lg p-3 border border-[rgb(var(--bd-default))]">
                    <p className="text-[10px] uppercase tracking-wide text-[rgb(var(--fg-muted))] font-bold mb-1">{label}</p>
                    <p className="text-base font-bold text-[rgb(var(--fg-default))] font-mono">₹{Number(value).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-[rgb(var(--color-primary))] rounded-lg p-3 text-center">
                <p className="text-xs text-white/80 font-semibold mb-1">Gross Amount</p>
                <p className="text-2xl font-bold text-white font-mono">₹{netAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--bd-default))] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
              <h3 className="text-sm font-bold text-[rgb(var(--fg-default))]">Remarks</h3>
            </div>
            <div className="p-4">
              <textarea
                value={narration}
                onChange={e => setNarration(e.target.value)}
                rows={3}
                placeholder="Additional remarks..."
                className="w-full px-3 py-2 text-sm border rounded-md resize-none"
                style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg-default))', borderColor: 'rgb(var(--bd-default))' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="flex-shrink-0 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] px-4 py-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear} disabled={saving} className="flex-1 gap-1.5">
            <RotateCcw className="h-4 w-4" />Clear
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1.5">
            <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1 gap-1.5">
            <XCircle className="h-4 w-4" />Cancel
          </Button>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (≥ 1024px) — fullscreen Dialog
  // ══════════════════════════════════════════════════════════════════════════
  const desktopContent = (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="fullscreen"
        hideCloseButton
        disableOutsideClick
        className="p-0 flex flex-col overflow-hidden"
      >
        {/* Dialog header */}
        <DialogHeader className="flex-shrink-0 px-5 py-2.5 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-[rgb(var(--fg-default))]">
              {mode === 'create' ? 'Purchase Invoice Creation' : `Purchase Invoice — ${selectedInvoice?.VoucherNo}`}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[rgb(var(--bg-muted))] text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">

          {/* ── 12-col header row ── */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Voucher Type</Label>
              <Dropdown
                options={MOCK_PI_VOUCHER_TYPES.map(v => ({ value: v.VoucherTypeID, label: v.VoucherTypeName }))}
                value={selectedVoucherType?.toString()}
                onValueChange={v => handleVoucherTypeChange(Number(v))}
                placeholder="Select"
                disabled={mode === 'edit'}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Voucher No.</Label>
              <Input value={voucherNo} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-xs" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Voucher Date</Label>
              <DatePicker value={voucherDate} onChange={d => d instanceof Date && setVoucherDate(d)} className="w-full" />
            </div>
            <div className="col-span-3">
              <Label className="text-xs mb-1 block">Supplier <span className="text-red-500">*</span></Label>
              <Dropdown
                options={MOCK_PI_SUPPLIERS.map(s => ({ value: s.LedgerID, label: s.LedgerName }))}
                value={selectedSupplier?.toString()}
                onValueChange={v => handleSupplierChange(Number(v))}
                placeholder="Select supplier"
              />
            </div>
            <div className="col-span-3">
              <Label className="text-xs mb-1 block">Purchase Ledger</Label>
              <Dropdown
                options={MOCK_PI_PURCHASE_LEDGERS.map(l => ({ value: l.LedgerID, label: l.LedgerName }))}
                value={selectedPurchaseLedger?.toString()}
                onValueChange={v => setSelectedPurchaseLedger(Number(v))}
                placeholder="Select ledger"
              />
            </div>
          </div>

          {/* State / Country / GST type info */}
          <div className="flex items-center gap-4 text-xs text-[rgb(var(--fg-muted))] -mt-1">
            {supplierState && <span>State: <span className="font-medium text-[rgb(var(--fg-default))]">{supplierState}</span></span>}
            {supplierCountry && <span>Country: <span className="font-medium text-[rgb(var(--fg-default))]">{supplierCountry}</span></span>}
            {selectedSupplier && <span>GST: {gstBadge}</span>}
          </div>

          {/* ── Line items grid ── */}
          <DataGrid
            data={lineItems}
            columns={lineItemColumns}
            enableFiltering={false}
            enableSearch={false}
            enableFilterRow={false}
            enablePagination={false}
            maxHeight="300px"
            initialColumnVisibility={initialLineItemVisibility}
          />

          {/* ── 5+7 bottom section ── */}
          <div className="grid grid-cols-12 gap-3">
            {/* Left: Additional Charges (5 cols) */}
            <div className="col-span-5">
              <div className="flex items-center gap-2 mb-2">
                <Dropdown
                  options={MOCK_PI_TAXES_LEDGERS.map(l => ({ value: l.LedgerID, label: l.LedgerName }))}
                  value={selectedChargeLedger?.toString()}
                  onValueChange={v => setSelectedChargeLedger(Number(v))}
                  placeholder="Select tax ledger"
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleAddCharge} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />Add
                </Button>
              </div>
              <DataGrid
                title="Additional Charges"
                data={additionalCharges}
                columns={chargeColumns}
                enableFiltering={false}
                enableSearch={false}
                enableFilterRow={false}
                enablePagination={false}
                enableExport={false}
                maxHeight="200px"
                initialColumnVisibility={initialChargeVisibility}
              />
            </div>

            {/* Right: Summary + Bill Details (7 cols = 4-col inner grid) */}
            <div className="col-span-7">
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1: Basic Amt | Bill No | Bill Date | D.Note No */}
                <div>
                  <Label className="text-xs mb-1 block">Basic Amount</Label>
                  <Input value={basicAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-xs text-right" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Bill No. <span className="text-red-500">*</span></Label>
                  <Input value={billNo} onChange={e => setBillNo(e.target.value)} placeholder="INV-2024-001" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Bill Date</Label>
                  <DatePicker value={billDate} onChange={d => d instanceof Date && setBillDate(d)} className="w-full" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">D. Note No.</Label>
                  <Input value={deliveryNoteNo} onChange={e => setDeliveryNoteNo(e.target.value)} />
                </div>

                {/* Row 2: Total Tax | E-Way Bill No | E-Way Bill Date | TCS Rate */}
                <div>
                  <Label className="text-xs mb-1 block">Total Tax</Label>
                  <Input value={taxAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-xs text-right" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">E-Way Bill No.</Label>
                  <Input value={eWayBillNo} onChange={e => setEWayBillNo(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">E-Way Bill Date</Label>
                  <DatePicker value={eWayBillDate} onChange={d => d instanceof Date && setEWayBillDate(d)} className="w-full" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">TCS Rate (%)</Label>
                  <Input type="number" value={tcsRate} onChange={e => setTcsRate(Number(e.target.value))} className="text-right" />
                </div>

                {/* Row 3: Round Off | TCS Amt | Other Charges | Gross Amt */}
                <div>
                  <Label className="text-xs mb-1 block">Round Off A/C</Label>
                  <Input type="number" value={roundOff} onChange={e => setRoundOff(Number(e.target.value))} className="text-right" step="0.01" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">TCS Amount</Label>
                  <Input value={tcsAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-xs text-right" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Other Charges</Label>
                  <Input value={otherChargesAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-xs text-right" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block font-bold text-[rgb(var(--color-primary))]">Gross Amount</Label>
                  <Input value={netAmount.toFixed(2)} readOnly disabled className="bg-[rgb(var(--bg-muted))] font-mono text-sm font-bold text-right text-[rgb(var(--color-primary))]" />
                </div>

                {/* Row 4: Remark (full width) */}
                <div className="col-span-4">
                  <Label className="text-xs mb-1 block">Remark</Label>
                  <textarea
                    value={narration}
                    onChange={e => setNarration(e.target.value)}
                    rows={2}
                    placeholder="Enter remark..."
                    className="w-full px-3 py-2 text-xs border rounded-md resize-none"
                    style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--fg-default))', borderColor: 'rgb(var(--bd-default))' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="flex-shrink-0 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] px-5 py-3">
          <div className="flex items-center justify-between">
            {/* Totals summary */}
            <div className="flex items-center gap-4 text-xs text-[rgb(var(--fg-muted))]">
              <span>Basic: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{basicAmount.toFixed(2)}</span></span>
              {cgstTotal > 0 && <span>CGST: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{cgstTotal.toFixed(2)}</span></span>}
              {sgstTotal > 0 && <span>SGST: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{sgstTotal.toFixed(2)}</span></span>}
              {igstTotal > 0 && <span>IGST: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{igstTotal.toFixed(2)}</span></span>}
              {cgstTotal === 0 && sgstTotal === 0 && igstTotal === 0 && <span>Tax: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{taxAmount.toFixed(2)}</span></span>}
              {tcsAmount > 0 && <span>TCS: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{tcsAmount.toFixed(2)}</span></span>}
              <span>Charges: <span className="font-semibold text-[rgb(var(--fg-default))]">₹{otherChargesAmount.toFixed(2)}</span></span>
              <span className="pl-2 border-l border-[rgb(var(--bd-default))] text-sm font-bold text-[rgb(var(--color-primary))]">
                Net: ₹{netAmount.toFixed(2)}
              </span>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClear} disabled={saving} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />Clear
              </Button>
              <Button onClick={handleSave} disabled={saving} className="min-w-[120px] gap-1.5">
                <Save className="h-4 w-4" />{saving ? 'Saving...' : (mode === 'create' ? 'Create Invoice' : 'Update Invoice')}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={saving} className="gap-1.5">
                <XCircle className="h-4 w-4" />Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // ── HSN Search Modal ──────────────────────────────────────────────────────
  const hsnModal = hsnModalOpen && (
    isDesktop ? (
      <Dialog open={hsnModalOpen} onOpenChange={() => { setHsnModalOpen(false); setHsnSearch('') }}>
        <DialogContent className="w-[90vw] max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b border-[rgb(var(--bd-default))]">
            <DialogTitle className="text-sm font-semibold">Select HSN Group</DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3">
            <Input
              value={hsnSearch}
              onChange={e => setHsnSearch(e.target.value)}
              placeholder="Search by name or HSN code..."
              className="mb-3"
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredHSN.map(group => (
                <button
                  key={group.ProductHSNID}
                  onClick={() => { handleHSNSelect(group); setHsnSearch('') }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[rgb(var(--bg-muted))] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[rgb(var(--fg-default))]">{group.ProductHSNName}</span>
                    <span className="text-xs text-[rgb(var(--fg-muted))]">GST {group.GSTTaxPercentage}%</span>
                  </div>
                  <span className="text-xs text-[rgb(var(--fg-muted))]">HSN: {group.HSNCode}</span>
                </button>
              ))}
              {filteredHSN.length === 0 && (
                <p className="text-sm text-[rgb(var(--fg-muted))] text-center py-6">No HSN groups found.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    ) : (
      /* Mobile HSN — full page overlay */
      <div className="fixed inset-0 z-[60] flex flex-col bg-[rgb(var(--bg-default))]">
        <div className="flex-shrink-0 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setHsnModalOpen(false); setSelectedItemIndex(null); setHsnSearch('') }}
              className="p-2 rounded-full hover:bg-[rgb(var(--bg-muted))] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[rgb(var(--fg-default))]" />
            </button>
            <h1 className="text-base font-bold text-[rgb(var(--fg-default))]">Select HSN Group</h1>
          </div>
        </div>
        <div className="px-4 pt-3 pb-2 border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))]">
          <Input value={hsnSearch} onChange={e => setHsnSearch(e.target.value)} placeholder="Search HSN code or name..." autoFocus />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filteredHSN.map(group => (
            <button
              key={group.ProductHSNID}
              onClick={() => { handleHSNSelect(group); setHsnSearch('') }}
              className="w-full text-left px-4 py-3 rounded-lg border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-muted))] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[rgb(var(--fg-default))]">{group.ProductHSNName}</span>
                <span className="text-xs font-semibold text-[rgb(var(--color-primary))]">GST {group.GSTTaxPercentage}%</span>
              </div>
              <span className="text-xs text-[rgb(var(--fg-muted))] font-mono">HSN: {group.HSNCode}</span>
            </button>
          ))}
          {filteredHSN.length === 0 && (
            <p className="text-sm text-[rgb(var(--fg-muted))] text-center py-8">No HSN groups found.</p>
          )}
        </div>
      </div>
    )
  )

  return (
    <>
      {!isDesktop && mobileContent}
      {isDesktop && desktopContent}
      {hsnModal}
    </>
  )
}
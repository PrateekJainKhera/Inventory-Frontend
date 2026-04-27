'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Plus, Trash2, Calendar, Save, Printer, XCircle, MapPin, RotateCcw, FileText } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Button, Input, Label, Textarea, Dropdown, FileAttachment,
} from '@/components/ui'
import type { AttachedFile } from '@/components/ui'
import { DatePicker } from '@/components/ui'
import { Footer } from '@/components/layout'
import { DataGrid } from '@/components/datagrid'
import { createActionsColumn } from '@/components/datagrid/columns/ActionsColumn'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { formatDate } from '@/lib/utils'
import {
  type PurchaseOrderItem,
  type PurchaseOrderDetailItem,
  type PaymentTermsItem,
  type AdditionalChargesItem,
  type DeliveryScheduleItem,
  type HSNItem,
  PO_SUPPLIERS,
  PO_CONTACT_PERSONS,
  PO_TRANSPORT_MODES,
  PO_CURRENCIES,
  PO_DIVISIONS,
  PO_PAYMENT_TERMS_OPTIONS,
  PO_CHARGE_LEDGERS,
  PO_DELIVERY_ADDRESSES,
  PO_HSN_LIST,
} from '@/data/mock/purchaseOrder'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderData?: PurchaseOrderItem | null
  selectedRequisitions?: PurchaseOrderItem[]
  mode?: 'create' | 'edit' | 'view' | 'close'
}

const TODAY = new Date()
const genId = () => Date.now() + Math.random()
const genPONo = () => `PO-${Date.now().toString().slice(-6)}`

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  onSuccess,
  orderData,
  selectedRequisitions = [],
  mode = 'create',
}: Props) {
  const alerts = useGlobalAlert()
  const isReadOnly = mode === 'view' || mode === 'close'
  const poNo = useMemo(() => orderData?.VoucherNo ?? genPONo(), [orderData])

  // ── Form state ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [closedRemark, setClosedRemark] = useState('')
  const [formData, setFormData] = useState({
    voucherDate: TODAY,
    supplierName: '',
    contactPerson: '',
    purchaseDivision: 'DIV001',
    currencyCode: 'INR',
    poApprovalBy: '',
    modeOfTransport: '',
    dealerName: '',
    deliveryAt: '',
    purchaseReference: '',
  })
  const [items, setItems] = useState<PurchaseOrderDetailItem[]>([])
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermsItem[]>([])
  const [paymentTermInput, setPaymentTermInput] = useState('')
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalChargesItem[]>([])
  const [chargesLedger, setChargesLedger] = useState('')
  const [deliverySchedules, setDeliverySchedules] = useState<DeliveryScheduleItem[]>([])
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])

  // ── Sub-modal flags ────────────────────────────────────────────────────────
  const [oldPOOpen, setOldPOOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleItemIdx, setScheduleItemIdx] = useState<number | null>(null)
  const [scheduleQty, setScheduleQty] = useState('')
  const [scheduleDate, setScheduleDate] = useState<Date>(TODAY)
  const [hsnOpen, setHsnOpen] = useState(false)
  const [hsnItemIdx, setHsnItemIdx] = useState<number | null>(null)
  const [hsnSearch, setHsnSearch] = useState('')

  // ── Populate from orderData (view/edit/close) ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    if (orderData && mode !== 'create') {
      setFormData({
        voucherDate: new Date(orderData.VoucherDate),
        supplierName: String(orderData.LedgerID ?? ''),
        contactPerson: '',
        purchaseDivision: orderData.PurchaseDivision || 'DIV001',
        currencyCode: orderData.CurrencyCode || 'INR',
        poApprovalBy: '',
        modeOfTransport: orderData.ModeOfTransport || '',
        dealerName: '',
        deliveryAt: orderData.DeliveryAddress || '',
        purchaseReference: orderData.PurchaseReference || '',
      })
      setItems([{
        TransactionID: orderData.TransactionID,
        ItemID: orderData.ItemID ?? 0,
        ItemCode: orderData.ItemCode ?? '',
        ItemGroupName: orderData.ItemGroupName ?? '',
        ItemSubGroupName: orderData.ItemSubGroupName,
        ItemName: orderData.ItemName ?? '',
        RefJobCardContentNo: orderData.RefJobCardContentNo,
        RequiredQuantity: orderData.RequiredQuantity ?? 0,
        PurchaseQuantity: orderData.PurchaseQuantity ?? 0,
        PurchaseQuantityComp: orderData.PurchaseQuantityComp ?? 0,
        StockUnit: orderData.StockUnit ?? '',
        PurchaseUnit: orderData.PurchaseUnit ?? '',
        PurchaseRate: orderData.PurchaseRate ?? 0,
        BasicAmount: orderData.BasicAmount ?? 0,
        Disc: 0,
        AfterDisAmt: orderData.BasicAmount ?? 0,
        TaxableAmount: orderData.TaxableAmount ?? 0,
        TotalAmount: orderData.NetAmount ?? 0,
        HSNCode: orderData.HSNCode,
        ProductHSNName: orderData.ProductHSNName,
        GSTTaxPercentage: orderData.GSTTaxPercentage ?? 0,
        CGSTTaxPercentage: orderData.CGSTTaxPercentage ?? 0,
        SGSTTaxPercentage: orderData.SGSTTaxPercentage ?? 0,
        IGSTTaxPercentage: orderData.IGSTTaxPercentage ?? 0,
        CGSTAmt: 0, SGSTAmt: 0, IGSTAmt: 0,
        ExpectedDeliveryDate: orderData.ExpectedDeliveryDate,
        Tolerance: 0,
      }])
    }
  }, [isOpen, orderData, mode])

  // ── Club requisitions on create ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || mode !== 'create') return
    if (selectedRequisitions.length === 0) { setItems([]); return }

    const map = new Map<string, PurchaseOrderDetailItem>()
    selectedRequisitions.forEach((req) => {
      const key = `${req.ItemID}_${0}` // ItemID + HSN (0 = no HSN yet)
      if (map.has(key)) {
        const ex = map.get(key)!
        const pendingQty = (ex.PurchaseQuantityComp ?? 0) + (req.PurchaseQuantityComp ?? req.RequiredQuantity ?? 0)
        map.set(key, {
          ...ex,
          PurchaseQuantityComp: pendingQty,
          PurchaseQuantity: pendingQty,
          RequiredQuantity: (ex.RequiredQuantity ?? 0) + (req.RequiredQuantity ?? 0),
        })
      } else {
        const pendingQty = req.PurchaseQuantityComp ?? req.RequiredQuantity ?? 0
        map.set(key, {
          TransactionID: genId(),
          ItemID: req.ItemID ?? 0,
          ItemCode: req.ItemCode ?? '',
          ItemGroupName: req.ItemGroupName ?? '',
          ItemSubGroupName: req.ItemSubGroupName,
          ItemName: req.ItemName ?? '',
          RefJobCardContentNo: req.RefJobCardContentNo,
          RequiredQuantity: req.RequiredQuantity ?? 0,
          RequiredNoOfPacks: 0,
          QuantityPerPack: 0,
          PurchaseQuantityComp: pendingQty,
          PurchaseQuantity: pendingQty,
          PurchaseQuantityInStockUnit: 0,
          StockUnit: req.StockUnit ?? '',
          PurchaseUnit: req.PurchaseUnit ?? '',
          PurchaseRate: 0,
          BasicAmount: 0,
          Disc: 0,
          AfterDisAmt: 0,
          TaxableAmount: 0,
          TotalAmount: 0,
          CGSTAmt: 0, SGSTAmt: 0, IGSTAmt: 0,
          Tolerance: 0,
        })
      }
    })
    setItems(Array.from(map.values()))
  }, [isOpen, selectedRequisitions, mode])

  // ── Amount calculations ────────────────────────────────────────────────────
  const amounts = useMemo(() => {
    const basicAmt = items.reduce((s, i) => s + (i.BasicAmount ?? 0), 0)
    const gstAmt   = items.reduce((s, i) => s + (i.CGSTAmt ?? 0) + (i.SGSTAmt ?? 0) + (i.IGSTAmt ?? 0), 0)
    const otherAmt = additionalCharges.reduce((s, c) => s + (c.Amount ?? 0), 0)
    return {
      basicAmt: basicAmt.toFixed(2),
      gstAmt:   gstAmt.toFixed(2),
      otherAmt: otherAmt.toFixed(2),
      netAmt:   (basicAmt + gstAmt + otherAmt).toFixed(2),
    }
  }, [items, additionalCharges])

  // ── Item updater with auto-calculations ───────────────────────────────────
  const recalcItem = (item: PurchaseOrderDetailItem): PurchaseOrderDetailItem => {
    const qty  = item.PurchaseQuantity ?? 0
    const rate = item.PurchaseRate ?? 0
    const disc = item.Disc ?? 0
    const basic = qty * rate
    const afterDis = basic * (1 - disc / 100)
    const taxable = afterDis
    const cgst = taxable * ((item.CGSTTaxPercentage ?? 0) / 100)
    const sgst = taxable * ((item.SGSTTaxPercentage ?? 0) / 100)
    const igst = taxable * ((item.IGSTTaxPercentage ?? 0) / 100)
    return { ...item, BasicAmount: basic, AfterDisAmt: afterDis, TaxableAmount: taxable, CGSTAmt: cgst, SGSTAmt: sgst, IGSTAmt: igst, TotalAmount: taxable + cgst + sgst + igst }
  }

  const updateItem = useCallback((idx: number, patch: Partial<PurchaseOrderDetailItem>) => {
    setItems(prev => {
      const next = [...prev]
      const merged = { ...next[idx], ...patch }
      // Recalc packs → qty
      if ('RequiredNoOfPacks' in patch || 'QuantityPerPack' in patch) {
        merged.PurchaseQuantity = (merged.RequiredNoOfPacks ?? 0) * (merged.QuantityPerPack ?? 0)
      }
      next[idx] = recalcItem(merged)
      return next
    })
  }, [])

  const deleteItem = useCallback((idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }, [])

  // ── Payment terms ──────────────────────────────────────────────────────────
  const handleAddPaymentTerm = () => {
    if (!paymentTermInput.trim()) { alerts.showError('Validation', 'Payment term cannot be empty'); return }
    setPaymentTerms(prev => [...prev, { id: genId(), TermsDescription: paymentTermInput }])
    setPaymentTermInput('')
  }

  // ── Additional charges ─────────────────────────────────────────────────────
  const handleAddCharge = () => {
    if (!chargesLedger) { alerts.showError('Validation', 'Please select a ledger'); return }
    const ledgerLabel = PO_CHARGE_LEDGERS.find(l => l.value === chargesLedger)?.label ?? ''
    setAdditionalCharges(prev => [...prev, {
      id: genId(), LedgerID: Number(chargesLedger), LedgerName: ledgerLabel,
      Percentage: 0, CalculateOn: 'Basic', GSTApplicable: true,
      InAmountChecked: false, InAmount: 0, Amount: 0, TaxType: 'Charges',
    }])
    setChargesLedger('')
  }

  // ── Delivery schedule ──────────────────────────────────────────────────────
  const handleAddSchedule = () => {
    if (!scheduleQty) { alerts.showError('Validation', 'Enter schedule quantity'); return }
    if (scheduleItemIdx === null) return
    const item = items[scheduleItemIdx]
    setDeliverySchedules(prev => [...prev, {
      id: genId(), ItemID: item.ItemID, ItemCode: item.ItemCode,
      Quantity: parseFloat(scheduleQty), PurchaseUnit: item.PurchaseUnit, SchDate: scheduleDate,
    }])
    setScheduleQty('')
  }

  // ── HSN select ─────────────────────────────────────────────────────────────
  const handleHSNSelect = (hsn: HSNItem) => {
    if (hsnItemIdx === null) return
    setItems(prev => {
      const next = [...prev]
      next[hsnItemIdx] = recalcItem({
        ...next[hsnItemIdx],
        ProductHSNID: hsn.ProductHSNID,
        ProductHSNName: hsn.ProductHSNName,
        HSNCode: hsn.HSNCode,
        GSTTaxPercentage: hsn.GSTTaxPercentage,
        CGSTTaxPercentage: hsn.CGSTTaxPercentage,
        SGSTTaxPercentage: hsn.SGSTTaxPercentage,
        IGSTTaxPercentage: hsn.IGSTTaxPercentage,
      })
      return next
    })
    setHsnOpen(false)
    setHsnItemIdx(null)
  }

  // ── Save / Close PO ────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!formData.supplierName) { alerts.showError('Validation', 'Supplier name is required'); return }
    if (!formData.modeOfTransport) { alerts.showError('Validation', 'Mode of transport is required'); return }
    if (items.length === 0) { alerts.showError('Validation', 'Please add at least one item'); return }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      onSuccess()
      onClose()
    }, 500)
  }

  const handleClosePOAction = () => {
    if (!closedRemark.trim()) { alerts.showWarning('Validation', 'Please enter a closed remark'); return }
    alerts.showConfirmation('Close Purchase Order', 'Are you sure you want to close this purchase order?', () => {
      setSaving(true)
      setTimeout(() => { setSaving(false); onSuccess(); onClose() }, 500)
    })
  }

  const handleClear = () => {
    setFormData({ voucherDate: TODAY, supplierName: '', contactPerson: '', purchaseDivision: 'DIV001', currencyCode: 'INR', poApprovalBy: '', modeOfTransport: '', dealerName: '', deliveryAt: '', purchaseReference: '' })
    setItems([])
    setPaymentTerms([])
    setAdditionalCharges([])
    setDeliverySchedules([])
    setAttachedFiles([])
    alerts.showSuccess('Cleared', 'Form cleared successfully')
  }

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))

  // ── Item grid columns ──────────────────────────────────────────────────────
  const itemColumns = useMemo((): ColumnDef<PurchaseOrderDetailItem>[] => [
    { accessorKey: 'ItemGroupName',   header: 'Group Name',   size: 110, cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    { accessorKey: 'ItemCode',        header: 'Item Code',    size: 80,  cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    { accessorKey: 'ItemName',        header: 'Item Name',    size: 200, cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    { accessorKey: 'RequiredQuantity',header: 'Req.Qty(S.U.)',size: 80,  cell: ({ getValue }) => <span className="text-xs">{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'StockUnit',       header: 'Stock Unit',   size: 70,  cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    {
      accessorKey: 'RequiredNoOfPacks',
      header: 'No. of Packs',
      size: 85,
      cell: ({ row }) => !isReadOnly ? (
        <input type="number" value={row.original.RequiredNoOfPacks ?? ''} min={0}
          onChange={e => updateItem(row.index, { RequiredNoOfPacks: parseFloat(e.target.value) || 0 })}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]" />
      ) : <span className="text-xs">{row.original.RequiredNoOfPacks ?? 0}</span>,
    },
    {
      accessorKey: 'QuantityPerPack',
      header: 'Qty/Pack',
      size: 75,
      cell: ({ row }) => !isReadOnly ? (
        <input type="number" value={row.original.QuantityPerPack ?? ''} min={0}
          onChange={e => updateItem(row.index, { QuantityPerPack: parseFloat(e.target.value) || 0 })}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]" />
      ) : <span className="text-xs">{row.original.QuantityPerPack ?? 0}</span>,
    },
    {
      accessorKey: 'PurchaseQuantity',
      header: 'P.O.Qty(P.U.)',
      size: 90,
      cell: ({ row }) => {
        const maxQty = row.original.PurchaseQuantityComp
        return !isReadOnly ? (
          <div>
            <input
              type="number"
              value={row.original.PurchaseQuantity ?? ''}
              min={0}
              max={maxQty}
              onChange={e => {
                const val = parseFloat(e.target.value) || 0
                const capped = maxQty != null ? Math.min(val, maxQty) : val
                updateItem(row.index, { PurchaseQuantity: capped })
              }}
              className={`w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] ${
                maxQty != null && (row.original.PurchaseQuantity ?? 0) > maxQty
                  ? 'border-red-500'
                  : 'border-[rgb(var(--bd-default))]'
              }`}
            />
            {maxQty != null && <div className="text-[10px] text-[rgb(var(--fg-muted))] text-right">max {maxQty}</div>}
          </div>
        ) : <span className="text-xs">{Number(row.original.PurchaseQuantity ?? 0).toFixed(2)}</span>
      },
    },
    {
      accessorKey: 'PurchaseRate',
      header: 'Rate',
      size: 70,
      cell: ({ row }) => !isReadOnly ? (
        <input type="number" value={row.original.PurchaseRate ?? ''} min={0}
          onChange={e => updateItem(row.index, { PurchaseRate: parseFloat(e.target.value) || 0 })}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]" />
      ) : <span className="text-xs">{Number(row.original.PurchaseRate ?? 0).toFixed(2)}</span>,
    },
    { accessorKey: 'PurchaseUnit',    header: 'P. Unit',      size: 70,  cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    {
      accessorKey: 'ProductHSNName',
      header: 'HSN',
      size: 110,
      cell: ({ row }) => (
        <button
          onClick={() => { if (!isReadOnly) { setHsnItemIdx(row.index); setHsnOpen(true) } }}
          disabled={isReadOnly}
          className="text-xs text-[rgb(var(--color-primary))] hover:underline disabled:text-[rgb(var(--fg-muted))] disabled:no-underline cursor-pointer"
        >
          {row.original.ProductHSNName || 'Select HSN'}
        </button>
      ),
    },
    { accessorKey: 'HSNCode',         header: 'HSN Code',     size: 90,  cell: ({ getValue }) => <span className="text-xs">{getValue() as string || ''}</span> },
    {
      accessorKey: 'ExpectedDeliveryDate',
      header: 'Exp. Delivery',
      size: 130,
      cell: ({ row }) => !isReadOnly ? (
        <DatePicker
          value={row.original.ExpectedDeliveryDate ? new Date(row.original.ExpectedDeliveryDate) : undefined}
          onChange={d => updateItem(row.index, { ExpectedDeliveryDate: d instanceof Date ? d.toISOString().split('T')[0] : undefined })}
          className="h-7 w-28 text-xs"
        />
      ) : <span className="text-xs">{row.original.ExpectedDeliveryDate ? formatDate(row.original.ExpectedDeliveryDate) : ''}</span>,
    },
    {
      accessorKey: 'Tolerance',
      header: 'Tol. %',
      size: 65,
      cell: ({ row }) => !isReadOnly ? (
        <input type="number" value={row.original.Tolerance ?? ''} min={0} max={100}
          onChange={e => updateItem(row.index, { Tolerance: parseFloat(e.target.value) || 0 })}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]" />
      ) : <span className="text-xs">{row.original.Tolerance ?? 0}</span>,
    },
    {
      accessorKey: 'Disc',
      header: 'Disc. %',
      size: 65,
      cell: ({ row }) => !isReadOnly ? (
        <input type="number" value={row.original.Disc ?? ''} min={0} max={100}
          onChange={e => updateItem(row.index, { Disc: parseFloat(e.target.value) || 0 })}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]" />
      ) : <span className="text-xs">{row.original.Disc ?? 0}</span>,
    },
    { accessorKey: 'CGSTTaxPercentage', header: 'CGST %', size: 65, cell: ({ getValue }) => <span className="text-xs">{Number(getValue() ?? 0).toFixed(2)}%</span> },
    { accessorKey: 'SGSTTaxPercentage', header: 'SGST %', size: 65, cell: ({ getValue }) => <span className="text-xs">{Number(getValue() ?? 0).toFixed(2)}%</span> },
    { accessorKey: 'IGSTTaxPercentage', header: 'IGST %', size: 65, cell: ({ getValue }) => <span className="text-xs">{Number(getValue() ?? 0).toFixed(2)}%</span> },
    { accessorKey: 'CGSTAmt',           header: 'CGST Amt', size: 85, cell: ({ getValue }) => <span className="text-xs">₹{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'SGSTAmt',           header: 'SGST Amt', size: 85, cell: ({ getValue }) => <span className="text-xs">₹{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'IGSTAmt',           header: 'IGST Amt', size: 85, cell: ({ getValue }) => <span className="text-xs">₹{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'TotalAmount',       header: 'Total Amt', size: 100, cell: ({ getValue }) => <span className="text-xs font-medium">₹{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: 'RefJobCardContentNo', header: 'Job Card', size: 110, cell: ({ getValue }) => <span className="text-xs">{getValue() as string || ''}</span> },
    {
      accessorKey: 'Remark',
      header: 'Remark',
      size: 200,
      cell: ({ row }) => !isReadOnly ? (
        <input type="text" value={row.original.Remark ?? ''}
          onChange={e => updateItem(row.index, { Remark: e.target.value })}
          className="w-full px-1.5 py-0.5 text-xs border rounded bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]" />
      ) : <span className="text-xs">{row.original.Remark || ''}</span>,
    },
    // Schedule button column
    {
      id: 'schedule',
      header: 'Schedule',
      size: 70,
      cell: ({ row }) => (
        <button
          onClick={() => {
            if (!isReadOnly) {
              setScheduleItemIdx(row.index)
              setScheduleQty(String(row.original.PurchaseQuantity ?? ''))
              setScheduleDate(TODAY)
              setScheduleOpen(true)
            }
          }}
          disabled={isReadOnly}
          className="flex items-center justify-center w-full h-7 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 rounded disabled:opacity-40 transition-colors"
          title="Delivery Schedule"
        >
          <Calendar className="h-3.5 w-3.5" />
        </button>
      ),
    },
    // Delete column
    ...(!isReadOnly
      ? [createActionsColumn<PurchaseOrderDetailItem>({
          onDelete: (row) => deleteItem(items.indexOf(row)),
          showDelete: true, showEdit: false, showView: false,
          mode: 'buttons', primaryActions: ['delete'],
        })]
      : []),
  ], [isReadOnly, updateItem, deleteItem])

  // ── Payment terms columns ──────────────────────────────────────────────────
  const paymentTermsColumns = useMemo((): ColumnDef<PaymentTermsItem>[] => [
    { accessorKey: 'TermsDescription', header: 'Terms of Payment', cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    ...(!isReadOnly ? [createActionsColumn<PaymentTermsItem>({
      onDelete: (item) => setPaymentTerms(prev => prev.filter(t => t.id !== item.id)),
      showDelete: true, showEdit: false, showView: false, mode: 'buttons', primaryActions: ['delete'],
    })] : []),
  ], [isReadOnly])

  // ── Additional charges columns ─────────────────────────────────────────────
  const chargesColumns = useMemo((): ColumnDef<AdditionalChargesItem>[] => [
    { accessorKey: 'LedgerName', header: 'Tax Ledger', size: 160, cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    {
      accessorKey: 'Percentage',
      header: '%',
      size: 80,
      cell: ({ row }) => (
        <input type="number" value={row.original.Percentage ?? ''} min={0}
          onChange={e => {
            const v = parseFloat(e.target.value) || 0
            setAdditionalCharges(prev => prev.map((c, i) => i === row.index ? { ...c, Percentage: v } : c))
          }}
          disabled={isReadOnly}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))] disabled:opacity-60" />
      ),
    },
    { accessorKey: 'CalculateOn', header: 'Calc. On', size: 100, cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    {
      accessorKey: 'GSTApplicable',
      header: 'GST Applicable',
      size: 110,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input type="checkbox" checked={!!row.original.GSTApplicable} disabled={isReadOnly}
            onChange={e => setAdditionalCharges(prev => prev.map((c, i) => i === row.index ? { ...c, GSTApplicable: e.target.checked } : c))}
            className="h-3.5 w-3.5" />
        </div>
      ),
    },
    {
      accessorKey: 'InAmountChecked',
      header: 'In Amount',
      size: 90,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input type="checkbox" checked={!!row.original.InAmountChecked} disabled={isReadOnly}
            onChange={e => setAdditionalCharges(prev => prev.map((c, i) => i === row.index ? { ...c, InAmountChecked: e.target.checked } : c))}
            className="h-3.5 w-3.5" />
        </div>
      ),
    },
    {
      accessorKey: 'Amount',
      header: 'Amount',
      size: 100,
      cell: ({ row }) => (
        <input type="number" value={row.original.Amount ?? ''} min={0}
          disabled={isReadOnly || !row.original.InAmountChecked}
          onChange={e => {
            const v = parseFloat(e.target.value) || 0
            setAdditionalCharges(prev => prev.map((c, i) => i === row.index ? { ...c, Amount: v } : c))
          }}
          className="w-full px-1.5 py-0.5 text-xs border rounded text-right bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))] disabled:opacity-50" />
      ),
    },
    ...(!isReadOnly ? [createActionsColumn<AdditionalChargesItem>({
      onDelete: (item) => setAdditionalCharges(prev => prev.filter(c => c.id !== item.id)),
      showDelete: true, showEdit: false, showView: false, mode: 'buttons', primaryActions: ['delete'],
    })] : []),
  ], [isReadOnly])

  // ── Delivery schedule columns ──────────────────────────────────────────────
  const scheduleColumns = useMemo((): ColumnDef<DeliveryScheduleItem>[] => [
    { accessorKey: 'ItemCode',     header: 'Item Code', size: 100, cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    { accessorKey: 'Quantity',     header: 'Quantity',  size: 100, cell: ({ getValue }) => <span className="text-xs">{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'PurchaseUnit', header: 'Unit',      size: 80,  cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    { accessorKey: 'SchDate',      header: 'Date',      size: 120, cell: ({ getValue }) => <span className="text-xs">{getValue() ? formatDate(String(getValue())) : ''}</span> },
    createActionsColumn<DeliveryScheduleItem>({
      onDelete: (item) => setDeliverySchedules(prev => prev.filter(s => s.id !== item.id)),
      showDelete: true, showEdit: false, showView: false, mode: 'buttons', primaryActions: ['delete'],
    }),
  ], [])

  const filteredHSN = useMemo(() =>
    PO_HSN_LIST.filter(h =>
      h.HSNCode.includes(hsnSearch) || h.ProductHSNName.toLowerCase().includes(hsnSearch.toLowerCase())
    ), [hsnSearch])

  const scheduleItem = scheduleItemIdx !== null ? items[scheduleItemIdx] : null

  // ── Modal title ────────────────────────────────────────────────────────────
  const title =
    mode === 'create' ? 'Create Purchase Order' :
    mode === 'edit'   ? 'Edit Purchase Order' :
    mode === 'view'   ? 'View Purchase Order' :
    'Close Purchase Order'

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
        <DialogContent
          size="master"
          hideCloseButton
          disableOutsideClick
          className="p-0 flex flex-col overflow-hidden"
          aria-describedby="po-modal-desc"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))] flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{title}</DialogTitle>
              <span id="po-modal-desc" className="sr-only">Purchase Order Form</span>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">

            {/* ── Header Form ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">P.O. No.</Label>
                <Input value={poNo} disabled className="bg-[rgb(var(--bg-subtle))] mt-1 font-mono text-xs" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Date</Label>
                <DatePicker
                  value={formData.voucherDate}
                  onChange={d => d instanceof Date && set('voucherDate', d)}
                  disabled={isReadOnly}
                  className="mt-1 h-9 w-full"
                />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Supplier <span className="text-red-500">*</span></Label>
                <Dropdown
                  options={PO_SUPPLIERS}
                  value={formData.supplierName}
                  onValueChange={v => set('supplierName', v)}
                  placeholder="Select Supplier"
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Contact Person</Label>
                <Dropdown
                  options={PO_CONTACT_PERSONS}
                  value={formData.contactPerson}
                  onValueChange={v => set('contactPerson', v)}
                  placeholder="Select"
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Purchase Division</Label>
                <Dropdown
                  options={PO_DIVISIONS}
                  value={formData.purchaseDivision}
                  onValueChange={v => set('purchaseDivision', v)}
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Currency</Label>
                <Dropdown
                  options={PO_CURRENCIES}
                  value={formData.currencyCode}
                  onValueChange={v => set('currencyCode', v)}
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Transport Mode <span className="text-red-500">*</span></Label>
                <Dropdown
                  options={PO_TRANSPORT_MODES}
                  value={formData.modeOfTransport}
                  onValueChange={v => set('modeOfTransport', v)}
                  placeholder="Select"
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Dealer Name</Label>
                <Input
                  value={formData.dealerName}
                  onChange={e => set('dealerName', e.target.value)}
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2 md:col-span-2">
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Delivery At</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={formData.deliveryAt}
                    onChange={e => set('deliveryAt', e.target.value)}
                    placeholder="Enter or select address"
                    disabled={isReadOnly}
                    className="flex-1"
                  />
                  {!isReadOnly && (
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0" onClick={() => setAddressOpen(true)}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="col-span-2 md:col-span-2">
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Purchase Reference</Label>
                <Input
                  value={formData.purchaseReference}
                  onChange={e => set('purchaseReference', e.target.value)}
                  placeholder="Reference / remarks"
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
            </div>

            {/* ── Close Remark ───────────────────────────────────────────── */}
            {mode === 'close' && (
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Closed Remark <span className="text-red-500">*</span></Label>
                <Textarea
                  value={closedRemark}
                  onChange={e => setClosedRemark(e.target.value)}
                  placeholder="Enter reason for closing this PO"
                  className="mt-1 h-20 resize-none"
                />
              </div>
            )}

            {/* ── Items Grid ─────────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[rgb(var(--fg-default))]">Items ({items.length})</span>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={FileText} onClick={() => setOldPOOpen(true)}>Old PO History</Button>
                    <Button variant="action-create" size="sm" icon={Plus} onClick={() => alerts.showInfo('Info', 'Add Item from master — connect to Item Master modal')}>Add Item</Button>
                  </div>
                )}
              </div>
              <DataGrid
                data={items}
                columns={itemColumns}
                getRowId={(row) => String(row.ItemID ?? row.TransactionID)}
                enableRowSelection={false}
                enableSearch={false}
                enableFilterRow={false}
                enablePagination={false}
                enableSorting={false}
                enableExport={false}
                enableColumnVisibility={false}
                enableColumnResizing={true}
              />
              {items.length === 0 && (
                <div className="border border-dashed border-[rgb(var(--bd-default))] rounded-md p-8 text-center text-sm text-[rgb(var(--fg-muted))]">
                  No items added. {!isReadOnly && 'Select requisitions or click "Add Item".'}
                </div>
              )}
            </div>

            {/* ── Payment Terms ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[rgb(var(--fg-default))]">Payment Terms</span>
              </div>
              {!isReadOnly && (
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Input
                      value={paymentTermInput}
                      onChange={e => setPaymentTermInput(e.target.value)}
                      placeholder="Enter or select payment terms"
                      className="pr-9"
                    />
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1">
                      <Dropdown
                        options={PO_PAYMENT_TERMS_OPTIONS}
                        value=""
                        onValueChange={v => setPaymentTermInput(String(v))}
                        searchable={false}
                        placeholder=""
                        triggerClassName="!border-none !bg-transparent !shadow-none !p-0 !h-8 !min-h-0"
                      />
                    </div>
                  </div>
                  <Button variant="action-create" size="sm" icon={Plus} onClick={handleAddPaymentTerm} className="h-9 w-9 p-0" />
                </div>
              )}
              {paymentTerms.length > 0 ? (
                <DataGrid
                  data={paymentTerms}
                  columns={paymentTermsColumns}
                  getRowId={r => String(r.id)}
                  enableRowSelection={false}
                  enableSearch={false}
                  enableFilterRow={false}
                  enablePagination={false}
                  enableSorting={false}
                  enableExport={false}
                  enableColumnVisibility={false}
                />
              ) : (
                <p className="text-xs text-[rgb(var(--fg-muted))] py-2">No payment terms added.</p>
              )}
            </div>

            {/* ── Additional Charges ─────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[rgb(var(--fg-default))]">Additional Charges</span>
                {!isReadOnly && (
                  <div className="flex gap-2 items-center">
                    <Dropdown
                      options={PO_CHARGE_LEDGERS}
                      value={chargesLedger}
                      onValueChange={v => setChargesLedger(String(v))}
                      placeholder="Select charge type"
                      className="w-44"
                    />
                    <Button variant="action-create" size="sm" icon={Plus} onClick={handleAddCharge} className="h-8 w-8 p-0" />
                  </div>
                )}
              </div>
              {additionalCharges.length > 0 ? (
                <DataGrid
                  data={additionalCharges}
                  columns={chargesColumns}
                  getRowId={r => String(r.id)}
                  enableRowSelection={false}
                  enableSearch={false}
                  enableFilterRow={false}
                  enablePagination={false}
                  enableSorting={false}
                  enableExport={false}
                  enableColumnVisibility={false}
                />
              ) : (
                <p className="text-xs text-[rgb(var(--fg-muted))] py-2">No additional charges.</p>
              )}
            </div>

            {/* ── Amount Summary ─────────────────────────────────────────── */}
            <div className="bg-[rgb(var(--bg-subtle))] rounded-lg border border-[rgb(var(--bd-default))] p-4">
              <p className="text-sm font-semibold text-[rgb(var(--fg-default))] mb-3">Amount Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Basic Amount',   value: amounts.basicAmt },
                  { label: 'GST Amount',     value: amounts.gstAmt   },
                  { label: 'Other Charges',  value: amounts.otherAmt },
                  { label: 'Net Amount',     value: amounts.netAmt, highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`text-center p-3 rounded-lg border ${highlight ? 'bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/30' : 'bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-default))]'}`}>
                    <p className="text-xs text-[rgb(var(--fg-muted))] mb-1">{label}</p>
                    <p className={`text-base font-bold ${highlight ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--fg-default))]'}`}>₹{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── File Attachments ───────────────────────────────────────── */}
            {!isReadOnly && (
              <div>
                <p className="text-sm font-semibold text-[rgb(var(--fg-default))] mb-2">Attachments</p>
                <FileAttachment
                  value={attachedFiles}
                  onChange={setAttachedFiles}
                  maxFiles={5}
                  maxFileSize={5 * 1024 * 1024}
                  acceptedFileTypes={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <Footer
            variant="modal"
            padding="compact"
            className="border-t border-[rgb(var(--bd-default))]"
            actions={
              <>
                {mode === 'create' && (
                  <>
                    <Button variant="outline" icon={RotateCcw} onClick={handleClear} disabled={saving}>Clear</Button>
                    <Button variant="action-save" icon={Save} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                  </>
                )}
                {mode === 'edit' && (
                  <>
                    <Button variant="action-cancel" icon={XCircle} onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button variant="action-save" icon={Save} onClick={handleSave} disabled={saving}>{saving ? 'Updating...' : 'Update'}</Button>
                  </>
                )}
                {mode === 'view' && (
                  <>
                    <Button variant="outline" icon={Printer} onClick={() => alerts.showInfo('Print', 'Printing...')}>Print</Button>
                    <Button variant="action-cancel" icon={XCircle} onClick={onClose}>Close</Button>
                  </>
                )}
                {mode === 'close' && (
                  <>
                    <Button variant="action-cancel" icon={XCircle} onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button variant="destructive" icon={XCircle} onClick={handleClosePOAction} disabled={saving}>{saving ? 'Closing...' : 'Close PO'}</Button>
                  </>
                )}
              </>
            }
          />
        </DialogContent>
      </Dialog>

      {/* ── Old PO History Sub-modal ─────────────────────────────────────── */}
      <Dialog open={oldPOOpen} onOpenChange={v => !v && setOldPOOpen(false)}>
        <DialogContent size="lg" hideCloseButton disableOutsideClick className="p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Old P.O. History</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setOldPOOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm text-[rgb(var(--fg-muted))] text-center py-8">Select a date range to load old P.O. history for reference.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Address Sub-modal ────────────────────────────────────────────── */}
      <Dialog open={addressOpen} onOpenChange={v => !v && setAddressOpen(false)}>
        <DialogContent size="md" hideCloseButton disableOutsideClick className="p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Select Delivery Address</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setAddressOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <div className="p-4 space-y-2">
            {PO_DELIVERY_ADDRESSES.map(addr => (
              <button
                key={addr.id}
                onClick={() => { set('deliveryAt', addr.address); setAddressOpen(false) }}
                className="w-full text-left p-3 rounded-lg border border-[rgb(var(--bd-default))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 transition-colors"
              >
                <p className="text-sm font-medium text-[rgb(var(--fg-default))]">{addr.label}</p>
                <p className="text-xs text-[rgb(var(--fg-muted))] mt-0.5">{addr.address}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delivery Schedule Sub-modal ──────────────────────────────────── */}
      <Dialog open={scheduleOpen} onOpenChange={v => !v && setScheduleOpen(false)}>
        <DialogContent size="md" hideCloseButton disableOutsideClick className="p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Delivery Schedule — {scheduleItem?.ItemName ?? ''}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setScheduleOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">P.O. Qty</Label>
                <Input value={scheduleItem?.PurchaseQuantity ?? 0} disabled className="mt-1 bg-[rgb(var(--bg-subtle))] text-xs" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Schedule Qty <span className="text-red-500">*</span></Label>
                <Input type="number" value={scheduleQty} onChange={e => setScheduleQty(e.target.value)} className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Unit</Label>
                <Input value={scheduleItem?.PurchaseUnit ?? ''} disabled className="mt-1 bg-[rgb(var(--bg-subtle))] text-xs" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-[rgb(var(--fg-muted))]">Delivery Date <span className="text-red-500">*</span></Label>
                <DatePicker value={scheduleDate} onChange={d => d instanceof Date && setScheduleDate(d)} className="mt-1 h-9 w-full" />
              </div>
              <div className="flex items-end">
                <Button variant="action-create" icon={Plus} onClick={handleAddSchedule} className="w-full h-9">Add</Button>
              </div>
            </div>
            {deliverySchedules.filter(s => s.ItemID === scheduleItem?.ItemID).length > 0 && (
              <DataGrid
                data={deliverySchedules.filter(s => s.ItemID === scheduleItem?.ItemID)}
                columns={scheduleColumns}
                getRowId={r => String(r.id)}
                enableRowSelection={false} enableSearch={false} enableFilterRow={false}
                enablePagination={false} enableSorting={false} enableExport={false} enableColumnVisibility={false}
              />
            )}
          </div>
          <Footer variant="modal" padding="compact" className="border-t border-[rgb(var(--bd-default))]"
            actions={<Button variant="action-save" onClick={() => setScheduleOpen(false)}>Done</Button>}
          />
        </DialogContent>
      </Dialog>

      {/* ── HSN Selection Sub-modal ──────────────────────────────────────── */}
      <Dialog open={hsnOpen} onOpenChange={v => !v && setHsnOpen(false)}>
        <DialogContent size="lg" hideCloseButton disableOutsideClick className="p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="px-6 py-4 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle>Select HSN Code</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setHsnOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <div className="p-4">
            <Input
              value={hsnSearch}
              onChange={e => setHsnSearch(e.target.value)}
              placeholder="Search HSN code or name..."
              className="mb-3"
            />
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto scrollbar-hide">
              {filteredHSN.map(hsn => (
                <button
                  key={hsn.ProductHSNID}
                  onClick={() => handleHSNSelect(hsn)}
                  className="w-full text-left p-3 rounded-lg border border-[rgb(var(--bd-default))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--fg-default))]">{hsn.HSNCode}</p>
                      <p className="text-xs text-[rgb(var(--fg-muted))] mt-0.5">{hsn.ProductHSNName}</p>
                    </div>
                    <div className="text-right text-xs text-[rgb(var(--fg-muted))]">
                      <p>GST: {hsn.GSTTaxPercentage}%</p>
                      <p>CGST: {hsn.CGSTTaxPercentage}% | SGST: {hsn.SGSTTaxPercentage}%</p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredHSN.length === 0 && <p className="text-sm text-[rgb(var(--fg-muted))] text-center py-6">No HSN codes found.</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, List as ListIcon, RefreshCw } from 'lucide-react'
import { Input, Label, Dropdown, DatePicker } from '@/components/ui'
import { DataGrid } from '@/components/datagrid'
import type { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { formatDate, cn } from '@/lib/utils'
import {
  genIPVNo,
  getBinsForWarehouse,
  getBatchStockForItem,
  MOCK_WAREHOUSES,
  MOCK_PHYSICAL_STOCK,
  MOCK_VERIFICATION_VOUCHERS,
  type PhysicalStockItem,
  type StockBatchWiseItem,
  type NewStockItem,
  type WarehouseItem,
} from '@/data/mock/itemPhysicalVerification'
import { ShowListModal } from './ShowListModal'

function asDate(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'string') return new Date(val)
  return null
}

export default function ItemPhysicalVerificationPage() {
  const alerts = useGlobalAlert()

  // ── Voucher header ───────────────────────────────────────────────────────────
  // voucherNo needs a setter so handleNew can regenerate it (line 997 in legacy)
  const [voucherNo, setVoucherNo] = useState(() => genIPVNo())
  const [voucherDate, setVoucherDate] = useState<Date>(new Date())
  const [remark, setRemark] = useState('')

  // ── Physical stock data in state so it can be refreshed after save ───────────
  // Mimics setPhysicalStock / refreshPhysicalStock in migration
  const [physicalStock, setPhysicalStock] = useState<PhysicalStockItem[]>([...MOCK_PHYSICAL_STOCK])

  // ── Item details (populated from Physical Stock grid row click) ──────────────
  // line 327-331 in legacy .js
  const [itemId, setItemId]                     = useState(0)
  const [itemCode, setItemCode]                 = useState('')
  const [itemName, setItemName]                 = useState('')
  const [stockUnit, setStockUnit]               = useState('')
  const [unitDecimalPlace, setUnitDecimalPlace] = useState(0)
  const [itemGroupId, setItemGroupId]           = useState(0)
  const [itemSubGroupId, setItemSubGroupId]     = useState(0)
  const [itemGroupName, setItemGroupName]       = useState('')
  const [itemSubGroupName, setItemSubGroupName] = useState('')
  const [itemDescription, setItemDescription]   = useState('')
  const [wtPerPacking, setWtPerPacking]         = useState(0)
  const [unitPerPacking, setUnitPerPacking]     = useState(0)
  const [conversionFactor, setConversionFactor] = useState(0)

  // ── Batch / transaction details ──────────────────────────────────────────────
  // line 473-485 in legacy .js
  const [grnTransactionId, setGrnTransactionId] = useState(0)
  const [totalStock, setTotalStock]             = useState(0)
  const [batchNo, setBatchNo]                   = useState('')
  const [batchId, setBatchId]                   = useState(0)
  const [supplierBatchNo, setSupplierBatchNo]   = useState('')
  const [mfgDate, setMfgDate]                   = useState('')
  const [expiryDate, setExpiryDate]             = useState('')
  const [grnNo, setGrnNo]                       = useState('')
  const [grnDate, setGrnDate]                   = useState('')

  // ── Warehouse / Bin ──────────────────────────────────────────────────────────
  const [warehouse, setWarehouse] = useState('')
  const [bin, setBin]             = useState('')
  const [bins, setBins]           = useState<WarehouseItem[]>([])

  // ── Physical qty input ───────────────────────────────────────────────────────
  const [physicalQty, setPhysicalQty] = useState('')

  // ── New stock checkbox ───────────────────────────────────────────────────────
  const [isNewStock, setIsNewStock] = useState(false)

  // ── Disabled flags — mimic legacy behavior ───────────────────────────────────
  const [batchNoDisabled, setBatchNoDisabled]     = useState(false)
  const [warehouseDisabled, setWarehouseDisabled] = useState(false)
  const [binDisabled, setBinDisabled]             = useState(false)

  // ── Grids ────────────────────────────────────────────────────────────────────
  const [batchWiseStock, setBatchWiseStock] = useState<StockBatchWiseItem[]>([])
  const [newStockItems, setNewStockItems]   = useState<NewStockItem[]>([])

  // Needed so handleNew can reset both to null (line 1026-1027 in legacy)
  const [selectedPhysicalItem, setSelectedPhysicalItem] = useState<PhysicalStockItem | null>(null)
  const [_selectedBatchItem, setSelectedBatchItem]      = useState<StockBatchWiseItem | null>(null)

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [saving, setSaving]       = useState(false)
  const [showListOpen, setShowListOpen] = useState(false)

  // ── Dropdown options (memoised) ──────────────────────────────────────────────
  const warehouseOptions = useMemo(() =>
    MOCK_WAREHOUSES.map(w => ({ value: w.Warehouse, label: w.Warehouse })), [])

  const binOptions = useMemo(() =>
    bins.map(b => ({ value: String(b.WarehouseID), label: b.Bin })), [bins])

  // ── Initial column visibility — ItemDescription and FreeStock hidden by default
  // Mimics columnVisibility in migration (used on all three grids)
  const columnVisibility = useMemo(() => ({
    ItemDescription: false,
    FreeStock: false,
  }), [])

  // ════════════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Physical Stock Grid row click
   * Mimics line 308–388 in legacy .js (gridstock onSelectionChanged)
   *
   * Sets all item fields, resets all batch/warehouse/qty fields,
   * enables all controls, then loads batch stock for selected item.
   */
  const handlePhysicalStockRowClick = useCallback((item: PhysicalStockItem) => {
    setSelectedPhysicalItem(item)

    // Populate item details — line 327-331
    setItemId(item.ItemID)
    setItemCode(item.ItemCode)
    setItemName(item.ItemName)
    setStockUnit(item.StockUnit)
    setUnitDecimalPlace(item.UnitDecimalPlace)
    setItemGroupId(item.ItemGroupID)
    setItemSubGroupId(item.ItemSubGroupID)
    setItemGroupName(item.ItemGroupName)
    setItemSubGroupName(item.ItemSubGroupName)
    setItemDescription(item.ItemDescription)
    setWtPerPacking(item.WtPerPacking)
    setUnitPerPacking(item.UnitPerPacking)
    setConversionFactor(item.ConversionFactor)

    // Reset batch/warehouse fields — line 311-326
    setGrnTransactionId(0)
    setTotalStock(0)
    setBatchNo('')
    setBatchId(0)
    setSupplierBatchNo('')
    setMfgDate('')
    setExpiryDate('')
    setGrnNo('')
    setGrnDate('')
    setPhysicalQty('')
    setWarehouse('')
    setBin('')
    setBins([])
    setSelectedBatchItem(null)

    // Enable all controls — line 333-339
    setBatchNoDisabled(false)
    setWarehouseDisabled(false)
    setBinDisabled(false)

    // Load batch wise stock — line 341-361
    setBatchWiseStock(getBatchStockForItem(item.ItemID))
  }, [])

  /**
   * Warehouse dropdown change — load bins
   * Mimics line 129–153 in legacy .js (RefreshBins)
   */
  const handleWarehouseChange = useCallback((value: string | string[]) => {
    const w = Array.isArray(value) ? value[0] : String(value ?? '')
    setWarehouse(w)
    setBin('')
    setBins(w ? getBinsForWarehouse(w) : [])
  }, [])

  /**
   * Batch Wise grid row click
   * Mimics line 471–492 in legacy .js (StockBatchWiseGrid onSelectionChanged)
   *
   * Key logic:
   * - Always sets transaction, stock, batch, grn fields
   * - Always disables batchNo (user picked it from grid)
   * - If WarehouseID > 0: loads bins, sets warehouse+bin, disables both
   */
  const handleBatchRowClick = useCallback((item: StockBatchWiseItem) => {
    setSelectedBatchItem(item)

    // Set transaction and stock details — line 473-485
    setGrnTransactionId(item.ParentTransactionID)
    setTotalStock(item.BatchStock)
    setBatchNo(item.BatchNo)
    setBatchId(item.BatchID)
    setSupplierBatchNo(item.SupplierBatchNo)
    setMfgDate(item.MfgDate || '')
    setExpiryDate(item.ExpiryDate || '')
    setPhysicalQty(String(item.BatchStock))
    setGrnNo(item.GRNNo)
    setGrnDate(item.GRNDate)

    // Disable batch no — line 486
    setBatchNoDisabled(true)

    // Set warehouse and bin if batch has a warehouse location — line 487-491
    if (item.WarehouseID > 0) {
      setWarehouse(item.Warehouse)

      // Load bins for the warehouse FIRST, then set the bin — line 489
      const warehouseBins = getBinsForWarehouse(item.Warehouse)
      setBins(warehouseBins)

      // Set bin value as WarehouseID string (the bin dropdown uses WarehouseID as value) — line 490
      setBin(String(item.WarehouseID))

      // Disable warehouse and bin — line 488, 490
      setWarehouseDisabled(true)
      setBinDisabled(true)
    }
  }, [])

  /**
   * New Stock checkbox change
   * Mimics line 591–636 in legacy .js (enableControls function)
   *
   * Checked (new stock mode): clears batch details, enables all controls.
   * Unchecked: restores item info (from selectedPhysicalItem), clears batch,
   *            enables all controls so user can pick a batch from the grid.
   */
  const handleNewStockChange = useCallback((checked: boolean) => {
    setIsNewStock(checked)

    if (checked) {
      // New stock mode — line 593-605
      setGrnTransactionId(0)
      setBatchNo('')
      setBatchId(0)
      setTotalStock(0)
      setSupplierBatchNo('')
      setMfgDate('')
      setExpiryDate('')
      setBatchNoDisabled(false)
      setWarehouseDisabled(false)
      setBinDisabled(false)
    } else {
      // Back to existing stock mode — line 606+ (uses physicalstockrow, NOT batch row)
      // Legacy line 606: uses physicalstockrow (the item row) to reset item fields
      // but does NOT restore batch details — user must re-select from batch grid
      if (selectedPhysicalItem) {
        setGrnTransactionId(0)
        setTotalStock(0)
        setBatchNo('')
        setBatchId(0)
        setSupplierBatchNo('')
        setMfgDate('')
        setExpiryDate('')
        setPhysicalQty('')
        setBatchNoDisabled(false)
        setWarehouseDisabled(false)
        setBinDisabled(false)
      }
    }
  }, [selectedPhysicalItem])

  /**
   * Add button — validates and adds item to the adjusted stock grid
   * Mimics line 638–758 in legacy .js (BtnAdd click)
   *
   * Validations (in order):
   *  1. Item must be selected
   *  2. Warehouse must be selected
   *  3. Bin must be selected
   *  4. Batch No must not be empty
   *  5. Physical Qty must be a valid number
   *  6. If not new stock: qty must be >= 0
   *     If new stock: qty must be > 0
   *  7. If existing stock (totalStock > 0) and new qty equals current: reject (no change)
   *  8. No duplicate item + batch already in the grid
   */
  const handleAdd = useCallback(() => {
    // Validation 1 — line 642-646
    if (itemId === 0) {
      alerts.showWarning('Warning', 'Please select stock item to adjust physical stock!')
      return
    }
    // Validation 2 — line 654-659
    if (!warehouse) {
      alerts.showWarning('Warning', 'Please select warehouse to adjust physical stock!')
      return
    }
    // Validation 3 — line 660-665
    if (!bin) {
      alerts.showWarning('Warning', 'Please select bin to adjust physical stock!')
      return
    }
    // Validation 4 — line 666-670
    if (!batchNo.trim()) {
      alerts.showWarning('Warning', 'Please enter stock batch no. to adjust physical stock!')
      return
    }

    // Validation 5 — line 671-682
    const qty = parseFloat(physicalQty)
    if (isNaN(qty)) {
      alerts.showWarning('Warning', 'Please enter valid current physical stock quantity!')
      return
    }
    if (!isNewStock && qty < 0) {
      alerts.showWarning('Warning', 'Please enter valid current physical stock quantity!')
      return
    }
    if (isNewStock && qty <= 0) {
      alerts.showWarning('Warning', 'Please enter valid current physical stock quantity!')
      return
    }

    // Validation 6 — line 683-694: no-change guard (only when existing stock > 0)
    const currStock = totalStock
    const newStock  = qty
    if (currStock > 0 && currStock - newStock === 0) {
      alerts.showWarning('Warning', 'Please enter valid stock current physical stock quantity..!')
      return
    }

    // Validation 7 — line 696-705: duplicate check
    const exists = newStockItems.some(
      i => i.ItemID === itemId && i.BatchNo === batchNo.trim()
    )
    if (exists) {
      alerts.showWarning('Warning', 'Already added stock for same batch and selected item!')
      return
    }

    // Adjusted stock calculation — line 683-746
    // If existing stock: adjustment = new - current (can be negative = stock loss)
    // If new stock (no parent): adjustment = new qty itself
    const adjustedStock = currStock > 0 ? newStock - currStock : newStock

    // Resolve warehouse ID and bin name from bins array
    const warehouseId = bins.find(b => String(b.WarehouseID) === bin)?.WarehouseID ?? 0
    const binName     = bins.find(b => String(b.WarehouseID) === bin)?.Bin ?? ''

    // Build new stock item — line 707-751
    const newItem: NewStockItem = {
      ParentTransactionID: grnTransactionId || 0,
      ItemID: itemId,
      ItemGroupID: itemGroupId,
      ItemSubGroupID: itemSubGroupId,
      WarehouseID: warehouseId,
      ItemCode: itemCode,
      ItemGroupName: itemGroupName,
      ItemSubGroupName: itemSubGroupName,
      ItemName: itemName,
      ItemDescription: itemDescription,
      StockUnit: stockUnit,
      GRNNo: grnNo || '',
      GRNDate: grnDate || '',
      BatchNo: batchNo.trim(),
      BatchID: batchId || 0,
      // SupplierBatchNo only for existing batches (grnTransactionId > 0)
      SupplierBatchNo: grnTransactionId === 0 ? '' : supplierBatchNo,
      CurrentStock: currStock,
      NewStock: newStock,
      AdjustedStock: adjustedStock,
      Warehouse: warehouse,
      Bin: binName,
      WtPerPacking: wtPerPacking,
      UnitPerPacking: unitPerPacking,
      ConversionFactor: conversionFactor,
      // MfgDate/ExpiryDate only for new batches (no parent GRN)
      MfgDate:     grnTransactionId === 0 ? mfgDate    : '',
      ExpiryDate:  grnTransactionId === 0 ? expiryDate : '',
    }

    setNewStockItems(prev => [...prev, newItem])
    alerts.showSuccess('Added', 'Item added to adjustment list.')
  }, [
    itemId, warehouse, bin, batchNo, physicalQty, isNewStock, totalStock,
    newStockItems, grnTransactionId, batchId, supplierBatchNo, mfgDate, expiryDate,
    bins, itemCode, itemGroupId, itemSubGroupId, itemGroupName, itemSubGroupName,
    itemName, itemDescription, stockUnit, grnNo, grnDate,
    wtPerPacking, unitPerPacking, conversionFactor, alerts,
  ])

  /**
   * New button — resets the entire form
   * Mimics line 997–1032 in legacy .js (BtnNew click)
   * Important: ALL state must be reset, including group/packing/conversion fields.
   */
  const handleNew = useCallback(() => {
    // Generate a new voucher number (line 1006-1011 in legacy)
    setVoucherNo(genIPVNo())
    setVoucherDate(new Date())
    setRemark('')

    // Item details
    setItemId(0)
    setItemCode('')
    setItemName('')
    setStockUnit('')
    setUnitDecimalPlace(0)
    setItemGroupId(0)
    setItemSubGroupId(0)
    setItemGroupName('')
    setItemSubGroupName('')
    setItemDescription('')
    setWtPerPacking(0)
    setUnitPerPacking(0)
    setConversionFactor(0)

    // Batch / transaction details
    setGrnTransactionId(0)
    setTotalStock(0)
    setBatchNo('')
    setBatchId(0)
    setSupplierBatchNo('')
    setMfgDate('')
    setExpiryDate('')
    setGrnNo('')
    setGrnDate('')
    setPhysicalQty('')

    // Warehouse / Bin
    setWarehouse('')
    setBin('')
    setBins([])

    // Flags
    setIsNewStock(false)
    setBatchNoDisabled(false)
    setWarehouseDisabled(false)
    setBinDisabled(false)

    // Grids
    setBatchWiseStock([])
    setNewStockItems([])
    setSelectedPhysicalItem(null)
    setSelectedBatchItem(null)

    // Refresh physical stock list (mimics refreshPhysicalStock call after save)
    setPhysicalStock([...MOCK_PHYSICAL_STOCK])
  }, [])

  /**
   * Save button
   * Mimics line 1034–1159 in legacy .js (BtnSave click)
   *
   * Key payload rules:
   * - VoucherID: -16, Particular: 'Stock Verification'
   * - AdjustedStock > 0 → ReceiptQuantity
   * - AdjustedStock < 0 → IssueQuantity = Math.abs(adjustedStock)
   * - CurrentStock > 0 → OldStockQuantity + NewStockQuantity
   * - BatchID <= 0 (new batch) → SupplierBatchNo + MfgDate + ExpiryDate
   */
  const handleSave = useCallback(() => {
    if (newStockItems.length === 0) {
      alerts.showWarning('Warning', 'Please add any item to adjust physical stock!')
      return
    }

    // Confirmation — line 1104-1112 in legacy
    alerts.showConfirmation(
      'Do you want to continue',
      'If you are confident please click Yes to save, otherwise click Cancel.',
      () => {
        setSaving(true)

        // Transaction main payload (line 1054-1064 in legacy — sent to API in production)
        void {
          VoucherID: -16,
          VoucherDate: voucherDate.toISOString(),
          TotalQuantity: 0,
          Particular: 'Stock Verification',
          Narration: remark,
        }

        // Transaction detail payload (line 1066-1098 in legacy — sent to API in production)
        void newStockItems.map((item, index) => {
          const detail: Record<string, unknown> = {
            TransID:             index + 1,
            ItemID:              item.ItemID,
            ItemGroupID:         item.ItemGroupID,
            ParentTransactionID: item.ParentTransactionID,
            BatchNo:             item.BatchNo,
            BatchID:             item.BatchID,
            StockUnit:           item.StockUnit,
            WarehouseID:         item.WarehouseID,
          }
          if (item.AdjustedStock > 0)     detail.ReceiptQuantity = item.AdjustedStock
          else if (item.AdjustedStock < 0) detail.IssueQuantity  = Math.abs(item.AdjustedStock)
          if (item.CurrentStock > 0) {
            detail.OldStockQuantity = item.CurrentStock
            detail.NewStockQuantity = item.NewStock
          }
          if (item.BatchID <= 0) {
            detail.SupplierBatchNo = item.SupplierBatchNo
            if (item.MfgDate)    detail.MfgDate    = new Date(item.MfgDate).toISOString()
            if (item.ExpiryDate) detail.ExpiryDate = new Date(item.ExpiryDate).toISOString()
          }
          return detail
        })

        // Mock save — push to MOCK_VERIFICATION_VOUCHERS
        newStockItems.forEach((item, idx) => {
          MOCK_VERIFICATION_VOUCHERS.push({
            TransactionID:       Date.now() + idx,
            TransactionDetailID: Date.now() + idx + 1000,
            ItemID:              item.ItemID,
            ProductionUnitID:    1,
            FYear:               '2026-27',
            VoucherNo:           voucherNo,
            VoucherDate:         voucherDate.toISOString().slice(0, 10),
            ItemGroupName:       item.ItemGroupName,
            ItemSubGroupName:    item.ItemSubGroupName,
            ItemCode:            item.ItemCode,
            ItemName:            item.ItemName,
            StockUnit:           item.StockUnit,
            OldStockQuantity:    item.CurrentStock,
            NewStockQuantity:    item.NewStock,
            AdjustedStockQty:    item.AdjustedStock,
            ClosingQty:          item.NewStock,
            GRNNo:               item.GRNNo,
            GRNDate:             item.GRNDate,
            BatchNo:             item.BatchNo,
            Warehouse:           item.Warehouse,
            Bin:                 item.Bin,
            Narration:           remark,
            CreatedBy:           'Admin',
            WtPerPacking:        item.WtPerPacking,
            UnitPerPacking:      item.UnitPerPacking,
            ProductionUnitName:  'Unit 1',
            CompanyName:         'Indas Analytics',
          })
        })

        setSaving(false)
        alerts.showSuccess('Saved!', 'Your data has been saved successfully.')

        // After save: reset form and refresh stock — line 1139 in legacy
        handleNew()
      }
    )
  }, [newStockItems, voucherDate, remark, voucherNo, handleNew, alerts])

  /**
   * Physical Qty blur — format to item's unitDecimalPlace
   * Mimics line 1167–1170 in legacy .js (TxtAdjestQty change event)
   */
  const handlePhysicalQtyBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) setPhysicalQty(val.toFixed(unitDecimalPlace))
  }, [unitDecimalPlace])

  // ════════════════════════════════════════════════════════════════════════════
  // GRID COLUMN DEFINITIONS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Physical Stock Grid columns
   * Mimics line 248–290 in legacy .js (gridstock columns)
   * ItemDescription and FreeStock hidden via initialColumnVisibility
   */
  const physicalStockColumns = useMemo<ColumnDef<PhysicalStockItem>[]>(() => [
    { accessorKey: 'ItemCode',          header: 'Item Code',       size: 90  },
    { accessorKey: 'ItemGroupName',     header: 'Item Group',      size: 110 },
    { accessorKey: 'ItemSubGroupName',  header: 'Sub Group',       size: 110 },
    { accessorKey: 'ItemName',          header: 'Item Name',       size: 300 },
    { accessorKey: 'Quality',           header: 'Quality',         size: 90  },
    { accessorKey: 'GSM',               header: 'GSM',             size: 70  },
    { accessorKey: 'Manufecturer',      header: 'Manufacturer',    size: 120 },
    { accessorKey: 'Finish',            header: 'Finish',          size: 80  },
    { accessorKey: 'SizeW',             header: 'Size W',          size: 75  },
    { accessorKey: 'SizeL',             header: 'Size L',          size: 75  },
    // Hidden by default via columnVisibility
    { accessorKey: 'ItemDescription',   header: 'Description',     size: 200 },
    { accessorKey: 'StockUnit',         header: 'Stock Unit',      size: 80  },
    { accessorKey: 'PhysicalStock',     header: 'Physical Stock',  size: 110, cell: ({ getValue }) => <span className="block text-right font-medium">{Number(getValue()).toLocaleString()}</span> },
    { accessorKey: 'PhysicalStockPerUnitWithPackingType', header: 'Unit/Packing', size: 110 },
    { accessorKey: 'BookedStock',       header: 'Booked Stock',    size: 100, cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    { accessorKey: 'AllocatedStock',    header: 'Allocated Stock', size: 105, cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    { accessorKey: 'UnapprovedStock',   header: 'Unapproved Stock',size: 115, cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    // Hidden by default via columnVisibility
    { accessorKey: 'FreeStock',         header: 'Free Stock',      size: 90,  cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    { accessorKey: 'IncomingStock',     header: 'Incoming Stock',  size: 105, cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    { accessorKey: 'OutgoingStock',     header: 'Outgoing Stock',  size: 105, cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    { accessorKey: 'FloorStock',        header: 'Floor Stock',     size: 90,  cell: ({ getValue }) => <span className="block text-right">{Number(getValue())}</span> },
    { accessorKey: 'ProductionUnitName',header: 'Production Unit', size: 130 },
    { accessorKey: 'CompanyName',       header: 'Company',         size: 140 },
  ], [])

  /**
   * Stock Batch Wise Grid columns
   * Mimics line 421–446 in legacy .js (StockBatchWiseGrid columns)
   * ItemDescription included but hidden via columnVisibility
   */
  const batchWiseColumns = useMemo<ColumnDef<StockBatchWiseItem>[]>(() => [
    { accessorKey: 'ItemCode',          header: 'Item Code',       size: 90  },
    { accessorKey: 'ItemGroupName',     header: 'Item Group',      size: 110 },
    { accessorKey: 'ItemSubGroupName',  header: 'Sub Group',       size: 110 },
    { accessorKey: 'ItemName',          header: 'Item Name',       size: 280 },
    // Hidden by default — same columnVisibility object used for all grids
    { accessorKey: 'ItemDescription',   header: 'Description',     size: 200 },
    { accessorKey: 'StockUnit',         header: 'Stock Unit',      size: 80  },
    { accessorKey: 'BatchStock',        header: 'Batch Stock',     size: 100, cell: ({ getValue }) => <span className="block text-right font-semibold text-amber-600">{Number(getValue()).toLocaleString()}</span> },
    { accessorKey: 'GRNNo',             header: 'Receipt No.',     size: 140 },
    { accessorKey: 'GRNDate',           header: 'Receipt Date',    size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'BatchNo',           header: 'Batch No.',       size: 210 },
    { accessorKey: 'SupplierBatchNo',   header: 'Supplier Batch',  size: 120 },
    { accessorKey: 'MfgDate',           header: 'Mfg. Date',       size: 100, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'ExpiryDate',        header: 'Expiry Date',     size: 100, cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'Warehouse',         header: 'Warehouse',       size: 120 },
    { accessorKey: 'Bin',               header: 'Bin',             size: 90  },
  ], [])

  /**
   * New / Adjusted Stock Grid columns
   * Mimics line 538–563 in legacy .js (gridnewstock columns)
   * ItemCode is commented out in legacy — not shown
   */
  const newStockColumns = useMemo<ColumnDef<NewStockItem>[]>(() => [
    { accessorKey: 'ItemGroupName',     header: 'Item Group',        size: 100 },
    { accessorKey: 'ItemSubGroupName',  header: 'Sub Group',         size: 100 },
    { accessorKey: 'ItemName',          header: 'Item Name',         size: 250 },
    { accessorKey: 'StockUnit',         header: 'Stock Unit',        size: 80  },
    { accessorKey: 'GRNNo',             header: 'Receipt No.',       size: 140 },
    { accessorKey: 'GRNDate',           header: 'Receipt Date',      size: 110 },
    { accessorKey: 'BatchNo',           header: 'Batch No.',         size: 210 },
    { accessorKey: 'SupplierBatchNo',   header: 'Supplier Batch No.',size: 130 },
    { accessorKey: 'CurrentStock',      header: 'Current Stock',     size: 110, cell: ({ getValue }) => <span className="block text-right">{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'NewStock',          header: 'New Stock',         size: 100, cell: ({ getValue }) => <span className="block text-right font-medium">{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: 'AdjustedStock',     header: 'Adjusted Stock',    size: 110, cell: ({ getValue }) => {
      const v = Number(getValue())
      return <span className={cn('block text-right font-semibold', v < 0 ? 'text-red-600' : v > 0 ? 'text-green-600' : '')}>
        {v.toFixed(2)}
      </span>
    }},
    { accessorKey: 'Warehouse',         header: 'Warehouse',         size: 120 },
    { accessorKey: 'Bin',               header: 'Bin',               size: 90  },
  ], [])

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-hidden bg-[rgb(var(--bg-default))]"
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">

        {/* ── Title + Voucher header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end gap-4 pb-2 border-b border-[rgb(var(--border-default))]">
          <h1 className="text-base font-bold text-[rgb(var(--fg-default))]">
            Physical Stock Verification
          </h1>
          <div className="flex items-end gap-3 ml-auto">
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Voucher No</Label>
              <Input className="h-8 text-xs w-36 bg-[rgb(var(--bg-subtle))]" value={voucherNo} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[rgb(var(--text-muted))]">Date</Label>
              <DatePicker
                value={voucherDate}
                onChange={d => { const date = asDate(d); if (date) setVoucherDate(date) }}
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* ── Physical Stock Grid ─────────────────────────────────────────────── */}
        {/* enableColumnVisibility lets user toggle ItemDescription / FreeStock */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[rgb(var(--fg-default))]">Physical Stock</Label>
          <div style={{ height: 240 }}>
            <DataGrid
              className="h-full"
              data={physicalStock}
              columns={physicalStockColumns}
              onRowClick={handlePhysicalStockRowClick}
              getRowId={row => String(row.ItemID)}
              enableFiltering
              enableColumnResizing
              enableVirtualization={false}
              rowSelectionMode="single"
              pageSize={100}
              stickyHeader
              initialColumnVisibility={columnVisibility}
            />
          </div>
        </div>

        {/* ── Stock Batch Wise Grid ───────────────────────────────────────────── */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[rgb(var(--fg-default))]">Stock Batch Wise</Label>
          <div style={{ height: 180 }}>
            <DataGrid
              className="h-full"
              data={batchWiseStock}
              columns={batchWiseColumns}
              onRowClick={handleBatchRowClick}
              getRowId={row => String(row.BatchID)}
              enableFiltering={false}
              enableColumnResizing
              enableVirtualization={false}
              rowSelectionMode="single"
              pageSize={50}
              stickyHeader
              initialColumnVisibility={columnVisibility}
            />
          </div>
        </div>

        {/* ── Adjustment Details ──────────────────────────────────────────────── */}
        <div className="rounded-lg border border-[rgb(var(--border-default))] bg-[rgb(var(--bg-subtle))] p-4 space-y-3">
          <h3 className="text-xs font-bold text-[rgb(var(--fg-default))]">Adjustment Details</h3>

          {/* Row 1: Item Code, Item Name, Stock Unit, Remark */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Item Code</Label>
              <Input className="h-8 text-xs bg-[rgb(var(--bg-default))]" value={itemCode} readOnly />
            </div>
            <div className="col-span-4 space-y-1">
              <Label className="text-xs">Item Name</Label>
              <Input className="h-8 text-xs bg-[rgb(var(--bg-default))]" value={itemName} readOnly />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Stock Unit</Label>
              <Input className="h-8 text-xs bg-[rgb(var(--bg-default))]" value={stockUnit} readOnly />
            </div>
            <div className="col-span-4 space-y-1">
              <Label className="text-xs">Remark</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Remark"
                value={remark}
                onChange={e => setRemark(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Warehouse, Bin, Batch No, Physical Qty, New Stock checkbox, Add */}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Warehouse</Label>
              <Dropdown
                options={warehouseOptions}
                value={warehouse}
                onValueChange={handleWarehouseChange}
                placeholder="Select Warehouse"
                disabled={warehouseDisabled}
                size="sm"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Bin Name</Label>
              <Dropdown
                options={binOptions}
                value={bin}
                onValueChange={v => setBin(String(Array.isArray(v) ? v[0] : v ?? ''))}
                placeholder="Select Bin"
                disabled={binDisabled || bins.length === 0}
                size="sm"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Batch No.</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Batch No."
                value={batchNo}
                onChange={e => setBatchNo(e.target.value)}
                disabled={batchNoDisabled}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Physical Qty</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                placeholder="0"
                value={physicalQty}
                onChange={e => setPhysicalQty(e.target.value)}
                onBlur={handlePhysicalQtyBlur}
              />
            </div>
            <div className="col-span-2 flex items-center gap-2 pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNewStock}
                  onChange={e => handleNewStockChange(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#002852]"
                />
                <span className="text-xs font-medium text-[rgb(var(--fg-default))]">New Stock</span>
              </label>
            </div>
            <div className="col-span-2">
              <button
                onClick={handleAdd}
                className="w-full h-8 flex items-center justify-center gap-1.5 px-3 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ── Adjusted Stock Grid ─────────────────────────────────────────────── */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[rgb(var(--fg-default))]">
            Adjusted Stock Items
            {newStockItems.length > 0 && (
              <span className="ml-2 text-[10px] font-normal text-[rgb(var(--fg-muted))]">
                ({newStockItems.length} item{newStockItems.length !== 1 ? 's' : ''})
              </span>
            )}
          </Label>
          <div style={{ height: 180 }}>
            <DataGrid
              className="h-full"
              data={newStockItems}
              columns={newStockColumns}
              getRowId={row => `${row.ItemID}_${row.BatchNo}`}
              enableFiltering={false}
              enableColumnResizing
              enableVirtualization={false}
              pageSize={50}
              stickyHeader
              initialColumnVisibility={columnVisibility}
            />
          </div>
        </div>

      </div>

      {/* ── Fixed footer buttons ────────────────────────────────────────────── */}
      {/* Mimics line 117-121 in legacy .aspx */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-[rgb(var(--border-default))] bg-[rgb(var(--bg-subtle))] flex items-center justify-end gap-2">
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded border border-[rgb(var(--border-default))] text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bg-default))] transition-colors"
        >
          <RefreshCw size={12} /> New
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-[#002852] text-white hover:bg-[#003a75] transition-colors disabled:opacity-50"
        >
          <Save size={12} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => setShowListOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded border border-[rgb(var(--border-default))] text-[rgb(var(--fg-default))] hover:bg-[rgb(var(--bg-default))] transition-colors"
        >
          <ListIcon size={12} /> Show List
        </button>
      </div>

      {/* Show List Modal — mimics line 126-153 in legacy .aspx */}
      <ShowListModal isOpen={showListOpen} onClose={() => setShowListOpen(false)} />
    </motion.div>
  )
}
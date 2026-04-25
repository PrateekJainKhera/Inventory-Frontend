'use client'

import * as React from 'react'
import { X, XCircle, Save, Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Button, Input, Dropdown, DatePicker, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { Footer } from '@/components/layout/footer'
import { DataGrid, createActionsColumn } from '@/components/datagrid'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import {
  MASTER_ITEMS,
  JOB_CARDS,
  CLIENTS,
  generateReqNo,
  type RequisitionRecord,
  type RequisitionItem,
  type MasterItem,
  type IndentItem,
} from '@/data/mock/purchaseRequisition'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PurchaseRequisitionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { header: { voucherNo: string; voucherDate: string; narration: string }; items: RequisitionItem[] }) => void
  editingRequisition: RequisitionRecord | null
  preselectedIndents?: IndentItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0]
}

function indentToReqItem(indent: IndentItem): RequisitionItem {
  const master = MASTER_ITEMS.find(m => m.ItemID === indent.ItemID)
  return {
    ItemID: indent.ItemID,
    ItemCode: indent.ItemCode,
    ItemGroupName: indent.ItemGroupName,
    ItemSubGroupName: indent.ItemSubGroupName,
    ItemName: indent.ItemName,
    RequiredNoOfPacks: 1,
    QuantityPerPack: indent.RequiredQuantity,
    PurchaseQty: indent.RequiredQuantity,
    RequisitionQty: indent.RequiredQuantity,
    StockUnit: indent.StockUnit,
    PurchaseUnit: indent.PurchaseUnit,
    OrderUnit: master?.OrderUnit ?? indent.PurchaseUnit,
    PhysicalStock: indent.PhysicalStock,
    BookedStock: indent.BookedStock,
    PhysicalStockInPurchaseUnit: indent.PhysicalStock,
    ExpectedDeliveryDate: '',
    RefJobCardContentNo: indent.JobBookingContentNo,
    JobName: indent.JobName,
    ClientID: null,
    ItemNarration: '',
    LastPurchaseDate: indent.LastPurchaseDate,
    GSM: master?.GSM ?? 0,
    SizeW: master?.SizeW ?? 0,
    ConversionFactor: master?.ConversionFactor ?? 1,
    UnitPerPacking: master?.UnitPerPacking ?? 1,
  }
}

function masterToReqItem(m: MasterItem): RequisitionItem {
  return {
    ItemID: m.ItemID,
    ItemCode: m.ItemCode,
    ItemGroupName: m.ItemGroupName,
    ItemSubGroupName: m.ItemSubGroupName,
    ItemName: m.ItemName,
    RequiredNoOfPacks: 1,
    QuantityPerPack: 0,
    PurchaseQty: 0,
    RequisitionQty: 0,
    StockUnit: m.StockUnit,
    PurchaseUnit: m.PurchaseUnit,
    OrderUnit: m.OrderUnit,
    PhysicalStock: m.PhysicalStock,
    BookedStock: m.BookedStock,
    PhysicalStockInPurchaseUnit: m.PhysicalStock,
    ExpectedDeliveryDate: '',
    RefJobCardContentNo: '',
    JobName: '',
    ClientID: null,
    ItemNarration: '',
    LastPurchaseDate: m.LastPurchaseDate,
    GSM: m.GSM,
    SizeW: m.SizeW,
    ConversionFactor: m.ConversionFactor,
    UnitPerPacking: m.UnitPerPacking,
  }
}

// ─── Editable Cell ────────────────────────────────────────────────────────────
// Manages local state to prevent focus loss during typing; commits on blur only

interface EditableCellProps {
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number'
  className?: string
  placeholder?: string
}

const EditableCell = React.memo(({ value, onChange, type = 'text', className, placeholder }: EditableCellProps) => {
  const [localValue, setLocalValue] = React.useState(String(value ?? ''))
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setLocalValue(String(value ?? ''))
  }, [value])

  const handleBlur = () => {
    if (localValue !== String(value ?? '')) {
      onChange(localValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur()
    e.stopPropagation()
  }

  return (
    <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={[
          'w-full px-2 rounded border bg-[rgb(var(--bg-surface))] text-[rgb(var(--fg-default))]',
          'border-[rgb(var(--bd-default))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]',
          className ?? 'h-8 text-xs',
        ].join(' ')}
      />
    </div>
  )
})
EditableCell.displayName = 'EditableCell'

// ─── Add Item Modal ───────────────────────────────────────────────────────────

const MASTER_ITEM_COLUMNS: ColumnDef<MasterItem>[] = [
  { accessorKey: 'ItemGroupName',    header: 'Item Group',     size: 120 },
  { accessorKey: 'ItemSubGroupName', header: 'Sub Group',      size: 120 },
  { accessorKey: 'ItemCode',         header: 'Item Code',      size: 80  },
  { accessorKey: 'ItemName',         header: 'Item Name',      size: 250 },
  { accessorKey: 'GSM',              header: 'GSM',            size: 60, cell: ({ getValue }) => getValue() as number || '—' },
  { accessorKey: 'Manufacturer',     header: 'Manufacturer',   size: 150 },
  { accessorKey: 'SizeW',            header: 'Size W',         size: 70  },
  { accessorKey: 'PurchaseUnit',     header: 'Purchase Unit',  size: 100 },
  { accessorKey: 'PhysicalStock',    header: 'Current Stock',  size: 100, cell: ({ getValue }) => Number(getValue()).toFixed(2) },
  { accessorKey: 'BookedStock',      header: 'Booked',         size: 80,  cell: ({ getValue }) => Number(getValue()).toFixed(2) },
  { accessorKey: 'StockUnit',        header: 'Unit',           size: 70  },
]

function AddItemModal({
  isOpen,
  onClose,
  onAdd,
  existingItemIds,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (items: MasterItem[]) => void
  existingItemIds: number[]
}) {
  const [selectedRows, setSelectedRows] = React.useState<MasterItem[]>([])
  const [gridKey, setGridKey] = React.useState(0)

  // Available items — exclude already-added ones
  const availableItems = React.useMemo(
    () => MASTER_ITEMS.filter(m => !existingItemIds.includes(m.ItemID)),
    [existingItemIds]
  )

  React.useEffect(() => {
    if (isOpen) { setSelectedRows([]); setGridKey(k => k + 1) }
  }, [isOpen])

  const handleAdd = () => {
    if (selectedRows.length === 0) return
    onAdd(selectedRows)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-6xl h-[85vh] bg-[rgb(var(--bg-surface))] p-0 flex flex-col overflow-hidden"
        hideCloseButton
        disableOutsideClick
        aria-describedby="add-item-desc"
      >
        <DialogHeader className="flex-shrink-0 px-4 md:px-6 pt-3 pb-2 border-b border-[rgb(var(--bd-default))]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-[rgb(var(--fg-default))]">
              Select From Item Master
            </DialogTitle>
            <span id="add-item-desc" className="sr-only">Select items to add to the requisition</span>
            <button onClick={onClose} className="close-btn-md"><X className="h-4 w-4" /></button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-3">
          <DataGrid
            key={gridKey}
            data={availableItems}
            columns={MASTER_ITEM_COLUMNS}
            getRowId={(row) => String(row.ItemID)}
            title="Master Items"
            enableRowSelection={true}
            rowSelectionMode="multi"
            onRowSelect={(rows) => setSelectedRows(rows as MasterItem[])}
            enableSearch={true}
            enableBacchaSearch={true}
            enableFilterRow={true}
            enableSorting={true}
            enableColumnResizing={true}
            enableColumnReordering={true}
            enableColumnFreezing={true}
            enablePagination={true}
            paginationPageSize={10}
            paginationPageSizeOptions={[10, 20, 50]}
            enableExport={false}
            enableColumnVisibility={true}
            className="h-full"
          />
        </div>

        <Footer
          variant="modal"
          gradient={false}
          actions={
            <div className="flex items-center gap-3">
              <span className="text-xs text-[rgb(var(--fg-muted))]">
                {selectedRows.length > 0
                  ? `${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} selected`
                  : 'Select items above'}
              </span>
              <Button variant="action-cancel" icon={XCircle} onClick={onClose}>Cancel</Button>
              <Button variant="action-save" icon={Plus} onClick={handleAdd} disabled={selectedRows.length === 0}>
                Add Selected
              </Button>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function PurchaseRequisitionModal({
  isOpen,
  onClose,
  onSave,
  editingRequisition,
  preselectedIndents = [],
}: PurchaseRequisitionModalProps) {
  const alerts = useGlobalAlert()

  const [voucherNo, setVoucherNo] = React.useState('')
  const [voucherDate, setVoucherDate] = React.useState(today())
  const [narration, setNarration] = React.useState('')
  const [items, setItems] = React.useState<RequisitionItem[]>([])
  const [showAddItem, setShowAddItem] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return

    if (editingRequisition) {
      setVoucherNo(editingRequisition.VoucherNo)
      setVoucherDate(editingRequisition.VoucherDate)
      setNarration(editingRequisition.Narration)
      setItems([{
        ItemID: editingRequisition.ItemID,
        ItemCode: editingRequisition.ItemCode,
        ItemGroupName: editingRequisition.ItemGroupName,
        ItemSubGroupName: editingRequisition.ItemSubGroupName,
        ItemName: editingRequisition.ItemName,
        RequiredNoOfPacks: 1,
        QuantityPerPack: editingRequisition.PurchaseQty,
        PurchaseQty: editingRequisition.PurchaseQty,
        RequisitionQty: editingRequisition.PurchaseQty,
        StockUnit: editingRequisition.StockUnit,
        PurchaseUnit: editingRequisition.StockUnit,
        PhysicalStock: 0,
        BookedStock: 0,
        PhysicalStockInPurchaseUnit: 0,
        ExpectedDeliveryDate: editingRequisition.ExpectedDeliveryDate,
        RefJobCardContentNo: editingRequisition.RefJobCardContentNo,
        JobName: editingRequisition.JobName,
        ClientID: null,
        ItemNarration: editingRequisition.ItemNarration,
        LastPurchaseDate: '',
        OrderUnit: editingRequisition.StockUnit,
        GSM: 0, SizeW: 0, ConversionFactor: 1, UnitPerPacking: 1,
      }])
    } else {
      setVoucherNo(generateReqNo())
      setVoucherDate(today())
      setNarration('')
      setItems(preselectedIndents.map(indentToReqItem))
    }
  }, [isOpen, editingRequisition])

  const existingItemIds = items.map(i => i.ItemID)
  const totalPurchaseQty = items.reduce((s, i) => s + (i.PurchaseQty || 0), 0)

  // Single-call handler — computes derived qty fields inline
  const handleItemChange = React.useCallback((index: number, field: keyof RequisitionItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const updated: RequisitionItem = { ...item, [field]: value }
      const numVal = parseFloat(value) || 0
      if (field === 'RequiredNoOfPacks') {
        updated.PurchaseQty = parseFloat((numVal * item.QuantityPerPack).toFixed(3))
      } else if (field === 'QuantityPerPack') {
        updated.PurchaseQty = parseFloat((item.RequiredNoOfPacks * numVal).toFixed(3))
      } else if (field === 'PurchaseQty') {
        if (item.QuantityPerPack > 0) {
          updated.RequiredNoOfPacks = parseFloat((numVal / item.QuantityPerPack).toFixed(3))
        }
      }
      return updated
    }))
  }, [])

  const handleDeleteItem = React.useCallback((item: RequisitionItem) => {
    setItems(prev => prev.filter(i => i.ItemID !== item.ItemID))
  }, [])

  const handleAddItems = (masterItems: MasterItem[]) => {
    setItems(prev => [...prev, ...masterItems.map(masterToReqItem)])
    setShowAddItem(false)
  }

  const handleSave = () => {
    if (items.length === 0) {
      alerts.showError('No Items', 'Please add at least one item to the requisition.')
      return
    }
    const zeroQty = items.filter(i => i.PurchaseQty <= 0)
    if (zeroQty.length > 0) {
      alerts.showError('Invalid Quantity', 'Purchase Qty must be greater than 0 for all items.')
      return
    }
    if (!voucherDate) {
      alerts.showError('Date Required', 'Please select a requisition date.')
      return
    }
    onSave({ header: { voucherNo, voucherDate, narration }, items })
  }

  // ─── Column Definitions ──────────────────────────────────────────────────────

  const jobOptions = React.useMemo(() => JOB_CARDS.map(j => ({ value: j.value, label: j.label })), [])
  const clientOptions = React.useMemo(() => CLIENTS.map(c => ({ value: String(c.LedgerID), label: c.LedgerName })), [])

  const itemColumns = React.useMemo((): ColumnDef<RequisitionItem>[] => [

    // 1. Item Code
    { accessorKey: 'ItemCode', header: 'Item Code', size: 100 },

    // 2. Item Group
    { accessorKey: 'ItemGroupName', header: 'Item Group', size: 120 },

    // 3. Sub Group
    { accessorKey: 'ItemSubGroupName', header: 'Sub Group', size: 120 },

    // 4. Item Name
    { accessorKey: 'ItemName', header: 'Item Name', size: 250 },

    // 5. Job Name
    { accessorKey: 'JobName', header: 'Job Name', size: 200 },

    // 6. Job Card No
    {
      accessorKey: 'RefJobCardContentNo',
      header: 'Job Card No',
      size: 160,
      cell: ({ row }) => (
        <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          <Dropdown
            options={jobOptions}
            value={row.original.RefJobCardContentNo || ''}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] : String(value || '')
              handleItemChange(row.index, 'RefJobCardContentNo', v)
              const job = JOB_CARDS.find(j => j.value === v)
              if (job) {
                const parts = job.label.split(' – ')
                handleItemChange(row.index, 'JobName', parts[1] ?? parts[0] ?? '')
                if (job.clientId != null) {
                  handleItemChange(row.index, 'ClientID', job.clientId)
                }
              }
            }}
            placeholder="Select…"
            searchable={true}
            className="h-8 text-xs w-full"
          />
        </div>
      ),
    },

    // 7. No. Of Packs / Rolls
    {
      accessorKey: 'RequiredNoOfPacks',
      header: 'No. Of Packs/Rolls',
      size: 120,
      cell: ({ row }) => (
        <EditableCell
          type="number"
          value={row.original.RequiredNoOfPacks}
          onChange={value => handleItemChange(row.index, 'RequiredNoOfPacks', value)}
          className="h-8 text-xs text-right"
        />
      ),
    },

    // 8. Qty / (Pack / Roll)
    {
      accessorKey: 'QuantityPerPack',
      header: 'Qty / (Pack/Roll)',
      size: 110,
      cell: ({ row }) => (
        <EditableCell
          type="number"
          value={row.original.QuantityPerPack}
          onChange={value => handleItemChange(row.index, 'QuantityPerPack', value)}
          className="h-8 text-xs text-right"
        />
      ),
    },

    // 9. Purchase Qty — highlighted blue
    {
      accessorKey: 'PurchaseQty',
      header: 'Purchase Qty',
      size: 110,
      cell: ({ row }) => (
        <EditableCell
          type="number"
          value={row.original.PurchaseQty}
          onChange={value => handleItemChange(row.index, 'PurchaseQty', value)}
          className="h-8 text-xs text-right font-bold bg-blue-50 border-blue-300 text-blue-700"
        />
      ),
    },

    // 10. Item Remark
    {
      accessorKey: 'ItemNarration',
      header: 'Item Remark',
      size: 150,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.ItemNarration}
          onChange={value => handleItemChange(row.index, 'ItemNarration', value)}
          className="h-8 text-xs"
          placeholder="Enter remark"
        />
      ),
    },

    // 11. Indent Qty
    {
      accessorKey: 'RequisitionQty',
      header: 'Indent Qty',
      size: 100,
      cell: ({ row }) => (
        <span className="text-[rgb(var(--fg-muted))] block w-full text-right pr-2">
          {Number(row.original.RequisitionQty).toFixed(2)}
        </span>
      ),
    },

    // 12. Booked Stock
    {
      accessorKey: 'BookedStock',
      header: 'Booked Stock',
      size: 110,
      cell: ({ row }) => (
        <span className="text-[rgb(var(--fg-muted))] block w-full text-right pr-2">
          {Number(row.original.BookedStock).toFixed(2)}
        </span>
      ),
    },

    // 13. Current Stock
    {
      accessorKey: 'PhysicalStock',
      header: 'Current Stock',
      size: 120,
      cell: ({ row }) => (
        <span className="text-[rgb(var(--fg-muted))] block w-full text-right pr-2">
          {Number(row.original.PhysicalStock).toFixed(2)}
        </span>
      ),
    },

    // 14. Stock Unit
    { accessorKey: 'StockUnit', header: 'Stock Unit', size: 90 },

    // 15. Current Stock (In P.U.)
    {
      accessorKey: 'PhysicalStockInPurchaseUnit',
      header: 'Current Stock (In P.U.)',
      size: 140,
      cell: ({ row }) => (
        <span className="text-[rgb(var(--fg-muted))] block w-full text-right pr-2">
          {Number(row.original.PhysicalStockInPurchaseUnit).toFixed(2)}
        </span>
      ),
    },

    // 16. Purchase Unit
    { accessorKey: 'PurchaseUnit', header: 'Purchase Unit', size: 110 },

    // 17. Expec. Del. Date
    {
      accessorKey: 'ExpectedDeliveryDate',
      header: 'Expec. Del. Date',
      size: 130,
      cell: ({ row }) => {
        const dateVal = row.original.ExpectedDeliveryDate
          ? new Date(row.original.ExpectedDeliveryDate)
          : undefined
        return (
          <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
            <DatePicker
              value={dateVal}
              onChange={(date) => {
                if (date instanceof Date) {
                  handleItemChange(row.index, 'ExpectedDeliveryDate', date.toISOString().split('T')[0])
                } else if (typeof date === 'string' && date) {
                  handleItemChange(row.index, 'ExpectedDeliveryDate', date)
                }
              }}
              mode="single"
              returnFormat="string"
              className="h-8 w-full"
            />
          </div>
        )
      },
    },

    // 18. Customer Name
    {
      id: 'refClient',
      header: 'Customer Name',
      size: 200,
      cell: ({ row }) => (
        <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          <Dropdown
            options={clientOptions}
            value={row.original.ClientID ? String(row.original.ClientID) : ''}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] : String(value || '')
              handleItemChange(row.index, 'ClientID', v ? parseInt(v) : null)
            }}
            placeholder="Select Customer"
            searchable={true}
            className="h-8 text-xs w-full"
          />
        </div>
      ),
    },

    // 19. Actions
    createActionsColumn<RequisitionItem>({
      onDelete: handleDeleteItem,
      showDelete: true,
      showEdit: false,
      showView: false,
      mode: 'buttons',
      primaryActions: ['delete'],
      confirmDelete: true,
      deleteConfirmation: { title: 'Remove Item', description: 'Remove this item from the requisition?' },
    }),

  ], [jobOptions, clientOptions, handleItemChange, handleDeleteItem])

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="w-[95vw] h-[92vh] max-w-none bg-[rgb(var(--bg-surface))] p-0 flex flex-col overflow-hidden"
          hideCloseButton
          disableOutsideClick
          aria-describedby="preq-modal-desc"
        >
          {/* Header */}
          <DialogHeader className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[rgb(var(--bd-default))]">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-semibold text-[rgb(var(--fg-default))]">
                {editingRequisition ? 'Edit Purchase Requisition' : 'Purchase Requisition Creation'}
              </DialogTitle>
              <div id="preq-modal-desc" className="sr-only">
                {editingRequisition ? 'Edit' : 'Create'} purchase requisition
              </div>
              <button onClick={onClose} className="close-btn-md" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Req No + Date + Add Item */}
            <div className="flex flex-wrap items-end gap-4 mt-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[rgb(var(--fg-muted))]">Req No.</label>
                <Input
                  type="text"
                  value={voucherNo}
                  readOnly
                  className="h-8 text-sm font-mono w-36 bg-[rgb(var(--bg-subtle))] cursor-default"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[rgb(var(--fg-muted))]">Date</label>
                <Input
                  type="date"
                  value={voucherDate}
                  onChange={e => setVoucherDate(e.target.value)}
                  className="h-8 text-sm w-40"
                />
              </div>
              <div className="ml-auto">
                <Button variant="action-create" icon={Plus} onClick={() => setShowAddItem(true)}>
                  Add Item
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-[rgb(var(--bg-subtle))]">

            {/* DataGrid */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-3">
              <DataGrid
                data={items}
                columns={itemColumns}
                getRowId={row => String(row.ItemID)}
                enableRowSelection={false}
                enableSorting={true}
                enableColumnVisibility={true}
                enableColumnResizing={true}
                enableColumnReordering={true}
                enableColumnFreezing={true}
                enableVirtualization={true}
                enableExport={true}
                enableSearch={true}
                enableBacchaSearch={true}
                enableFilterRow={false}
                enablePagination={true}
                paginationPageSize={20}
                paginationPageSizeOptions={[10, 20, 50, 100]}
                title="Requisition Items"
                mainColumns="ItemCode,ItemName"
                className="w-full"
              />
            </div>

            {/* Total Purchase Qty */}
            {items.length > 0 && (
              <div className="flex justify-end bg-white rounded-lg border shadow-sm px-4 py-2.5 mb-3">
                <span className="text-sm font-semibold text-[rgb(var(--fg-default))]">
                  Total Purchase Qty:&nbsp;
                  <span className="text-[rgb(var(--color-primary))]">{totalPurchaseQty.toFixed(2)}</span>
                </span>
              </div>
            )}

            {/* Remark */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-[rgb(var(--fg-muted))] mb-1">Remark</label>
              <Input
                type="text"
                value={narration}
                onChange={e => setNarration(e.target.value)}
                placeholder="Enter general remarks"
                className="text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <Footer
            variant="modal"
            gradient={false}
            actions={
              <div className="flex items-center gap-3">
                <Button variant="action-cancel" icon={XCircle} onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="action-save" icon={Save} onClick={handleSave} disabled={items.length === 0}>
                  {editingRequisition ? 'Update' : 'Save'}
                </Button>
              </div>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Add Item sub-modal */}
      <AddItemModal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        onAdd={handleAddItems}
        existingItemIds={existingItemIds}
      />
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { X, Save, XCircle, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { Button, Input } from '@/components/ui'
import { Dropdown } from '@/components/forms/dropdown'
import { Footer } from '@/components/layout/footer'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { CITIES, BRANCHES, PRODUCTION_UNITS } from '@/data/mock/warehouseMaster'
import type { Warehouse, BinName } from '@/data/mock/warehouseMaster'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Warehouse, 'WarehouseID' | 'WarehouseCode'>, bins: BinName[]) => void
  warehouseData: Warehouse | null
  existingBins: BinName[]
  mode: 'create' | 'edit' | 'view'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseModal({
  isOpen,
  onClose,
  onSave,
  warehouseData,
  existingBins,
  mode,
}: WarehouseModalProps) {
  const alerts = useGlobalAlert()
  const isViewMode = mode === 'view'

  const [formData, setFormData] = useState({
    warehouseCode: '',
    warehouseName: '',
    warehouseAddress: '',
    refWarehouseCode: '',
    city: '',
    branchId: '',
    branchName: '',
    productionUnitId: '',
    productionUnitName: '',
    isFloorWarehouse: false,
  })
  const [binNames, setBinNames] = useState<BinName[]>([])
  const [newBinName, setNewBinName] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Init form on open
  useEffect(() => {
    if (!isOpen) return
    setValidationErrors({})
    setNewBinName('')

    if (mode === 'create') {
      setFormData({
        warehouseCode: '',
        warehouseName: '',
        warehouseAddress: '',
        refWarehouseCode: '',
        city: '',
        branchId: '',
        branchName: '',
        productionUnitId: '',
        productionUnitName: '',
        isFloorWarehouse: false,
      })
      setBinNames([])
    } else if (warehouseData) {
      setFormData({
        warehouseCode: warehouseData.WarehouseCode,
        warehouseName: warehouseData.WarehouseName,
        warehouseAddress: warehouseData.Address,
        refWarehouseCode: warehouseData.RefWarehouseCode,
        city: warehouseData.City,
        branchId: String(warehouseData.BranchID),
        branchName: warehouseData.BranchName,
        productionUnitId: String(warehouseData.ProductionUnitID),
        productionUnitName: warehouseData.ProductionUnitName,
        isFloorWarehouse: warehouseData.IsFloorWarehouse,
      })
      setBinNames(existingBins)
    }
  }, [isOpen, mode, warehouseData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddBin = () => {
    if (!newBinName.trim()) {
      alerts.showWarning('Warning', 'Please enter a bin name.')
      return
    }
    if (binNames.some(b => b.BinName.toLowerCase() === newBinName.trim().toLowerCase())) {
      alerts.showWarning('Warning', 'This bin name already exists.')
      return
    }
    setBinNames(prev => [
      ...prev,
      { BinID: 0, BinName: newBinName.trim(), WarehouseID: warehouseData?.WarehouseID || 0 },
    ])
    setNewBinName('')
  }

  const handleRemoveBin = (index: number) => {
    setBinNames(prev => prev.filter((_, i) => i !== index))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.warehouseName.trim()) errors.warehouseName = 'Please enter Warehouse name...!'
    if (!formData.warehouseAddress.trim()) errors.warehouseAddress = 'Please enter Warehouse address...!'
    if (!formData.city.trim()) errors.city = 'Please Choose City...!'
    if (binNames.length === 0) {
      alerts.showWarning('Warning', 'Please enter at least one Bin name.')
      return false
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const branch = BRANCHES.find(b => String(b.BranchID) === formData.branchId)
    const unit = PRODUCTION_UNITS.find(u => String(u.ProductionUnitID) === formData.productionUnitId)

    onSave(
      {
        WarehouseName: formData.warehouseName,
        Address: formData.warehouseAddress,
        RefWarehouseCode: formData.refWarehouseCode,
        City: formData.city,
        BranchID: branch?.BranchID || 0,
        BranchName: branch?.BranchName || '',
        ProductionUnitID: unit?.ProductionUnitID || 0,
        ProductionUnitName: unit?.ProductionUnitName || '',
        IsFloorWarehouse: formData.isFloorWarehouse,
      },
      binNames
    )
  }

  const cityOptions = CITIES.map(c => ({ value: c.CityName, label: c.CityName }))
  const branchOptions = BRANCHES.map(b => ({ value: String(b.BranchID), label: b.BranchName }))
  const unitOptions = PRODUCTION_UNITS.map(u => ({ value: String(u.ProductionUnitID), label: u.ProductionUnitName }))

  const title = mode === 'view' ? 'View Warehouse' : warehouseData ? 'Edit Warehouse' : 'Create Warehouse'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] h-[95vh] max-w-none bg-[rgb(var(--bg-surface))] p-0 flex flex-col overflow-hidden"
        hideCloseButton
        disableOutsideClick
        aria-describedby="warehouse-modal-description"
      >
        {/* Header */}
        <DialogHeader
          className="flex-shrink-0 px-4 md:px-6 pt-3 pb-2 border-b"
          style={{
            borderColor: 'rgb(var(--bd-default))',
            background: 'linear-gradient(to right, rgba(var(--color-primary-subtle), 0.3), rgba(var(--color-primary-subtle), 0.5))',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-semibold text-[rgb(var(--fg-default))]">
                {title}
              </DialogTitle>
              <div id="warehouse-modal-description" className="sr-only">{title}</div>
            </div>
            <button onClick={onClose} className="close-btn-md" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="grid grid-cols-12 gap-4">

            {/* Left — 8 cols: warehouse fields */}
            <div className="col-span-12 lg:col-span-8">
              <div className="space-y-3">

                {/* Row 1: Code + Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Warehouse Code"
                    value={formData.warehouseCode || 'Auto-generated'}
                    disabled
                  />
                  <Input
                    label={<>Warehouse Name <span className="text-[rgb(var(--color-error))]">*</span></>}
                    value={formData.warehouseName}
                    onChange={(e) => handleInputChange('warehouseName', e.target.value)}
                    placeholder="Enter warehouse name"
                    error={validationErrors.warehouseName}
                    disabled={isViewMode}
                  />
                </div>

                {/* Row 2: City + Ref Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Dropdown
                    label={<>City <span className="text-[rgb(var(--color-error))]">*</span></>}
                    value={formData.city}
                    onValueChange={(v) => handleInputChange('city', v as string)}
                    options={cityOptions}
                    placeholder="Select city"
                    searchable
                    clearable
                    disabled={isViewMode}
                    error={validationErrors.city}
                  />
                  <Input
                    label="Ref Warehouse Code"
                    value={formData.refWarehouseCode}
                    onChange={(e) => handleInputChange('refWarehouseCode', e.target.value)}
                    placeholder="Warehouse Ref. Code"
                    disabled={isViewMode}
                  />
                </div>

                {/* Row 3: Branch + Production Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Dropdown
                    label="Branch Name"
                    value={formData.branchId}
                    onValueChange={(v) => handleInputChange('branchId', v as string)}
                    options={branchOptions}
                    placeholder="Select branch"
                    searchable
                    clearable
                    disabled={isViewMode}
                  />
                  <Dropdown
                    label="Production Unit Name"
                    value={formData.productionUnitId}
                    onValueChange={(v) => handleInputChange('productionUnitId', v as string)}
                    options={unitOptions}
                    placeholder="Select production unit"
                    searchable
                    clearable
                    disabled={isViewMode}
                  />
                </div>

                {/* Row 4: Address + Floor Checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[rgb(var(--fg-default))] mb-1.5">
                      Warehouse Address <span className="text-[rgb(var(--color-error))]">*</span>
                    </label>
                    <textarea
                      value={formData.warehouseAddress}
                      onChange={(e) => handleInputChange('warehouseAddress', e.target.value)}
                      placeholder="Enter warehouse address"
                      disabled={isViewMode}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md text-sm resize-none bg-[rgb(var(--bg-surface))] text-[rgb(var(--fg-default))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] disabled:bg-[rgb(var(--bg-subtle))] disabled:text-[rgb(var(--fg-muted))] ${
                        validationErrors.warehouseAddress
                          ? 'border-[rgb(var(--color-error))]'
                          : 'border-[rgb(var(--bd-default))]'
                      }`}
                    />
                    {validationErrors.warehouseAddress && (
                      <p className="text-xs text-[rgb(var(--color-error))] mt-1">
                        {validationErrors.warehouseAddress}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFloorWarehouse}
                        onChange={(e) => handleInputChange('isFloorWarehouse', e.target.checked)}
                        disabled={isViewMode}
                        className="w-4 h-4 rounded border-[rgb(var(--bd-default))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                      />
                      <span className="text-sm font-medium text-[rgb(var(--fg-default))]">
                        Is Floor Warehouse?
                      </span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Right — 4 cols: Bin Names */}
            <div className="col-span-12 lg:col-span-4">
              <div
                className="border rounded-md p-3 h-full"
                style={{ borderColor: 'rgb(var(--bd-default))', backgroundColor: 'rgb(var(--bg-subtle))' }}
              >
                <div className="space-y-2.5">

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[rgb(var(--fg-default))]">Bin Names</h4>
                    {binNames.length > 0 && (
                      <span className="text-xs font-medium text-[rgb(var(--fg-muted))] bg-[rgb(var(--bg-surface))] px-2 py-1 rounded">
                        {binNames.length} {binNames.length === 1 ? 'Bin' : 'Bins'}
                      </span>
                    )}
                  </div>

                  {/* Add bin row */}
                  {!isViewMode && (
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-8">
                        <Input
                          label="Bin Name"
                          value={newBinName}
                          onChange={(e) => setNewBinName(e.target.value)}
                          placeholder="Enter bin name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleAddBin() }
                          }}
                        />
                      </div>
                      <div className="col-span-4 flex items-end">
                        <Button
                          variant="action-create"
                          icon={Plus}
                          onClick={handleAddBin}
                          className="w-full"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Bin list */}
                  {binNames.length > 0 ? (
                    <div className="border rounded-md overflow-hidden" style={{ borderColor: 'rgb(var(--bd-default))' }}>
                      {/* Header row */}
                      <div
                        className="grid grid-cols-12 gap-2 px-3 py-2 bg-[rgb(var(--bg-subtle))] border-b"
                        style={{ borderColor: 'rgb(var(--bd-default))' }}
                      >
                        <div className={!isViewMode ? 'col-span-10' : 'col-span-12'}>
                          <span className="text-xs font-semibold text-[rgb(var(--fg-default))]">Bin Name</span>
                        </div>
                        {!isViewMode && (
                          <div className="col-span-2 text-center">
                            <span className="text-xs font-semibold text-[rgb(var(--fg-default))]">Action</span>
                          </div>
                        )}
                      </div>
                      {/* Bin rows */}
                      <div className="overflow-y-auto bg-[rgb(var(--bg-surface))]" style={{ maxHeight: '15em' }}>
                        {binNames.map((bin, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-2 px-3 py-2 border-b hover:bg-[rgb(var(--bg-subtle))] transition-colors"
                            style={{ borderColor: 'rgb(var(--bd-default))' }}
                          >
                            <div className={!isViewMode ? 'col-span-10' : 'col-span-12'}>
                              <span className="text-sm text-[rgb(var(--fg-default))]">{bin.BinName}</span>
                            </div>
                            {!isViewMode && (
                              <div className="col-span-2 flex items-center justify-center">
                                <button
                                  onClick={() => handleRemoveBin(index)}
                                  className="p-1 rounded transition-colors text-[rgb(var(--fg-default))] hover:text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error-subtle))]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--fg-muted))] text-center py-6 bg-[rgb(var(--bg-surface))] rounded border border-dashed" style={{ borderColor: 'rgb(var(--bd-default))' }}>
                      No bin names added yet
                    </p>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <Footer
          variant="modal"
          gradient={true}
          actions={
            <div className="flex items-center gap-3">
              {!isViewMode && (
                <Button variant="action-save" icon={Save} onClick={handleSave}>
                  {warehouseData ? 'Update' : 'Save'}
                </Button>
              )}
              <Button variant="action-cancel" icon={XCircle} onClick={onClose}>
                {isViewMode ? 'Close' : 'Cancel'}
              </Button>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
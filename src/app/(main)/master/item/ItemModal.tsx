'use client'

import * as React from 'react'
import { X, Save, XCircle, Copy, Check } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { ComboBox } from '@/components/forms/dropdown'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { Footer } from '@/components/layout/footer'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { cn } from '@/lib/utils'
import { GROUP_FIELDS, SELECT_OPTIONS } from '@/data/mock/itemMaster'
import type { ItemRecord, FieldConfig } from '@/data/mock/itemMaster'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemMasterModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, any>) => void
  item: ItemRecord | null
  masterName?: string
  selectedGroupId?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemMasterModal({
  isOpen,
  onClose,
  onSave,
  item,
  masterName,
  selectedGroupId,
}: ItemMasterModalProps) {
  const alerts = useGlobalAlert()
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = React.useState<Record<string, boolean>>({})

  const fields = selectedGroupId ? (GROUP_FIELDS[selectedGroupId] || []) : []

  React.useEffect(() => {
    if (!isOpen) return
    const initial: Record<string, any> = {}
    fields.forEach(f => {
      if (item && item[f.FieldName] !== undefined) {
        initial[f.FieldName] = item[f.FieldName]
      } else {
        if (f.FieldType === 'checkbox') initial[f.FieldName] = false
        else if (f.FieldType === 'number') initial[f.FieldName] = parseFloat(f.FieldDefaultValue || '0') || 0
        else initial[f.FieldName] = f.FieldDefaultValue || ''
      }
    })
    setFormData(initial)
    setValidationErrors({})
  }, [isOpen, selectedGroupId, item])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[fieldName]; return n })
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = formData[field.FieldName] ?? (field.FieldType === 'number' ? 0 : '')
    const hasError = !!validationErrors[field.FieldName]

    switch (field.FieldType) {
      case 'text':
        return (
          <Input
            id={field.FieldName}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.FieldName, e.target.value)}
            placeholder={field.FieldDescription || ''}
            required={field.IsRequiredFieldValidator}
            disabled={field.IsLocked}
            error={hasError ? 'This field is required' : undefined}
          />
        )

      case 'number':
        return (
          <Input
            id={field.FieldName}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.FieldName, parseFloat(e.target.value) || 0)}
            placeholder={field.FieldDescription || '0'}
            required={field.IsRequiredFieldValidator}
            disabled={field.IsLocked}
            min={field.MinimumValue}
            error={hasError ? 'This field is required' : undefined}
          />
        )

      case 'selectbox': {
        const options = SELECT_OPTIONS[field.FieldName] || []
        return (
          <ComboBox
            options={options}
            value={value}
            onValueChange={(v) => handleFieldChange(field.FieldName, v)}
            disabled={field.IsLocked}
            placeholder={field.FieldDisplayName.toLowerCase()}
            allowCustomValue={true}
            error={hasError}
          />
        )
      }

      case 'checkbox': {
        const checked = value === true || value === 'true' || value === '1'
        return (
          <button
            type="button"
            onClick={() => handleFieldChange(field.FieldName, !checked)}
            disabled={field.IsLocked}
            className={cn(
              'px-3 py-2 text-xs font-medium rounded-md border transition-all duration-200 flex items-center gap-2',
              checked
                ? 'bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))] shadow-sm'
                : 'bg-transparent text-[rgb(var(--fg-default))] border-[rgb(var(--bd-default))] hover:bg-[rgb(var(--bg-subtle))]',
              field.IsLocked && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300',
              checked ? 'bg-white border-white' : 'bg-transparent border-[rgb(var(--bd-default))]'
            )}>
              {checked && <Check className="h-3 w-3 text-[rgb(var(--color-primary))]" />}
            </div>
            <span>
              {field.FieldDisplayName}
              {field.IsRequiredFieldValidator && <span className="ml-1">*</span>}
              {field.UnitMeasurement && <span className="text-[rgb(var(--fg-subtle))] ml-1">({field.UnitMeasurement})</span>}
            </span>
          </button>
        )
      }

      default:
        return (
          <Input
            id={field.FieldName}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.FieldName, e.target.value)}
            placeholder={field.FieldDescription || ''}
            disabled={field.IsLocked}
          />
        )
    }
  }

  const handleSave = (isSaveAs = false) => {
    const missing = fields.filter(f => {
      if (!f.IsRequiredFieldValidator) return false
      const v = formData[f.FieldName]
      if (f.FieldType === 'checkbox') return v === undefined || v === null
      return !v && v !== 0
    })

    if (missing.length > 0) {
      const errs: Record<string, boolean> = {}
      missing.forEach(f => { errs[f.FieldName] = true })
      setValidationErrors(errs)
      alerts.showError('Validation Error', 'Please fill in all mandatory fields (highlighted in red)')
      return
    }

    setValidationErrors({})
    onSave(isSaveAs ? { ...formData, ItemID: undefined } : formData)
  }

  const regularFields = fields.filter(f => f.FieldType !== 'checkbox')
  const checkboxFields = fields.filter(f => f.FieldType === 'checkbox')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[90vw] h-[90vh] max-w-none bg-[rgb(var(--bg-surface))] p-0 flex flex-col overflow-hidden"
        hideCloseButton
        disableOutsideClick
        aria-describedby="item-master-description"
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
                {item
                  ? `${masterName || 'Item Master'} Updation`
                  : `${masterName || 'Item Master'} Creation`}
              </DialogTitle>
              <div id="item-master-description" className="sr-only">
                {item ? 'Update' : 'Create'} {masterName || 'item master'} details.
              </div>
            </div>
            <button
              onClick={onClose}
              className="close-btn-md"
              aria-label="Close item modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-2">
          {fields.length > 0 ? (
            <div className="py-4 p-4 bg-[rgb(var(--bg-surface))] rounded-lg">
              <div className="grid grid-cols-12 gap-3">
                {regularFields.map(field => (
                  <div key={field.FieldName} className="col-span-12 md:col-span-6 lg:col-span-3">
                    <label
                      htmlFor={field.FieldName}
                      className="block text-xs font-medium text-[rgb(var(--fg-default))] mb-1"
                    >
                      {field.FieldDisplayName}
                      {field.IsRequiredFieldValidator && (
                        <span className="text-[rgb(var(--color-error))] ml-0.5">*</span>
                      )}
                      {field.UnitMeasurement && (
                        <span className="text-[rgb(var(--fg-subtle))] ml-1">({field.UnitMeasurement})</span>
                      )}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                {checkboxFields.map(field => (
                  <div key={field.FieldName} className="col-span-12 md:col-span-6 lg:col-span-3 flex items-end">
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[rgb(var(--fg-muted))]">
              <p>Please select a master group to create an item</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer
          variant="modal"
          gradient={true}
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="action-save"
                icon={Save}
                onClick={() => handleSave(false)}
              >
                {item ? 'Update' : 'Save'}
              </Button>
              {item && (
                <Button
                  variant="action-save-as"
                  icon={Copy}
                  onClick={() => handleSave(true)}
                >
                  Save As
                </Button>
              )}
              <Button
                variant="action-cancel"
                icon={XCircle}
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}

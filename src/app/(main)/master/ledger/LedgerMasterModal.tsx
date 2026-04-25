'use client'

import * as React from 'react'
import { X, Save, XCircle, Copy, Check } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { ComboBox } from '@/components/forms/dropdown'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { Footer } from '@/components/layout/footer'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { cn } from '@/lib/utils'
import { GROUP_FIELDS, SELECT_OPTIONS } from '@/data/mock/ledgerMaster'
import type { DynamicField, LedgerRecord } from '@/data/mock/ledgerMaster'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LedgerMasterModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, any>, isSaveAs?: boolean) => void
  item: LedgerRecord | null
  masterName?: string
  selectedGroupId?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveFieldType(field: DynamicField): string {
  const dt = (field.FieldDataType || '').toLowerCase()
  const ft = (field.FieldType || '').toLowerCase()
  if (ft === 'selectbox' || ft === 'select') return 'selectbox'
  if (ft === 'checkbox' || dt === 'bool' || dt === 'boolean' || dt === 'bit') return 'checkbox'
  if (ft === 'number' || dt === 'int' || dt === 'bigint' || dt === 'smallint' || dt === 'decimal' || dt === 'float' || dt === 'numeric' || dt === 'money') return 'number'
  return 'text'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LedgerMasterModal({
  isOpen,
  onClose,
  onSave,
  item,
  masterName,
  selectedGroupId,
}: LedgerMasterModalProps) {
  const alerts = useGlobalAlert()
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = React.useState<Record<string, boolean>>({})

  const fields = selectedGroupId ? (GROUP_FIELDS[selectedGroupId] || []) : []

  // Init form on open
  React.useEffect(() => {
    if (!isOpen) return

    const initial: Record<string, any> = {}
    fields.forEach(f => {
      const type = resolveFieldType(f)
      const rawValue = item ? (item[f.FieldName] ?? item[f.FieldName.charAt(0).toLowerCase() + f.FieldName.slice(1)]) : undefined

      if (rawValue !== undefined && rawValue !== null) {
        if (type === 'checkbox') {
          initial[f.FieldName] = rawValue === true || rawValue === 'true' || rawValue === '1' || rawValue === 1
        } else if (type === 'number') {
          initial[f.FieldName] = parseFloat(rawValue) || 0
        } else {
          initial[f.FieldName] = String(rawValue)
        }
      } else {
        if (type === 'checkbox') {
          initial[f.FieldName] = f.FieldDefaultValue === 'true'
        } else if (type === 'number') {
          initial[f.FieldName] = parseFloat(f.FieldDefaultValue) || 0
        } else {
          const def = f.FieldDefaultValue?.toLowerCase()
          initial[f.FieldName] = (def === 'false' || def === 'null') ? '' : (f.FieldDefaultValue || '')
        }
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

  // ─── Field renderer ────────────────────────────────────────────────────────

  const renderField = (field: DynamicField) => {
    const type = resolveFieldType(field)
    const value = formData[field.FieldName]
    const hasError = !!validationErrors[field.FieldName]

    switch (type) {
      case 'number':
        return (
          <Input
            id={field.FieldName}
            type="number"
            value={value ?? 0}
            onChange={(e) => handleFieldChange(field.FieldName, parseFloat(e.target.value) || 0)}
            placeholder={field.FieldDescription}
            required={field.IsRequiredFieldValidator}
            disabled={field.IsLocked}
            min={field.MinimumValue}
            max={field.MaximumValue || undefined}
            error={hasError ? 'This field is required' : undefined}
          />
        )

      case 'checkbox': {
        const checked = value === true || value === 'true' || value === '1' || value === 1
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
              {field.UnitMeasurement && (
                <span className="text-[rgb(var(--fg-subtle))] ml-1">({field.UnitMeasurement})</span>
              )}
            </span>
          </button>
        )
      }

      case 'selectbox': {
        const opts = SELECT_OPTIONS[field.FieldName] || []
        return (
          <ComboBox
            options={opts}
            value={value ?? ''}
            onValueChange={(v) => handleFieldChange(field.FieldName, v)}
            disabled={field.IsLocked}
            placeholder={field.FieldDisplayName.toLowerCase()}
            allowCustomValue={true}
            error={hasError}
          />
        )
      }

      default:
        return (
          <Input
            id={field.FieldName}
            type="text"
            value={value ?? ''}
            onChange={(e) => handleFieldChange(field.FieldName, e.target.value)}
            placeholder={field.FieldDescription}
            required={field.IsRequiredFieldValidator}
            disabled={field.IsLocked}
            error={hasError ? 'This field is required' : undefined}
          />
        )
    }
  }

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = (isSaveAs = false) => {
    const missing = fields.filter(f => {
      if (!f.IsRequiredFieldValidator) return false
      if (resolveFieldType(f) === 'checkbox') return false
      const v = formData[f.FieldName]
      return v === undefined || v === null || v === ''
    })

    if (missing.length > 0) {
      const errs: Record<string, boolean> = {}
      missing.forEach(f => { errs[f.FieldName] = true })
      setValidationErrors(errs)
      alerts.showError('Validation Error', 'Please fill in all mandatory fields (highlighted in red)')
      return
    }

    setValidationErrors({})

    // Convert types before saving
    const typed: Record<string, any> = {}
    fields.forEach(f => {
      const type = resolveFieldType(f)
      const val = formData[f.FieldName]
      const dt = (f.FieldDataType || '').toLowerCase()

      if (type === 'checkbox') {
        typed[f.FieldName] = val === true || val === 'true' || val === '1' || val === 1
      } else if (type === 'number' || dt === 'int' || dt === 'bigint' || dt === 'smallint') {
        typed[f.FieldName] = parseInt(val) || 0
      } else if (dt === 'decimal' || dt === 'float' || dt === 'numeric' || dt === 'money') {
        typed[f.FieldName] = parseFloat(val) || 0
      } else {
        typed[f.FieldName] = val ?? ''
      }
    })

    onSave(typed, isSaveAs)
  }

  const regularFields = fields.filter(f => resolveFieldType(f) !== 'checkbox')
  const checkboxFields = fields.filter(f => resolveFieldType(f) === 'checkbox')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[90vw] h-[90vh] max-w-none bg-[rgb(var(--bg-surface))] p-0 flex flex-col overflow-hidden"
        hideCloseButton
        disableOutsideClick
        aria-describedby="ledger-master-description"
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
                  ? `${masterName || 'Ledger Master'} Updation`
                  : `${masterName || 'Ledger Master'} Creation`}
              </DialogTitle>
              <div id="ledger-master-description" className="sr-only">
                {item ? 'Update' : 'Create'} {masterName || 'ledger master'} details.
              </div>
            </div>
            <button onClick={onClose} className="close-btn-md" aria-label="Close ledger modal">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-2">
          {fields.length > 0 ? (
            <div className="py-4 p-4 bg-[rgb(var(--bg-surface))] rounded-lg">
              <div className="grid grid-cols-12 gap-3">
                {/* Regular fields */}
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

                {/* Checkbox fields */}
                {checkboxFields.map(field => (
                  <div key={field.FieldName} className="col-span-12 md:col-span-6 lg:col-span-3 flex items-end">
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-[rgb(var(--fg-muted))]">
              <p>{selectedGroupId ? 'No fields configured for this master group' : 'Please select a master group'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer
          variant="modal"
          gradient={true}
          actions={
            <div className="flex items-center gap-3">
              <Button variant="action-save" icon={Save} onClick={() => handleSave(false)}>
                {item ? 'Update' : 'Save'}
              </Button>
              {item && (
                <Button variant="action-save-as" icon={Copy} onClick={() => handleSave(true)}>
                  Save As
                </Button>
              )}
              <Button variant="action-cancel" icon={XCircle} onClick={onClose}>
                Cancel
              </Button>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
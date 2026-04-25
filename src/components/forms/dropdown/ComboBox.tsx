'use client'

import * as React from 'react'
import { Dropdown } from './Dropdown'
import { DropdownOption } from './types'

export interface ComboBoxOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface ComboBoxProps {
  options: ComboBoxOption[]
  value?: string | number
  placeholder?: string
  onValueChange: (value: string | number) => void
  disabled?: boolean
  className?: string
  error?: boolean
  label?: React.ReactNode
  required?: boolean
  /** Allow typing custom values not in the options list (default: true) */
  allowCustomValue?: boolean
}

/**
 * ComboBox - A dropdown that allows both selection and custom input
 *
 * This is an alias for Dropdown with allowCustomInput enabled.
 * For full feature access, use Dropdown directly with allowCustomInput prop.
 *
 * Usage:
 * ```tsx
 * <ComboBox
 *   options={[{ value: '1', label: 'Option 1' }]}
 *   value={value}
 *   onValueChange={setValue}
 *   allowCustomValue={true}
 * />
 * ```
 *
 * Or use Dropdown directly:
 * ```tsx
 * <Dropdown
 *   options={options}
 *   value={value}
 *   onValueChange={setValue}
 *   allowCustomInput={true}
 *   searchable={true}
 * />
 * ```
 */
export function ComboBox({
  options = [],
  value,
  placeholder = 'Select or type...',
  onValueChange,
  disabled = false,
  className,
  error = false,
  label,
  required = false,
  allowCustomValue = true
}: ComboBoxProps) {
  return (
    <Dropdown
      options={options as DropdownOption[]}
      value={value}
      placeholder={placeholder}
      onValueChange={(val) => onValueChange(val as string | number)}
      disabled={disabled}
      className={className}
      error={error}
      label={label}
      required={required}
      searchable={true}
      clearable={true}
      allowCustomInput={allowCustomValue}
    />
  )
}

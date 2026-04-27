'use client'

import React from 'react'

interface SelectionCellProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  circular?: boolean
  mode?: 'checkbox' | 'radio' // checkbox = multi-select, radio = single-select
}

export function SelectionCell({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  circular = true,
  mode = 'checkbox',
}: SelectionCellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onChange(!checked)
    }
  }

  if (!circular) {
    // Square checkbox (original style)
    return (
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate
        }}
        onChange={(e) => {
          e.stopPropagation()
          onChange(e.target.checked)
        }}
        disabled={disabled}
        className="w-4 h-4 border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-primary"
      />
    )
  }

  // Radio button mode (single selection)
  if (mode === 'radio') {
    return (
      <div
        onClick={handleClick}
        className={`
          relative rounded-full border-2 cursor-pointer transition-all duration-150
          flex items-center justify-center flex-shrink-0
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${
            checked
              ? 'border-slate-700 bg-white'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
        style={{
          boxShadow: checked ? '0 0 0 2px rgba(30, 41, 59, 0.15)' : 'none',
          width: '14px',
          height: '14px',
          minWidth: '14px',
          minHeight: '14px',
        }}
      >
        {/* Inner filled circle for radio */}
        {checked && (
          <div className="w-2 h-2 rounded-full bg-slate-700 transition-all duration-150" />
        )}
      </div>
    )
  }

  // Circular checkbox (AG Grid style, multi-select)
  return (
    <div
      onClick={handleClick}
      className={`
        relative rounded-full border-2 cursor-pointer transition-all duration-150
        flex items-center justify-center flex-shrink-0
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${
          checked || indeterminate
            ? 'border-slate-700 bg-slate-700'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }
      `}
      style={{
        boxShadow: checked || indeterminate ? '0 0 0 2px rgba(30, 41, 59, 0.15)' : 'none',
        width: '14px',
        height: '14px',
        minWidth: '14px',
        minHeight: '14px',
      }}
    >
      {/* Tick mark */}
      {checked && !indeterminate && (
        <svg width="8" height="7" viewBox="0 0 10 8" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Indeterminate line */}
      {indeterminate && (
        <div className="w-2 h-0.5 bg-white rounded transition-all duration-150" />
      )}
    </div>
  )
}

// Backward compatibility
export { SelectionCell as SelectionCheckbox }
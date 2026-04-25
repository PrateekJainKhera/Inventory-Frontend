import React from 'react'
import { clsx } from 'clsx'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  indeterminate?: boolean
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  indeterminate,
  ...props
}) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate ?? false
    }
  }, [indeterminate])

  return (
    <div className="flex items-center">
      <input
        ref={checkboxRef}
        type="checkbox"
        className={clsx(
          'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
          className
        )}
        {...props}
      />
      {label && (
        <label className="ml-2 block text-xs text-gray-700">
          {label}
        </label>
      )}
    </div>
  )
}
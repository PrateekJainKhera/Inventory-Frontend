import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    helper,
    ...props
  }, ref) => {
    const hasError = !!error
    const generatedId = React.useId()
    const textareaId = props.id || generatedId
    const textareaName = props.name || textareaId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          name={textareaName}
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            hasError && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />

        {helper && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helper}</p>
        )}

        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }

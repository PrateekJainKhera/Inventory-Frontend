import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, CheckCircle } from "lucide-react"

// Helper to check if value is a valid React element (already rendered JSX)
const isReactElement = (value: any): value is React.ReactElement => {
  return React.isValidElement(value)
}

// Helper to check if value is a React component (function or forwardRef)
const isReactComponent = (value: any): boolean => {
  return typeof value === 'function' || (value && typeof value === 'object' && '$$typeof' in value)
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'destructive' | 'footer-primary' | 'footer-secondary' |
            'action-create' | 'action-save' | 'action-save-as' | 'action-edit' | 'action-delete' | 'action-print' |
            'action-send' | 'action-mail' | 'action-download' | 'action-refresh' | 'action-cancel' | 'action-secondary' | 'action-apply' | 'action-back'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'footer'
  loading?: boolean
  icon?: LucideIcon | React.ReactNode
  iconPosition?: 'left' | 'right'
  /** When true, renders as circular icon-only button (36px × 36px) */
  iconOnly?: boolean
  /** Tooltip text for icon-only buttons */
  tooltip?: string
}

const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover focus-ring active:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover focus-ring active:opacity-90",
  tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary-hover focus-ring active:opacity-90",
  outline: "border border-bd-default bg-bg-surface text-fg-default hover:bg-bg-hover focus-ring active:bg-bg-hover",
  ghost: "text-fg-default hover:bg-bg-hover focus-ring active:bg-bg-hover",
  destructive: "bg-error text-fg-inverse hover:bg-error-hover focus-ring-error active:opacity-90",
  // Footer-specific variants with inline primary color styles
  'footer-primary': "border-primary transition-opacity duration-200 hover:opacity-90 disabled:opacity-50",
  'footer-secondary': "transition-opacity duration-200 hover:opacity-80 disabled:opacity-50",
  // Action button variants with CSS variable colors (dark mode compatible)
  'action-create': "bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))]/20",
  'action-save': "bg-[rgb(var(--color-success))]/10 hover:bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/20",
  'action-save-as': "bg-[rgb(var(--color-sky))]/10 hover:bg-[rgb(var(--color-sky))]/20 text-[rgb(var(--color-sky))] border border-[rgb(var(--color-sky))]/20",
  'action-edit': "bg-[rgb(var(--color-warning))]/10 hover:bg-[rgb(var(--color-warning))]/20 text-[rgb(var(--color-warning))] border border-[rgb(var(--color-warning))]/20",
  'action-delete': "bg-[rgb(var(--color-error))]/10 hover:bg-[rgb(var(--color-error))]/20 text-[rgb(var(--color-error))] border border-[rgb(var(--color-error))]/20",
  'action-print': "bg-[rgb(var(--color-purple))]/10 hover:bg-[rgb(var(--color-purple))]/20 text-[rgb(var(--color-purple))] border border-[rgb(var(--color-purple))]/20",
  'action-send': "bg-[rgb(var(--color-info))]/10 hover:bg-[rgb(var(--color-info))]/20 text-[rgb(var(--color-info))] border border-[rgb(var(--color-info))]/20",
  'action-mail': "bg-[rgb(var(--color-error))]/10 hover:bg-[rgb(var(--color-error))]/20 text-[rgb(var(--color-error))] border border-[rgb(var(--color-error))]/20",
  'action-download': "bg-[rgb(var(--color-success))]/10 hover:bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/20",
  'action-refresh': "bg-[rgb(var(--color-neutral))]/10 hover:bg-[rgb(var(--color-neutral))]/20 text-[rgb(var(--color-neutral))] border border-[rgb(var(--color-neutral))]/20",
  'action-cancel': "bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] border border-[rgb(var(--bd-default))]",
  'action-secondary': "bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-hover))] text-[rgb(var(--fg-default))] border border-[rgb(var(--bd-default))]",
  'action-apply': "bg-[rgb(var(--color-teal))]/10 hover:bg-[rgb(var(--color-teal))]/20 text-[rgb(var(--color-teal))] border border-[rgb(var(--color-teal))]/20",
  'action-back': "bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] border border-[rgb(var(--bd-default))]"
}

const buttonSizes = {
  xs: "h-6 px-2 py-1 text-xs font-medium", // Extra small - for card headers, compact UI
  sm: "h-8 px-3 text-sm font-medium",
  md: "h-10 px-4 text-sm font-medium",
  lg: "h-12 px-6 text-base font-medium",
  footer: "px-3 py-1.5 text-xs font-medium", // Compact footer size
  action: "h-8 px-3 text-xs font-medium" // Action button size - between sm and footer
}

const iconOnlySizes = {
  xs: "w-6 h-6 text-sm",
  sm: "w-8 h-8 text-base",
  md: "w-9 h-9 text-lg",
  lg: "w-10 h-10 text-xl",
  footer: "w-8 h-8 text-base",
  action: "w-9 h-9 text-lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    iconOnly = false,
    tooltip,
    children,
    disabled,
    style,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    // Check if it's an action button variant
    const isActionButton = variant?.startsWith('action-')

    // Automatically use 'action' size for action button variants
    const buttonSize = isActionButton && size === 'md' ? 'action' : size

    // Auto-assign CheckCircle icon for action-apply if no icon provided
    const resolvedIcon = variant === 'action-apply' && !Icon ? CheckCircle : Icon

    // Icon-only mode: circular button with just icon
    if (iconOnly) {
      // For icon-only buttons, use ghost variant by default if not specified
      const iconOnlyVariant = variant === 'primary' ? 'ghost' : variant

      return (
        <button
          ref={ref}
          type="button"
          title={tooltip}
          disabled={isDisabled}
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-full border-0',
            'transition-colors duration-150 ease-in-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
            iconOnlyVariant === 'ghost' && [
              'text-[rgb(var(--fg-muted))]',
              'hover:bg-[rgb(var(--bg-hover))]',
              'active:bg-[rgb(var(--bg-subtle))]'
            ],
            iconOnlyVariant !== 'ghost' && buttonVariants[iconOnlyVariant],
            iconOnlySizes[buttonSize],
            className
          )}
          style={style}
          {...props}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : Icon && isReactElement(Icon) ? (
            Icon
          ) : Icon && isReactComponent(Icon) ? (
            React.createElement(Icon as any, { className: buttonSize === 'footer' ? 'h-3.5 w-3.5' : 'h-5 w-5' })
          ) : null}
        </button>
      )
    }

    // Apply inline styles for footer variants (uses CSS variables)
    const footerStyles = variant === 'footer-primary'
      ? { backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))', ...style }
      : variant === 'footer-secondary'
      ? { borderColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary))', ...style }
      : style

    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2 transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Border radius - action buttons use rounded-lg, others use rounded-md
          isActionButton ? "rounded-lg" : "rounded-md",
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[buttonSize],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        style={footerStyles}
        title={tooltip}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        )}

        {resolvedIcon && iconPosition === 'left' && !loading && (
          isReactElement(resolvedIcon) ? (
            resolvedIcon
          ) : isReactComponent(resolvedIcon) ? (
            React.createElement(resolvedIcon as any, { className: size === 'xs' ? 'h-3 w-3' : size === 'footer' ? 'h-3.5 w-3.5' : isActionButton ? 'h-4 w-4' : 'h-4 w-4' })
          ) : null
        )}

        {children}

        {resolvedIcon && iconPosition === 'right' && !loading && (
          isReactElement(resolvedIcon) ? (
            resolvedIcon
          ) : isReactComponent(resolvedIcon) ? (
            React.createElement(resolvedIcon as any, { className: size === 'xs' ? 'h-3 w-3' : size === 'footer' ? 'h-3.5 w-3.5' : isActionButton ? 'h-4 w-4' : 'h-4 w-4' })
          ) : null
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

/**
 * CheckboxButton - Toggle button with checkbox-style UI
 * Styled like "Set First Plan as Master"
 */
export interface CheckboxButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label: string
  size?: 'sm' | 'md'
}

export const CheckboxButton = React.forwardRef<HTMLButtonElement, CheckboxButtonProps>(
  ({ checked = false, onChange, label, size = 'md', className, ...props }, ref) => {
    const { Check } = require('lucide-react')

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onChange?.(!checked)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border font-medium transition-all duration-200',
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-2.5 text-xs',
          checked
            ? 'bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]/20'
            : 'bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] border-[rgb(var(--bd-default))]',
          className
        )}
        {...props}
      >
        <div className={cn(
          'w-4 h-4 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0',
          checked
            ? 'bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]'
            : 'bg-transparent border border-[rgb(var(--bd-default))]'
        )}>
          {checked && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </div>
        <span className="whitespace-nowrap">{label}</span>
      </button>
    )
  }
)
CheckboxButton.displayName = "CheckboxButton"

/**
 * InputButton - Inline input with label in bordered container
 * Styled like "Show Wastage upto: 30%"
 */
export interface InputButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  size?: 'sm' | 'md'
  inputClassName?: string
  suffix?: string
}

export const InputButton = React.forwardRef<HTMLInputElement, InputButtonProps>(
  ({ label, size = 'md', className, inputClassName, suffix, ...props }, ref) => {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-2.5 rounded-lg border transition-all duration-200',
          'bg-[rgb(var(--bg-subtle))] hover:bg-[rgb(var(--bg-hover))] border-[rgb(var(--bd-default))]',
          'h-8',
          className
        )}
      >
        <span className={cn(
          'font-medium whitespace-nowrap text-[rgb(var(--fg-default))]',
          'text-xs'
        )}>
          {label}:
        </span>
        <input
          ref={ref}
          type="number"
          className={cn(
            'w-12 text-xs font-bold rounded-md px-1.5 text-center',
            'border-0 focus:outline-none focus:ring-0',
            'bg-[rgb(var(--bg-surface))]',
            'text-[rgb(var(--fg-default))]',
            'placeholder:text-[rgb(var(--fg-muted))]',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            'h-5',
            inputClassName
          )}
          {...props}
        />
        {suffix && (
          <span className="text-xs font-medium text-[rgb(var(--fg-default))]">
            {suffix}
          </span>
        )}
      </div>
    )
  }
)
InputButton.displayName = "InputButton"

export { Button }
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KpiProps {
  /** KPI title/label */
  title: string

  /** Main value to display */
  value: string | number

  /** Optional unit (%, $, etc.) */
  unit?: string

  /** Change from previous period */
  change?: number

  /** Change label (e.g., "vs last week") */
  changeLabel?: string

  /** Icon to display */
  icon?: LucideIcon

  /** Icon background color */
  iconBgColor?: string

  /** Icon color */
  iconColor?: string

  /** Size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Design variant */
  variant?: 'default' | 'minimal' | 'gradient' | 'outlined' | 'compact'

  /** Accent color for gradient/outlined variants */
  accentColor?: 'primary' | 'success' | 'warning' | 'error' | 'info'

  /** Optional subtitle/description */
  subtitle?: string

  /** Loading state */
  loading?: boolean

  /** Click handler */
  onClick?: () => void

  /** Optional footer content (e.g., sparkline chart) */
  footer?: React.ReactNode

  className?: string
}

/**
 * Kpi - Key Performance Indicator card for dashboards
 *
 * Variants:
 * - default: Standard card with icon on right
 * - minimal: Clean, no border, subtle background
 * - gradient: Gradient left border accent
 * - outlined: Colored border with matching icon
 * - compact: Horizontal layout, smaller footprint
 */
export function Kpi({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon: Icon,
  iconBgColor,
  iconColor,
  size = 'md',
  variant = 'default',
  accentColor = 'primary',
  subtitle,
  loading = false,
  onClick,
  footer,
  className
}: KpiProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-xs',
      value: 'text-xl',
      unit: 'text-sm',
      icon: 'w-8 h-8',
      iconSize: 'w-4 h-4'
    },
    md: {
      container: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      unit: 'text-base',
      icon: 'w-10 h-10',
      iconSize: 'w-5 h-5'
    },
    lg: {
      container: 'p-5',
      title: 'text-base',
      value: 'text-3xl',
      unit: 'text-lg',
      icon: 'w-12 h-12',
      iconSize: 'w-6 h-6'
    }
  }

  const accentColors = {
    primary: {
      gradient: 'from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/60',
      border: 'border-[rgb(var(--color-primary))]',
      bg: 'bg-[rgb(var(--color-primary))]/10',
      text: 'text-[rgb(var(--color-primary))]',
      iconBg: 'bg-[rgb(var(--color-primary))]/10',
      iconText: 'text-[rgb(var(--color-primary))]'
    },
    success: {
      gradient: 'from-[rgb(var(--color-success))] to-[rgb(var(--color-success))]/60',
      border: 'border-[rgb(var(--color-success))]',
      bg: 'bg-[rgb(var(--color-success))]/10',
      text: 'text-[rgb(var(--color-success))]',
      iconBg: 'bg-[rgb(var(--color-success))]/10',
      iconText: 'text-[rgb(var(--color-success))]'
    },
    warning: {
      gradient: 'from-[rgb(var(--color-warning))] to-[rgb(var(--color-warning))]/60',
      border: 'border-[rgb(var(--color-warning))]',
      bg: 'bg-[rgb(var(--color-warning))]/10',
      text: 'text-[rgb(var(--color-warning))]',
      iconBg: 'bg-[rgb(var(--color-warning))]/10',
      iconText: 'text-[rgb(var(--color-warning))]'
    },
    error: {
      gradient: 'from-[rgb(var(--color-error))] to-[rgb(var(--color-error))]/60',
      border: 'border-[rgb(var(--color-error))]',
      bg: 'bg-[rgb(var(--color-error))]/10',
      text: 'text-[rgb(var(--color-error))]',
      iconBg: 'bg-[rgb(var(--color-error))]/10',
      iconText: 'text-[rgb(var(--color-error))]'
    },
    info: {
      gradient: 'from-[rgb(var(--color-info))] to-[rgb(var(--color-info))]/60',
      border: 'border-[rgb(var(--color-info))]',
      bg: 'bg-[rgb(var(--color-info))]/10',
      text: 'text-[rgb(var(--color-info))]',
      iconBg: 'bg-[rgb(var(--color-info))]/10',
      iconText: 'text-[rgb(var(--color-info))]'
    }
  }

  const sizes = sizeClasses[size]
  const accent = accentColors[accentColor]

  // Use provided colors or fall back to accent-based colors
  const finalIconBgColor = iconBgColor || accent.iconBg
  const finalIconColor = iconColor || accent.iconText

  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-3 h-3" />
    }
    return change > 0 ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    )
  }

  const getTrendColor = () => {
    if (change === undefined || change === 0) {
      return 'text-[rgb(var(--fg-muted))] bg-[rgb(var(--bg-subtle))]'
    }
    return change > 0
      ? 'text-[rgb(var(--color-success))] bg-[rgb(var(--color-success))]/10'
      : 'text-[rgb(var(--color-error))] bg-[rgb(var(--color-error))]/10'
  }

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={cn(
          'bg-[rgb(var(--bg-surface))] rounded-xl shadow-sm border border-[rgb(var(--bd-default))]',
          sizes.container,
          className
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[rgb(var(--bg-subtle))] rounded w-1/2" />
          <div className="h-8 bg-[rgb(var(--bg-subtle))] rounded w-3/4" />
          <div className="h-3 bg-[rgb(var(--bg-subtle))] rounded w-1/3" />
        </div>
      </div>
    )
  }

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-[rgb(var(--bg-subtle))] rounded-xl border-0 shadow-none'

      case 'gradient':
        return cn(
          'bg-[rgb(var(--bg-surface))] rounded-xl shadow-sm border border-[rgb(var(--bd-default))]',
          'border-l-4',
          accent.border
        )

      case 'outlined':
        return cn(
          'bg-[rgb(var(--bg-surface))] rounded-xl shadow-sm border-2',
          accent.border
        )

      case 'compact':
        return 'bg-[rgb(var(--bg-surface))] rounded-lg shadow-sm border border-[rgb(var(--bd-default))]'

      default:
        return 'bg-[rgb(var(--bg-surface))] rounded-xl shadow-sm border border-[rgb(var(--bd-default))]'
    }
  }

  // Compact variant has a different layout
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className={cn(
          getVariantClasses(),
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-md hover:border-[rgb(var(--bd-hover))]',
          'p-3',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          {Icon && (
            <div
              className={cn(
                'flex items-center justify-center rounded-lg flex-shrink-0 w-10 h-10',
                finalIconBgColor
              )}
            >
              <Icon className={cn(finalIconColor, 'w-5 h-5')} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[rgb(var(--fg-muted))] truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[rgb(var(--fg-default))]">
                {value}
              </span>
              {unit && (
                <span className="text-sm font-medium text-[rgb(var(--fg-muted))]">
                  {unit}
                </span>
              )}
            </div>
          </div>

          {/* Change indicator */}
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0',
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </motion.div>
    )
  }

  // Default, minimal, gradient, outlined variants
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        getVariantClasses(),
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-[rgb(var(--bd-hover))]',
        sizes.container,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={cn('font-medium text-[rgb(var(--fg-muted))] truncate', sizes.title)}>
            {title}
          </p>

          {/* Value + Unit */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className={cn('font-bold text-[rgb(var(--fg-default))]', sizes.value)}>
              {value}
            </span>
            {unit && (
              <span className={cn('font-medium text-[rgb(var(--fg-muted))]', sizes.unit)}>
                {unit}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-[rgb(var(--fg-subtle))] mt-1 truncate">{subtitle}</p>
          )}

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-[rgb(var(--fg-subtle))]">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'flex items-center justify-center rounded-lg flex-shrink-0',
              finalIconBgColor,
              sizes.icon
            )}
          >
            <Icon className={cn(finalIconColor, sizes.iconSize)} />
          </div>
        )}
      </div>

      {/* Footer (e.g., sparkline) */}
      {footer && (
        <div className="mt-3 pt-2 border-t border-[rgb(var(--bd-default))]">
          {footer}
        </div>
      )}
    </motion.div>
  )
}

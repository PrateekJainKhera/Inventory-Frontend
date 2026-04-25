'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageLoading } from './page-loading'

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  variant?: 'spinner' | 'cradle' | 'pendulum' | 'pulse' | 'dots'
  color?: string
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = 'md', text, variant = 'spinner', color = 'text-blue-600', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12'
    }

    const textSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    }

    if (variant === 'cradle') {
      return (
        <PageLoading
          ref={ref}
          size={size === 'xl' ? 'lg' : size}
          text={text}
          className={className}
          {...props}
        />
      )
    }

    const renderVariant = () => {
      switch (variant) {
        case 'pendulum':
          return (
            <div className={cn('relative', sizeClasses[size], color)}>
              {/* Clock face */}
              <div className="absolute inset-0 border-2 border-current rounded-full opacity-20"></div>
              {/* Pendulum arm */}
              <div className="absolute top-1/2 left-1/2 w-0.5 h-1/2 bg-current origin-top animate-[pendulum_1s_ease-in-out_infinite]"></div>
              {/* Pendulum weight */}
              <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-current rounded-full transform -translate-x-1/2 animate-[pendulum_1s_ease-in-out_infinite]"></div>
            </div>
          )

        case 'pulse':
          return (
            <div className={cn('rounded-full bg-current animate-pulse opacity-75', sizeClasses[size], color)}></div>
          )

        case 'dots':
          return (
            <div className={cn('flex space-x-0.5', color)}>
              <div className={cn('rounded-full bg-current w-1.5 h-1.5 animate-bounce')} style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></div>
              <div className={cn('rounded-full bg-current w-1.5 h-1.5 animate-bounce')} style={{ animationDelay: '100ms', animationDuration: '0.6s' }}></div>
              <div className={cn('rounded-full bg-current w-1.5 h-1.5 animate-bounce')} style={{ animationDelay: '200ms', animationDuration: '0.6s' }}></div>
            </div>
          )

        default: // spinner
          return (
            <Loader2 className={cn('animate-spin', sizeClasses[size], color)} />
          )
      }
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center gap-2', className)}
        {...props}
      >
        {renderVariant()}
        {text && (
          <span className={cn('font-medium opacity-80', textSizes[size], color)}>
            {text}
          </span>
        )}
      </div>
    )
  }
)

Loading.displayName = 'Loading'

// Professional loading states for ERP scenarios
export const LoadingStates = {
  // Form operations
  Saving: () => <Loading variant="pendulum" text="Saving..." color="text-green-600" />,
  Loading: () => <Loading variant="spinner" text="Loading..." color="text-blue-600" />,
  Processing: () => <Loading variant="dots" text="Processing..." color="text-blue-600" />,

  // Business operations
  Calculating: () => <Loading variant="pendulum" text="Calculating..." color="text-purple-600" />,
  Generating: () => <Loading variant="spinner" text="Generating plan..." color="text-indigo-600" />,
  Validating: () => <Loading variant="pulse" text="Validating..." color="text-amber-600" />,

  // Data operations
  Exporting: () => <Loading variant="dots" text="Exporting..." color="text-orange-600" />,
  Importing: () => <Loading variant="spinner" text="Importing..." color="text-teal-600" />,
  Syncing: () => <Loading variant="pendulum" text="Syncing..." color="text-cyan-600" />,

  // System operations
  Connecting: () => <Loading variant="pulse" text="Connecting..." color="text-gray-600" />,
  Authenticating: () => <Loading variant="spinner" text="Authenticating..." color="text-slate-600" />,
  SigningIn: () => <PageLoading size="md" text="Signing in..." color="white" />,

  // Inline loading (no text)
  Inline: ({ size = 'sm' }: { size?: 'sm' | 'md' }) => <Loading variant="spinner" size={size} />,
  InlinePendulum: ({ size = 'sm' }: { size?: 'sm' | 'md' }) => <Loading variant="pendulum" size={size} />,
  InlineCradle: ({ size = 'sm' }: { size?: 'sm' | 'md' }) => <PageLoading size={size} />
}

// Full page loading overlay
export function LoadingOverlay({
  isVisible,
  text = "Loading...",
  variant = "pendulum",
  size = "lg"
}: {
  isVisible: boolean
  text?: string
  variant?: LoadingProps['variant']
  size?: LoadingProps['size']
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300]">
      <div className="bg-white rounded-xl p-8 shadow-2xl">
        <Loading variant={variant} size={size} text={text} />
      </div>
    </div>
  )
}

export { Loading }
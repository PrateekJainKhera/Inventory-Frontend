'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  color?: string
  speed?: string
}

const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ className, size = 'md', text, color = '#003366', speed = '1.4', ...props }, ref) => {
    const [isClient, setIsClient] = React.useState(false)

    const sizeMapping = {
      sm: '48',
      md: '64',
      lg: '78'
    }

    React.useEffect(() => {
      setIsClient(true)

      // Dynamically import and register the NewtonsCradle component
      const loadNewtonsCradle = async () => {
        try {
          const { newtonsCradle } = await import('ldrs')
          newtonsCradle.register()
        } catch (error) {
          console.error('Failed to load NewtonsCradle:', error)
        }
      }

      loadNewtonsCradle()
    }, [])

    if (!isClient) {
      // Fallback spinner for SSR
      return (
        <div
          ref={ref}
          className={cn('flex flex-col items-center justify-center space-y-3', className)}
          {...props}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          {text && <span className="text-sm text-gray-600 font-medium">{text}</span>}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center space-y-3', className)}
        {...props}
      >
        <l-newtons-cradle
          size={sizeMapping[size]}
          speed={speed}
          color={color}
        />
        {text && <span className="text-sm text-gray-600 font-medium">{text}</span>}
      </div>
    )
  }
)

PageLoading.displayName = 'PageLoading'

export { PageLoading }

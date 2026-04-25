'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PageLoading } from '../overlays/page-loading'

export function NavigationProgress() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    setProgress(0)

    // Animate progress smoothly: 0 → 30 → 60 → 90 → 100
    const timer1 = setTimeout(() => setProgress(30), 100)
    const timer2 = setTimeout(() => setProgress(60), 250)
    const timer3 = setTimeout(() => setProgress(90), 400)
    const timer4 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none bg-black/20 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="bg-[rgb(var(--bg-surface))] px-10 py-8 rounded-xl shadow-2xl border border-[rgb(var(--bd-default))]">
            <div className="flex flex-col items-center gap-6">
              {/* Newton's Cradle Pendulum */}
              <PageLoading size="lg" text="Loading..." />

              {/* Progress Bar */}
              <div className="w-64 space-y-2">
                <div className="h-2 bg-[rgb(var(--bg-subtle))] rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary-hover))] to-[rgb(var(--color-primary))] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      boxShadow: '0 0 10px rgba(var(--color-primary), 0.5)'
                    }}
                  />
                </div>

                {/* Progress Percentage */}
                <div className="text-center">
                  <span className="text-sm font-semibold text-[rgb(var(--color-primary))] tabular-nums">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
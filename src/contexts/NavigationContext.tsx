'use client'

import * as React from 'react'
import { getDynamicNavigation, GroupedModule, DynamicModule } from '@/lib/api'

interface NavigationContextValue {
  groupedModules: GroupedModule[]
  loading: boolean
  error: string | null
  refreshNavigation: () => void
}

const NavigationContext = React.createContext<NavigationContextValue | undefined>(undefined)

export function NavigationProvider({
  children,
  companyId,
  userId
}: {
  children: React.ReactNode
  companyId?: number
  userId?: number
}) {
  const [groupedModules, setGroupedModules] = React.useState<GroupedModule[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchNavigation = React.useCallback(async () => {
    if (!companyId || !userId) {
      setLoading(false)
      return
    }

    const cacheKey = `navigation_${companyId}_${userId}`
    const cacheTimeKey = `${cacheKey}_time`
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    try {
      // Check cache first
      const cachedData = localStorage.getItem(cacheKey)
      const cacheTime = localStorage.getItem(cacheTimeKey)

      if (cachedData && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < CACHE_DURATION) {
          setGroupedModules(JSON.parse(cachedData))
          setLoading(false)
          return
        }
      }

      setLoading(true)
      const navigation = await getDynamicNavigation(companyId, userId)

      setGroupedModules(navigation)
      localStorage.setItem(cacheKey, JSON.stringify(navigation))
      localStorage.setItem(cacheTimeKey, Date.now().toString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load navigation'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [companyId, userId])

  React.useEffect(() => {
    fetchNavigation()
  }, [fetchNavigation])

  const value = React.useMemo(
    () => ({
      groupedModules,
      loading,
      error,
      refreshNavigation: fetchNavigation
    }),
    [groupedModules, loading, error, fetchNavigation]
  )

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = React.useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

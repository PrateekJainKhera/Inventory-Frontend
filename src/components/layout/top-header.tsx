'use client'

import * as React from 'react'
import { Settings, ChevronDown, Search, Bell, Sidebar, X, Mail, Menu, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ProductionUnitsAPI } from '@/lib/api'
import { Dropdown, DropdownOption } from '@/components'
import { EmailPanelContent as EmailInboxPanel } from '@/app/(main)/email/components/InboxPanel'
import { UserDropdown } from './userprofile-dropdown'
import { useAppConfig } from '@/contexts/AppConfigContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { useEmail } from '@/contexts/EmailContext'

export interface TopHeaderProps {
  className?: string
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onToggleMobileSidebar?: () => void
}

// Fallback production units if API fails
const fallbackProductionUnits: { value: string; label: string }[] = [
  { value: 'default', label: 'Default Unit' }
]

// Empty initial state - data comes from API only
const defaultProductionUnits: { value: string; label: string }[] = []

export function TopHeader({ className, sidebarCollapsed = true, onToggleSidebar, onToggleMobileSidebar }: TopHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const appConfig = useAppConfig()
  const { state: emailState } = useEmail()
  const [productionUnits, setProductionUnits] = React.useState(defaultProductionUnits)
  const [selectedUnit, setSelectedUnit] = React.useState('')
  const [unitsLoading, setUnitsLoading] = React.useState(false)
  const [apiCallMade, setApiCallMade] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showSearchModal, setShowSearchModal] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false)
  const [activeNotificationCategory, setActiveNotificationCategory] = React.useState<'all' | 'pending' | 'escalations' | 'notifications'>('all')
  const [showEmailDropdown, setShowEmailDropdown] = React.useState(false)
  const [notifications, setNotifications] = React.useState({
    pending: [
      { id: 1, title: "Quotation #Q-2024-001 requires approval", time: "5 min ago", type: "pending", read: false },
      { id: 2, title: "Material cost approval needed", time: "15 min ago", type: "pending", read: false },
      { id: 3, title: "Production schedule confirmation required", time: "1 hour ago", type: "pending", read: true }
    ],
    escalations: [
      { id: 4, title: "Overdue quotation - Customer ABC Ltd", time: "2 hours ago", type: "escalation", read: false },
      { id: 5, title: "Quality issue escalated by production team", time: "4 hours ago", type: "escalation", read: true }
    ],
    notifications: [
      { id: 6, title: "New order received from XYZ Corp", time: "30 min ago", type: "notification", read: false },
      { id: 7, title: "Inventory level low for Paper Grade A", time: "2 hours ago", type: "notification", read: false },
      { id: 8, title: "Monthly report generated successfully", time: "3 hours ago", type: "notification", read: true }
    ]
  })

  const getAllNotifications = () => [
    ...notifications.pending,
    ...notifications.escalations,
    ...notifications.notifications
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const getFilteredNotifications = () => {
    if (activeNotificationCategory === 'all') return getAllNotifications()
    return notifications[activeNotificationCategory] || []
  }

  const getNotificationCounts = () => ({
    all: getAllNotifications().length,
    pending: notifications.pending.length,
    escalations: notifications.escalations.length,
    notifications: notifications.notifications.length
  })

  const getUnreadCount = () => {
    return getAllNotifications().filter(n => !n.read).length
  }

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(key => {
        updated[key as keyof typeof updated] = updated[key as keyof typeof updated].map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      })
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(key => {
        updated[key as keyof typeof updated] = updated[key as keyof typeof updated].map(n => ({ ...n, read: true }))
      })
      return updated
    })
  }

  // Fetch production units from API
  React.useEffect(() => {
    const fetchProductionUnits = async () => {
      if (!session?.user) {
        setUnitsLoading(false)
        return
      }

      // Prevent multiple simultaneous calls
      if (unitsLoading || apiCallMade) {
        return
      }

      setUnitsLoading(true)
      setApiCallMade(true)

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setUnitsLoading(false)
        setProductionUnits([])
      }, 10000)

      try {
        const response = await ProductionUnitsAPI.getProductionUnits(session)

        if (response.success && response.data) {

          // Handle the nested ProductionUnits structure
          let unitsArray = response.data
          if (response.data.ProductionUnits) {
            unitsArray = response.data.ProductionUnits
          }

          if (Array.isArray(unitsArray)) {
            // Transform API data to match the expected format
            const units = unitsArray.map((unit: any) => {
              return {
                value: unit.ProductionUnitID || unit.Value || unit.value || unit.UnitCode || unit.unitCode || unit.id || unit.Id || unit.Code,
                label: unit.ProductionUnitName || unit.Label || unit.label || unit.UnitName || unit.unitName || unit.name || unit.Name || unit.Description
              }
            })

            if (units.length > 0) {
              setProductionUnits(units)
              // Set the first unit as default if no selection or current selection doesn't exist
              const unitExists = selectedUnit && units.some((unit: any) => unit.value === selectedUnit)
              if (!unitExists) {
                setSelectedUnit(units[0].value)
              }
            } else {
              setProductionUnits([])
            }
          } else {
            setProductionUnits([])
          }
        } else {
          setProductionUnits(fallbackProductionUnits)
          setSelectedUnit(fallbackProductionUnits[0].value)
        }
      } catch (error) {
        // Use fallback production units on any error
        setProductionUnits(fallbackProductionUnits)
        setSelectedUnit(fallbackProductionUnits[0].value)
      } finally {
        clearTimeout(timeoutId)
        setUnitsLoading(false)
      }
    }

    fetchProductionUnits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, selectedUnit]) // apiCallMade and unitsLoading are intentionally excluded - they're internal guards to prevent re-fetching

  const { groupedModules, loading: navLoading } = useNavigation()

  // Convert route mapping (same as sidebar)
  const getModuleRoutePath = (moduleName: string | undefined | null): string => {
    // Handle undefined/null module names
    if (!moduleName || typeof moduleName !== 'string') {
      return '#'
    }

    // Trim whitespace, newlines, tabs
    const trimmedName = moduleName.trim()

    if (trimmedName.startsWith('/')) return trimmedName
    if (trimmedName.includes('.aspx')) return '#'

    const ROUTE_MAP: Record<string, string> = {
      'estimation': '/estimation',
      'dashboard': '/dashboard',
      'master': '/master',
      'enquiry': '/enquiry',
      'reports': '/reports',
      'settings': '/settings',
      'process': '/master/process',
      'machine': '/master/machine',
    }

    const lowerPath = trimmedName.toLowerCase().trim()
    return ROUTE_MAP[lowerPath] || `/${lowerPath.replace(/\s+/g, '-')}`
  }

  // Flatten all modules for search
  const allModules = React.useMemo(() => {
    const modules: { name: string; href: string; group: string }[] = []

    groupedModules.forEach(group => {
      group.modules?.forEach(module => {
        // Skip modules without a valid ModuleName
        if (!module.ModuleName || typeof module.ModuleName !== 'string') {
          return
        }

        const href = getModuleRoutePath(module.ModuleName)
        if (href !== '#') { // Skip non-clickable items
          modules.push({
            name: module.ModuleName.trim(),
            href,
            group: group.groupName
          })
        }
      })
    })

    return modules
  }, [groupedModules])

  const filteredResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { all: [], byGroup: {} }

    const query = searchQuery.toLowerCase()
    const filtered = allModules.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.group.toLowerCase().includes(query)
    )

    // Group results by group name
    const byGroup: Record<string, typeof filtered> = {}
    filtered.forEach(item => {
      if (!byGroup[item.group]) {
        byGroup[item.group] = []
      }
      byGroup[item.group].push(item)
    })

    return { all: filtered, byGroup }
  }, [searchQuery, allModules])

  const handleSearchItemClick = (item: any) => {
    setShowSearchModal(false)
    setSearchQuery('')
    router.push(item.href)
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full bg-primary-hover border-b border-primary/20 shadow-sm",
        className
      )}>
        <div className="flex h-14 items-center justify-between px-2 sm:px-4 lg:px-6 gap-2 sm:gap-3 lg:gap-4">
          {/* Left side - Sidebar toggle and Company info */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink min-w-0">
            {/* Mobile Sidebar Toggle Button */}
            {onToggleMobileSidebar && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleMobileSidebar()
                }}
                className="lg:hidden p-1.5 sm:p-2 text-white/60 hover:text-white transition-colors focus:outline-none flex-shrink-0"
                title="Open menu"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Desktop Sidebar Toggle Button */}
            {onToggleSidebar && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSidebar()
                }}
                className="hidden lg:block p-2 text-white/60 hover:text-white transition-colors focus:outline-none flex-shrink-0"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Company Name - Responsive truncation */}
            <button
              onClick={() => router.push('/home')}
              className="text-white font-semibold text-xs sm:text-sm lg:text-base hover:text-white/80 transition-colors cursor-pointer max-w-[80px] sm:max-w-[120px] md:max-w-[200px] lg:max-w-xs truncate flex-shrink"
              title={(session?.user as any)?.CompanyName || 'Loading...'}
            >
              {(session?.user as any)?.CompanyName || 'Loading...'}
            </button>

            {/* Production Unit Dropdown */}
            <div className="w-20 sm:w-28 md:w-36 lg:w-40 flex-shrink-0">
              {mounted ? (
                <Dropdown
                  options={unitsLoading ? [{ value: '', label: 'Loading...', disabled: true }] : productionUnits}
                  value={selectedUnit}
                  onValueChange={(value) => {
                    const unitValue = Array.isArray(value) ? value[0] : String(value || '')
                    setSelectedUnit(unitValue)
                    appConfig.setSelectedProductionUnit(unitValue)
                  }}
                  placeholder="Unit"
                  disabled={unitsLoading}
                  triggerClassName="bg-white/10 text-white text-[10px] sm:text-xs border-white/20 hover:bg-white/15 focus:bg-white/15 focus:ring-white/30 py-1 px-1.5 sm:px-2 min-h-0 h-6 sm:h-7"
                />
              ) : (
                <div className="bg-white/10 text-white text-[10px] sm:text-xs border border-white/20 rounded-md py-1 px-1.5 sm:px-2 h-6 sm:h-7 flex items-center">
                  <span className="text-white/60">Loading...</span>
                </div>
              )}
            </div>

            {/* FY Year Display - Compact on mobile */}
            <div className="hidden sm:block w-fit flex-shrink-0">
              <div className="bg-white/10 text-white text-[10px] sm:text-xs border border-white/20 rounded-md py-1 px-2 sm:px-3 h-6 sm:h-7 flex items-center justify-center">
                <span className="text-white font-medium whitespace-nowrap">
                  {(session?.user as any)?.FYear || 'N/A'}
                </span>
              </div>
            </div>

            {/* Greet User - Desktop only */}
            <div className="hidden xl:flex items-center text-white/90 text-sm font-medium max-w-48 flex-shrink">
              <span className="truncate">Hello {session?.user?.name || 'User'}</span>
              {!unitsLoading && apiCallMade && productionUnits.length === 0 && session && (
                <span className="ml-2 text-xs text-red-300">(Units unavailable)</span>
              )}
            </div>
          </div>

          {/* Right side - Search, actions and user */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            {/* Global Search - Icon on mobile, full search on desktop */}
            <div className="relative">
              {/* Mobile: Search icon button */}
              <Button
                iconOnly
                variant="ghost"
                size="sm"
                icon={<Search className="h-4 w-4" />}
                onClick={() => setShowSearchModal(!showSearchModal)}
                className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10"
              />

              {/* Desktop: Full search bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value.length > 0) {
                        setShowSearchModal(true)
                      } else {
                        setShowSearchModal(false)
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSearchModal(false), 200)}
                    className="pl-10 pr-3 py-1 w-56 lg:w-72 h-8 text-xs rounded-md border bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Search Dropdown - Simple and clean */}
              {showSearchModal && filteredResults.all.length > 0 && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-40 md:hidden bg-black/20"
                    onClick={() => {
                      setShowSearchModal(false)
                      setSearchQuery('')
                    }}
                  />

                  {/* Search Results */}
                  <div className={cn(
                    "absolute z-50 bg-[rgb(var(--bg-surface))] rounded-lg shadow-xl border border-[rgb(var(--bd-default))] overflow-hidden",
                    "md:top-full md:left-0 md:mt-2 md:w-80",
                    "max-md:fixed max-md:inset-x-4 max-md:top-16 max-md:max-w-md max-md:mx-auto"
                  )}>
                    {/* Mobile: Search input */}
                    <div className="md:hidden p-3 border-b border-[rgb(var(--bd-default))]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[rgb(var(--fg-muted))]" />
                        <input
                          type="text"
                          placeholder="Search modules..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="pl-10 pr-3 py-2 w-full text-sm rounded-md border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] placeholder:text-[rgb(var(--fg-muted))] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Results List */}
                    <div className="max-h-96 overflow-y-auto">
                      {filteredResults.all.length === 0 ? (
                        <div className="p-8 text-center">
                          <Search className="h-10 w-10 text-[rgb(var(--fg-muted))] mx-auto mb-2 opacity-30" />
                          <p className="text-sm text-[rgb(var(--fg-muted))]">
                            {navLoading ? 'Loading...' : 'No results found'}
                          </p>
                        </div>
                      ) : (
                        <>
                          {Object.entries(filteredResults.byGroup).map(([groupName, items]) => (
                            <div key={groupName} className="py-2">
                              <div className="px-4 py-1.5 bg-[rgb(var(--bg-subtle))]">
                                <h4 className="text-xs font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-wide">
                                  {groupName}
                                </h4>
                              </div>
                              <div className="px-2 py-1">
                                {items.map((item, index) => (
                                  <div
                                    key={index}
                                    onClick={() => handleSearchItemClick(item)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[rgb(var(--bg-hover))] cursor-pointer group"
                                  >
                                    <Search className="h-4 w-4 text-[rgb(var(--fg-muted))] group-hover:text-[rgb(var(--color-primary))] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-[rgb(var(--fg-default))] group-hover:text-[rgb(var(--color-primary))]">
                                        {item.name}
                                      </div>
                                      <div className="text-xs text-[rgb(var(--fg-muted))] truncate">{item.href}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Footer with count */}
                    {filteredResults.all.length > 0 && (
                      <div className="px-4 py-2 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))] flex items-center justify-between">
                        <span className="text-xs text-[rgb(var(--fg-muted))]">
                          {filteredResults.all.length} result{filteredResults.all.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-[rgb(var(--fg-muted))]">Click to navigate</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mail */}
            <div className="relative">
              <Button
                iconOnly
                variant="ghost"
                size="sm"
                icon={<Mail className="h-4 w-4" />}
                className="relative p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setShowEmailDropdown(!showEmailDropdown)}
              >
                {emailState.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[rgb(var(--color-primary))]">
                    {emailState.unreadCount > 99 ? '99+' : emailState.unreadCount}
                  </span>
                )}
                <span className="sr-only">Mail</span>
              </Button>

              {/* Email Dropdown */}
              {showEmailDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowEmailDropdown(false)}
                  />

                  {/* Dropdown Content - Responsive width */}
                  <div className={cn(
                    "absolute mt-2 z-50",
                    "right-0 md:right-0",
                    "w-screen max-w-[calc(100vw-2rem)] sm:w-auto"
                  )}>
                    <EmailInboxPanel onClose={() => setShowEmailDropdown(false)} />
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                iconOnly
                variant="ghost"
                size="sm"
                icon={<Bell className="h-4 w-4" />}
                className="relative p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              >
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[rgb(var(--color-primary))] animate-pulse">
                    {getUnreadCount() > 99 ? '99+' : getUnreadCount()}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotificationDropdown(false)}
                  />

                  {/* Dropdown Content - Responsive width */}
                  <div className={cn(
                    "absolute mt-2 z-50 bg-bg-surface rounded-lg shadow-xl border border-bd-default overflow-hidden",
                    "right-0",
                    "w-screen max-w-[calc(100vw-1rem)] sm:max-w-md md:w-96"
                  )}>
                    {/* Header */}
                    <div className="p-4 border-b border-bd-subtle">
                      <h3 className="text-lg font-semibold text-fg-default">Notifications</h3>
                    </div>

                    {/* Category Toggle Buttons - Responsive layout */}
                    <div className="p-2 sm:p-3 border-b border-bd-subtle bg-bg-subtle">
                      <div className="grid grid-cols-2 sm:flex gap-1">
                        {[
                          { key: 'all', label: 'All', count: getNotificationCounts().all, color: null },
                          { key: 'pending', label: 'Pending', count: getNotificationCounts().pending, color: 'error' },
                          { key: 'escalations', label: 'Escalations', shortLabel: 'Escalate', count: getNotificationCounts().escalations, color: 'warning' },
                          { key: 'notifications', label: 'Updates', count: getNotificationCounts().notifications, color: 'success' }
                        ].map((category) => {
                          const getColorClasses = () => {
                            if (activeNotificationCategory === category.key) {
                              if (category.color === 'error') {
                                return 'bg-[rgb(var(--color-error))]/80 text-white shadow-md border-2 border-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]'
                              }
                              if (category.color === 'warning') {
                                return 'bg-[rgb(var(--color-warning))]/80 text-white shadow-md border-2 border-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning))]'
                              }
                              if (category.color === 'success') {
                                return 'bg-[rgb(var(--color-success))]/80 text-white shadow-md border-2 border-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))]'
                              }
                              return 'bg-[rgb(var(--color-primary))]/80 text-white shadow-md border-2 border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]'
                            }
                            if (category.color === 'error') {
                              return 'bg-[rgb(var(--color-error))]/10 text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]/20 border border-[rgb(var(--color-error))]/30'
                            }
                            if (category.color === 'warning') {
                              return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning))]/20 border border-[rgb(var(--color-warning))]/30'
                            }
                            if (category.color === 'success') {
                              return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))]/20 border border-[rgb(var(--color-success))]/30'
                            }
                            return 'bg-bg-hover text-fg-muted hover:bg-bg-selected hover:text-fg-default'
                          }

                          return (
                            <button
                              key={category.key}
                              onClick={() => setActiveNotificationCategory(category.key as any)}
                              className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 flex-1 justify-center ${getColorClasses()}`}
                            >
                              <span className="truncate">
                                {/* Show short label on mobile, full label on tablet+ */}
                                <span className="sm:hidden">{(category as any).shortLabel || category.label}</span>
                                <span className="hidden sm:inline">{category.label}</span>
                              </span>
                              {category.count > 0 && (
                                <span className={`inline-flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-0.5 sm:px-1 text-[9px] sm:text-[10px] leading-none rounded-full font-bold ${activeNotificationCategory === category.key
                                    ? 'bg-white/25 text-white'
                                    : category.color === 'error'
                                      ? 'bg-[rgb(var(--color-error))] text-white'
                                      : category.color === 'warning'
                                        ? 'bg-[rgb(var(--color-warning))] text-white'
                                        : category.color === 'success'
                                          ? 'bg-[rgb(var(--color-success))] text-white'
                                          : 'bg-[rgb(var(--color-primary))] text-white'
                                  }`}>
                                  {category.count}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                      {getFilteredNotifications().length === 0 ? (
                        <div className="p-6 text-center text-fg-subtle">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications in this category</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-bd-subtle">
                          {getFilteredNotifications().map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markNotificationAsRead(notification.id)}
                              className={`p-4 hover:bg-bg-hover transition-colors cursor-pointer ${!notification.read ? 'bg-bg-subtle' : ''
                                }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notification.type === 'pending' ? 'bg-[rgb(var(--color-error))]' :
                                    notification.type === 'escalation' ? 'bg-[rgb(var(--color-warning))]' :
                                      'bg-[rgb(var(--color-success))]'
                                  }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${notification.read ? 'text-fg-muted' : 'text-fg-default font-semibold'
                                    }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-fg-muted mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-bd-subtle bg-bg-subtle flex gap-2">
                      {getUnreadCount() > 0 && (
                        <button
                          className="flex-1 text-center text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAllAsRead()
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        className="flex-1 text-center text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] font-medium transition-colors"
                        onClick={() => {
                          setShowNotificationDropdown(false)
                          // TODO: Navigate to notifications page when ready
                        }}
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Dropdown */}
            <UserDropdown />
          </div>
        </div>
      </header>
    </>
  )
}
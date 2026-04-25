'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Home, Package, Settings, FileText, Users, Calculator, Wrench, Building2, ClipboardList, TrendingUp, DollarSign, Factory, Briefcase, Database, ShoppingCart, BarChart3, ChevronLeft, Gauge, MessageSquare, ClipboardCheck, Cog, UserCog, Building, Tag, Layers, Boxes, BookOpen, Receipt, PieChart, FileSpreadsheet, Target, Shield, PanelLeftOpen, PanelLeftClose, AlertCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from '@/components/ui'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui'
import { getDynamicNavigation, GroupedModule, DynamicModule } from '@/lib/api'
import '../../styles/sidebar-scrollbar.css'
import { createPortal } from 'react-dom'
import { SidebarContextMenu, SidebarGroupContextMenu } from './SidebarContextMenu'
import { useSidebarPreferences } from '@/contexts/SidebarPreferencesContext'

// Route mapping for consistent path conversion
const ROUTE_MAP: Record<string, string> = {
  'estimation': '/estimation',
  'dashboard': '/dashboard',
  'master': '/master',
  'enquiry': '/enquiry',
  'reports': '/reports',
  'settings': '/settings',
  'process': '/master/process',
  'machine': '/master/machine',
  'test-auth': '/test-auth',
  'theme-demo': '/theme-demo',
  'dynamic-menu-test': '/dynamic-menu-test'
}

// Utility function to convert module name to route path
const getModuleRoutePath = (moduleName: string | undefined | null): string => {
  // Handle undefined/null module names
  if (!moduleName || typeof moduleName !== 'string') {
    return '#'
  }

  // Trim whitespace, newlines, tabs
  const trimmedName = moduleName.trim()

  // If it's already a proper path starting with /, use as-is
  if (trimmedName.startsWith('/')) {
    return trimmedName
  }

  // If it's a legacy .aspx file, keep non-clickable
  if (trimmedName.includes('.aspx')) {
    return '#'
  }

  // Check route mapping first
  const lowerPath = trimmedName.toLowerCase().trim()
  const mappedRoute = ROUTE_MAP[lowerPath]

  if (mappedRoute) {
    return mappedRoute
  }

  // Default: convert to kebab-case path
  return `/${lowerPath.replace(/\s+/g, '-')}`
}

export interface DynamicSidebarProps {
  isCollapsed?: boolean
  onMenuItemClick?: () => void
  onToggleSidebar?: () => void
  className?: string
  companyId?: number
  userId?: number
}

interface ExpandedState {
  [groupName: string]: boolean
}

// Icon mapping for group names with more intelligent and specific icons
const getGroupIcon = (groupName: string) => {
  const name = groupName.toLowerCase()

  // Dashboard & Home
  if (name.includes('dashboard') || name.includes('home')) {
    return Gauge
  }

  // Sales & Enquiry
  else if (name.includes('sales')) {
    return TrendingUp
  } else if (name.includes('enquiry') || name.includes('inquiry') || name.includes('lead')) {
    return MessageSquare
  }

  // Estimation & Quotation
  else if (name.includes('estimation') || name.includes('estimate')) {
    return Calculator
  } else if (name.includes('quotation') || name.includes('quote')) {
    return Receipt
  }

  // Master Data Management
  else if (name.includes('masters') || name.includes('master')) {
    return Database
  } else if (name.includes('user') && name.includes('management')) {
    return UserCog
  } else if (name.includes('company') || name.includes('branch')) {
    return Building
  } else if (name.includes('category') || name.includes('tag')) {
    return Tag
  } else if (name.includes('process')) {
    return Layers
  } else if (name.includes('machine') || name.includes('equipment')) {
    return Cog
  } else if (name.includes('item') || name.includes('product') || name.includes('inventory')) {
    return Boxes
  } else if (name.includes('ledger') || name.includes('account')) {
    return BookOpen
  }

  // Reports & Analytics
  else if (name.includes('mis') || name.includes('report')) {
    return PieChart
  } else if (name.includes('analytics') || name.includes('analysis')) {
    return BarChart3
  }

  // Operations
  else if (name.includes('order') || name.includes('purchase')) {
    return ShoppingCart
  } else if (name.includes('cost') || name.includes('price') || name.includes('material')) {
    return DollarSign
  } else if (name.includes('quality') || name.includes('control')) {
    return Shield
  } else if (name.includes('production') || name.includes('manufacturing')) {
    return Factory
  }

  // General
  else if (name.includes('customer') || name.includes('client')) {
    return Users
  } else if (name.includes('setting') || name.includes('config')) {
    return Settings
  } else if (name.includes('target') || name.includes('goal')) {
    return Target
  }

  // Default icon
  return ClipboardCheck
}

export function DynamicSidebar({
  isCollapsed = false,
  onMenuItemClick,
  onToggleSidebar,
  className,
  companyId,
  userId
}: DynamicSidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation();
  const { favorites, hiddenItems, isFavorite, isHidden } = useSidebarPreferences()
  const [groupedModules, setGroupedModules] = React.useState<GroupedModule[]>([])
  const [openItems, setOpenItems] = React.useState<string[]>([])
  const [expandedSubModules, setExpandedSubModules] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [needsScroll, setNeedsScroll] = React.useState(false)
  const navRef = React.useRef<HTMLElement>(null)
  const [hoveredGroup, setHoveredGroup] = React.useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)
  const previousCollapsedRef = React.useRef(isCollapsed)
  const disableHoverRef = React.useRef(false)

  // Filter out hidden items and collect favorites
  const filteredGroupedModules = React.useMemo(() => {
    return groupedModules.map(group => ({
      ...group,
      modules: group.modules.filter(module => {
        // Skip modules without a valid ModuleName
        if (!module.ModuleName || typeof module.ModuleName !== 'string') {
          return false
        }
        const modulePath = getModuleRoutePath(module.ModuleName)
        return !isHidden(modulePath)
      })
    })).filter(group => group.modules.length > 0)
  }, [groupedModules, hiddenItems, isHidden])

  // Collect favorite modules across all groups
  const favoriteModules = React.useMemo(() => {
    const favs: { module: DynamicModule; groupName: string }[] = []
    groupedModules.forEach(group => {
      group.modules.forEach(module => {
        // Skip modules without a valid ModuleName
        if (!module.ModuleName || typeof module.ModuleName !== 'string') {
          return
        }
        const modulePath = getModuleRoutePath(module.ModuleName)
        if (isFavorite(modulePath) && !isHidden(modulePath)) {
          favs.push({ module, groupName: group.groupName })
        }
      })
    })
    return favs
  }, [groupedModules, favorites, isFavorite, isHidden])

  // Ensure component is mounted before using portal
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Smart navigation loading with caching
  React.useEffect(() => {
    // Don't fetch if companyId or userId are not available yet
    if (!companyId || !userId) {
      return
    }

    let isCancelled = false

    const fetchNavigation = async () => {
      // Check cache first - include session start time to invalidate cache across logins
      const sessionKey = sessionStorage.getItem('session_start_time') || Date.now().toString()
      if (!sessionStorage.getItem('session_start_time')) {
        sessionStorage.setItem('session_start_time', sessionKey)
      }
      const cacheKey = `nav_${companyId}_${userId}_${sessionKey}`
      const cachedNav = localStorage.getItem(cacheKey)
      const cacheTime = localStorage.getItem(`${cacheKey}_time`)

      // Use cache if less than 5 minutes old
      if (cachedNav && cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
        try {
          const navigation = JSON.parse(cachedNav)
          setGroupedModules(navigation)
          setLoading(false)
          return
        } catch {
          // Invalid cache, proceed to fetch
        }
      }

      try {
        setLoading(true)
        setError(null)
        const navigation = await getDynamicNavigation(companyId, userId)

        if (!isCancelled) {
          setGroupedModules(navigation)
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify(navigation))
          localStorage.setItem(`${cacheKey}_time`, Date.now().toString())
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load navigation menu'
          setError(errorMessage)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchNavigation()

    // Cleanup function to prevent memory leaks
    return () => {
      isCancelled = true
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [companyId, userId])

  // Auto-open parent items based on current path (optimized)
  React.useEffect(() => {
    if (groupedModules.length === 0) return

    const groupsToOpen = groupedModules
      .filter(group =>
        group.modules && group.modules.some(module => {
          const modulePath = getModuleRoutePath(module.ModuleName)
          return modulePath !== '#' && pathname && (pathname === modulePath || pathname.startsWith(modulePath + '/'))
        })
      )
      .map(group => group.groupName)

    if (groupsToOpen.length > 0) {
      setOpenItems(prev => {
        // Only update if there are actually new items to open
        const newItems = groupsToOpen.filter(item => !prev.includes(item))
        return newItems.length > 0 ? [...prev, ...newItems] : prev
      })
    }
  }, [pathname, groupedModules])

  const toggleItem = React.useCallback((itemName: string) => {
    setOpenItems(prev => {
      const isCurrentlyOpen = prev.includes(itemName)
      if (isCurrentlyOpen) {
        return prev.filter(id => id !== itemName)
      } else {
        return [...prev, itemName]
      }
    })
  }, [])

  const toggleSubModule = React.useCallback((moduleName: string) => {
    setExpandedSubModules(prev => {
      const isCurrentlyExpanded = prev.includes(moduleName)
      if (isCurrentlyExpanded) {
        return prev.filter(name => name !== moduleName)
      } else {
        return [...prev, moduleName]
      }
    })
  }, [])

  const isModuleActive = React.useCallback((module: DynamicModule) => {
    const modulePath = getModuleRoutePath(module.ModuleName)

    // Can't be active if it's a non-clickable path
    if (modulePath === '#' || !pathname) {
      return false
    }

    // Exact match for the module path
    if (pathname === modulePath) {
      return true
    }

    // Check if current path is a sub-route of this module
    // Ensure we're checking for a proper path segment (not just prefix)
    if (pathname.startsWith(modulePath + '/')) {
      return true
    }

    return false
  }, [pathname])

  const handleModuleClick = (module: DynamicModule) => {
    // Clear hover state and disable hover for 600ms (enough for collapse + cooldown)
    setHoveredGroup(null)
    disableHoverRef.current = true

    setTimeout(() => {
      disableHoverRef.current = false
    }, 600)

    onMenuItemClick?.()
  }

  // Clear hover state when sidebar expands/collapses and track previous state
  React.useEffect(() => {
    // If transitioning from expanded to collapsed (user clicked menu item)
    if (!previousCollapsedRef.current && isCollapsed) {
      // Clear hover immediately and prevent it from showing during transition
      setHoveredGroup(null)
    }
    previousCollapsedRef.current = isCollapsed
  }, [isCollapsed])

  // Check if scrolling is needed
  React.useEffect(() => {
    const checkScrollNeeded = () => {
      if (navRef.current) {
        const { scrollHeight, clientHeight } = navRef.current
        setNeedsScroll(scrollHeight > clientHeight)
      }
    }

    checkScrollNeeded()
    window.addEventListener('resize', checkScrollNeeded)

    return () => window.removeEventListener('resize', checkScrollNeeded)
  }, [groupedModules, openItems, isCollapsed])

  // Clean up hover timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className={cn(
        "flex flex-col h-full bg-primary-hover border-r border-primary/20 transition-all duration-300 shadow-lg",
        isCollapsed ? "w-14" : "w-56 sm:w-60 md:w-64",
        className
      )}>
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        "flex flex-col h-full bg-primary-hover border-r border-primary/20 transition-all duration-300 shadow-lg",
        isCollapsed ? "w-14" : "w-56 sm:w-60 md:w-64",
        className
      )}>
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">{t("Failed to load navigation menu")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs text-primary hover:underline"
          >
            {t("Retry")}
          </button>
        </div>
      </div>
    )
  }

  // Recursive rendering for modules with sub-modules
  const renderModuleWithChildren = (module: DynamicModule, depth: number): React.ReactNode => {
    const modulePath = getModuleRoutePath(module.ModuleName)
    const isActive = isModuleActive(module)
    const hasChildren = module.children && module.children.length > 0
    const isExpanded = expandedSubModules.includes(module.ModuleName)
    const paddingLeft = depth > 0 ? `${1 + depth * 0.75}rem` : '1rem'

    if (hasChildren) {
      // Module with children - render as expandable
      return (
        <div key={module.ModuleDisplayName} className="space-y-0.5">
          <div
            className={cn(
              "flex items-center justify-between py-2.5 pr-4 text-sm transition-all duration-200 pointer-events-auto rounded-lg mx-2 cursor-pointer",
              isActive
                ? "bg-white/25 text-white border-l-2 border-white"
                : "text-white/70 hover:bg-white/15 hover:text-white"
            )}
            style={{ paddingLeft }}
            onClick={() => toggleSubModule(module.ModuleName)}
          >
            <span className="truncate flex-1">{module.ModuleDisplayName}</span>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200 flex-shrink-0 ml-2",
                isExpanded && "rotate-90"
              )}
            />
          </div>
          {isExpanded && module.children && (
            <div className="space-y-0.5">
              {module.children.map(child => renderModuleWithChildren(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    // Leaf module - render as link
    return (
      <Link
        key={module.ModuleDisplayName}
        href={modulePath}
        className={cn(
          "flex items-center py-2.5 pr-4 text-sm transition-all duration-200 pointer-events-auto rounded-lg mx-2",
          isActive
            ? "bg-white/25 text-white border-l-2 border-white"
            : "text-white/70 hover:bg-white/15 hover:text-white hover:translate-x-1"
        )}
        style={{ paddingLeft }}
        onClick={() => {
          setHoveredGroup(null)
          onMenuItemClick?.()
        }}
      >
        <span className="truncate">{module.ModuleDisplayName}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
        )}
      </Link>
    )
  }

  return (
    <>
      <div className={cn(
        "flex flex-col h-full bg-primary-hover border-r border-primary/20 transition-all duration-300 shadow-lg",
        isCollapsed ? "w-14 overflow-visible" : "w-56 sm:w-60 md:w-64",
        className
      )}>

        {/* Navigation Menu */}
        <nav
          ref={navRef}
          className="flex-1 p-4 custom-scrollbar overflow-y-auto overflow-x-visible"
        >
          <ul className="space-y-2">
            {/* Favorites Section - pinned items at top */}
            {favoriteModules.length > 0 && !isCollapsed && (
              <>
                {favoriteModules.map(({ module, groupName }) => (
                  <li key={`fav-${module.ModuleDisplayName}`}>
                    <SidebarContextMenu
                      modulePath={getModuleRoutePath(module.ModuleName)}
                      moduleDisplayName={module.ModuleDisplayName}
                    >
                      <NavigationLink
                        module={module}
                        isActive={isModuleActive(module)}
                        isCollapsed={isCollapsed}
                        onMenuItemClick={() => {
                          setHoveredGroup(null)
                          disableHoverRef.current = true
                          setTimeout(() => { disableHoverRef.current = false }, 600)
                          onMenuItemClick?.()
                        }}
                        groupName={module.ModuleDisplayName}
                        isFavorite={true}
                      />
                    </SidebarContextMenu>
                  </li>
                ))}
                <li><div className="border-b border-white/10 my-2 mx-3" /></li>
              </>
            )}

            {filteredGroupedModules.length === 0 && !loading && !error ? (
              <li className="flex items-center justify-center py-8">
                {!isCollapsed ? (
                  <p className="text-sm text-white/60 text-center">
                    {t("No navigation items available")}
                  </p>
                ) : (
                  <div className="w-2 h-2 bg-white/30 rounded-full" />
                )}
              </li>
            ) : (
              filteredGroupedModules.map((group) => (
                <li key={group.groupName}>
                  {/* Parent item with children */}
                  {group.modules.filter((module) => {
                    if (group.modules.length === 1 &&
                      module.ModuleDisplayName.toLowerCase().trim() === group.groupName.toLowerCase().trim()) {
                      return false
                    }
                    return true
                  }).length > 0 ? (
                    <div className={cn("relative overflow-visible", isCollapsed && "group")}>
                      <Collapsible
                        open={openItems.includes(group.groupName) && !isCollapsed}
                      >
                        <SidebarGroupContextMenu
                          groupName={group.groupName}
                          modulePaths={group.modules.map(m => getModuleRoutePath(m.ModuleName))}
                        >
                          <button
                            type="button"
                            className={cn(
                            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 relative overflow-visible cursor-pointer",
                            "text-white/70 hover:bg-white/20 hover:text-white hover:shadow-md active:bg-white/25",
                            "focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20",
                            isCollapsed && "justify-center px-2 hover:bg-white/20 hover:text-white",
                            !isCollapsed && group.modules.some(module => isModuleActive(module)) && "bg-white/10 text-white"
                          )}
                          aria-expanded={openItems.includes(group.groupName) && !isCollapsed}
                          aria-label={isCollapsed ? t("Expand {{groupName}} menu", { groupName: group.groupName }) : t("Toggle {{groupName}} menu", { groupName: group.groupName })}
                          onMouseEnter={(e) => {
                            // Only show hover if sidebar is collapsed, was already collapsed, and hover is not disabled
                            if (isCollapsed && previousCollapsedRef.current && !disableHoverRef.current) {
                              const rect = e.currentTarget.getBoundingClientRect()
                              // Position overlay to the right of the sidebar with some spacing
                              setHoverPosition({
                                x: rect.right + 12,
                                y: Math.max(rect.top - 8, 8) // Ensure it doesn't go off screen
                              })

                              // Clear any existing timeout
                              if (hoverTimeoutRef.current) {
                                clearTimeout(hoverTimeoutRef.current)
                              }

                              // Set hover immediately
                              setHoveredGroup(group.groupName)
                            }
                          }}
                          onMouseLeave={() => {
                            if (isCollapsed) {
                              // Add delay before hiding to allow mouse movement to overlay
                              hoverTimeoutRef.current = setTimeout(() => {
                                setHoveredGroup(null)
                              }, 200)
                            }
                          }}
                          onClick={(e) => {
                            if (isCollapsed) {
                              // When collapsed, prevent default and expand sidebar
                              e.preventDefault()
                              e.stopPropagation()

                              if (onMenuItemClick) {
                                onMenuItemClick()
                              }
                              // Auto-open the submenu when expanding from collapsed
                              setTimeout(() => {
                                if (!openItems.includes(group.groupName)) {
                                  setOpenItems(prev => [...prev, group.groupName])
                                }
                              }, 100)
                            } else {
                              // When expanded, manually toggle the submenu
                              e.preventDefault()
                              e.stopPropagation()

                              // Manually toggle the open state
                              const isCurrentlyOpen = openItems.includes(group.groupName)
                              if (isCurrentlyOpen) {
                                setOpenItems(prev => prev.filter(item => item !== group.groupName))
                              } else {
                                setOpenItems(prev => [...prev, group.groupName])
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              if (isCollapsed) {
                                e.preventDefault()
                                if (onMenuItemClick) {
                                  onMenuItemClick()
                                }
                              }
                              // When expanded, let the Collapsible handle keyboard events naturally
                            } else if (e.key === 'ArrowRight' && isCollapsed) {
                              // Show hover overlay on arrow right when collapsed
                              const rect = e.currentTarget.getBoundingClientRect()
                              setHoverPosition({
                                x: rect.right + 12,
                                y: Math.max(rect.top - 8, 8)
                              })
                              setHoveredGroup(group.groupName)
                            } else if (e.key === 'Escape') {
                              // Hide hover overlay on escape
                              setHoveredGroup(null)
                            }
                          }}
                        >
                          {(() => {
                            const GroupIcon = getGroupIcon(group.groupName)
                            return <GroupIcon
                              className={cn(
                                "flex-shrink-0 h-5 w-5",
                                "text-white/60 group-hover:text-white",
                                !isCollapsed && "mr-3"
                              )}
                            />
                          })()}

                          {!isCollapsed && (
                            <span className="truncate">{group.groupName}</span>
                          )}

                          {!isCollapsed && (
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 transition-all duration-300 ease-in-out",
                                openItems.includes(group.groupName) && "rotate-180 text-white"
                              )}
                            />
                          )}
                          </button>
                        </SidebarGroupContextMenu>

                        {/* Sub-navigation - Normal expanded view */}
                        <CollapsibleContent className="space-y-1 transition-all duration-300 ease-in-out">
                          <ul className="mt-2 ml-6 space-y-1 border-l-2 border-primary/40 pl-3">
                            {group.modules.filter((module) => {
                              if (group.modules.length === 1 &&
                                module.ModuleDisplayName.toLowerCase().trim() === group.groupName.toLowerCase().trim()) {
                                return false
                              }
                              return true
                            }).map((module) => (
                              <li key={module.ModuleDisplayName} className="pl-1 transition-all duration-200 hover:translate-x-1">
                                <SidebarContextMenu
                                  modulePath={getModuleRoutePath(module.ModuleName)}
                                  moduleDisplayName={module.ModuleDisplayName}
                                >
                                  <NavigationLink
                                    module={module}
                                    isActive={isModuleActive(module)}
                                    isChild
                                    onMenuItemClick={() => {
                                      setHoveredGroup(null)
                                      disableHoverRef.current = true
                                      setTimeout(() => { disableHoverRef.current = false }, 600)
                                      onMenuItemClick?.()
                                    }}
                                  />
                                </SidebarContextMenu>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>

                    </div>
                  ) : (
                    /* Regular navigation link without children */
                    <SidebarContextMenu
                      modulePath={getModuleRoutePath(group.modules[0].ModuleName)}
                      moduleDisplayName={group.modules[0].ModuleDisplayName}
                    >
                      <NavigationLink
                        module={group.modules[0]}
                        isActive={isModuleActive(group.modules[0])}
                        isCollapsed={isCollapsed}
                        onMenuItemClick={() => {
                          setHoveredGroup(null)
                          disableHoverRef.current = true
                          setTimeout(() => { disableHoverRef.current = false }, 600)
                          onMenuItemClick?.()
                        }}
                        groupName={group.groupName}
                      />
                    </SidebarContextMenu>
                  )}
                </li>
              )))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary/20">
          <div className="flex items-center justify-between">
            {/* Toggle Button */}
            {onToggleSidebar && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSidebar()
                }}
                className={cn(
                  "p-2 text-white/60 hover:text-white transition-colors hover:bg-transparent focus:outline-none",
                  isCollapsed ? "w-full flex justify-center" : "flex-shrink-0"
                )}
                title={isCollapsed ? t("Expand sidebar") : t("Collapse sidebar")}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Version info - only when expanded */}
            {!isCollapsed && (
              <div className="text-xs text-white/60 ml-3">
                {t("Estimo v3.0")}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Portal-based hover overlay - rendered to document body */}
      {hoveredGroup && isCollapsed && isMounted && createPortal(
        <div
          className="fixed z-40 transition-all duration-200 ease-out transform scale-100"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            pointerEvents: 'auto'
          }}
          onMouseEnter={() => {
            // Clear any pending hide timeout when entering the overlay
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current)
            }
            setHoveredGroup(hoveredGroup)
          }}
          onMouseLeave={() => {
            // Immediate hide when leaving the overlay
            setHoveredGroup(null)
          }}
        >
          <div className="bg-primary-hover rounded-xl shadow-2xl border border-primary/30 py-3 w-[85vw] sm:min-w-[220px] sm:max-w-[280px] sm:w-auto backdrop-blur-sm ring-2 ring-white/20 max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-15rem)] flex flex-col">
            {/* Header with parent item */}
            <div className="px-4 py-2 text-sm font-semibold text-white border-b border-primary/30 mb-2 flex-shrink-0">
              <div className="flex items-center">
                {(() => {
                  const GroupIcon = getGroupIcon(hoveredGroup)
                  return <GroupIcon className="h-4 w-4 mr-3 text-white" />
                })()}
                <span className="truncate">{hoveredGroup}</span>
              </div>
            </div>

            {/* Children links - scrollable */}
            <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
              {groupedModules
                .find(group => group.groupName === hoveredGroup)
                ?.modules.filter((module) => {
                  const group = groupedModules.find(g => g.groupName === hoveredGroup)
                  if (group && group.modules.length === 1 &&
                    module.ModuleDisplayName.toLowerCase().trim() === hoveredGroup.toLowerCase().trim()) {
                    return false
                  }
                  return true
                }).map((module) => {
                  return renderModuleWithChildren(module, 0)
                })}
            </div>

            {/* Small arrow pointing to parent */}
            <div className="absolute top-6 left-0 transform -translate-x-1 w-2 h-2 bg-primary-hover border-l border-t border-primary/30 rotate-45"></div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Navigation Link Component
interface NavigationLinkProps {
  module: DynamicModule
  isActive: boolean
  isCollapsed?: boolean
  isChild?: boolean
  onMenuItemClick?: () => void
  groupName?: string
  isFavorite?: boolean
}

function NavigationLink({
  module,
  isActive,
  isCollapsed = false,
  isChild = false,
  onMenuItemClick,
  groupName,
  isFavorite = false
}: NavigationLinkProps) {
  const { t } = useTranslation()

  // Get the route path using shared utility
  const modulePath = getModuleRoutePath(module.ModuleName)

  // Use group name for display if this is a single module group
  const displayName = groupName || module.ModuleDisplayName

  return (
    <Link
      href={modulePath}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 w-full relative overflow-hidden",
        isActive
          ? "bg-white/25 text-white hover:bg-white/30 shadow-sm border-l-2 border-white"
          : "text-white/70 hover:bg-white/20 hover:text-white hover:shadow-sm hover:scale-[1.02]",
        isChild && "text-xs pl-3 py-1.5 hover:bg-white/15",
        isCollapsed && "justify-center px-2"
      )}
      onClick={(e) => {
        // Always call onMenuItemClick to close/collapse sidebar
        onMenuItemClick?.()
      }}
    >
      {isFavorite && !isCollapsed && (
        <Star className="h-3 w-3 mr-2 fill-yellow-400 text-yellow-400 flex-shrink-0" />
      )}
      {!isChild && !isFavorite && (() => {
        const GroupIcon = getGroupIcon(groupName || module.ModuleDisplayName)
        return <GroupIcon
          className={cn(
            "flex-shrink-0",
            isChild ? "h-3 w-3" : "h-5 w-5",
            isActive
              ? "text-white"
              : "text-white/60 group-hover:text-white",
            !isCollapsed && "mr-3"
          )}
        />
      })()}

      {!isCollapsed && (
        <span className="truncate">{displayName}</span>
      )}

      {!isCollapsed && (
        <div className="ml-auto flex items-center gap-1">
          {isActive && (
            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-white/20 text-white">
              {t("Active")}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
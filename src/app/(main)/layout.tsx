'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Package, Warehouse, BookOpen, ChevronDown, ChevronRight,
  Box, ShoppingCart, ClipboardList, CheckSquare,
  FileText, BadgeCheck, Lock, Bell, Mail,
  PanelLeftOpen, PanelLeftClose, Menu, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlobalAlertProvider } from '@/contexts/GlobalAlertContext'
import { SearchPreferencesProvider } from '@/contexts/SearchPreferencesContext'

const navigation = [
  {
    label: 'Masters',
    icon: Box,
    children: [
      { label: 'Item Master',      href: '/master/item',      icon: Package },
      { label: 'Warehouse Master', href: '/master/warehouse', icon: Warehouse },
      { label: 'Ledger Master',    href: '/master/ledger',    icon: BookOpen },
    ],
  },
  {
    label: 'Procurement',
    icon: ShoppingCart,
    children: [
      { label: 'Purchase Requisition',         href: '/inventory/purchaserequisition',    icon: ClipboardList },
      { label: 'Requisition Approval',        href: '/inventory/requisition-approval',   icon: CheckSquare  },
      { label: 'Purchase Order',              href: '/inventory/purchaseorder',          icon: FileText     },
      { label: 'Purchase Order Approval',     href: '/inventory/purchase-order-approval', icon: BadgeCheck  },
      { label: 'Purchase Order Close',        href: '/inventory/purchase-order-close',   icon: Lock         },
      { label: 'Purchase GRN',                href: '/inventory/purchase-grn',           icon: FileText     },
      { label: 'GRN Approval',                href: '/inventory/grn-approval',           icon: BadgeCheck   },
      { label: 'Purchase Invoice',           href: '/inventory/purchase-invoice',       icon: FileText     },
      { label: 'GRN QC Approval',             href: '/inventory/grn-qc-approval',              icon: CheckSquare  },
      { label: 'Item Physical Verification', href: '/inventory/item-physical-verification', icon: ClipboardList },
    ],
  },
]

// ── Collapsed icon-only sidebar (w-12 = 48px) ────────────────────────────────
function CollapsedSidebar() {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full w-12 bg-[#002852] border-r border-white/15">
      <div className="flex items-center justify-center h-11 border-b border-white/15 shrink-0">
        <Box className="h-4 w-4 text-white/80" />
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 flex flex-col items-center gap-0.5">
        {navigation.map((section, si) => (
          <div
            key={section.label}
            className={cn('w-full flex flex-col items-center gap-0.5 py-1', si > 0 && 'border-t border-white/10 mt-1 pt-2')}
          >
            {section.children.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                    active
                      ? 'bg-white/25 text-white shadow-sm'
                      : 'text-white/60 hover:bg-white/15 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="flex items-center justify-center py-2 border-t border-white/15 shrink-0">
        <Link
          href="/settings"
          title="Settings"
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-white/25 text-white shadow-sm'
              : 'text-white/60 hover:bg-white/15 hover:text-white'
          )}
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

// ── Full expanded sidebar (w-64) ──────────────────────────────────────────────
function ExpandedSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(['Masters', 'Procurement'])

  const toggle = (label: string) =>
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )

  return (
    <div className="flex flex-col h-full w-56 bg-[#002852] border-r border-white/15 shadow-xl">
      <div className="flex items-center gap-2 px-4 h-11 border-b border-white/15 shrink-0">
        <Box className="h-5 w-5 text-white/80" />
        <span className="text-base font-bold text-white">Inventory</span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-0.5">
        {navigation.map(section => (
          <div key={section.label}>
            <button
              onClick={() => toggle(section.label)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <section.icon className="h-4 w-4 text-white/60" />
                {section.label}
              </span>
              {expanded.includes(section.label)
                ? <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                : <ChevronRight className="h-3.5 w-3.5 text-white/40" />}
            </button>

            {expanded.includes(section.label) && (
              <div className="ml-3 mt-0.5 space-y-0.5">
                {section.children.map(item => {
                  const active = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                        active
                          ? 'bg-white/25 text-white font-medium border-l-2 border-white'
                          : 'text-white/70 hover:bg-white/15 hover:text-white'
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-white/15 shrink-0 flex items-center justify-between">
        <p className="text-xs text-white/40">Inventory v1.0 · Mock</p>
        <Link
          href="/settings"
          title="Settings"
          className="flex items-center justify-center w-7 h-7 rounded-md text-white/50 hover:bg-white/15 hover:text-white transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

// ── Root layout ───────────────────────────────────────────────────────────────
function usePageTitle() {
  const pathname = usePathname()
  const allItems = navigation.flatMap(s => s.children)
  const match = allItems.find(item => pathname.startsWith(item.href))
  return match?.label ?? ''
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const pageTitle = usePageTitle()

  return (
    <SearchPreferencesProvider>
    <GlobalAlertProvider>
      <div className="flex flex-col h-screen bg-[rgb(var(--bg-default))]">

        {/* ── Dark top navbar ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 w-full bg-[#002852] border-b border-white/15 shadow-sm shrink-0">
          <div className="flex h-11 items-center justify-between px-2 sm:px-4 gap-2 sm:gap-3">

            {/* Left: toggle + company */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink min-w-0">

              {/* Mobile sidebar open */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 text-white/60 hover:text-white transition-colors focus:outline-none"
                title="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Desktop sidebar collapse/expand */}
              <button
                onClick={() => setSidebarCollapsed(v => !v)}
                className="hidden lg:block p-1.5 text-white/60 hover:text-white transition-colors focus:outline-none"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed
                  ? <PanelLeftOpen className="h-4 w-4" />
                  : <PanelLeftClose className="h-4 w-4" />
                }
              </button>

              {/* Company name */}
              <span className="text-white font-semibold text-xs sm:text-sm max-w-[100px] sm:max-w-[160px] truncate">
                Inventory App
              </span>

            </div>

            {/* Center: page title */}
            {pageTitle && (
              <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
                <span className="text-white font-semibold text-sm tracking-wide">{pageTitle}</span>
              </div>
            )}

            {/* Right: mail + notifications + user */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">

              {/* Mail */}
              <button className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors" aria-label="Mail">
                <Mail className="h-4 w-4" />
              </button>

              {/* Notifications */}
              <button className="relative p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[#0c1e32] animate-pulse">
                  3
                </span>
              </button>

              {/* User avatar */}
              <button className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xs font-bold text-white" aria-label="User profile">
                A
              </button>
            </div>
          </div>
        </header>

        {/* ── Content row ────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Desktop collapsed sidebar — always present, 56px wide */}
          <div className="hidden lg:flex lg:flex-shrink-0 absolute top-0 left-0 h-full z-30 overflow-visible transition-all duration-300">
            {sidebarCollapsed
              ? <CollapsedSidebar />
              : <ExpandedSidebar onClose={() => setSidebarCollapsed(true)} />
            }
          </div>

          {/* Desktop backdrop — only when expanded */}
          {!sidebarCollapsed && (
            <div
              className="hidden lg:block absolute inset-0 bg-black/20 z-20"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Mobile: slide-in drawer */}
          {mobileSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
          <div className={cn(
            'lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}>
            <ExpandedSidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>

          {/* Main content — ml-12 to account for collapsed sidebar */}
          <div className="flex flex-1 flex-col overflow-hidden lg:ml-12">
            <main className="flex-1 overflow-hidden flex flex-col">
              {children}
            </main>
          </div>
        </div>

      </div>
    </GlobalAlertProvider>
    </SearchPreferencesProvider>
  )
}
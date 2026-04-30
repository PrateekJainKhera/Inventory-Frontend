'use client'

import * as React from 'react'
import { Bell, Mail, Menu, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EmailPanelContent as EmailInboxPanel } from '@/app/(main)/email/components/InboxPanel'
import { UserDropdown } from './userprofile-dropdown'
import { useEmail } from '@/contexts/EmailContext'

export interface TopHeaderProps {
  className?: string
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onToggleMobileSidebar?: () => void
}

export function TopHeader({ className, sidebarCollapsed = true, onToggleSidebar, onToggleMobileSidebar }: TopHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { state: emailState } = useEmail()
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

  const getUnreadCount = () => getAllNotifications().filter(n => !n.read).length

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
                onClick={(e) => { e.stopPropagation(); onToggleMobileSidebar() }}
                className="lg:hidden p-1.5 sm:p-2 text-white/60 hover:text-white transition-colors focus:outline-none flex-shrink-0"
                title="Open menu"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Desktop Sidebar Toggle Button */}
            {onToggleSidebar && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSidebar() }}
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

            {/* Company Name */}
            <button
              onClick={() => router.push('/home')}
              className="text-white font-semibold text-xs sm:text-sm lg:text-base hover:text-white/80 transition-colors cursor-pointer max-w-[80px] sm:max-w-[120px] md:max-w-[200px] lg:max-w-xs truncate flex-shrink"
              title={(session?.user as any)?.CompanyName || 'Loading...'}
            >
              {(session?.user as any)?.CompanyName || 'Loading...'}
            </button>
          </div>

          {/* Right side - actions and user */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
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

              {showEmailDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmailDropdown(false)} />
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

              {showNotificationDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotificationDropdown(false)} />
                  <div className={cn(
                    "absolute mt-2 z-50 bg-bg-surface rounded-lg shadow-xl border border-bd-default overflow-hidden",
                    "right-0",
                    "w-screen max-w-[calc(100vw-1rem)] sm:max-w-md md:w-96"
                  )}>
                    <div className="p-4 border-b border-bd-subtle">
                      <h3 className="text-lg font-semibold text-fg-default">Notifications</h3>
                    </div>

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
                              if (category.color === 'error') return 'bg-[rgb(var(--color-error))]/80 text-white shadow-md border-2 border-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]'
                              if (category.color === 'warning') return 'bg-[rgb(var(--color-warning))]/80 text-white shadow-md border-2 border-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning))]'
                              if (category.color === 'success') return 'bg-[rgb(var(--color-success))]/80 text-white shadow-md border-2 border-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))]'
                              return 'bg-[rgb(var(--color-primary))]/80 text-white shadow-md border-2 border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]'
                            }
                            if (category.color === 'error') return 'bg-[rgb(var(--color-error))]/10 text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]/20 border border-[rgb(var(--color-error))]/30'
                            if (category.color === 'warning') return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning))]/20 border border-[rgb(var(--color-warning))]/30'
                            if (category.color === 'success') return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))]/20 border border-[rgb(var(--color-success))]/30'
                            return 'bg-bg-hover text-fg-muted hover:bg-bg-selected hover:text-fg-default'
                          }
                          return (
                            <button
                              key={category.key}
                              onClick={() => setActiveNotificationCategory(category.key as any)}
                              className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 flex-1 justify-center ${getColorClasses()}`}
                            >
                              <span className="truncate">
                                <span className="sm:hidden">{(category as any).shortLabel || category.label}</span>
                                <span className="hidden sm:inline">{category.label}</span>
                              </span>
                              {category.count > 0 && (
                                <span className={`inline-flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-0.5 sm:px-1 text-[9px] sm:text-[10px] leading-none rounded-full font-bold ${
                                  activeNotificationCategory === category.key
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
                              className={`p-4 hover:bg-bg-hover transition-colors cursor-pointer ${!notification.read ? 'bg-bg-subtle' : ''}`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                                  notification.type === 'pending' ? 'bg-[rgb(var(--color-error))]' :
                                  notification.type === 'escalation' ? 'bg-[rgb(var(--color-warning))]' :
                                  'bg-[rgb(var(--color-success))]'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${notification.read ? 'text-fg-muted' : 'text-fg-default font-semibold'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-fg-muted mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-bd-subtle bg-bg-subtle flex gap-2">
                      {getUnreadCount() > 0 && (
                        <button
                          className="flex-1 text-center text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] font-medium transition-colors"
                          onClick={(e) => { e.stopPropagation(); markAllAsRead() }}
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        className="flex-1 text-center text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] font-medium transition-colors"
                        onClick={() => setShowNotificationDropdown(false)}
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
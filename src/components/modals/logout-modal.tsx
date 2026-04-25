'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { LogOut, Clock, Monitor, Smartphone, Tablet, AlertTriangle, ExternalLink, Shield, Ban, X } from 'lucide-react'

// Device information interface
export interface DeviceInfo {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  lastUsed: Date
  isCurrent: boolean
}

// Task status interface
export interface TaskStatus {
  overdue: number
  dueSoon: number
  total: number
}

// Main props interface
export interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  onLogoutEverywhere: () => void
  sessionData: {
    duration: string
    startTime: Date
    tasks: TaskStatus
    activeDevices: DeviceInfo[]
    isInactivityWarning?: boolean
    timeUntilAutoLogout?: string
  }
  onExtendSession?: () => void
  onViewTasks?: () => void
  className?: string
}

export function LogoutModal({
  isOpen,
  onClose,
  onLogout,
  onLogoutEverywhere,
  sessionData,
  onViewTasks,
  className
}: LogoutModalProps) {
  const [logoutEverywhere, setLogoutEverywhere] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLogoutEverywhere(false)
    }
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (logoutEverywhere) {
          onLogoutEverywhere()
        } else {
          onLogout()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onLogout, onLogoutEverywhere, logoutEverywhere])

  // Get device icon
  const getDeviceIcon = (device: DeviceInfo) => {
    const iconClass = "h-4 w-4 text-[rgb(var(--color-icon))]"
    switch (device.type) {
      case 'mobile':
        return <Smartphone className={iconClass} />
      case 'tablet':
        return <Tablet className={iconClass} />
      default:
        return <Monitor className={iconClass} />
    }
  }

  // Format last used time
  const formatLastUsed = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`
    } else {
      return 'Just now'
    }
  }

  const hasPendingTasks = sessionData.tasks.overdue > 0 || sessionData.tasks.dueSoon > 0
  const hasMultipleDevices = sessionData.activeDevices.length > 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px] p-0 gap-0 rounded-2xl overflow-hidden",
          className
        )}
        hideCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-3 pb-2 border-b border-[rgb(var(--bd-default))]" style={{ background: 'linear-gradient(to right, rgb(var(--color-primary-subtle) / 0.3), rgb(var(--color-primary-subtle) / 0.5))' }}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-[rgb(var(--fg-default))]">
              Are you sure you want to log out?
            </DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgb(var(--bg-surface))]/50 border border-[rgb(var(--bd-default))]">
                <Clock className="h-3.5 w-3.5 text-[rgb(var(--color-primary))]" />
                <span className="text-xs font-medium text-[rgb(var(--fg-default))]">
                  Session: {sessionData.duration}
                </span>
              </div>
              <button
                onClick={onClose}
                className="close-btn-md"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Pending Tasks Warning */}
          {hasPendingTasks && (
            <div className={cn(
              "p-4 rounded-lg border",
              sessionData.tasks.overdue > 0
                ? "bg-[rgb(var(--color-error))]/5 border-[rgb(var(--color-error))]/20"
                : "bg-[rgb(var(--color-warning))]/5 border-[rgb(var(--color-warning))]/20"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  sessionData.tasks.overdue > 0
                    ? "bg-[rgb(var(--color-error))]/10"
                    : "bg-[rgb(var(--color-warning))]/10"
                )}>
                  <AlertTriangle className={cn(
                    "h-5 w-5",
                    sessionData.tasks.overdue > 0
                      ? "text-[rgb(var(--color-error))]"
                      : "text-[rgb(var(--color-warning))]"
                  )} />
                </div>
                <div className="flex-1">
                  {sessionData.tasks.overdue > 0 ? (
                    <>
                      <div className="text-sm font-medium text-[rgb(var(--fg-default))]">
                        {sessionData.tasks.overdue} overdue task{sessionData.tasks.overdue > 1 ? 's' : ''} pending
                      </div>
                      <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-[rgb(var(--fg-default))]">
                        {sessionData.tasks.dueSoon} task{sessionData.tasks.dueSoon > 1 ? 's' : ''} due soon
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">Due Soon</Badge>
                    </>
                  )}
                </div>
              </div>
              {onViewTasks && sessionData.tasks.total > 0 && (
                <button
                  onClick={onViewTasks}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] transition-colors"
                >
                  View all tasks
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Active Devices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-[rgb(var(--fg-muted))]" />
                <span className="text-xs font-medium text-[rgb(var(--fg-muted))]">
                  {sessionData.activeDevices.length} active device{sessionData.activeDevices.length > 1 ? 's' : ''}
                </span>
              </div>
              {hasMultipleDevices && (
                <span className="text-xs text-[rgb(var(--color-warning))] font-medium">Multiple sessions</span>
              )}
            </div>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              {sessionData.activeDevices.map((device) => (
                <div
                  key={device.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    device.isCurrent
                      ? "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                      : "bg-[rgb(var(--bg-surface))] border-[rgb(var(--bd-subtle))]"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getDeviceIcon(device)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          device.isCurrent
                            ? "text-[rgb(var(--color-accent))]"
                            : "text-[rgb(var(--fg-default))]"
                        )}>
                          {device.isCurrent ? "This Device" : device.name}
                        </span>
                        {device.isCurrent && (
                          <div className="h-2 w-2 bg-[rgb(var(--color-success))] rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-[rgb(var(--fg-muted))] truncate">
                        {device.browser && device.os ? `${device.browser} on ${device.os}` : 'Unknown device'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[rgb(var(--fg-muted))] flex-shrink-0">
                    {device.isCurrent ? 'Active now' : formatLastUsed(device.lastUsed)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log out from all devices option */}
          {hasMultipleDevices && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--bd-default))] rounded-lg">
              <input
                type="checkbox"
                checked={logoutEverywhere}
                onChange={(e) => setLogoutEverywhere(e.target.checked)}
                className="h-4 w-4 rounded border-[rgb(var(--bd-default))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-offset-0 cursor-pointer"
              />
              <label
                className="flex items-center gap-2 flex-1 cursor-pointer select-none"
                onClick={() => setLogoutEverywhere(!logoutEverywhere)}
              >
                <Shield className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[rgb(var(--fg-default))]">
                    Log out from all devices
                  </div>
                  <div className="text-xs text-[rgb(var(--fg-muted))]">
                    ({sessionData.activeDevices.length} devices)
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer with Icon Buttons */}
        <DialogFooter className="px-6 py-2.5 bg-[rgb(var(--bg-subtle))] border-t border-[rgb(var(--bd-default))]">
          <div className="flex items-center gap-3 w-full">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-[rgb(var(--bg-surface))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--fg-default))] border border-[rgb(var(--bd-default))] transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Ban className="h-4 w-4" />
              <span className="text-sm font-medium">Cancel</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (logoutEverywhere) {
                  onLogoutEverywhere()
                } else {
                  onLogout()
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-[rgb(var(--color-error))]/10 hover:bg-[rgb(var(--color-error))]/20 text-[rgb(var(--color-error))] border border-[rgb(var(--color-error))]/20 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">
                {logoutEverywhere ? 'Logout All' : 'Log Out'}
              </span>
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

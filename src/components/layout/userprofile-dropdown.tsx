"use client"

import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { LogOut, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui"
import { useRouter } from "next/navigation"
import { LogoutModal, DeviceInfo, TaskStatus } from "@/components/modals/logout-modal"
import { detectDevice, getDeviceId, getDeviceName } from "@/lib/utils/device-detection"
import { performLogoutCleanup } from "@/lib/utils/logout-cleanup"

export function UserDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [sessionDuration, setSessionDuration] = useState('0h 0m')
  const [selectedProfile, setSelectedProfile] = useState('gradient')
  const router = useRouter()


  // Calculate session duration
  useEffect(() => {
    const calculateSessionDuration = () => {
      // Get login time from session storage or use a reasonable default
      const loginTime = sessionStorage.getItem('loginTime') || new Date().toISOString()
      const loginDate = new Date(loginTime)
      const now = new Date()
      const diffMs = now.getTime() - loginDate.getTime()

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      setSessionDuration(`${hours}h ${minutes}m`)
    }

    // Calculate initial duration
    calculateSessionDuration()

    // Update every minute
    const interval = setInterval(calculateSessionDuration, 60000)

    return () => clearInterval(interval)
  }, [])

  // Set login time on first load
  useEffect(() => {
    if (session && !sessionStorage.getItem('loginTime')) {
      sessionStorage.setItem('loginTime', new Date().toISOString())
    }
  }, [session])

  // Load saved profile preference
  useEffect(() => {
    const savedProfile = localStorage.getItem('selectedProfile')
    if (savedProfile) {
      setSelectedProfile(savedProfile)
    }
  }, [])

  // Profile options
  const profileOptions = [
    {
      id: 'gradient',
      name: 'Gradient Blue',
      component: (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )
    },
    {
      id: 'gradient-green',
      name: 'Gradient Green',
      component: (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )
    },
    {
      id: 'gradient-orange',
      name: 'Gradient Orange',
      component: (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )
    },
    {
      id: 'gradient-pink',
      name: 'Gradient Pink',
      component: (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )
    },
    {
      id: 'solid-blue',
      name: 'Solid Blue',
      component: (
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )
    },
    {
      id: 'solid-gray',
      name: 'Solid Gray',
      component: (
        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )
    }
  ]

  const getSelectedProfileComponent = () => {
    const profile = profileOptions.find(p => p.id === selectedProfile)
    return profile ? profile.component : profileOptions[0].component
  }

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId)
    localStorage.setItem('selectedProfile', profileId)
  }

  // Get session data with real device detection
  const getSessionData = () => {
    const device = detectDevice()
    const deviceId = getDeviceId()
    const deviceName = getDeviceName()

    const currentDevice: DeviceInfo = {
      id: deviceId,
      name: deviceName,
      type: device.deviceType,
      browser: device.browser,
      os: device.os,
      lastUsed: new Date(),
      isCurrent: true
    }

    // For now, only show current device
    // In future, you can fetch other active devices from API
    const devices: DeviceInfo[] = [currentDevice]

    const tasks: TaskStatus = {
      overdue: 2,
      dueSoon: 3,
      total: 10
    }

    return {
      duration: sessionDuration,
      startTime: new Date(sessionStorage.getItem('loginTime') || new Date().toISOString()),
      tasks,
      activeDevices: devices,
      isInactivityWarning: false
    }
  }

  const handleLogout = async () => {
    try {
      // Perform comprehensive cleanup using the utility
      await performLogoutCleanup()

      // Use window.location.host for dynamic URL - truly production ready
      const currentHost = typeof window !== 'undefined' ? window.location.host : ''
      const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
      const loginUrl = `${currentProtocol}//${currentHost}/login`

      await signOut({
        callbackUrl: loginUrl,
        redirect: true
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout with same dynamic URL
      const currentHost = typeof window !== 'undefined' ? window.location.host : ''
      const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
      const loginUrl = `${currentProtocol}//${currentHost}/login`

      await signOut({
        callbackUrl: loginUrl,
        redirect: true
      })
    }
  }

  if (!session?.user) {
    return null
  }

  const { user } = session

  return (
    <div className="relative">
      {/* Profile Picture - Simple Display */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 h-auto p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        {getSelectedProfileComponent()}
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Professional Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <span className="text-white text-lg font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="mt-3">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(user as any).IsAdmin
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {(user as any).IsAdmin ? 'Administrator' : 'User'}
                </div>
              </div>

            </div>

            {/* Menu Actions */}
            <div className="p-2">
              {/* Settings */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/settings')
                }}
                className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-150"
              >
                <Settings className="w-4 h-4 mr-3 text-gray-400" />
                <div className="font-medium">Settings</div>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

              {/* Log Out */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Check if user has "don't ask again" preference
                  const skipConfirmation = localStorage.getItem('skipLogoutConfirmation') === 'true'
                  if (skipConfirmation) {
                    handleLogout()
                  } else {
                    setShowLogoutModal(true)
                  }
                }}
                className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-150"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <div className="font-medium">Log Out</div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Log Out Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
        onLogoutEverywhere={handleLogout} // Could be extended to log out from all devices
        sessionData={getSessionData()}
        onExtendSession={() => {
          // Extend session logic here
          setShowLogoutModal(false)
        }}
        onViewTasks={() => {
          setShowLogoutModal(false)
          router.push('/tasks') // Navigate to tasks page
        }}
      />
    </div>
  )
}
"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import type { Session } from "next-auth"
import { SessionExpiryWarning } from "@/components/modals/session-expiry-warning"
import { performLogoutCleanup } from "@/lib/utils/logout-cleanup"

interface AuthSessionProviderProps {
  children: React.ReactNode
  session: Session | null
}

// Session expiry monitor component
function SessionExpiryMonitor({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const [showExpiryWarning, setShowExpiryWarning] = useState(false)
  const [minutesRemaining, setMinutesRemaining] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === "authenticated" && session?.expires) {
      // Check session expiry every 30 seconds (faster detection)
      interval = setInterval(() => {
        const now = new Date()
        const expiryTime = new Date(session.expires)
        const timeUntilExpiry = expiryTime.getTime() - now.getTime()
        const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000))

        // Show warning 5 minutes before expiry
        if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
          setMinutesRemaining(minutesLeft)
          setShowExpiryWarning(true)
        }

        // If session has expired, automatically sign out with cleanup
        if (now >= expiryTime) {
          handleAutoLogout()
        }
      }, 30000) // Check every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [session, status])

  const handleAutoLogout = async () => {
    try {
      // Perform comprehensive cleanup before logout
      await performLogoutCleanup()

      // Sign out and redirect to login
      await signOut({
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      console.error('Auto-logout error:', error)
      // Force logout even if cleanup fails
      await signOut({
        callbackUrl: '/login',
        redirect: true
      })
    }
  }

  const handleExtendSession = async () => {
    try {
      // Trigger session refresh by calling update
      await update()
      setShowExpiryWarning(false)
    } catch (error) {
      console.error('Session extend error:', error)
    }
  }

  const handleLogoutNow = async () => {
    setShowExpiryWarning(false)
    await handleAutoLogout()
  }

  return (
    <>
      {children}
      <SessionExpiryWarning
        isOpen={showExpiryWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogoutNow}
        minutesRemaining={minutesRemaining}
      />
    </>
  )
}

export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      <SessionExpiryMonitor>
        {children}
      </SessionExpiryMonitor>
    </SessionProvider>
  )
}

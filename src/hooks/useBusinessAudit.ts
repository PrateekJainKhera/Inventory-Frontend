/**
 * useBusinessAudit Hook
 *
 * React hook for logging business actions (CREATE, UPDATE, DELETE, APPROVE, etc.)
 * Provides simple interface for audit logging throughout the application.
 *
 * Usage:
 * ```typescript
 * const { logAction, getEntityHistory, isLogging } = useBusinessAudit()
 *
 * // Log an action
 * await logAction('CREATE', 'ESTIMATION', {
 *   entityType: 'Quotation',
 *   entityId: 123,
 *   newValue: { jobName: 'Box Design', totalCost: 50000 }
 * })
 *
 * // Get entity history
 * const history = await getEntityHistory('Quotation', 123)
 * ```
 */

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BusinessAuditAPI } from '@/lib/api/audit'
import type { AuditModule, AuditAction, BusinessAuditLog } from '@/types/audit'

export interface UseBusinessAuditReturn {
  /**
   * Log a business action
   */
  logAction: (
    action: AuditAction,
    module: AuditModule,
    details: {
      entityType: string
      entityId?: number
      oldValue?: any
      newValue?: any
      comments?: string
    }
  ) => Promise<boolean>

  /**
   * Get audit trail for a specific entity
   */
  getEntityHistory: (
    entityType: string,
    entityId: number
  ) => Promise<BusinessAuditLog[] | null>

  /**
   * Whether an audit log is currently being saved
   */
  isLogging: boolean
}

/**
 * useBusinessAudit Hook
 */
export function useBusinessAudit(): UseBusinessAuditReturn {
  const { data: session } = useSession()
  const [isLogging, setIsLogging] = useState(false)

  /**
   * Log a business action
   */
  const logAction = useCallback(
    async (
      action: AuditAction,
      module: AuditModule,
      details: {
        entityType: string
        entityId?: number
        oldValue?: any
        newValue?: any
        comments?: string
      }
    ): Promise<boolean> => {
      if (!session) {
        return false
      }

      setIsLogging(true)

      try {
        const auditLog: BusinessAuditLog = {
          userId: (session.user as any)?.UserID || 0,
          userName: (session.user as any)?.UserName || session.user?.name || 'Unknown',
          companyId: (session.user as any)?.CompanyID || 0,
          companyName: (session.user as any)?.CompanyName || 'Unknown',
          module,
          action,
          entityType: details.entityType,
          entityId: details.entityId,
          oldValue: details.oldValue,
          newValue: details.newValue,
          comments: details.comments
        }

        const response = await BusinessAuditAPI.logAction(auditLog, session)

        if (response.success) {
          return true
        } else {
          console.error('❌ [useBusinessAudit] Failed to log action:', response.error)
          return false
        }
      } catch (error) {
        console.error('❌ [useBusinessAudit] Error logging action:', error)
        return false
      } finally {
        setIsLogging(false)
      }
    },
    [session]
  )

  /**
   * Get audit trail for a specific entity
   */
  const getEntityHistory = useCallback(
    async (
      entityType: string,
      entityId: number
    ): Promise<BusinessAuditLog[] | null> => {
      if (!session) {
        return null
      }

      try {
        const response = await BusinessAuditAPI.getEntityAuditTrail(
          entityType,
          entityId,
          session
        )

        if (response.success && response.data) {
          return response.data
        } else {
          console.error('❌ [useBusinessAudit] Failed to get entity history:', response.error)
          return null
        }
      } catch (error) {
        console.error('❌ [useBusinessAudit] Error getting entity history:', error)
        return null
      }
    },
    [session]
  )

  return {
    logAction,
    getEntityHistory,
    isLogging
  }
}

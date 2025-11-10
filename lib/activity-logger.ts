/**
 * Activity Logger
 * Tracks user activities and system events for audit and analytics
 */

import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'signup'
  | 'email_verified'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'profile_updated'
  | 'test_started'
  | 'test_completed'
  | 'test_result_viewed'
  | 'pdf_downloaded'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'share_created'
  | 'invite_sent'
  | 'admin_action'

export interface ActivityMetadata {
  [key: string]: any
}

/**
 * Log user activity
 */
export async function logActivity(
  userId: number,
  action: ActivityAction,
  description?: string,
  metadata?: ActivityMetadata
): Promise<void> {
  try {
    // Get request headers for IP and user agent
    let ipAddress: string | null = null
    let userAgent: string | null = null

    try {
      const headersList = headers()
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null
      userAgent = headersList.get('user-agent') || null
    } catch (error) {
      // Headers might not be available in some contexts
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - logging failures shouldn't break the application
  }
}

/**
 * Get user activity history
 */
export async function getUserActivityHistory(
  userId: number,
  limit: number = 50,
  offset: number = 0
) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Get activity statistics for a user
 */
export async function getUserActivityStats(userId: number) {
  const totalActivities = await prisma.activityLog.count({
    where: { userId }
  })

  const testsTaken = await prisma.activityLog.count({
    where: {
      userId,
      action: 'test_completed'
    }
  })

  const loginCount = await prisma.activityLog.count({
    where: {
      userId,
      action: 'login'
    }
  })

  const lastLogin = await prisma.activityLog.findFirst({
    where: {
      userId,
      action: 'login'
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    totalActivities,
    testsTaken,
    loginCount,
    lastLogin: lastLogin?.createdAt || null
  }
}

/**
 * Get all activities (admin only)
 */
export async function getAllActivities(
  limit: number = 100,
  offset: number = 0,
  action?: ActivityAction
) {
  return prisma.activityLog.findMany({
    where: action ? { action } : undefined,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Clean up old activity logs (retain last 90 days)
 */
export async function cleanupOldActivityLogs(retentionDays: number = 90): Promise<number> {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

  const result = await prisma.activityLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  })

  return result.count
}

/**
 * Get activity analytics for admin dashboard
 */
export async function getActivityAnalytics(days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const totalUsers = await prisma.user.count()
  const activeUsers = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: startDate }
    }
  })

  const testsCompleted = await prisma.activityLog.count({
    where: {
      action: 'test_completed',
      createdAt: { gte: startDate }
    }
  })

  const newSignups = await prisma.user.count({
    where: {
      createdAt: { gte: startDate }
    }
  })

  const activityByDay = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT
      DATE(createdAt) as date,
      COUNT(*) as count
    FROM ActivityLog
    WHERE createdAt >= ${startDate}
    GROUP BY DATE(createdAt)
    ORDER BY date DESC
  `

  return {
    totalUsers,
    activeUsers: activeUsers.length,
    testsCompleted,
    newSignups,
    activityByDay
  }
}

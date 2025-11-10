/**
 * Admin Analytics API
 * Provides platform analytics for administrators
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { getActivityAnalytics } from '@/lib/activity-logger'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get activity analytics
    const activityStats = await getActivityAnalytics(days)

    // Get user statistics
    const totalUsers = await prisma.user.count()
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: { not: null } }
    })
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    })

    // Get test statistics
    const totalTests = await prisma.testAttempt.count()
    const testsWithPremium = await prisma.testAttempt.count({
      where: { hasPremiumAccess: true }
    })

    // Get payment statistics
    const totalPayments = await prisma.payment.count()
    const completedPayments = await prisma.payment.count({
      where: { status: 'completed' }
    })
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true }
    })

    // Get personality type distribution
    const personalityDistribution = await prisma.testAttempt.groupBy({
      by: ['personalityType'],
      _count: { personalityType: true }
    })

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: { testAttempts: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          active: activeUsers,
          verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(1) : 0
        },
        tests: {
          total: totalTests,
          premium: testsWithPremium,
          premiumRate: totalTests > 0 ? (testsWithPremium / totalTests * 100).toFixed(1) : 0
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          revenue: totalRevenue._sum.amount || 0,
          conversionRate: totalTests > 0 ? (completedPayments / totalTests * 100).toFixed(1) : 0
        },
        personalityDistribution,
        recentUsers,
        activity: activityStats
      }
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

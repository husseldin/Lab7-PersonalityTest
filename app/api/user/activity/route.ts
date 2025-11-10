/**
 * User Activity API
 * Get user activity logs and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserActivityHistory, getUserActivityStats } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const stats = searchParams.get('stats') === 'true'

    const userId = parseInt(session.user.id)

    if (stats) {
      // Return activity statistics
      const statistics = await getUserActivityStats(userId)
      return NextResponse.json({ stats: statistics })
    } else {
      // Return activity history
      const activities = await getUserActivityHistory(userId, limit, offset)
      return NextResponse.json({ activities })
    }
  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

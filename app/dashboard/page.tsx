'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TestAttempt {
  id: number
  personalityType: string
  completedAt: string
  hasPremiumAccess: boolean
}

interface DashboardData {
  user: {
    name: string | null
    email: string
  }
  testAttempts: TestAttempt[]
  totalTests: number
  premiumTests: number
}

const personalityNames: Record<string, string> = {
  INTJ: 'The Architect',
  INTP: 'The Thinker',
  ENTJ: 'The Commander',
  ENTP: 'The Debater',
  INFJ: 'The Advocate',
  INFP: 'The Mediator',
  ENFJ: 'The Protagonist',
  ENFP: 'The Campaigner',
  ISTJ: 'The Logistician',
  ISFJ: 'The Defender',
  ESTJ: 'The Executive',
  ESFJ: 'The Consul',
  ISTP: 'The Virtuoso',
  ISFP: 'The Adventurer',
  ESTP: 'The Entrepreneur',
  ESFP: 'The Entertainer',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchDashboard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/test/history')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await res.json()

      const premiumCount = data.testAttempts.filter((t: TestAttempt) => t.hasPremiumAccess).length

      setDashboardData({
        user: {
          name: session?.user?.name || null,
          email: session?.user?.email || '',
        },
        testAttempts: data.testAttempts.slice(0, 3), // Show only 3 most recent
        totalTests: data.testAttempts.length,
        premiumTests: premiumCount,
      })
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (loading || status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </main>
    )
  }

  if (error || !dashboardData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl text-red-600">{error || 'Failed to load dashboard'}</div>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {dashboardData.user.name || dashboardData.user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-1">Total Tests</div>
            <div className="text-4xl font-bold text-blue-600">{dashboardData.totalTests}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-1">Premium Reports</div>
            <div className="text-4xl font-bold text-purple-600">{dashboardData.premiumTests}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-1">Email</div>
            <div className="text-sm font-medium text-gray-800 truncate">{dashboardData.user.email}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/test"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">📝</div>
            <h2 className="text-2xl font-bold mb-2">Take New Test</h2>
            <p className="text-blue-100">
              Discover your personality type with our comprehensive assessment
            </p>
          </Link>
          <Link
            href="/history"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-2xl font-bold mb-2">View History</h2>
            <p className="text-purple-100">
              See all your past test results and track your journey
            </p>
          </Link>
        </div>

        {/* Recent Tests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Tests</h2>
            {dashboardData.totalTests > 3 && (
              <Link
                href="/history"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            )}
          </div>

          {dashboardData.testAttempts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tests Yet</h3>
              <p className="text-gray-600 mb-6">
                Take your first personality test to get started!
              </p>
              <Link
                href="/test"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Take Test Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.testAttempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/result/${attempt.id}`}
                  className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {attempt.personalityType}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {personalityNames[attempt.personalityType]}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    {attempt.hasPremiumAccess && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full">
                        PREMIUM
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

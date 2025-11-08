'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TestAttempt {
  id: number
  personalityType: string
  completedAt: string
  hasPremiumAccess: boolean
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

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/test/history')
      if (!res.ok) {
        throw new Error('Failed to fetch history')
      }
      const data = await res.json()
      setAttempts(data.testAttempts || [])
    } catch (err) {
      setError('Failed to load test history')
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Test History</h1>
          <p className="text-gray-600">View all your past personality test results</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {attempts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Tests Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t taken any personality tests yet. Take your first test to discover your personality type!
            </p>
            <Link
              href="/test"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Take Your First Test
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-700">
                You have completed <span className="font-bold">{attempts.length}</span> test{attempts.length !== 1 ? 's' : ''}
              </p>
              <Link
                href="/test"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Take New Test
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {attempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/result/${attempt.id}`}
                  className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {attempt.personalityType}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {personalityNames[attempt.personalityType]}
                      </div>
                    </div>
                    {attempt.hasPremiumAccess && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full">
                        PREMIUM
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Completed: {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 text-center py-2 bg-blue-50 text-blue-700 rounded font-medium text-sm">
                      View Details
                    </div>
                    {!attempt.hasPremiumAccess && (
                      <div className="flex-1 text-center py-2 bg-purple-50 text-purple-700 rounded font-medium text-sm">
                        Upgrade
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

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

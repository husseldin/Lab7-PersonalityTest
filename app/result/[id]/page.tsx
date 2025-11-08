'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface TestResult {
  id: number
  personalityType: string
  scores: Record<string, number>
  completedAt: string
  hasPremiumAccess: boolean
}

const personalityDescriptions: Record<string, { name: string; description: string; details: string }> = {
  INTJ: { name: 'The Architect', description: 'Imaginative and strategic thinkers, with a plan for everything.', details: 'INTJs are analytical problem-solvers who excel at developing long-term strategies and innovative solutions.' },
  INTP: { name: 'The Thinker', description: 'Innovative inventors with an unquenchable thirst for knowledge.', details: 'INTPs are philosophical innovators fascinated by logical analysis, systems, and design.' },
  ENTJ: { name: 'The Commander', description: 'Bold, imaginative and strong-willed leaders.', details: 'ENTJs are strategic leaders motivated to organize change and excel at directing projects and people.' },
  ENTP: { name: 'The Debater', description: 'Smart and curious thinkers who cannot resist an intellectual challenge.', details: 'ENTPs are inspired innovators who enjoy exploring new ideas and possibilities.' },
  INFJ: { name: 'The Advocate', description: 'Quiet and mystical, yet very inspiring and tireless idealists.', details: 'INFJs are creative nurturers with strong personal integrity and a drive to help others.' },
  INFP: { name: 'The Mediator', description: 'Poetic, kind and altruistic people, always eager to help.', details: 'INFPs are imaginative idealists guided by their core values and desire to make the world better.' },
  ENFJ: { name: 'The Protagonist', description: 'Charismatic and inspiring leaders.', details: 'ENFJs are idealist organizers driven to implement their vision of what is best for humanity.' },
  ENFP: { name: 'The Campaigner', description: 'Enthusiastic, creative and sociable free spirits.', details: 'ENFPs are people-centered creators with a focus on possibilities and a contagious enthusiasm.' },
  ISTJ: { name: 'The Logistician', description: 'Practical and fact-minded individuals.', details: 'ISTJs are responsible organizers driven to create and enforce order within systems.' },
  ISFJ: { name: 'The Defender', description: 'Very dedicated and warm protectors.', details: 'ISFJs are conscientious helpers dedicated to their responsibilities and caring for others.' },
  ESTJ: { name: 'The Executive', description: 'Excellent administrators, unsurpassed at managing.', details: 'ESTJs are hardworking traditionalists eager to take charge in organizing projects and people.' },
  ESFJ: { name: 'The Consul', description: 'Extraordinarily caring, social and popular people.', details: 'ESFJs are conscientious helpers sensitive to the needs of others and eager to provide.' },
  ISTP: { name: 'The Virtuoso', description: 'Bold and practical experimenters.', details: 'ISTPs are observant artisans with a natural understanding of mechanics and hands-on problem solving.' },
  ISFP: { name: 'The Adventurer', description: 'Flexible and charming artists.', details: 'ISFPs are gentle caretakers who live in the present and enjoy harmonious, creative experiences.' },
  ESTP: { name: 'The Entrepreneur', description: 'Smart, energetic and perceptive people.', details: 'ESTPs are energetic thrillseekers who live in the moment and solve problems pragmatically.' },
  ESFP: { name: 'The Entertainer', description: 'Spontaneous, energetic and enthusiastic people.', details: 'ESFPs are vivacious entertainers who charm and engage everyone around them.' },
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState('')

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchResult()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.id, router])

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/test/result/${params.id}`)
      if (!res.ok) {
        throw new Error('Failed to fetch result')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Failed to load result')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testAttemptId: parseInt(params.id) }),
      })

      if (!res.ok) {
        throw new Error('Payment failed')
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError('Failed to initiate payment')
      setUpgrading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`/api/test/result/${params.id}/pdf`)
      if (!res.ok) {
        throw new Error('Failed to download PDF')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `personality-report-${result?.personalityType}.pdf`
      a.click()
    } catch (err) {
      setError('Failed to download PDF')
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </main>
    )
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-2xl text-red-600 mb-4">{error || 'Result not found'}</div>
        <Link href="/history" className="text-blue-600 hover:text-blue-700">
          Back to History
        </Link>
      </main>
    )
  }

  const personality = personalityDescriptions[result.personalityType]

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✅ Payment successful! You now have access to the premium report.
          </div>
        )}

        {canceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
            Payment was canceled. You can upgrade anytime to access the full report.
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Your Personality Type</h1>
          <p className="text-gray-600">
            Completed on {new Date(result.completedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-7xl font-bold text-blue-600 mb-4">{result.personalityType}</div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-3">{personality.name}</h2>
            <p className="text-lg text-gray-600 mb-4">{personality.description}</p>
            <p className="text-gray-700">{personality.details}</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Dimension Scores</h3>
            <div className="space-y-4">
              {[
                { label: 'Extraversion (E) vs Introversion (I)', e: result.scores.E || 0, i: result.scores.I || 0 },
                { label: 'Sensing (S) vs Intuition (N)', e: result.scores.S || 0, i: result.scores.N || 0 },
                { label: 'Thinking (T) vs Feeling (F)', e: result.scores.T || 0, i: result.scores.F || 0 },
                { label: 'Judging (J) vs Perceiving (P)', e: result.scores.J || 0, i: result.scores.P || 0 }
              ].map((dim, idx) => {
                const total = dim.e + dim.i
                const percentage = total > 0 ? Math.round((dim.e / total) * 100) : 50
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{dim.label}</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {!result.hasPremiumAccess ? (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-8 mb-6 border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🎁 Unlock Your Full Report</h3>
            <p className="text-gray-700 mb-6">
              Get your comprehensive premium report with:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Detailed personality analysis (10+ pages)
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Key strengths and areas for growth
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Career recommendations tailored to your type
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Relationship compatibility insights
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Downloadable PDF report
              </li>
            </ul>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                $9.99 <span className="text-lg font-normal text-gray-600">one-time</span>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {upgrading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg shadow-lg p-8 mb-6 border-2 border-green-200">
            <h3 className="text-2xl font-bold text-green-900 mb-4">🎉 Premium Access Activated!</h3>
            <p className="text-green-700 mb-6">
              You have full access to your comprehensive personality report.
            </p>
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              📥 Download Full PDF Report
            </button>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            href="/history"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            View Test History
          </Link>
          <Link
            href="/test"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Take Test Again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

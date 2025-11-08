'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TestResults {
  attempt: {
    id: string
    status: string
    completedAt: string
    resultType: string
  }
  results: {
    personalityType: string
    scores: {
      EI: { E: number; I: number }
      SN: { S: number; N: number }
      TF: { T: number; F: number }
      JP: { J: number; P: number }
    }
  }
  hasPremiumAccess: boolean
}

export default function ResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<TestResults | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const attemptId = params.attemptId as string
  const paymentStatus = searchParams.get('payment')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, attemptId])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/test/${attemptId}/results`)

      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching results:', error)
      alert('Failed to load results. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchasePremium = async () => {
    setPurchasing(true)
    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setPurchasing(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/test/${attemptId}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `personality-test-${results?.results.personalityType}-${attemptId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">Results not found</p>
        </div>
      </div>
    )
  }

  const { personalityType, scores } = results.results

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Payment success message */}
        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Payment successful! You now have access to your premium report.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-600 mb-2">
              {personalityType}
            </h1>
            <p className="text-gray-600">Your Personality Type</p>
          </div>

          {/* Dimension scores */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Dimension Scores</h2>

            {[
              { name: 'Extraversion (E) vs Introversion (I)', key: 'EI', scores: scores.EI },
              { name: 'Sensing (S) vs Intuition (N)', key: 'SN', scores: scores.SN },
              { name: 'Thinking (T) vs Feeling (F)', key: 'TF', scores: scores.TF },
              { name: 'Judging (J) vs Perceiving (P)', key: 'JP', scores: scores.JP }
            ].map(dimension => {
              const keys = Object.keys(dimension.scores) as [string, string]
              const values = Object.values(dimension.scores) as [number, number]
              const total = Math.abs(values[0]) + Math.abs(values[1])
              const percentage1 = total > 0 ? (Math.abs(values[0]) / total) * 100 : 50
              const percentage2 = total > 0 ? (Math.abs(values[1]) / total) * 100 : 50

              return (
                <div key={dimension.key}>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{dimension.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-8">{keys[0]}</span>
                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-primary-500 flex items-center justify-end pr-2"
                        style={{ width: `${percentage1}%` }}
                      >
                        <span className="text-xs text-white font-medium">{values[0]}</span>
                      </div>
                      <div
                        className="bg-indigo-500 flex items-center justify-start pl-2"
                        style={{ width: `${percentage2}%` }}
                      >
                        <span className="text-xs text-white font-medium">{values[1]}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-8">{keys[1]}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Download {results.hasPremiumAccess ? 'Premium' : 'Basic'} Report (PDF)
            </button>

            {!results.hasPremiumAccess && (
              <button
                onClick={handlePurchasePremium}
                disabled={purchasing}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Processing...' : 'Unlock Premium Report - $9.90'}
              </button>
            )}
          </div>

          {!results.hasPremiumAccess && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">Premium Report Includes:</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Detailed career recommendations tailored to your personality</li>
                <li>• Personal growth insights and development areas</li>
                <li>• In-depth analysis of your strengths and challenges</li>
                <li>• Lifetime access to your premium report</li>
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

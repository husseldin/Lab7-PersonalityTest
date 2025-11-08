'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Question {
  id: number
  dimension: string
  question: string
  options: {
    text: string
    type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
  }[]
}

export default function TestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/test')
      return
    }

    if (status === 'authenticated') {
      fetch('/data/questions.json')
        .then(res => res.json())
        .then(data => {
          setQuestions(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load questions:', err)
          setError('Failed to load questions. Please refresh the page.')
          setLoading(false)
        })
    }
  }, [status, router])

  const handleAnswer = async (type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P') => {
    const question = questions[currentQuestion]
    const newAnswers = { ...answers, [question.id]: type }

    if (currentQuestion < questions.length - 1) {
      setAnswers(newAnswers)
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Test complete - submit to backend
      setAnswers(newAnswers)
      await submitTest(newAnswers)
    }
  }

  const submitTest = async (finalAnswers: Record<number, string>) => {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: finalAnswers }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit test')
      }

      const data = await res.json()

      // Redirect to result page
      router.push(`/result/${data.testAttempt.id}`)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit test. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-2xl text-gray-600">Loading...</div>
      </main>
    )
  }

  if (submitting) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✨</div>
          <div className="text-2xl font-semibold text-gray-900">Analyzing Your Results...</div>
          <div className="text-gray-600">This will only take a moment</div>
        </div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4">
          <div className="text-2xl text-red-600">Failed to load questions</div>
          {error && <div className="text-gray-600">{error}</div>}
          <Link
            href="/test"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
        </div>
      </main>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Personality Test</h1>
          <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">{question.question}</h2>
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.type)}
                className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:text-blue-700"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
          <Link
            href="/history"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View History →
          </Link>
        </div>
      </div>
    </main>
  )
}

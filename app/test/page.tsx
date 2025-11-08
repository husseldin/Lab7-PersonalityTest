'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Question {
  id: string
  text: string
  orderIndex: number
}

interface Answer {
  questionId: string
  value: number
}

export default function TestPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      startTest()
    }
  }, [status])

  const startTest = async () => {
    try {
      const response = await fetch('/api/test/start', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to start test')
      }

      const data = await response.json()
      setAttemptId(data.attempt.id)
      setQuestions(data.questions)
    } catch (error) {
      console.error('Error starting test:', error)
      alert('Failed to start test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (value: number) => {
    if (!attemptId || !questions[currentIndex]) return

    const questionId = questions[currentIndex].id

    // Update local state
    setAnswers(prev => ({ ...prev, [questionId]: value }))

    // Save to backend
    setSaving(true)
    try {
      const response = await fetch(`/api/test/${attemptId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, value })
      })

      if (!response.ok) {
        throw new Error('Failed to save answer')
      }

      // Move to next question or submit
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        await submitTest()
      }
    } catch (error) {
      console.error('Error saving answer:', error)
      alert('Failed to save answer. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const submitTest = async () => {
    if (!attemptId) return

    try {
      const response = await fetch(`/api/test/${attemptId}/submit`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to submit test')
      }

      router.push(`/test/${attemptId}/results`)
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Failed to submit test. Please try again.')
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">No questions available</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const currentAnswer = answers[currentQuestion.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {[
              { value: 1, label: 'Strongly Disagree' },
              { value: 2, label: 'Disagree' },
              { value: 3, label: 'Neutral' },
              { value: 4, label: 'Agree' },
              { value: 5, label: 'Strongly Agree' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                disabled={saving}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  currentAnswer === option.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {currentAnswer === option.value && (
                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0 || saving}
              className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {saving && (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                Saving...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

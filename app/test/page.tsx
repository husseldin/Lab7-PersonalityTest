'use client'

import { useState, useEffect } from 'react'
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

let questionsData: Question[] = []

// Load questions from JSON file
if (typeof window !== 'undefined') {
  fetch('/data/questions.json')
    .then(res => res.json())
    .then(data => questionsData = data)
    .catch(err => console.error('Failed to load questions:', err))
}

const personalityTypes: Record<string, { name: string; description: string }> = {
  INTJ: { name: 'The Architect', description: 'Imaginative and strategic thinkers, with a plan for everything.' },
  INTP: { name: 'The Thinker', description: 'Innovative inventors with an unquenchable thirst for knowledge.' },
  ENTJ: { name: 'The Commander', description: 'Bold, imaginative and strong-willed leaders.' },
  ENTP: { name: 'The Debater', description: 'Smart and curious thinkers who cannot resist an intellectual challenge.' },
  INFJ: { name: 'The Advocate', description: 'Creative and insightful, inspired and independent perfectionists.' },
  INFP: { name: 'The Mediator', description: 'Poetic, kind and altruistic people, always eager to help a good cause.' },
  ENFJ: { name: 'The Protagonist', description: 'Charismatic and inspiring leaders, able to mesmerize their listeners.' },
  ENFP: { name: 'The Campaigner', description: 'Enthusiastic, creative and sociable free spirits.' },
  ISTJ: { name: 'The Logistician', description: 'Practical and fact-minded, reliable and responsible.' },
  ISFJ: { name: 'The Protector', description: 'Very dedicated and warm protectors, always ready to defend their loved ones.' },
  ESTJ: { name: 'The Executive', description: 'Excellent administrators, unsurpassed at managing things or people.' },
  ESFJ: { name: 'The Consul', description: 'Extraordinarily caring, social and popular people, always eager to help.' },
  ISTP: { name: 'The Virtuoso', description: 'Bold and practical experimenters, masters of all kinds of tools.' },
  ISFP: { name: 'The Adventurer', description: 'Flexible and charming artists, always ready to explore new possibilities.' },
  ESTP: { name: 'The Entrepreneur', description: 'Smart, energetic and perceptive people, true risk takers.' },
  ESFP: { name: 'The Entertainer', description: 'Spontaneous, energetic and enthusiastic people – life is never boring around them.' },
}

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  })
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/questions.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load questions:', err)
        setLoading(false)
      })
  }, [])

  const handleAnswer = (type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P') => {
    const newAnswers = { ...answers }
    newAnswers[type] = (newAnswers[type] || 0) + 1

    if (currentQuestion < questions.length - 1) {
      setAnswers(newAnswers)
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate result
      const personalityType =
        (newAnswers.E >= newAnswers.I ? 'E' : 'I') +
        (newAnswers.S >= newAnswers.N ? 'S' : 'N') +
        (newAnswers.T >= newAnswers.F ? 'T' : 'F') +
        (newAnswers.J >= newAnswers.P ? 'J' : 'P')
      setAnswers(newAnswers)
      setResult(personalityType)
    }
  }

  const resetTest = () => {
    setCurrentQuestion(0)
    setAnswers({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 })
    setResult(null)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-2xl text-gray-600">Loading questions...</div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-2xl text-red-600">Failed to load questions. Please try again.</div>
      </main>
    )
  }

  if (result) {
    const personality = personalityTypes[result]
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">Your Personality Type</h1>
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
            <div className="text-6xl font-bold text-blue-600 mb-4">{result}</div>
            <h2 className="text-3xl font-semibold text-gray-800">{personality.name}</h2>
            <p className="text-lg text-gray-600">{personality.description}</p>
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={resetTest}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Take Test Again
            </button>
            <Link
              href="/"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
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

        <div className="text-center">
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

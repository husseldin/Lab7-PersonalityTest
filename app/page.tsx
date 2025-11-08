'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStartTest = () => {
    if (session) {
      router.push('/test')
    } else {
      setShowAuthModal(true)
      setIsLogin(true)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        })

        if (result?.error) {
          setError('Invalid email or password')
        } else {
          setShowAuthModal(false)
          router.push('/test')
        }
      } else {
        // Register
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Registration failed')
        } else {
          // Auto login after registration
          const result = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
          })

          if (!result?.error) {
            setShowAuthModal(false)
            router.push('/test')
          }
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Personality Test Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Discover your unique personality type
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take our comprehensive MBTI-inspired assessment and unlock insights about your personality, career paths, and personal growth opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {session ? (
              <>
                <button
                  onClick={handleStartTest}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Test
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartTest}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Test
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(true)
                    setIsLogin(true)
                  }}
                  className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">60-Question Assessment</h3>
              <p className="text-gray-600">Comprehensive evaluation across all MBTI dimensions</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600">Get your personality type immediately after completion</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Reports</h3>
              <p className="text-gray-600">Unlock career insights and growth recommendations for $9.90</p>
            </div>
          </div>

          {session && (
            <div className="mt-8 text-gray-700">
              Welcome back, <span className="font-semibold">{session.user?.name}</span>!
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with one uppercase letter and one number
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

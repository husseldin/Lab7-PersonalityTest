'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Auth Links */}
      <div className="absolute top-0 right-0 p-6">
        {status === 'loading' ? (
          <div className="text-gray-400">Loading...</div>
        ) : session ? (
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/auth/signin"
              className="px-5 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="text-center space-y-6 max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
          Personality Test Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover your unique personality type with our comprehensive MBTI-inspired assessment
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/test"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {session ? 'Take Test Now' : 'Start Free Test'}
          </Link>
          {session && (
            <Link
              href="/history"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              View History
            </Link>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">60 Questions</h3>
            <p className="text-gray-600">
              Comprehensive assessment covering all personality dimensions
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analysis</h3>
            <p className="text-gray-600">
              In-depth reports with strengths, weaknesses, and career insights
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">💾</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Save Results</h3>
            <p className="text-gray-600">
              Track your personality journey and download premium PDF reports
            </p>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Built with Next.js 14 + TypeScript + Prisma + NextAuth + Stripe</p>
        </div>
      </div>
    </main>
  )
}

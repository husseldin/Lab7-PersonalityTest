'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: number
  email: string
  name: string | null
  bio: string | null
  image: string | null
  emailVerified: Date | null
  role: string
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  _count: {
    testAttempts: number
    payments: number
  }
}

interface Activity {
  id: number
  action: string
  description: string | null
  createdAt: Date
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'security'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')

      const data = await res.json()
      setProfile(data.user)
      setName(data.user.name || '')
      setBio(data.user.bio || '')
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/user/activity?limit=10')
      if (!res.ok) throw new Error('Failed to fetch activities')

      const data = await res.json()
      setActivities(data.activities)
    } catch (err) {
      console.error('Failed to load activities:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'activity' && activities.length === 0) {
      fetchActivities()
    }
  }, [activeTab])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfile(data.user)
      setSuccess('Profile updated successfully!')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const actionLabels: Record<string, string> = {
    login: '🔐 Signed in',
    logout: '👋 Signed out',
    signup: '✨ Account created',
    email_verified: '✅ Email verified',
    password_reset_requested: '🔑 Password reset requested',
    password_reset_completed: '🔒 Password changed',
    profile_updated: '✏️ Profile updated',
    test_started: '📝 Started test',
    test_completed: '✅ Completed test',
    test_result_viewed: '👀 Viewed results',
    pdf_downloaded: '📄 Downloaded PDF',
    payment_initiated: '💳 Payment initiated',
    payment_completed: '💰 Payment completed',
    payment_failed: '❌ Payment failed'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity Log
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'security'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{name || profile.email}</h3>
                    <p className="text-gray-600">{profile.email}</p>
                    {profile.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Email Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-yellow-600 mt-1">
                        ⚠️ Email not verified
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-sm text-gray-500 mt-1">{bio.length}/500 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Member since:</span>
                      <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tests taken:</span>
                      <p className="font-medium">{profile._count.testAttempts}</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {activities.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {actionLabels[activity.action] || activity.action}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
                  <Link
                    href="/auth/forgot-password"
                    className="inline-block px-6 py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50"
                  >
                    Change Password
                  </Link>
                </div>

                {!profile.emailVerified && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h4 className="font-medium text-yellow-800 mb-2">Email Verification Required</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Please verify your email address to secure your account.
                    </p>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700">
                      Resend Verification Email
                    </button>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

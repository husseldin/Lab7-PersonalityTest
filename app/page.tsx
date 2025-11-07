export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">
          Personality Test Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Discover your unique personality type with our comprehensive MBTI-inspired assessment
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/test"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Test
          </a>
          <a
            href="/about"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Learn More
          </a>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          <p>Built with Next.js 14 + TypeScript + Prisma</p>
        </div>
      </div>
    </main>
  )
}

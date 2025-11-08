import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About the Personality Test</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">What is this test?</h2>
            <p className="text-gray-600 leading-relaxed">
              This personality test is inspired by the Myers-Briggs Type Indicator (MBTI),
              a widely used psychological tool that helps people understand their personality
              preferences. The test categorizes individuals into 16 different personality types
              based on four key dimensions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">The Four Dimensions</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Extraversion (E) vs Introversion (I)</h3>
                <p className="text-gray-600">
                  How you get your energy - from the outer world of people and activities,
                  or from your inner world of thoughts and reflection.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Sensing (S) vs Intuition (N)</h3>
                <p className="text-gray-600">
                  How you take in information - through concrete facts and details,
                  or through patterns and possibilities.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Thinking (T) vs Feeling (F)</h3>
                <p className="text-gray-600">
                  How you make decisions - based on logic and objective analysis,
                  or based on values and how it affects people.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Judging (J) vs Perceiving (P)</h3>
                <p className="text-gray-600">
                  How you approach the world - with structure and planning,
                  or with flexibility and spontaneity.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">16 Personality Types</h2>
            <p className="text-gray-600 leading-relaxed">
              The combination of these four dimensions results in 16 unique personality types,
              each with its own strengths, preferences, and characteristics. Understanding your
              type can help you better understand yourself, your relationships, and your career
              preferences.
            </p>
          </section>

          <section className="pt-4">
            <div className="flex gap-4 justify-center">
              <Link
                href="/test"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start the Test
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Back to Home
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

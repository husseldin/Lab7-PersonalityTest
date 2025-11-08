import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Protect specific routes with authentication
export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which routes require authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/test/:path*',
    '/result/:path*',
    '/history/:path*',
  ],
}

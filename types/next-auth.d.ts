import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    emailVerified: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      emailVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    emailVerified: boolean
  }
}

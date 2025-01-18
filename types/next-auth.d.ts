import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    stats?: {
      totalSessions: number
      totalMinutes: number
      preferredModes: Record<string, number>
      lastSession: Date | null
    }
  }
}
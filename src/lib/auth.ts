import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    username: string
    role: 'USER' | 'ADMIN'
    creditsBalance: number
    mustChangePassword: boolean
  }
  
  interface Session {
    user: User
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    email: string
    username: string
    role: 'USER' | 'ADMIN'
    creditsBalance: number
    mustChangePassword: boolean
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const validated = loginSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({
            where: { email: validated.email },
          })

          if (!user) {
            console.log(`[Auth] Login failed: user not found for email ${validated.email}`)
            return null
          }

          const passwordMatch = await bcrypt.compare(validated.password, user.passwordHash)

          if (!passwordMatch) {
            console.log(`[Auth] Login failed: invalid password for email ${validated.email}`)
            return null
          }

          console.log(`[Auth] Login successful for user ${user.email} (${user.role})`)
          
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            creditsBalance: user.creditsBalance,
            mustChangePassword: user.mustChangePassword,
          }
        } catch (error) {
          console.error('[Auth] Login error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = user.username
        token.role = user.role
        token.creditsBalance = user.creditsBalance
        token.mustChangePassword = user.mustChangePassword
      }
      
      // Update session from client
      if (trigger === 'update' && session) {
        if (session.creditsBalance !== undefined) {
          token.creditsBalance = session.creditsBalance
        }
        if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.username = token.username
        session.user.role = token.role
        session.user.creditsBalance = token.creditsBalance
        session.user.mustChangePassword = token.mustChangePassword
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
})

// Helper to get current session server-side
export async function getServerSession() {
  return auth()
}

// Helper to require authentication
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('No autorizado')
  }
  return session
}

// Helper to require admin role
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') {
    throw new Error('Acceso denegado: se requiere rol de administrador')
  }
  return session
}


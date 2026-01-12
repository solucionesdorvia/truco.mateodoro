import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  
  // During build time, return a mock client that will be replaced at runtime
  if (!connectionString || connectionString.includes('placeholder')) {
    console.log('[Prisma] Build-time mode - database operations will fail')
    // Return a client that will fail gracefully
    return new Proxy({} as PrismaClient, {
      get: (_target, prop) => {
        if (prop === '$connect' || prop === '$disconnect') {
          return async () => {}
        }
        // Return a function that throws a helpful error
        return () => {
          throw new Error('Database not available - DATABASE_URL not configured')
        }
      }
    })
  }
  
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

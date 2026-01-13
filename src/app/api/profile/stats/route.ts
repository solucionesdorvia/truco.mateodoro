import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()
    
    // Get or create player stats
    let playerStats = await prisma.playerStats.findUnique({
      where: { userId: session.user.id }
    })

    if (!playerStats) {
      // Create initial stats
      playerStats = await prisma.playerStats.create({
        data: {
          userId: session.user.id,
        }
      })
    }

    // Calculate ranking position
    const higherRanked = await prisma.playerStats.count({
      where: {
        gamesWon: { gt: playerStats.gamesWon }
      }
    })
    const ranking = higherRanked + 1

    const stats = {
      gamesPlayed: playerStats.gamesPlayed,
      gamesWon: playerStats.gamesWon,
      winRate: playerStats.gamesPlayed > 0 
        ? Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100) 
        : 0,
      creditsWon: playerStats.creditsWon - playerStats.creditsLost,
      weeklyGamesPlayed: playerStats.weeklyGamesPlayed,
      weeklyGamesWon: playerStats.weeklyGamesWon,
      weeklyWinRate: playerStats.weeklyGamesPlayed > 0 
        ? Math.round((playerStats.weeklyGamesWon / playerStats.weeklyGamesPlayed) * 100) 
        : 0,
      ranking: playerStats.gamesPlayed > 0 ? ranking : undefined,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    console.error('Error fetching profile stats:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}


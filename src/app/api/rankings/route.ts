import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all player stats
    const allStats = await prisma.playerStats.findMany({
      include: {
        user: {
          select: {
            username: true,
          }
        }
      },
      orderBy: {
        gamesWon: 'desc'
      },
      take: 100,
    })

    // Calculate global rankings
    const global = allStats.map((stat, index) => ({
      position: index + 1,
      userId: stat.userId,
      username: stat.user.username,
      gamesPlayed: stat.gamesPlayed,
      gamesWon: stat.gamesWon,
      winRate: stat.gamesPlayed > 0 
        ? Math.round((stat.gamesWon / stat.gamesPlayed) * 100) 
        : 0,
      creditsWon: stat.creditsWon - stat.creditsLost,
      trend: 'same' as const,
    }))

    // Weekly rankings (from PlayerStats weekly fields)
    const weeklyStats = [...allStats].sort((a, b) => b.weeklyGamesWon - a.weeklyGamesWon)
    
    const weekly = weeklyStats
      .filter(stat => stat.weeklyGamesPlayed > 0)
      .map((stat, index) => ({
        position: index + 1,
        userId: stat.userId,
        username: stat.user.username,
        gamesPlayed: stat.weeklyGamesPlayed,
        gamesWon: stat.weeklyGamesWon,
        winRate: stat.weeklyGamesPlayed > 0 
          ? Math.round((stat.weeklyGamesWon / stat.weeklyGamesPlayed) * 100) 
          : 0,
        creditsWon: stat.weeklyCreditsWon - stat.weeklyCreditsLost,
        trend: 'same' as const,
      }))

    // Calculate week end date (next Sunday 23:59:59 AR time)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() + daysUntilSunday)
    weekEnd.setHours(23, 59, 59, 999)

    return NextResponse.json({
      global,
      weekly,
      weekEndDate: weekEnd.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching rankings:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}


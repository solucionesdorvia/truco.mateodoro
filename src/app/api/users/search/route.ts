import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''

    if (query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        username: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
      orderBy: { username: 'asc' },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[API/Users/Search] Error:', error)
    return NextResponse.json({ error: 'Error al buscar usuarios' }, { status: 500 })
  }
}

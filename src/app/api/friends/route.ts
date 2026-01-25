import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const requests = await prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id },
        ],
      },
      include: {
        fromUser: { select: { id: true, username: true, avatarUrl: true } },
        toUser: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const friends = requests.map(request => (
      request.fromUserId === session.user.id ? request.toUser : request.fromUser
    ))

    return NextResponse.json({ friends })
  } catch (error) {
    console.error('[API/Friends] Error:', error)
    return NextResponse.json({ error: 'Error al obtener amigos' }, { status: 500 })
  }
}

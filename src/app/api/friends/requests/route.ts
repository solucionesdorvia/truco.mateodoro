import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [incoming, outgoing] = await Promise.all([
      prisma.friendRequest.findMany({
        where: {
          toUserId: session.user.id,
          status: 'PENDING',
        },
        include: {
          fromUser: { select: { id: true, username: true, avatarUrl: true } },
          toUser: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendRequest.findMany({
        where: {
          fromUserId: session.user.id,
          status: 'PENDING',
        },
        include: {
          fromUser: { select: { id: true, username: true, avatarUrl: true } },
          toUser: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({ incoming, outgoing })
  } catch (error) {
    console.error('[API/Friends/Requests] Error:', error)
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const targetUserId = body.userId as string | undefined

    if (!targetUserId) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'No podés agregarte' }, { status: 400 })
    }

    const accepted = await prisma.friendRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromUserId: session.user.id, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: session.user.id },
        ],
      },
    })

    if (accepted) {
      return NextResponse.json({ error: 'Ya son amigos' }, { status: 400 })
    }

    const incomingPending = await prisma.friendRequest.findFirst({
      where: {
        fromUserId: targetUserId,
        toUserId: session.user.id,
        status: 'PENDING',
      },
    })

    if (incomingPending) {
      const updated = await prisma.friendRequest.update({
        where: { id: incomingPending.id },
        data: { status: 'ACCEPTED' },
        include: {
          fromUser: { select: { id: true, username: true, avatarUrl: true } },
          toUser: { select: { id: true, username: true, avatarUrl: true } },
        },
      })
      return NextResponse.json({ request: updated, message: 'Solicitud aceptada' })
    }

    const existingOutgoing = await prisma.friendRequest.findFirst({
      where: {
        fromUserId: session.user.id,
        toUserId: targetUserId,
      },
    })

    if (existingOutgoing) {
      const updated = await prisma.friendRequest.update({
        where: { id: existingOutgoing.id },
        data: { status: 'PENDING' },
        include: {
          fromUser: { select: { id: true, username: true, avatarUrl: true } },
          toUser: { select: { id: true, username: true, avatarUrl: true } },
        },
      })
      return NextResponse.json({ request: updated, message: 'Solicitud reenviada' })
    }

    const requestCreated = await prisma.friendRequest.create({
      data: {
        fromUserId: session.user.id,
        toUserId: targetUserId,
        status: 'PENDING',
      },
      include: {
        fromUser: { select: { id: true, username: true, avatarUrl: true } },
        toUser: { select: { id: true, username: true, avatarUrl: true } },
      },
    })

    return NextResponse.json({ request: requestCreated, message: 'Solicitud enviada' })
  } catch (error) {
    console.error('[API/Friends/Requests] Error:', error)
    return NextResponse.json({ error: 'Error al enviar solicitud' }, { status: 500 })
  }
}

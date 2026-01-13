import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await requireAuth()
    
    const post = await prisma.communityPost.update({
      where: { id: params.postId },
      data: {
        likes: { increment: 1 }
      }
    })

    return NextResponse.json({ likes: post.likes })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    console.error('Error liking post:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}


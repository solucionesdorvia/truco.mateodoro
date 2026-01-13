import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category && category !== 'ALL' 
      ? { category: category as 'TIP' | 'PARTIDA' | 'BUSCO_EQUIPO' | 'GENERAL' }
      : {}

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const { title, body: postBody, category } = body

    if (!postBody?.trim()) {
      return NextResponse.json(
        { error: 'El mensaje es requerido' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['TIP', 'PARTIDA', 'BUSCO_EQUIPO', 'GENERAL']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: session.user.id,
        title: title?.trim() || null,
        body: postBody.trim(),
        category: category as 'TIP' | 'PARTIDA' | 'BUSCO_EQUIPO' | 'GENERAL',
      },
      include: {
        user: {
          select: {
            username: true,
          }
        }
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    if (sessionId) {
      // Get specific session with messages
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: {
              timestamp: 'asc'
            }
          }
        }
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        session
      })
    } else {
      // Get all sessions for user
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          messages: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1 // Just the last message for preview
          }
        }
      })

      return NextResponse.json({
        success: true,
        sessions
      })
    }

  } catch (error) {
    console.error('Chat sessions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}
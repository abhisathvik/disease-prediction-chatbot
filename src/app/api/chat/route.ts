import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { MedicalChatbot } from '@/lib/geminiChatbot'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    const { message, sessionId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get or create chat session
    let chatSession
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: {
              timestamp: 'asc'
            },
            take: 10 // Last 10 messages for context
          }
        }
      })
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        },
        include: {
          messages: true
        }
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message
      }
    })

    // Get user's medical context
    const [medicalHistory, recentPredictions] = await Promise.all([
      prisma.medicalHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.diseaseQuery.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
        take: 3
      })
    ])

    // Prepare medical context
    const medicalContext = {
      userMedicalHistory: medicalHistory,
      recentPredictions: recentPredictions.map(p => JSON.parse(p.predictions)).flat(),
      allergies: medicalHistory.flatMap(h => h.allergies ? JSON.parse(h.allergies) : []),
      currentMedications: medicalHistory.flatMap(h => h.medications ? JSON.parse(h.medications) : [])
    }

    // Generate AI response
    const chatbot = new MedicalChatbot()
    const conversationHistory = chatSession.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: msg.timestamp
    }))

    const aiResponse = await chatbot.generateResponse(
      message,
      conversationHistory,
      medicalContext
    )

    // Save AI response
    const savedMessage = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: aiResponse
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: chatSession.id,
      message: {
        id: savedMessage.id,
        role: 'assistant',
        content: aiResponse,
        timestamp: savedMessage.timestamp
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
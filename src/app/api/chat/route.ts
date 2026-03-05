import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { MedicalChatbot } from '@/lib/geminiChatbot'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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

    let chatSession
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 10
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
        include: { messages: true }
      })
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message
      }
    })

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

    const safeParse = (data: string | null) => {
      try {
        return data ? JSON.parse(data) : []
      } catch {
        return []
      }
    }

    const medicalContext = {
      userMedicalHistory: medicalHistory,
      recentPredictions: recentPredictions.map(p => safeParse(p.predictions)).flat(),
      allergies: medicalHistory.flatMap(h => safeParse(h.allergies)),
      currentMedications: medicalHistory.flatMap(h => safeParse(h.medications))
    }

    const chatbot = new MedicalChatbot()
    const conversationHistory = chatSession.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: msg.timestamp
    }))

    let aiResponse = "I'm sorry, I couldn't process your request."
    try {
      aiResponse = await chatbot.generateResponse(message, conversationHistory, medicalContext)
    } catch (err) {
      console.error("Gemini error:", err)
      aiResponse = "I apologize, but I'm having trouble responding right now. Please try again."
    }

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
        timestamp: savedMessage.timestamp.toISOString()
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

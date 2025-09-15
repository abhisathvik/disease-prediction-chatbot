import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    // Fetch health metrics and symptom logs
    const metrics = await prisma.healthMetric.findMany({
      where: { userId: decoded.userId },
      orderBy: { date: 'desc' }
    })

    const symptoms = await prisma.symptomLog.findMany({
      where: { userId: decoded.userId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({
      metrics,
      symptoms
    })

  } catch (error) {
    console.error('Health monitoring fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
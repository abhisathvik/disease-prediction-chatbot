import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const body = await request.json()
    const { type, value, unit, date, notes } = body

    const metric = await prisma.healthMetric.create({
      data: {
        userId: decoded.userId,
        type,
        value,
        unit: unit || '',
        date: new Date(date),
        notes: notes || null
      }
    })

    return NextResponse.json({ metric })

  } catch (error) {
    console.error('Health metric creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
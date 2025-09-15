import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const body = await request.json()

    // Update user personal information
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: body.name,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        address: body.address || null,
        gender: body.gender || null
      }
    })

    return NextResponse.json({ user })

  } catch (error) {
    console.error('User profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
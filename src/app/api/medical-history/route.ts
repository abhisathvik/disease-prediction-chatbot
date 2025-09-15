import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const medicalHistory = await prisma.medicalHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    const predictions = await prisma.diseaseQuery.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' }
    })

    return NextResponse.json({
      success: true,
      medicalHistory: medicalHistory.map(entry => ({
        ...entry,
        symptoms: entry.symptoms ? JSON.parse(entry.symptoms) : [],
        medications: entry.medications ? JSON.parse(entry.medications) : [],
        allergies: entry.allergies ? JSON.parse(entry.allergies) : [],
        conditions: entry.conditions ? JSON.parse(entry.conditions) : []
      })),
      predictions: predictions.map(pred => ({
        ...pred,
        symptoms: JSON.parse(pred.symptoms),
        predictions: JSON.parse(pred.predictions)
      }))
    })

  } catch (error) {
    console.error('Medical history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical history' },
      { status: 500 }
    )
  }
}

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

    const {
      symptoms,
      diagnosis,
      medications,
      allergies,
      conditions,
      notes,
      date
    } = await request.json()

    const medicalEntry = await prisma.medicalHistory.create({
      data: {
        userId: user.id,
        symptoms: JSON.stringify(symptoms || []),
        diagnosis,
        medications: JSON.stringify(medications || []),
        allergies: JSON.stringify(allergies || []),
        conditions: JSON.stringify(conditions || []),
        notes,
        date: date ? new Date(date) : new Date()
      }
    })

    return NextResponse.json({
      success: true,
      entry: {
        ...medicalEntry,
        symptoms: JSON.parse(medicalEntry.symptoms),
        medications: medicalEntry.medications ? JSON.parse(medicalEntry.medications) : [],
        allergies: medicalEntry.allergies ? JSON.parse(medicalEntry.allergies) : [],
        conditions: medicalEntry.conditions ? JSON.parse(medicalEntry.conditions) : []
      }
    })

  } catch (error) {
    console.error('Medical history creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create medical history entry' },
      { status: 500 }
    )
  }
}
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

    // Fetch health profile data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        name: true,
        email: true,
        dateOfBirth: true,
        address: true,
        gender: true
      }
    })

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: decoded.userId }
    })

    return NextResponse.json({
      personalInfo: user,
      profile: healthProfile
    })

  } catch (error) {
    console.error('Health profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const body = await request.json()

    // Update or create health profile
    const healthProfile = await prisma.healthProfile.upsert({
      where: { userId: decoded.userId },
      update: {
        height: body.height || null,
        weight: body.weight || null,
        bloodType: body.bloodType || null,
        allergies: body.allergies || [],
        medications: body.medications || [],
        emergencyContactName: body.emergencyContact?.name || null,
        emergencyContactPhone: body.emergencyContact?.phone || null,
        emergencyContactRelationship: body.emergencyContact?.relationship || null,
        medicalConditions: body.medicalConditions || [],
        preferredHospital: body.preferredHospital || null,
        insuranceProvider: body.insuranceProvider || null,
        lastCheckup: body.lastCheckup ? new Date(body.lastCheckup) : null
      },
      create: {
        userId: decoded.userId,
        height: body.height || null,
        weight: body.weight || null,
        bloodType: body.bloodType || null,
        allergies: body.allergies || [],
        medications: body.medications || [],
        emergencyContactName: body.emergencyContact?.name || null,
        emergencyContactPhone: body.emergencyContact?.phone || null,
        emergencyContactRelationship: body.emergencyContact?.relationship || null,
        medicalConditions: body.medicalConditions || [],
        preferredHospital: body.preferredHospital || null,
        insuranceProvider: body.insuranceProvider || null,
        lastCheckup: body.lastCheckup ? new Date(body.lastCheckup) : null
      }
    })

    return NextResponse.json({ profile: healthProfile })

  } catch (error) {
    console.error('Health profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
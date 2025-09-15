import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Parse request body
    const body = await request.json();
    const { symptoms, severity, duration, date, notes } = body;

    // Validate required fields
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: 'At least one symptom is required' }, { status: 400 });
    }

    if (typeof severity !== 'number' || severity < 1 || severity > 10) {
      return NextResponse.json({ error: 'Severity must be a number between 1 and 10' }, { status: 400 });
    }

    if (!duration || typeof duration !== 'string') {
      return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
    }

    if (!date || !Date.parse(date)) {
      return NextResponse.json({ error: 'Valid date is required' }, { status: 400 });
    }

    // Create symptom log in database
    const symptomLog = await prisma.symptomLog.create({
      data: {
        userId: decoded.userId,
        symptoms: JSON.stringify(symptoms), // Convert array to string for SQLite
        severity: severity,
        duration: duration,
        date: new Date(date),
        notes: notes || null
      }
    });

    return NextResponse.json({ symptomLog });

  } catch (error) {
    console.error('Symptom log creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
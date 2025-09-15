import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { predictDiseases, savePredictionQuery } from '@/lib/diseasePredictor'

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

    const { symptoms } = await request.json()

    // Validate input
    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json(
        { error: 'Symptoms array is required' },
        { status: 400 }
      )
    }

    if (symptoms.length !== 3) {
      return NextResponse.json(
        { error: 'Exactly 3 symptoms are required' },
        { status: 400 }
      )
    }

    // Validate that all symptoms are non-empty strings
    const validSymptoms = symptoms.filter(symptom => 
      typeof symptom === 'string' && symptom.trim().length > 0
    )

    if (validSymptoms.length !== 3) {
      return NextResponse.json(
        { error: 'All 3 symptoms must be non-empty strings' },
        { status: 400 }
      )
    }

    // Predict diseases
    const predictions = await predictDiseases(validSymptoms)

    // Save the query to database
    await savePredictionQuery(user.id, validSymptoms, predictions)

    return NextResponse.json({
      success: true,
      symptoms: validSymptoms,
      predictions,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Disease prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
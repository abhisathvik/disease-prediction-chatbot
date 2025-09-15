import prisma from './prisma'

interface DiseaseMatch {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  disease: any
  matchScore: number
  confidence: number
}

export interface PredictionResult {
  id: string
  name: string
  description: string
  symptoms: string[]
  causes: string[]
  precautions: string[]
  medicines: string[]
  severity: string
  category: string
  confidence: number
  matchedSymptoms: string[]
}

export async function predictDiseases(symptoms: string[]): Promise<PredictionResult[]> {
  // Normalize input symptoms
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim())
  
  // Fetch all diseases from database
  const diseases = await prisma.disease.findMany()
  
  const diseaseMatches: DiseaseMatch[] = []
  
  for (const disease of diseases) {
    const diseaseSymptoms = JSON.parse(disease.symptoms) as string[]
    const normalizedDiseaseSymptoms = diseaseSymptoms.map(s => s.toLowerCase())
    
    // Calculate match score based on symptom overlap
    let matchScore = 0
    let exactMatches = 0
    const matchedSymptoms: string[] = []
    
    for (const inputSymptom of normalizedSymptoms) {
      for (const diseaseSymptom of normalizedDiseaseSymptoms) {
        // Exact match
        if (inputSymptom === diseaseSymptom) {
          matchScore += 10
          exactMatches++
          matchedSymptoms.push(diseaseSymptom)
        }
        // Partial match (substring)
        else if (diseaseSymptom.includes(inputSymptom) || inputSymptom.includes(diseaseSymptom)) {
          matchScore += 5
          matchedSymptoms.push(diseaseSymptom)
        }
        // Similar words (basic similarity)
        else if (areSimilar(inputSymptom, diseaseSymptom)) {
          matchScore += 3
          matchedSymptoms.push(diseaseSymptom)
        }
      }
    }
    
    // Calculate confidence based on match quality and disease severity
    let confidence = Math.min((matchScore / (normalizedSymptoms.length * 10)) * 100, 100)
    
    // Boost confidence for severe diseases with good matches
    if (disease.severity === 'high' || disease.severity === 'critical') {
      confidence *= 1.1
    }
    
    // Penalty for diseases with no exact matches
    if (exactMatches === 0 && matchScore < 15) {
      confidence *= 0.7
    }
    
    if (matchScore > 0) {
      diseaseMatches.push({
        disease: {
          ...disease,
          matchedSymptoms: [...new Set(matchedSymptoms)] // Remove duplicates
        },
        matchScore,
        confidence: Math.min(confidence, 95) // Cap at 95%
      })
    }
  }
  
  // Sort by match score and confidence
  diseaseMatches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore
    }
    return b.confidence - a.confidence
  })
  
  // Return top 3 predictions
  return diseaseMatches.slice(0, 3).map(match => ({
    id: match.disease.id,
    name: match.disease.name,
    description: match.disease.description || '',
    symptoms: JSON.parse(match.disease.symptoms),
    causes: JSON.parse(match.disease.causes || '[]'),
    precautions: JSON.parse(match.disease.precautions || '[]'),
    medicines: JSON.parse(match.disease.medicines || '[]'),
    severity: match.disease.severity,
    category: match.disease.category || 'General',
    confidence: Math.round(match.confidence),
    matchedSymptoms: match.disease.matchedSymptoms
  }))
}

function areSimilar(word1: string, word2: string): boolean {
  // Basic similarity check using Levenshtein distance
  const distance = levenshteinDistance(word1, word2)
  const maxLength = Math.max(word1.length, word2.length)
  const similarity = 1 - distance / maxLength
  return similarity > 0.6 // 60% similarity threshold
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

export async function savePredictionQuery(
  userId: string,
  symptoms: string[],
  predictions: PredictionResult[]
): Promise<void> {
  await prisma.diseaseQuery.create({
    data: {
      userId,
      symptoms: JSON.stringify(symptoms),
      predictions: JSON.stringify(predictions),
      confidence: predictions.length > 0 ? predictions[0].confidence : 0
    }
  })
}
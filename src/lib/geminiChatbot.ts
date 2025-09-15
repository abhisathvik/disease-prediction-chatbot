import { GoogleGenerativeAI } from '@google/generative-ai'
import { PredictionResult } from './diseasePredictor'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

export interface MedicalContext {
  userMedicalHistory?: any[]
  recentPredictions?: PredictionResult[]
  currentSymptoms?: string[]
  allergies?: string[]
  currentMedications?: string[]
}

export class MedicalChatbot {
  private model: any
  private isConfigured: boolean

  constructor() {
    this.isConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    if (this.isConfigured) {
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    }
  }

  private createSystemPrompt(medicalContext: MedicalContext): string {
    return `You are MedBot AI, a compassionate and knowledgeable medical assistant chatbot. Your role is to provide helpful, accurate, and empathetic responses about health-related queries while maintaining strict medical ethics.

IMPORTANT GUIDELINES:
1. Always provide helpful medical information but NEVER replace professional medical advice
2. Always recommend consulting healthcare professionals for serious concerns
3. Be empathetic and supportive in your responses
4. Use clear, understandable language
5. Provide actionable advice when appropriate
6. Always include disclaimers about seeking professional medical help

MEDICAL CONTEXT:
${medicalContext.recentPredictions ? `Recent Disease Predictions: ${JSON.stringify(medicalContext.recentPredictions.map(p => ({ name: p.name, confidence: p.confidence, symptoms: p.matchedSymptoms })))}` : ''}
${medicalContext.currentSymptoms ? `Current Symptoms: ${medicalContext.currentSymptoms.join(', ')}` : ''}
${medicalContext.allergies ? `Known Allergies: ${medicalContext.allergies.join(', ')}` : ''}
${medicalContext.currentMedications ? `Current Medications: ${medicalContext.currentMedications.join(', ')}` : ''}

RESPONSE FORMAT:
- Provide clear, well-structured responses
- Use bullet points or numbered lists when helpful
- Include relevant medical information about diseases, symptoms, treatments
- Always end with appropriate medical disclaimers
- Be supportive and understanding

Remember: You are providing educational information and support, not diagnosing or treating medical conditions.`
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[],
    medicalContext: MedicalContext = {}
  ): Promise<string> {
    if (!this.isConfigured) {
      return "I apologize, but the AI chatbot is currently not configured. Please ensure the Gemini API key is properly set in the environment variables. You can still use the disease prediction feature to analyze your symptoms."
    }

    try {
      // Create the conversation prompt
      const systemPrompt = this.createSystemPrompt(medicalContext)
      
      // Format conversation history
      const conversationText = conversationHistory
        .slice(-6) // Keep only last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')

      const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationText}

USER MESSAGE: ${userMessage}

Please provide a helpful, empathetic, and medically informed response:`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      let text = response.text()

      // Ensure response includes appropriate medical disclaimers
      if (!text.toLowerCase().includes('healthcare professional') && 
          !text.toLowerCase().includes('medical professional') &&
          !text.toLowerCase().includes('doctor')) {
        text += '\n\n⚠️ **Important**: This information is for educational purposes only. Please consult with a healthcare professional for proper medical advice, diagnosis, or treatment.'
      }

      return text

    } catch (error) {
      console.error('Gemini AI error:', error)
      throw new Error('Failed to generate response. Please try again.')
    }
  }

  async generateDiseaseExplanation(prediction: PredictionResult): Promise<string> {
    try {
      const prompt = `As MedBot AI, provide a comprehensive but easy-to-understand explanation about the disease "${prediction.name}".

DISEASE INFORMATION:
- Name: ${prediction.name}
- Description: ${prediction.description}
- Severity: ${prediction.severity}
- Category: ${prediction.category}
- Common Symptoms: ${prediction.symptoms.join(', ')}
- Possible Causes: ${prediction.causes.join(', ')}
- Precautions: ${prediction.precautions.join(', ')}
- Treatment Options: ${prediction.medicines.join(', ')}

Please provide:
1. A clear explanation of what this condition is
2. Why these symptoms occur
3. When to seek immediate medical attention
4. General management tips
5. What to expect

Keep the tone supportive and informative. Include appropriate medical disclaimers.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()

    } catch (error) {
      console.error('Gemini AI error:', error)
      throw new Error('Failed to generate disease explanation. Please try again.')
    }
  }

  async generateSymptomAnalysis(symptoms: string[]): Promise<string> {
    try {
      const prompt = `As MedBot AI, analyze these symptoms and provide helpful insights: ${symptoms.join(', ')}

Please provide:
1. What these symptoms commonly indicate
2. Possible relationships between these symptoms
3. When these symptoms might require immediate medical attention
4. General self-care recommendations
5. Questions to consider asking a healthcare provider

Be supportive and informative while emphasizing the importance of professional medical consultation.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()

    } catch (error) {
      console.error('Gemini AI error:', error)
      throw new Error('Failed to analyze symptoms. Please try again.')
    }
  }
}
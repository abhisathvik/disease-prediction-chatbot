'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  Info, 
  Shield, 
  Pill,
  TrendingUp,
  Brain,
  Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PredictionResult {
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

export default function PredictPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [symptoms, setSymptoms] = useState(['', '', ''])
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const updateSymptom = (index: number, value: string) => {
    const newSymptoms = [...symptoms]
    newSymptoms[index] = value
    setSymptoms(newSymptoms)
  }

  const analyzSymptoms = async () => {
    const validSymptoms = symptoms.filter(s => s.trim().length > 0)
    
    if (validSymptoms.length !== 3) {
      toast.error('Please enter exactly 3 symptoms')
      return
    }

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms: validSymptoms })
      })

      const data = await response.json()

      if (response.ok) {
        setPredictions(data.predictions)
        setShowResults(true)
        toast.success('Analysis complete!')
      } else {
        toast.error(data.error || 'Analysis failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
      console.error('Prediction error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return Info
      case 'medium': return AlertTriangle
      case 'high': return AlertTriangle
      case 'critical': return AlertTriangle
      default: return Info
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Disease Prediction</h1>
                  <p className="text-sm text-gray-600">AI-powered symptom analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Symptom Analysis</h2>
              <p className="text-gray-600">
                Enter your three main symptoms for AI-powered disease prediction
              </p>
            </div>

            <div className="space-y-6">
              {symptoms.map((symptom, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Symptom {index + 1}
                  </label>
                  <input
                    type="text"
                    value={symptom}
                    onChange={(e) => updateSymptom(index, e.target.value)}
                    placeholder={`Enter symptom ${index + 1} (e.g., headache, fever, cough)`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzSymptoms}
                disabled={isAnalyzing || symptoms.filter(s => s.trim()).length !== 3}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Analyze Symptoms</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Disclaimer</p>
                  <p>
                    This AI prediction tool is for educational purposes only and should not replace professional medical advice. 
                    Always consult with healthcare professionals for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
                  <p className="text-gray-600">
                    Based on symptoms: {symptoms.filter(s => s.trim()).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowResults(false)
                    setSymptoms(['', '', ''])
                    setPredictions([])
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Predictions */}
            <AnimatePresence>
              {predictions.map((prediction, index) => {
                const SeverityIcon = getSeverityIcon(prediction.severity)
                return (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-bold text-purple-600">
                            #{index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {prediction.name}
                            </h3>
                            <p className="text-gray-600">{prediction.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(prediction.severity)}`}>
                            <SeverityIcon className="h-4 w-4" />
                            <span>{prediction.severity.toUpperCase()}</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {prediction.confidence}%
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-6">{prediction.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                            Matched Symptoms
                          </h4>
                          <div className="space-y-2">
                            {prediction.matchedSymptoms.map((symptom, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700">{symptom}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                            Common Causes
                          </h4>
                          <div className="space-y-2">
                            {prediction.causes.slice(0, 3).map((cause, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-gray-700">{cause}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                            <Shield className="h-5 w-5 mr-2 text-green-600" />
                            Precautions
                          </h4>
                          <div className="space-y-2">
                            {prediction.precautions.slice(0, 3).map((precaution, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700">{precaution}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                            <Pill className="h-5 w-5 mr-2 text-purple-600" />
                            Treatment Options
                          </h4>
                          <div className="space-y-2">
                            {prediction.medicines.slice(0, 3).map((medicine, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-700">{medicine}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Medical Disclaimer */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Important Medical Disclaimer
                  </h3>
                  <p className="text-red-700">
                    These predictions are generated by AI and are for informational purposes only. 
                    They should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
                    Always seek the advice of qualified healthcare professionals with any questions you may have regarding a medical condition.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
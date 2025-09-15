'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  History, 
  Clock, 
  Activity, 
  Brain, 
  Plus, 
  X, 
  Save,
  Edit,
  Trash2,
  AlertCircle,
  Heart,
  Pill,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface MedicalEntry {
  id: string
  symptoms: string[]
  diagnosis?: string
  medications: string[]
  allergies: string[]
  conditions: string[]
  notes?: string
  date: string
  createdAt: string
}

interface PredictionEntry {
  id: string
  symptoms: string[]
  predictions: any[]
  confidence: number
  timestamp: string
}

export default function HistoryPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [medicalHistory, setMedicalHistory] = useState<MedicalEntry[]>([])
  const [predictions, setPredictions] = useState<PredictionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: [''],
    medications: [''],
    allergies: [''],
    conditions: [''],
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && token) {
      fetchHistory()
    }
  }, [user, token])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/medical-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setMedicalHistory(data.medicalHistory)
        setPredictions(data.predictions)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const addArrayField = (field: keyof typeof formData, value: string = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }))
  }

  const removeArrayField = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const updateArrayField = (field: keyof typeof formData, index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...(prev[field] as string[])]
      newArray[index] = value
      return { ...prev, [field]: newArray }
    })
  }

  const resetForm = () => {
    setFormData({
      diagnosis: '',
      symptoms: [''],
      medications: [''],
      allergies: [''],
      conditions: [''],
      notes: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Filter out empty strings
      const filteredData = {
        ...formData,
        symptoms: formData.symptoms.filter(s => s.trim()),
        medications: formData.medications.filter(m => m.trim()),
        allergies: formData.allergies.filter(a => a.trim()),
        conditions: formData.conditions.filter(c => c.trim())
      }

      const response = await fetch('/api/medical-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filteredData)
      })

      if (response.ok) {
        toast.success('Medical record added successfully!')
        setShowAddForm(false)
        resetForm()
        fetchHistory() // Refresh the list
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add medical record')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
      console.error('Medical record error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <History className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Medical History</h1>
                    <p className="text-sm text-gray-600">Your health records and predictions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recent Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            Recent Disease Predictions
          </h2>
          
          {predictions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No predictions yet. Start by analyzing your symptoms!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.slice(0, 5).map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {isClient ? new Date(prediction.timestamp).toLocaleDateString() : ''} {isClient ? 'at ' + new Date(prediction.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-purple-600">
                      {prediction.confidence}% confidence
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Symptoms Analyzed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {prediction.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Top Predictions:</h4>
                    <div className="space-y-2">
                      {prediction.predictions.slice(0, 3).map((pred, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{pred.name}</span>
                          <span className="text-sm text-gray-600">{pred.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Medical Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="h-6 w-6 text-green-600 mr-2" />
            Medical Records
          </h2>
          
          {medicalHistory.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No medical records yet. Add your first entry to get started!</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Add Medical Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {isClient ? new Date(entry.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {entry.diagnosis && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {entry.diagnosis}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {entry.symptoms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                          Symptoms:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.symptoms.map((symptom, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.medications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Pill className="h-4 w-4 text-blue-500 mr-1" />
                          Medications:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.medications.map((med, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.allergies.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Heart className="h-4 w-4 text-yellow-500 mr-1" />
                          Allergies:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.allergies.map((allergy, idx) => (
                            <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.conditions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FileText className="h-4 w-4 text-purple-500 mr-1" />
                          Previous Conditions:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.conditions.map((condition, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {entry.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                      <p className="text-gray-700 text-sm">{entry.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Add Medical Record Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Add Medical Record</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diagnosis/Condition
                        </label>
                        <input
                          type="text"
                          value={formData.diagnosis}
                          onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                          placeholder="e.g., Acute Bronchitis, Hypertension"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Dynamic Fields */}
                    {[{ key: 'symptoms', label: 'Symptoms', placeholder: 'e.g., fever, cough' },
                      { key: 'medications', label: 'Medications', placeholder: 'e.g., Amoxicillin, Ibuprofen' },
                      { key: 'allergies', label: 'Allergies', placeholder: 'e.g., Penicillin, Peanuts' },
                      { key: 'conditions', label: 'Previous Conditions', placeholder: 'e.g., Diabetes, Asthma' }].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label}
                        </label>
                        <div className="space-y-2">
                          {(formData[key as keyof typeof formData] as string[]).map((item, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => updateArrayField(key as keyof typeof formData, index, e.target.value)}
                                placeholder={placeholder}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                              {(formData[key as keyof typeof formData] as string[]).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayField(key as keyof typeof formData, index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayField(key as keyof typeof formData)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add {label.slice(0, -1)}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional information about this medical record"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Record</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
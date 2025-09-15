'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Activity, 
  Plus,
  Heart,
  Thermometer,
  Scale,
  Droplets,
  Brain,
  AlertCircle,
  Clock,
  Save,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface HealthMetric {
  id: string
  type: string
  value: string
  unit: string
  date: string
  notes?: string
}

interface SymptomLog {
  id: string
  symptoms: string[]
  severity: number
  duration: string
  date: string
  notes?: string
}

export default function MonitoringPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState<'metrics' | 'symptoms'>('metrics')
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMetric, setShowAddMetric] = useState(false)
  const [showAddSymptom, setShowAddSymptom] = useState(false)

  const [metricForm, setMetricForm] = useState({
    type: 'blood_pressure',
    value: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [symptomForm, setSymptomForm] = useState({
    symptoms: [''],
    severity: 5,
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  const metricTypes = [
    { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: Heart },
    { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Activity },
    { key: 'temperature', label: 'Temperature', unit: '°F', icon: Thermometer },
    { key: 'weight', label: 'Weight', unit: 'lbs', icon: Scale },
    { key: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', icon: Droplets },
    { key: 'mood', label: 'Mood', unit: '/10', icon: Brain },
    { key: 'sleep_hours', label: 'Sleep Hours', unit: 'hrs', icon: Clock }
  ]

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
      fetchMonitoringData()
    }
  }, [user, token])

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/health-monitoring', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setHealthMetrics(data.metrics || [])
        setSymptomLogs(data.symptoms || [])
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedType = metricTypes.find(t => t.key === metricForm.type)
      const response = await fetch('/api/health-monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...metricForm, unit: selectedType?.unit || '' })
      })
      if (response.ok) {
        toast.success('Health metric recorded!')
        setShowAddMetric(false)
        setMetricForm({ type: 'blood_pressure', value: '', notes: '', date: new Date().toISOString().split('T')[0] })
        fetchMonitoringData()
      }
    } catch (error) {
      toast.error('Failed to record metric')
    }
  }

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/health-monitoring/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...symptomForm, symptoms: symptomForm.symptoms.filter(s => s.trim()) })
      })
      if (response.ok) {
        toast.success('Symptoms logged!')
        setShowAddSymptom(false)
        setSymptomForm({ symptoms: [''], severity: 5, duration: '', notes: '', date: new Date().toISOString().split('T')[0] })
        fetchMonitoringData()
      }
    } catch (error) {
      toast.error('Failed to log symptoms')
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/dashboard')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Health Monitoring</h1>
                  <p className="text-sm text-gray-600">Track your health metrics and symptoms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'metrics' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Health Metrics
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'symptoms' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Symptom Logs
          </button>
        </div>

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Health Metrics</h2>
              <button
                onClick={() => setShowAddMetric(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Add Metric</span>
              </button>
            </div>

            {healthMetrics.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No health metrics recorded yet.</p>
                <button
                  onClick={() => setShowAddMetric(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                >
                  Add Your First Metric
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={metric.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {metricTypes.find(t => t.key === metric.type)?.label || metric.type}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {isClient ? new Date(metric.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value} {metric.unit}
                    </div>
                    {metric.notes && (
                      <p className="text-sm text-gray-600 mt-2">{metric.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'symptoms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Symptom Logs</h2>
              <button
                onClick={() => setShowAddSymptom(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Log Symptoms</span>
              </button>
            </div>

            {symptomLogs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No symptoms logged yet.</p>
                <button
                  onClick={() => setShowAddSymptom(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                >
                  Log Your First Symptoms
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {symptomLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Symptom Log</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Severity: {log.severity}/10
                        </span>
                        <span className="text-sm text-gray-600">
                          {isClient ? new Date(log.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {log.symptoms.map((symptom, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    {log.duration && (
                      <p className="text-sm text-gray-600 mb-2">Duration: {log.duration}</p>
                    )}
                    {log.notes && (
                      <p className="text-sm text-gray-600">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Metric Modal */}
        {showAddMetric && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add Health Metric</h3>
                  <button onClick={() => setShowAddMetric(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleAddMetric} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                    <select
                      value={metricForm.type}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      {metricTypes.map(type => (
                        <option key={type.key} value={type.key}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value ({metricTypes.find(t => t.key === metricForm.type)?.unit})
                    </label>
                    <input
                      type="text"
                      value={metricForm.value}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={metricForm.date}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button type="button" onClick={() => setShowAddMetric(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Symptom Modal */}
        {showAddSymptom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Log Symptoms</h3>
                  <button onClick={() => setShowAddSymptom(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleAddSymptom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                    <div className="space-y-2">
                      {symptomForm.symptoms.map((symptom, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={symptom}
                            onChange={(e) => {
                              const newSymptoms = [...symptomForm.symptoms]
                              newSymptoms[index] = e.target.value
                              setSymptomForm(prev => ({ ...prev, symptoms: newSymptoms }))
                            }}
                            placeholder="Enter symptom"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          />
                          {symptomForm.symptoms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSymptomForm(prev => ({ 
                                ...prev, 
                                symptoms: prev.symptoms.filter((_, i) => i !== index) 
                              }))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSymptomForm(prev => ({ ...prev, symptoms: [...prev.symptoms, ''] }))}
                        className="text-red-600 text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Symptom
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={symptomForm.severity}
                      onChange={(e) => setSymptomForm(prev => ({ ...prev, severity: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Mild</span>
                      <span>{symptomForm.severity}/10</span>
                      <span>Severe</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={symptomForm.date}
                      onChange={(e) => setSymptomForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button type="button" onClick={() => setShowAddSymptom(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
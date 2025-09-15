'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  User, 
  Edit3, 
  Save, 
  X,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Heart,
  Scale,
  Ruler,
  Thermometer,
  Droplets,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface HealthProfile {
  id?: string
  height: string
  weight: string
  bloodType: string
  allergies: string[]
  medications: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalConditions: string[]
  preferredHospital: string
  insuranceProvider: string
  lastCheckup: string
}

interface PersonalInfo {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  gender: string
}

export default function ProfilePage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingHealth, setEditingHealth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    gender: ''
  })

  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    height: '',
    weight: '',
    bloodType: '',
    allergies: [],
    medications: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalConditions: [],
    preferredHospital: '',
    insuranceProvider: '',
    lastCheckup: ''
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
      setPersonalInfo({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
        gender: ''
      })
      fetchHealthProfile()
    }
  }, [user, token])

  const fetchHealthProfile = async () => {
    try {
      const response = await fetch('/api/health-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setHealthProfile(data.profile)
        }
        if (data.personalInfo) {
          setPersonalInfo(prev => ({ ...prev, ...data.personalInfo }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch health profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePersonalInfo = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personalInfo)
      })

      if (response.ok) {
        toast.success('Personal information updated successfully!')
        setEditingPersonal(false)
      } else {
        toast.error('Failed to update personal information')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateHealthProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/health-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(healthProfile)
      })

      if (response.ok) {
        toast.success('Health profile updated successfully!')
        setEditingHealth(false)
        fetchHealthProfile()
      } else {
        toast.error('Failed to update health profile')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addArrayItem = (field: 'allergies' | 'medications' | 'medicalConditions', value: string = '') => {
    setHealthProfile(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }))
  }

  const removeArrayItem = (field: 'allergies' | 'medications' | 'medicalConditions', index: number) => {
    setHealthProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: 'allergies' | 'medications' | 'medicalConditions', index: number, value: string) => {
    setHealthProfile(prev => {
      const newArray = [...prev[field]]
      newArray[index] = value
      return { ...prev, [field]: newArray }
    })
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
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
                <User className="h-8 w-8 text-teal-600 mr-3" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Health Profile</h1>
                  <p className="text-sm text-gray-600">Manage your personal health information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-6 w-6 text-teal-600 mr-2" />
              Personal Information
            </h2>
            {!editingPersonal ? (
              <button
                onClick={() => setEditingPersonal(true)}
                className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPersonal(false)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={updatePersonalInfo}
                  disabled={saving}
                  className="flex items-center space-x-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              {editingPersonal ? (
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{personalInfo.name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{personalInfo.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              {editingPersonal ? (
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{personalInfo.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date of Birth
              </label>
              {editingPersonal ? (
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                  {personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </label>
              {editingPersonal ? (
                <textarea
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{personalInfo.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Health Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Heart className="h-6 w-6 text-red-600 mr-2" />
              Health Information
            </h2>
            {!editingHealth ? (
              <button
                onClick={() => setEditingHealth(true)}
                className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingHealth(false)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={updateHealthProfile}
                  disabled={saving}
                  className="flex items-center space-x-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="h-4 w-4 inline mr-1" />
                  Height
                </label>
                {editingHealth ? (
                  <input
                    type="text"
                    value={healthProfile.height}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="e.g., 5'8 inches"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.height || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="h-4 w-4 inline mr-1" />
                  Weight
                </label>
                {editingHealth ? (
                  <input
                    type="text"
                    value={healthProfile.weight}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g., 150 lbs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.weight || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="h-4 w-4 inline mr-1" />
                  Blood Type
                </label>
                {editingHealth ? (
                  <select
                    value={healthProfile.bloodType}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, bloodType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.bloodType || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Last Checkup
                </label>
                {editingHealth ? (
                  <input
                    type="date"
                    value={healthProfile.lastCheckup}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, lastCheckup: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {healthProfile.lastCheckup ? new Date(healthProfile.lastCheckup).toLocaleDateString() : 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Provider
                </label>
                {editingHealth ? (
                  <input
                    type="text"
                    value={healthProfile.insuranceProvider}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                    placeholder="e.g., Blue Cross Blue Shield"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.insuranceProvider || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Hospital
                </label>
                {editingHealth ? (
                  <input
                    type="text"
                    value={healthProfile.preferredHospital}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, preferredHospital: e.target.value }))}
                    placeholder="e.g., City General Hospital"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.preferredHospital || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 text-red-500 mr-2" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  {editingHealth ? (
                    <input
                      type="text"
                      value={healthProfile.emergencyContact.name}
                      onChange={(e) => setHealthProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.emergencyContact.name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {editingHealth ? (
                    <input
                      type="tel"
                      value={healthProfile.emergencyContact.phone}
                      onChange={(e) => setHealthProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.emergencyContact.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  {editingHealth ? (
                    <input
                      type="text"
                      value={healthProfile.emergencyContact.relationship}
                      onChange={(e) => setHealthProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                      placeholder="e.g., Spouse, Parent"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{healthProfile.emergencyContact.relationship || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Lists */}
            {editingHealth && (
              <div className="space-y-6">
                {[
                  { key: 'allergies', label: 'Allergies', placeholder: 'e.g., Penicillin, Peanuts' },
                  { key: 'medications', label: 'Current Medications', placeholder: 'e.g., Lisinopril, Metformin' },
                  { key: 'medicalConditions', label: 'Medical Conditions', placeholder: 'e.g., Hypertension, Diabetes' }
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <div className="space-y-2">
                      {(healthProfile[key as 'allergies' | 'medications' | 'medicalConditions'] as string[]).map((item: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateArrayItem(key as any, index, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem(key as any, index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(key as any)}
                        className="text-teal-600 hover:text-teal-700 text-sm flex items-center"
                      >
                        + Add {label.slice(0, -1)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Display Lists when not editing */}
            {!editingHealth && (
              <div className="space-y-4">
                {[
                  { key: 'allergies', label: 'Allergies', color: 'yellow' },
                  { key: 'medications', label: 'Current Medications', color: 'blue' },
                  { key: 'medicalConditions', label: 'Medical Conditions', color: 'purple' }
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <h4 className="font-medium text-gray-900 mb-2">{label}:</h4>
                    {(healthProfile[key as 'allergies' | 'medications' | 'medicalConditions'] as string[]).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(healthProfile[key as 'allergies' | 'medications' | 'medicalConditions'] as string[]).map((item: string, idx: number) => (
                          <span 
                            key={idx} 
                            className={`px-2 py-1 bg-${color}-100 text-${color}-800 rounded text-sm`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">None recorded</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
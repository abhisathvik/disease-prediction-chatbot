'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  Phone, 
  Clock, 
  Star, 
  AlertCircle,
  ExternalLink
} from 'lucide-react'

// Define types for our data
interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  distance: string
  address: string
  phone: string
  hours: string
  acceptingPatients: boolean
}

export default function DoctorsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [userLocation, setUserLocation] = useState<string>('')
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [loadingLocation, setLoadingLocation] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Get user's location for nearby hospitals search
    if (navigator.geolocation) {
      setLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}`
            )
            const data = await response.json()
            if (data.results && data.results[0]) {
              setUserLocation(data.results[0].formatted)
            } else {
              setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
            }
          } catch (error) {
            setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
          
          // Fetch nearby doctors based on actual location
          await fetchNearbyDoctors(latitude, longitude)
          setLoadingLocation(false)
        },
        (error) => {
          console.error('Location access error:', error)
          let errorMessage = 'Location access denied'
          
          // Check if geolocation is supported and error code exists
          if (!navigator.geolocation) {
            errorMessage = 'Geolocation not supported by this browser'
          } else if (error.code) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services.'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable'
                break
              case error.TIMEOUT:
                errorMessage = 'Location request timed out'
                break
              default:
                errorMessage = 'Unknown location error'
                break
            }
          } else {
            errorMessage = 'Geolocation error without error code'
          }
          
          setLocationError(errorMessage)
          setUserLocation('Location unavailable')
          setLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      setLocationError('Geolocation is not supported by this browser')
      setUserLocation('Location not supported')
      setLoadingLocation(false)
    }
  }, [])

  const specialties = ['all', 'Family Medicine', 'Internal Medicine', 'Cardiology', 'Pediatrics', 'Dermatology', 'Orthopedics']

  const fetchNearbyDoctors = async (latitude: number, longitude: number) => {
    try {
      // This would typically call a real API like Google Places, Yelp, or a medical directory
      // For now, we'll simulate with mock data but add distance calculation
      const doctorsWithDistance = mockDoctors.map(doctor => {
        // Simulate random coordinates near the user (within ~10 miles)
        const doctorLat = latitude + (Math.random() - 0.5) * 0.2
        const doctorLng = longitude + (Math.random() - 0.5) * 0.2
        
        // Calculate distance using Haversine formula
        const distance = calculateDistance(latitude, longitude, doctorLat, doctorLng)
        
        return {
          ...doctor,
          distance: `${distance.toFixed(1)} mi`
        }
      })
      
      // Sort by distance
      doctorsWithDistance.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      setDoctors(doctorsWithDistance)
    } catch (error) {
      console.error('Failed to fetch nearby doctors:', error)
      setDoctors(mockDoctors) // Fallback to mock data
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const requestLocationAgain = () => {
    setLocationError('')
    setLoadingLocation(true)
    // Trigger location request again
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })
          setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          await fetchNearbyDoctors(latitude, longitude)
          setLoadingLocation(false)
        },
        () => {
          setLocationError('Location access still denied')
          setLoadingLocation(false)
        }
      )
    }
  }

  // Function to open external maps with nearby hospitals search
  const openNearbyHospitalsInMaps = () => {
    if (coordinates) {
      // Construct search query for nearby hospitals
      const searchQuery = `hospitals near ${coordinates.lat},${coordinates.lng}`
      
      // Try different map applications based on user agent
      const userAgent = navigator.userAgent
      
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        // iOS - Open Apple Maps
        window.open(`http://maps.apple.com/?q=${encodeURIComponent(searchQuery)}`, '_blank')
      } else if (/Android/.test(userAgent)) {
        // Android - Open Google Maps
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank')
      } else {
        // Desktop - Open Google Maps
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank')
      }
    } else {
      // Fallback - general hospital search
      window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
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
                <MapPin className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Find Doctors & Hospitals</h1>
                  <p className="text-sm text-gray-600">Locate nearby healthcare providers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{loadingLocation ? 'Getting your location...' : userLocation}</span>
              </div>
              {locationError && (
                <button
                  onClick={requestLocationAgain}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Try Again
                </button>
              )}
            </div>
            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">Location Required</p>
                    <p className="text-red-700 text-sm">{locationError}</p>
                    <p className="text-red-600 text-xs mt-1">This feature requires location access to find nearby doctors.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* External Maps Button */}
            <div className="mb-6">
              <button
                onClick={openNearbyHospitalsInMaps}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Find Nearby Hospitals in Maps
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Opens your device's default maps app to search for nearby hospitals and medical facilities
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Doctors
              </label>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or specialty..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Doctors List */}
        <div className="space-y-4">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                    {doctor.acceptingPatients && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Accepting Patients
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-600 font-medium mb-1">{doctor.specialty}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{doctor.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{doctor.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors mb-2">
                    Contact
                  </button>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-end mb-1">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{doctor.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">{doctor.address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Hours
                    </h4>
                    <p className="text-gray-600">{doctor.hours}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-200"
          >
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No doctors found matching your criteria.</p>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Find Real Hospitals & Medical Facilities
          </h3>
          <p className="text-blue-700 text-sm">
            Click the &quot;Find Nearby Hospitals in Maps&quot; button above to open your device&apos;s maps app 
            and search for actual hospitals, clinics, and medical facilities near your location. 
            This will show you real-time information including directions, hours, and contact details.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Mock doctor data for demonstration
const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    rating: 4.8,
    distance: '0.5 mi',
    address: '123 Health St, Medical Center',
    phone: '(555) 123-4567',
    hours: 'Mon-Fri: 8AM-6PM',
    acceptingPatients: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    rating: 4.9,
    distance: '1.2 mi',
    address: '456 Wellness Ave, Healthcare Plaza',
    phone: '(555) 234-5678',
    hours: 'Mon-Sat: 7AM-7PM',
    acceptingPatients: true
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Cardiology',
    rating: 4.7,
    distance: '2.1 mi',
    address: '789 Heart Blvd, Cardiac Institute',
    phone: '(555) 345-6789',
    hours: 'Mon-Fri: 9AM-5PM',
    acceptingPatients: false
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Pediatrics',
    rating: 4.6,
    distance: '2.8 mi',
    address: '321 Kids Lane, Childrens Medical',
    phone: '(555) 456-7890',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
    acceptingPatients: true
  }
]
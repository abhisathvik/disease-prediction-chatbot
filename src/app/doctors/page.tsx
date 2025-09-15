'use client'

import { useState, useEffect, useRef } from 'react'
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
  Map
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
  coordinates?: {
    lat: number,
    lng: number
  }
}

// Define types for Google Maps (only needed for type checking)
declare global {
  interface Window {
    initMap?: () => void
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google: any
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
  const [showMap, setShowMap] = useState(false)
  
  // Ref for the map container
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Get user's location - MANDATORY requirement
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
          distance: `${distance.toFixed(1)} mi`,
          coordinates: { lat: doctorLat, lng: doctorLng }
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
        (error) => {
          setLocationError('Location access still denied')
          setLoadingLocation(false)
        }
      )
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  // Load Google Maps script
  useEffect(() => {
    // Check if we have what we need to load the map
    if (showMap && coordinates && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script')
      script.id = 'google-maps-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
      script.async = true
      // For older browsers that don't support defer
      if (script.defer !== undefined) {
        script.defer = true
      }
      
      // Create a global callback function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).initMap = () => {
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: coordinates.lat, lng: coordinates.lng },
            zoom: 14,
            mapTypeId: 'roadmap'
          })

          // Add markers for doctors
          if (doctors && doctors.length > 0) {
            doctors.forEach((doctor: Doctor) => {
              if (doctor.coordinates) {
                new google.maps.Marker({
                  position: { lat: doctor.coordinates.lat, lng: doctor.coordinates.lng },
                  map: map,
                  title: doctor.name
                })
              }
            })
          }
        }
      }
      
      document.head.appendChild(script)
    }
    
    // Cleanup function to remove script when component unmounts or dependencies change
    return () => {
      const existingScript = document.getElementById('google-maps-script')
      if (existingScript) {
        existingScript.remove()
      }
      // Remove the global callback to prevent memory leaks
      if ('initMap' in window) {
        delete window.initMap
      }
    }
  }, [showMap, coordinates, doctors])

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
                  <h1 className="text-lg font-semibold text-gray-900">Find Doctors</h1>
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
            <div className="mb-6">
              <button
                onClick={() => setShowMap(!showMap)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Map className="h-5 w-5 mr-2" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
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

        {/* Map Container */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 h-96 relative"
          >
            <div ref={mapRef} className="w-full h-full rounded-lg" />
            {coordinates && (
              <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Your Location</p>
                <p className="text-xs text-gray-500">Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}</p>
              </div>
            )}
          </motion.div>
        )}

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

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Note about Doctor Search
          </h3>
          <p className="text-blue-700 text-sm">
            This is a demo feature showing mock doctor data. In a real implementation, 
            this would integrate with healthcare provider APIs and real location services 
            to show actual doctors in your area.
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
    address: '321 Kids Lane, Children\'s Medical',
    phone: '(555) 456-7890',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
    acceptingPatients: true
  }
]
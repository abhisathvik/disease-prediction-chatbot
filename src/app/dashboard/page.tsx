'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Activity, 
  History, 
  User, 
  LogOut, 
  Stethoscope,
  Brain,
  Heart,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!isClient) return
    
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [isClient])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const dashboardItems = [
    {
      title: 'AI Chat Assistant',
      description: 'Get instant medical advice and health guidance',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Disease Prediction',
      description: 'Analyze symptoms and predict possible conditions',
      icon: Brain,
      href: '/predict',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Medical History',
      description: 'View and manage your health records',
      icon: History,
      href: '/history',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Health Monitoring',
      description: 'Track symptoms and health patterns',
      icon: Activity,
      href: '/monitoring',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Find Doctors',
      description: 'Locate nearby healthcare providers',
      icon: MapPin,
      href: '/doctors',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Health Profile',
      description: 'Manage your personal health information',
      icon: User,
      href: '/profile',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">MedBot AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {greeting}, {user.name}!
            </h2>
            <p className="text-lg text-gray-600">
              How can I help you with your health today?
            </p>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <div className={`${item.bgColor} rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group hover:shadow-lg`}>
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Start a Health Consultation</h3>
              <p className="text-blue-100 mb-4">
                Get instant AI-powered medical guidance tailored to your health history
              </p>
              <Link href="/chat">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Start Chatting
                </button>
              </Link>
            </div>
            <div className="hidden md:block">
              <Stethoscope className="h-24 w-24 text-blue-300" />
            </div>
          </div>
        </motion.div>

        {/* Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-8 bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">💧</div>
              <h4 className="font-medium text-gray-900">Stay Hydrated</h4>
              <p className="text-sm text-gray-600">Drink 8-10 glasses of water daily</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🏃‍♂️</div>
              <h4 className="font-medium text-gray-900">Stay Active</h4>
              <p className="text-sm text-gray-600">30 minutes of exercise daily</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">😴</div>
              <h4 className="font-medium text-gray-900">Sleep Well</h4>
              <p className="text-sm text-gray-600">7-9 hours of quality sleep</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
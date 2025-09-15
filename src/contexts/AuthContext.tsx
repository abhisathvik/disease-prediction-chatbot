'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserPayload } from '@/lib/auth'

interface AuthContextType {
  user: UserPayload | null
  token: string | null
  login: (token: string, user: UserPayload) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      verifyStoredToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [isClient])

  const verifyStoredToken = async (storedToken: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(storedToken)
      } else {
        if (isClient) {
          localStorage.removeItem('token')
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      if (isClient) {
        localStorage.removeItem('token')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newToken: string, userData: UserPayload) => {
    setToken(newToken)
    setUser(userData)
    if (isClient) {
      localStorage.setItem('token', newToken)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    if (isClient) {
      localStorage.removeItem('token')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
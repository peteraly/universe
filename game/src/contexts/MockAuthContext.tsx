import React, { createContext, useContext, useState } from 'react'
import { currentMockUser, mockUsers, MockUser } from '../lib/mockData'

interface MockAuthContextType {
  user: MockUser | null
  firebaseUser: any
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
  switchUser: (userId: string) => void
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

export const useMockAuth = () => {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(currentMockUser)
  const [loading] = useState(false)

  const signInWithGoogle = async () => {
    // Simulate Google sign in by setting to Alex Chen
    setUser(currentMockUser)
  }

  const signInAnonymously = async () => {
    // Simulate anonymous sign in
    setUser({
      id: 'anonymous_user',
      displayName: 'Anonymous User',
      email: 'anonymous@example.com',
      createdAt: new Date()
    })
  }

  const signOut = async () => {
    setUser(null)
  }

  const switchUser = (userId: string) => {
    const newUser = mockUsers.find(u => u.id === userId)
    if (newUser) {
      setUser(newUser)
    }
  }

  const value = {
    user,
    firebaseUser: user,
    loading,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    switchUser
  }

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
}

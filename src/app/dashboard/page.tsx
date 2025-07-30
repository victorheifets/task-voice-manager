'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) return null
  
  if (!user) {
    return <LoginForm />
  }

  // Redirect to main app if authenticated
  redirect('/')
}
'use client'

import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { AIChatSearch } from '@/components/search/AIChatSearch'
import { ScrollButton } from '@/components/layout/ScrollButton'
import { useAuth } from '@/lib/store'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { useNotificationPolling } from '@/hooks/useNotifications'

export function Providers({ children }: { children: React.ReactNode }) {
  const { loadUser, isAuthenticated, isLoading } = useAuth()

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
      return () => disconnectSocket()
    }
  }, [isAuthenticated])

  // Poll for notifications and show toast popups
  useNotificationPolling()

  // Listen for forced logout
  useEffect(() => {
    const handler = () => useAuth.getState().logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-[calc(100dvh-3.5rem)] pt-14 pb-16 md:pb-0 overflow-x-hidden">
        <div className="w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </main>
      <BottomNav />
      <ScrollButton />
      <AIChatSearch />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--surface-0)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </>
  )
}

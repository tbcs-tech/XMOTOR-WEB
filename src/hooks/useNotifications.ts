'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/store'
import { notifications as notifApi } from '@/lib/api'
import toast from 'react-hot-toast'

const ICONS: Record<string, string> = {
  bid_received: '🔨', bid_accepted: '✅', bid_rejected: '❌',
  vehicle_approved: '🚗', account_approved: '👤',
}

export function useNotificationPolling() {
  const { isAuthenticated } = useAuth()
  const lastCount = useRef(0)
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) { lastCount.current = 0; initialized.current = false; return }

    const poll = async () => {
      try {
        const res = await notifApi.count()
        if (initialized.current && res.unread_count > lastCount.current) {
          const detail = await notifApi.list(true, 3)
          for (const n of detail.notifications.slice(0, res.unread_count - lastCount.current)) {
            toast(n.title, { icon: ICONS[n.type] || '🔔', duration: 5000, style: { borderLeft: '4px solid #ff8c1a' } })
          }
        }
        lastCount.current = res.unread_count
        initialized.current = true
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated])
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { notifications as notifApi } from '@/lib/api'
import { Button, Card, Skeleton } from '@/components/ui'
import { timeAgo } from '@/lib/utils'
import { Bell, CheckCheck, Gavel, CarFront, Shield, UserCheck, Trash2 } from 'lucide-react'

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  bid_received: { icon: <Gavel className="w-4 h-4" />, color: 'bg-brand-50 text-brand-600' },
  bid_accepted: { icon: <Gavel className="w-4 h-4" />, color: 'bg-green-50 text-green-600' },
  bid_rejected: { icon: <Gavel className="w-4 h-4" />, color: 'bg-red-50 text-red-600' },
  vehicle_approved: { icon: <CarFront className="w-4 h-4" />, color: 'bg-green-50 text-green-600' },
  vehicle_rejected: { icon: <CarFront className="w-4 h-4" />, color: 'bg-red-50 text-red-600' },
  estimation_confirmed: { icon: <Shield className="w-4 h-4" />, color: 'bg-teal-50 text-teal-600' },
  account_approved: { icon: <UserCheck className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push('/auth/login'); return }
    if (isAuthenticated) load()
  }, [isAuthenticated, isLoading])

  const load = () => {
    setLoading(true)
    notifApi.list(false, 50).then(r => setNotifications(r.notifications)).finally(() => setLoading(false))
  }

  const markAllRead = async () => {
    await notifApi.markAllRead()
    load()
  }

  if (!isAuthenticated) return null

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl">Notifications</h1>
            <p className="text-xs text-[var(--text-muted)]">{notifications.filter(n => !n.is_read).length} unread</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <Button size="sm" variant="secondary" onClick={markAllRead}>
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">All caught up</h2>
            <p className="text-sm text-[var(--text-muted)]">No notifications yet. They'll appear here when you receive bids, approvals, or updates.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const type = TYPE_ICONS[n.type] || { icon: <Bell className="w-4 h-4" />, color: 'bg-[var(--surface-1)] text-[var(--text-muted)]' }
              return (
                <Card key={n.id} className={`p-3.5 transition-all ${!n.is_read ? 'border-l-4 border-l-brand-500 bg-brand-50/20' : 'opacity-70'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${type.color}`}>
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.is_read ? 'font-medium' : ''}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

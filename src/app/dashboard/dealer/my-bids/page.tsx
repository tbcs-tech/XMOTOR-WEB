'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { bids as bidsApi } from '@/lib/api'
import { Card, Badge, Skeleton, Button } from '@/components/ui'
import { formatPrice, getVehicleImage, timeAgo } from '@/lib/utils'
import { Gavel, Trophy, Clock, XCircle } from 'lucide-react'

export default function MyBidsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    bidsApi.mine().then(r => setItems(r.bids || [])).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? items : items.filter(b => b.status === filter)

  const counts = {
    all: items.length,
    pending: items.filter(b => b.status === 'pending').length,
    accepted: items.filter(b => b.status === 'accepted').length,
    rejected: items.filter(b => b.status === 'rejected').length,
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard/dealer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">My Bids</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{items.length} bids placed</p>
          <div className="flex gap-1.5 mt-3">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-brand-500 text-white' : 'bg-[var(--surface-1)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />) :
        filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Gavel className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No bids{filter !== 'all' ? ` with status "${filter}"` : ''}</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Browse individual listings and place bids to source inventory.</p>
            <Link href="/dashboard/dealer/browse"><Button>Browse Listings</Button></Link>
          </Card>
        ) : filtered.map(b => (
          <Card key={b.id} className={`p-4 border-l-4 ${b.status === 'pending' ? 'border-l-amber-400' : b.status === 'accepted' ? 'border-l-green-500' : 'border-l-red-300 opacity-70'}`}>
            <div className="flex items-center gap-3">
              <div className="w-16 h-14 rounded-xl bg-[var(--surface-1)] overflow-hidden shrink-0">
                {b.vehicle && getVehicleImage(b.vehicle.images) ? <img src={getVehicleImage(b.vehicle.images)!} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xl">🚗</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{b.vehicle?.title || 'Vehicle'}</p>
                <p className="text-xs text-[var(--text-muted)]">{b.vehicle ? `${b.vehicle.year} · ${b.vehicle.fuel_type}` : ''} · {timeAgo(b.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-lg text-brand-500">{formatPrice(b.amount)}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  {b.status === 'pending' && <><Clock className="w-3 h-3 text-amber-500" /><span className="text-[10px] text-amber-600 font-medium">Pending</span></>}
                  {b.status === 'accepted' && <><Trophy className="w-3 h-3 text-green-500" /><span className="text-[10px] text-green-600 font-bold">You Won!</span></>}
                  {b.status === 'rejected' && <><XCircle className="w-3 h-3 text-red-400" /><span className="text-[10px] text-red-500 font-medium">Outbid</span></>}
                </div>
              </div>
            </div>
            {b.message && <p className="text-xs text-[var(--text-muted)] italic mt-2 bg-[var(--surface-1)] p-2 rounded-lg">"{b.message}"</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { vehicles as vehiclesApi } from '@/lib/api'
import { Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, timeAgo } from '@/lib/utils'

export default function AdminBidsPage() {
  const [allBids, setAllBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all vehicles and collect their bids
    vehiclesApi.list({ per_page: 100 }).then(async (r) => {
      const bidsList: any[] = []
      // Fetch bids for each vehicle that has them
      for (const v of r.items.slice(0, 20)) {
        try {
          const detail = await vehiclesApi.get(v.id)
          if (detail.bids && detail.bids.length > 0) {
            for (const b of detail.bids) {
              bidsList.push({ ...b, vehicle: v })
            }
          }
        } catch {}
      }
      bidsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setAllBids(bidsList)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/dashboard/admin" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Bid Activity</h1>
          <p className="text-white/50 text-sm mt-1">{allBids.length} bids across all vehicles</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : allBids.length === 0 ? (
          <Card className="p-12 text-center"><p className="text-sm text-[var(--text-muted)]">No bids yet.</p></Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Vehicle</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Dealer</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Bid Amount</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allBids.map((b, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-1)]">
                      <td className="p-3">
                        <Link href={`/vehicle/${b.vehicle_id}`} className="hover:text-brand-500">
                          <p className="font-medium truncate max-w-[200px]">{b.vehicle?.title || `Vehicle #${b.vehicle_id}`}</p>
                          <p className="text-xs text-[var(--text-muted)]">Asking: {b.vehicle ? formatPrice(b.vehicle.price) : '—'}</p>
                        </Link>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{b.store?.name || b.bidder?.full_name || 'Dealer'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{b.store?.city || ''}</p>
                      </td>
                      <td className="p-3 font-display font-bold text-brand-500">{formatPrice(b.amount)}</td>
                      <td className="p-3"><Badge variant={b.status === 'pending' ? 'warning' : b.status === 'accepted' ? 'success' : 'danger'}>{b.status}</Badge></td>
                      <td className="p-3 text-[var(--text-muted)]">{timeAgo(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

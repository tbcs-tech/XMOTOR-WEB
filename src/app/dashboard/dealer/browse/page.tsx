'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi } from '@/lib/api'
import { Card, Button, Badge, Skeleton } from '@/components/ui'
import { formatPrice, formatMileage, getVehicleImage, timeAgo } from '@/lib/utils'
import { Search, Gavel, MapPin, Calendar, Gauge, Fuel, Eye } from 'lucide-react'

export default function BrowsePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    setLoading(true)
    vehiclesApi.list({ per_page: 50, sort: sortBy }).then(r => {
      setItems(r.items.filter((v: any) => v.listing_type === 'bid' && v.status === 'approved'))
    }).finally(() => setLoading(false))
  }, [sortBy])

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard/dealer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Browse & Bid</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{items.length} vehicles open for bidding</p>
          <div className="flex items-center gap-2 mt-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-8 px-2 rounded-lg border border-[var(--border)] text-xs bg-[var(--surface-0)]">
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No listings available</h2>
            <p className="text-sm text-[var(--text-muted)]">Check back later for new individual listings open for bidding.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(v => (
              <Card key={v.id} className="p-0 overflow-hidden hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full h-40 sm:w-40 sm:h-28 bg-[var(--surface-1)] shrink-0 overflow-hidden">
                    {getVehicleImage(v.images) ? <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-3xl opacity-20">🚗</div>}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <h3 className="font-medium text-sm truncate">{v.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{v.year}</span>
                      <span className="flex items-center gap-0.5"><Gauge className="w-3 h-3" />{formatMileage(v.mileage)}</span>
                      <span className="flex items-center gap-0.5"><Fuel className="w-3 h-3" />{v.fuel_type}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Asking</p>
                        <p className="font-display font-bold text-brand-500">{formatPrice(v.price)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-1)] font-medium">{v.bid_count || 0} bids</span>
                        {v.city && <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center justify-end gap-0.5"><MapPin className="w-2.5 h-2.5" />{v.city}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 sm:pr-3 sm:p-0 border-t sm:border-t-0 border-[var(--border)]">
                    <Link href={`/dashboard/dealer/bid/${v.id}`}>
                      <Button size="sm"><Gavel className="w-3.5 h-3.5" /> Bid</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

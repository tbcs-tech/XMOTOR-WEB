'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { stores as storesApi } from '@/lib/api'
import { Badge, Card, Skeleton } from '@/components/ui'
import { MapPin, Star, BadgeCheck, Phone, Globe } from 'lucide-react'

export default function AdminStoresPage() {
  const [storesList, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storesApi.list().then(r => setStores(r.stores)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/dashboard/admin" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Dealer Stores</h1>
          <p className="text-white/50 text-sm mt-1">{storesList.length} registered dealerships</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? <Skeleton className="h-64 rounded-2xl" /> : (
          <div className="space-y-3">
            {storesList.map(store => (
              <Card key={store.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-lg shrink-0">
                    {store.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-sm">{store.name}</h3>
                      {store.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                      {store.is_featured && <Badge variant="brand">Featured</Badge>}
                    </div>
                    {store.tagline && <p className="text-xs text-[var(--text-muted)] italic">{store.tagline}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.city}, {store.state}</span>
                      {store.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {store.phone}</span>}
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {store.rating} ({store.review_count} reviews)</span>
                    </div>
                    {store.description && <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">{store.description}</p>}
                  </div>
                  <Link href={`/dealer/${store.slug}`} className="px-3 py-1.5 rounded-lg bg-[var(--surface-1)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] shrink-0">
                    View →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

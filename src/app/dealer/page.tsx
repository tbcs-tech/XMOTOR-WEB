'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { stores as storesApi } from '@/lib/api'
import { Card, Skeleton } from '@/components/ui'
import { BadgeCheck, MapPin, Star } from 'lucide-react'

export default function DealersPage() {
  const [storesList, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storesApi.list().then(r => setStores(r.stores)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-2xl mb-2">Verified Dealers</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Trusted dealerships across India</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storesList.map(store => (
            <Link key={store.id} href={`/dealer/${store.slug}`}>
              <Card className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-lg">
                    {store.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-1">
                      {store.name}
                      {store.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {store.city}{store.state ? `, ${store.state}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{store.rating}</span>
                  <span className="text-[var(--text-muted)]">· {store.review_count} reviews</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

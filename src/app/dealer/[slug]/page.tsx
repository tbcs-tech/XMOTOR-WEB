'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { stores as storesApi } from '@/lib/api'
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard'
import { Card, Skeleton, Badge } from '@/components/ui'
import { BadgeCheck, MapPin, Phone, Globe, Clock, Star } from 'lucide-react'

export default function DealerDetailPage() {
  const { slug } = useParams()
  const [store, setStore] = useState<any>(null)
  const [storeVehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storesApi.get(slug as string)
      .then(r => { setStore(r.store); setVehicles(r.vehicles) })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <VehicleCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!store) return <div className="max-w-5xl mx-auto px-4 py-16 text-center"><p>Dealer not found</p></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-2xl shrink-0">
            {store.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              {store.name}
              {store.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
              {store.is_featured && <Badge variant="brand">Featured</Badge>}
            </h1>
            {store.tagline && <p className="text-sm text-[var(--text-secondary)] mt-1">{store.tagline}</p>}
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {store.city}, {store.state}</span>
              {store.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {store.phone}</span>}
              {store.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {store.website}</span>}
              {store.hours && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {store.hours}</span>}
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{store.rating}</span>
              <span className="text-sm text-[var(--text-muted)]">· {store.review_count} reviews</span>
            </div>
            {/* Contact buttons */}
            <div className="flex gap-2 mt-4">
              {store.phone && (
                <>
                  <a href={`tel:${store.phone}`} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a href={`https://wa.me/91${store.phone?.replace(/\D/g, '').replace(/^91/, '')}?text=${encodeURIComponent(`Hi, I found your dealership on XMotor. I'd like to know more about your available vehicles.`)}`} target="_blank" rel="noopener"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5" style={{ background: '#25d366' }}>
                    💬 WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        {store.description && <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed">{store.description}</p>}
      </Card>

      <h2 className="font-display font-bold text-lg mb-4">Vehicles ({storeVehicles.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {storeVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
        {storeVehicles.length === 0 && (
          <p className="col-span-full text-center py-8 text-sm text-[var(--text-muted)]">No vehicles listed yet</p>
        )}
      </div>
    </div>
  )
}

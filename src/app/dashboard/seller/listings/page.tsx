'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { VehiclePlaceholder } from '@/components/vehicles/VehiclePlaceholder'
import { formatPrice, getVehicleImage, timeAgo } from '@/lib/utils'
import { Plus, Eye, Edit, Gavel, Shield, MapPin } from 'lucide-react'

export default function ListingsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { vehiclesApi.mine().then(r => setItems(r.items)).finally(() => setLoading(false)) }, [])

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/dashboard/seller" className="text-xs text-[var(--text-muted)]">← Dashboard</Link>
            <h1 className="font-display font-bold text-xl mt-1">My Listings</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{items.length} vehicles listed</p>
          </div>
          <Link href="/dashboard/seller/sell"><Button size="sm"><Plus className="w-4 h-4" /> New Listing</Button></Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? <Skeleton className="h-64 rounded-2xl" /> :
        items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">🚗</div>
            <h2 className="font-display font-bold text-xl mb-2">No listings yet</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">List your vehicle and receive bids from verified dealers within 48 hours.</p>
            <Link href="/dashboard/seller/sell"><Button>List your first vehicle</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(v => (
              <Card key={v.id} className={`p-0 overflow-hidden ${v.status === 'rejected' ? 'opacity-60' : ''}`}>
                <div className="flex">
                  <div className="w-28 h-24 sm:w-36 bg-[var(--surface-1)] shrink-0 overflow-hidden">
                    {getVehicleImage(v.images) ? <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" /> : <VehiclePlaceholder bodyType={v.body_type} color={v.exterior_color} />}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate flex-1">{v.title}</h3>
                      <Badge variant={v.status === 'approved' ? 'success' : v.status === 'pending' ? 'warning' : 'danger'}>{v.status}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{v.year} · {v.fuel_type} · {v.mileage?.toLocaleString()} km</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-display font-bold text-brand-500">{formatPrice(v.price)}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {v.views || 0}</span>
                        <span className="flex items-center gap-0.5"><Gavel className="w-3 h-3" /> {v.bid_count || 0} bids</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-1 pr-3">
                    <Link href={`/dashboard/seller/vehicle/${v.id}/edit`} className="p-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"><Edit className="w-4 h-4 text-[var(--text-muted)]" /></Link>
                    <Link href={`/vehicle/${v.id}`} className="p-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"><Eye className="w-4 h-4 text-[var(--text-muted)]" /></Link>
                    <Link href={`/dashboard/seller/estimation/book/${v.id}`} className="p-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"><Shield className="w-4 h-4 text-[var(--text-muted)]" /></Link>
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

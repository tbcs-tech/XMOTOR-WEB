'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { vehicles as vehiclesApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, getVehicleImage } from '@/lib/utils'
import { Plus, Eye, Edit, Package } from 'lucide-react'

export default function DealerInventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { vehiclesApi.mine().then(r => setItems(r.items)).finally(() => setLoading(false)) }, [])

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard/dealer" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
            <h1 className="font-display font-bold text-xl mt-1">My Inventory</h1>
            <p className="text-white/50 text-sm mt-1">{items.length} vehicles in your showroom</p>
          </div>
          <Link href="/dashboard/dealer/add-vehicle"><Button size="sm"><Plus className="w-4 h-4" /> Add Vehicle</Button></Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? <Skeleton className="h-64 rounded-2xl" /> : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">Inventory empty</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Add vehicles from your showroom to list them on XMotor.</p>
            <Link href="/dashboard/dealer/add-vehicle"><Button>Add your first vehicle</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(v => (
              <Card key={v.id} className="p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full h-40 sm:w-36 sm:h-24 bg-[var(--surface-1)] shrink-0 overflow-hidden">
                    {getVehicleImage(v.images) ? <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-2xl opacity-20">🚗</div>}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate flex-1">{v.title}</h3>
                      <Badge variant={v.status === 'approved' ? 'success' : v.status === 'pending' || v.status === 'store_only' ? 'warning' : 'default'}>{v.status}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{v.year} · {v.fuel_type} · {v.mileage?.toLocaleString()} km</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-display font-bold text-brand-500">{formatPrice(v.price)}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {v.views || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col justify-start sm:justify-center gap-1 p-3 sm:pr-3 sm:p-0 sm:py-3 border-t sm:border-t-0 border-[var(--border)]">
                    <Link href={`/vehicle/${v.id}`} className="p-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"><Eye className="w-4 h-4 text-[var(--text-muted)]" /></Link>
                    <Link href={`/dashboard/dealer/add-vehicle`} className="p-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"><Edit className="w-4 h-4 text-[var(--text-muted)]" /></Link>
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

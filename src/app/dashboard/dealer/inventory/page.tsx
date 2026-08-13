'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { vehicles as vehiclesApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { VehiclePlaceholder } from '@/components/vehicles/VehiclePlaceholder'
import { formatPrice, getVehicleImage } from '@/lib/utils'
import { Plus, Eye, Edit, Package , ImagePlus } from 'lucide-react'

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
          <Card><div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
              <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Vehicle</th>
              <th className="p-3 text-xs text-left">Price</th>
              <th className="p-3 text-xs text-left">Status</th>
              <th className="p-3 text-xs text-left">Views</th>
              <th className="p-3 text-xs text-right">Actions</th>
            </tr></thead>
            <tbody>{items.map(v => (
              <tr key={v.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-1)]">
                <td className="p-3"><div className="flex items-center gap-3"><div className="w-14 h-10 rounded-lg bg-[var(--surface-1)] overflow-hidden shrink-0">{getVehicleImage(v.images) ? <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" /> : <VehiclePlaceholder bodyType={v.body_type} color={v.exterior_color} />}</div><div><p className="font-medium text-sm truncate max-w-[250px]">{v.title}</p><p className="text-xs text-[var(--text-muted)]">{v.year} · {v.fuel_type} · {v.mileage?.toLocaleString()} km</p>
                  {!getVehicleImage(v.images) && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium">
                      <ImagePlus className="w-3 h-3" /> Add photos — listings with photos get far more enquiries
                    </span>
                  )}</div></div></td>
                <td className="p-3 font-display font-bold text-brand-500">{formatPrice(v.price)}</td>
                <td className="p-3"><Badge variant={v.status === 'approved' ? 'success' : v.status === 'pending' || v.status === 'store_only' ? 'warning' : 'default'}>{v.status}</Badge></td>
                <td className="p-3 text-[var(--text-muted)]">{v.views || 0}</td>
                <td className="p-3 text-right"><div className="flex justify-end gap-1"><Link href={`/vehicle/${v.id}`} className="p-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"><Eye className="w-4 h-4 text-[var(--text-muted)]" /></Link></div></td>
              </tr>
            ))}</tbody>
          </table></div></Card>
        )}
      </div>
    </div>
  )
}

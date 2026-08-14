'use client'
// @ts-nocheck

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi } from '@/lib/api'
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard'
import { Card, Button } from '@/components/ui'
import { Heart, Search } from 'lucide-react'

// Wishlist stored in localStorage (no backend needed for MVP)
function getSavedIds(): number[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('xm_saved') || '[]') } catch { return [] }
}

function toggleSaved(vehicleId: number): boolean {
  const ids = getSavedIds()
  const idx = ids.indexOf(vehicleId)
  if (idx >= 0) { ids.splice(idx, 1) } else { ids.push(vehicleId) }
  localStorage.setItem('xm_saved', JSON.stringify(ids))
  window.dispatchEvent(new Event('xm_saved_change'))
  return idx < 0 // true if newly saved
}

function isSaved(vehicleId: number): boolean {
  return getSavedIds().includes(vehicleId)
}

export default function SavedPage() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const ids = getSavedIds()
    if (ids.length === 0) { setItems([]); setLoading(false); return }
    try {
      const results = await Promise.all(ids.map(id => vehiclesApi.get(id).then(r => r.vehicle).catch(() => null)))
      setItems(results.filter(Boolean))
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    window.addEventListener('xm_saved_change', load)
    return () => window.removeEventListener('xm_saved_change', load)
  }, [])

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-display font-bold text-xl">Saved vehicles</h1>
          <p className="text-white/50 text-sm mt-1">{items.length} vehicles saved</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <VehicleCardSkeleton key={i} />)}</div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No saved vehicles</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Browse vehicles and tap the heart icon to save them here.</p>
            <Link href="/buy"><Button><Search className="w-4 h-4" /> Browse vehicles</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
      </div>
    </div>
  )
}

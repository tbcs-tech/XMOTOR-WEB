'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { vehicles as vehiclesApi, search as searchApi } from '@/lib/api'
import { useCity } from '@/lib/store'
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard'
import { Button, Badge, Card } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { SlidersHorizontal, X, Store, Shield, MapPin } from 'lucide-react'

export default function BuyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { city: globalCity } = useCity()
  const [items, setItems] = useState<any[]>([])
  const [facets, setFacets] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCity = searchParams.get('city') || (globalCity !== 'All India' ? globalCity : '')

  const filters = {
    make: searchParams.get('make') || '',
    city: activeCity,
    fuel_type: searchParams.get('fuel_type') || '',
    body_type: searchParams.get('body_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      vehiclesApi.list({ ...filters, per_page: 50 }),
      facets ? Promise.resolve(facets) : searchApi.facets(),
    ]).then(([vRes, fRes]) => {
      // Buy page shows all approved vehicles — both dealer (sale) and individual (bid)
      setItems(vRes.items)
      if (!facets) setFacets(fRes)
    }).finally(() => setLoading(false))
  }, [searchParams])

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    router.push(`/buy?${params.toString()}`)
  }

  const hasFilters = !!(filters.make || filters.city || filters.fuel_type || filters.body_type)

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-display font-extrabold text-3xl">Buy from verified dealers</h1>
          <p className="text-white/60 mt-2 max-w-lg text-sm">Browse pre-owned vehicles from XMotor's verified dealer network. Every vehicle is dealer-inspected. Enquire directly — no middlemen.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="popular">Popular</option>
          </select>

          {facets?.makes && (
            <select value={filters.make} onChange={e => setFilter('make', e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
              <option value="">All brands</option>
              {facets.makes.map((m: any) => <option key={m.value} value={m.value}>{m.value} ({m.count})</option>)}
            </select>
          )}

          {facets?.cities && (
            <select value={filters.city} onChange={e => setFilter('city', e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
              <option value="">All cities</option>
              {facets.cities.map((c: any) => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
          )}

          {facets?.fuel_types && (
            <select value={filters.fuel_type} onChange={e => setFilter('fuel_type', e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
              <option value="">All fuels</option>
              {facets.fuel_types.map((f: any) => <option key={f.value} value={f.value}>{f.value}</option>)}
            </select>
          )}

          {hasFilters && (
            <button onClick={() => router.push('/buy')} className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100">
              <X className="w-3 h-3 inline mr-1" />Clear
            </button>
          )}

          <span className="ml-auto text-xs text-[var(--text-muted)]">{items.length} vehicles</span>
        </div>

        {/* Vehicle grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Store className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No vehicles found</h2>
            <p className="text-sm text-[var(--text-muted)]">Try different filters or check back later.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(v => <VehicleCard key={v.id} vehicle={v} showBidInfo={false} />)}
          </div>
        )}
      </div>
    </div>
  )
}

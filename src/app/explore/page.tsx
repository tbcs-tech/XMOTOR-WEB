'use client'
// @ts-nocheck

import React, { useEffect, useState, useCallback , Suspense} from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { vehicles as vehiclesApi, search as searchApi } from '@/lib/api'
import { useCity } from '@/lib/store'
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard'
import { Button, Card } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, CarFront } from 'lucide-react'

const BODY_ICONS: Record<string, string> = { 'Hatchback': '🚙', 'Sedan': '🚗', 'SUV': '🚙', 'MUV/MPV': '🚐', 'Coupe': '🏎️', 'Pickup Truck': '🛻' }
const FUEL_ICONS: Record<string, string> = { 'Petrol': '⛽', 'Diesel': '🛢️', 'Electric': '⚡', 'Hybrid': '🔋', 'CNG': '💨', 'LPG': '🔥' }
const BRAND_ICONS: Record<string, string> = {
  'Maruti Suzuki': '🔵', 'Hyundai': '🔷', 'Tata': '🟦', 'Tata Motors': '🟦',
  'Mahindra': '🔴', 'Kia': '🟥', 'Toyota': '⬛', 'Honda': '🟡',
  'BMW': '⚪', 'Mercedes-Benz': '⭐', 'Audi': '🔘', 'Porsche': '🔲',
  'Volkswagen': '🔵', 'Skoda': '🟢', 'MG': '🔶', 'Volvo': '🔷',
}

const PRICE_MARKS = [0, 300000, 500000, 800000, 1200000, 2000000, 3500000, 5000000, 10000000, 20000000]
const PRICE_LABELS = ['0', '3L', '5L', '8L', '12L', '20L', '35L', '50L', '1Cr', '2Cr']

function ExplorePageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { city: globalCity, setCity: setGlobalCity } = useCity()

  const [items, setItems] = useState<any[]>([])
  const [facets, setFacets] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [openSection, setOpenSection] = useState<string | null>('brand')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MARKS.length - 1])

  // Build filters from URL + global city
  const activeCity = searchParams.get('city') || (globalCity !== 'All India' ? globalCity : '')
  const make = searchParams.get('make') || ''
  const fuel_type = searchParams.get('fuel_type') || ''
  const body_type = searchParams.get('body_type') || ''
  const sort = searchParams.get('sort') || 'newest'
  const min_price = searchParams.get('min_price') || ''
  const max_price = searchParams.get('max_price') || ''

  const hasFilters = !!(make || fuel_type || body_type || activeCity || min_price || max_price)

  useEffect(() => {
    setLoading(true)
    const filters: any = { sort, per_page: 50 }
    if (make) filters.make = make
    if (fuel_type) filters.fuel_type = fuel_type
    if (body_type) filters.body_type = body_type
    if (activeCity) filters.city = activeCity
    if (min_price) filters.min_price = min_price
    if (max_price) filters.max_price = max_price

    Promise.all([
      vehiclesApi.list(filters),
      facets ? Promise.resolve(facets) : searchApi.facets(),
    ]).then(([vRes, fRes]) => {
      setItems(vRes.items)
      if (!facets) setFacets(fRes)
    }).finally(() => setLoading(false))
  }, [searchParams, globalCity])

  // Update URL params
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/explore?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  const clearFilter = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    if (key === 'city') setGlobalCity('All India')
    router.push(`/explore?${params.toString()}`, { scroll: false })
  }, [searchParams, router, setGlobalCity])

  const clearAll = useCallback(() => {
    setGlobalCity('All India')
    router.push('/explore', { scroll: false })
  }, [router, setGlobalCity])

  // Auto-apply price when slider changes (debounced)
  const priceTimerRef = React.useRef<any>(null)
  const updatePrice = useCallback((newRange: [number, number]) => {
    setPriceRange(newRange)
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current)
    priceTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (newRange[0] > 0) params.set('min_price', String(PRICE_MARKS[newRange[0]]))
      else params.delete('min_price')
      if (newRange[1] < PRICE_MARKS.length - 1) params.set('max_price', String(PRICE_MARKS[newRange[1]]))
      else params.delete('max_price')
      router.push(`/explore?${params.toString()}`, { scroll: false })
    }, 400)
  }, [searchParams, router])

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s)

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      {/* Header row: title left, count + sort + filter right */}
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display font-extrabold text-xl mb-2">Explore</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">{items.length} vehicles</span>
            <div className="flex-1" />
            <select value={sort} onChange={e => updateFilter('sort', e.target.value)}
              className="h-8 px-2 rounded-lg border border-[var(--border)] text-xs bg-[var(--surface-0)] font-medium">
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="popular">Popular</option>
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                filtersOpen ? 'bg-brand-500 text-white' : 'border border-[var(--border)] text-[var(--text-secondary)]'
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              {hasFilters && !filtersOpen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Active chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {make && <Chip label={make} onRemove={() => clearFilter('make')} />}
            {fuel_type && <Chip label={fuel_type} onRemove={() => clearFilter('fuel_type')} />}
            {body_type && <Chip label={body_type} onRemove={() => clearFilter('body_type')} />}
            {activeCity && <Chip label={activeCity} onRemove={() => clearFilter('city')} />}
            {(min_price || max_price) && <Chip label={`₹${min_price ? formatPrice(Number(min_price)) : '0'} – ${max_price ? formatPrice(Number(max_price)) : 'Any'}`} onRemove={() => { clearFilter('min_price'); clearFilter('max_price') }} />}
            <button onClick={clearAll} className="text-xs text-red-500 font-medium hover:underline ml-1">Clear all</button>
          </div>
        )}

        {/* Collapsible Filters */}
        {filtersOpen && (
          <Card className="mb-4 overflow-hidden animate-slide-up">
            <FilterSection title="Brand" icon="🚘" open={openSection === 'brand'} onToggle={() => toggleSection('brand')}>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3">
                {(facets?.makes || []).slice(0, 16).map((m: any) => (
                  <button key={m.value} onClick={() => updateFilter('make', make === m.value ? '' : m.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${make === m.value ? 'bg-brand-50 border-2 border-brand-500' : 'bg-[var(--surface-1)] border-2 border-transparent hover:border-brand-200'}`}>
                    <span className="text-lg">{BRAND_ICONS[m.value] || '🚗'}</span>
                    <span className="text-[9px] font-medium text-center leading-tight">{m.value.replace('Maruti Suzuki','Maruti').replace('Mercedes-Benz','Mercedes')}</span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Body Type" icon="🚙" open={openSection === 'body'} onToggle={() => toggleSection('body')}>
              <div className="flex gap-2 p-3 overflow-x-auto">
                {(facets?.body_types || []).map((b: any) => (
                  <button key={b.value} onClick={() => updateFilter('body_type', body_type === b.value ? '' : b.value)}
                    className={`flex flex-col items-center gap-1 min-w-[64px] p-2.5 rounded-xl transition-all ${body_type === b.value ? 'bg-brand-50 border-2 border-brand-500' : 'bg-[var(--surface-1)] border-2 border-transparent hover:border-brand-200'}`}>
                    <span className="text-xl">{BODY_ICONS[b.value] || '🚗'}</span>
                    <span className="text-[9px] font-medium">{b.value}</span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Fuel Type" icon="⛽" open={openSection === 'fuel'} onToggle={() => toggleSection('fuel')}>
              <div className="flex gap-2 p-3 overflow-x-auto">
                {(facets?.fuel_types || []).map((f: any) => (
                  <button key={f.value} onClick={() => updateFilter('fuel_type', fuel_type === f.value ? '' : f.value)}
                    className={`flex flex-col items-center gap-1 min-w-[56px] p-2.5 rounded-xl transition-all ${fuel_type === f.value ? 'bg-brand-50 border-2 border-brand-500' : 'bg-[var(--surface-1)] border-2 border-transparent hover:border-brand-200'}`}>
                    <span className="text-lg">{FUEL_ICONS[f.value] || '⛽'}</span>
                    <span className="text-[9px] font-medium">{f.value}</span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Price Range" icon="💰" open={openSection === 'price'} onToggle={() => toggleSection('price')}>
              <div className="p-4 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-sm font-display font-bold text-brand-500">
                    {PRICE_LABELS[priceRange[0]]} – {PRICE_LABELS[priceRange[1]]}
                  </span>
                </div>

                {/* Single track with two thumbs */}
                <div className="relative h-8 flex items-center">
                  {/* Track background */}
                  <div className="absolute inset-x-0 h-1.5 bg-[var(--surface-2)] rounded-full" />
                  {/* Active range highlight */}
                  <div className="absolute h-1.5 bg-brand-500 rounded-full" style={{
                    left: `${(priceRange[0] / (PRICE_MARKS.length - 1)) * 100}%`,
                    right: `${100 - (priceRange[1] / (PRICE_MARKS.length - 1)) * 100}%`,
                  }} />
                  {/* Min thumb */}
                  <input type="range" min={0} max={PRICE_MARKS.length - 1} value={priceRange[0]}
                    onChange={e => { const v = Number(e.target.value); if (v < priceRange[1]) updatePrice([v, priceRange[1]]) }}
                    className="absolute inset-x-0 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
                  />
                  {/* Max thumb */}
                  <input type="range" min={0} max={PRICE_MARKS.length - 1} value={priceRange[1]}
                    onChange={e => { const v = Number(e.target.value); if (v > priceRange[0]) updatePrice([priceRange[0], v]) }}
                    className="absolute inset-x-0 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                  />
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-1 px-0.5">
                  {PRICE_LABELS.map(l => <span key={l} className="text-[8px] text-[var(--text-muted)]">{l}</span>)}
                </div>
              </div>
            </FilterSection>
          </Card>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <CarFront className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No vehicles found</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Try adjusting your filters</p>
            <Button onClick={clearAll}>Clear filters</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterSection({ title, icon, open, onToggle, children }: { title: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-1)] transition-colors">
        <span className="flex items-center gap-2 text-sm font-medium"><span>{icon}</span> {title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
      </button>
      {open && <div className="border-t border-[var(--border)]">{children}</div>}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
      {label}
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove() }}
        className="w-4 h-4 rounded-full bg-brand-200 hover:bg-brand-300 flex items-center justify-center transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[var(--text-muted)]">Loading…</div>}>
      <ExplorePageInner />
    </Suspense>
  )
}

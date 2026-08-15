'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { vehicles as vehiclesApi, stores as storesApi, search as searchApi } from '@/lib/api'
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard'
import { Button, Card } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Shield, Gavel, Star, MapPin, BadgeCheck, ChevronRight, Sparkles, Clock } from 'lucide-react'
import { useCity } from '@/lib/store'

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([])
  const [dealers, setDealers] = useState<any[]>([])
  const [facets, setFacets] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const { city } = useCity()

  useEffect(() => {
    const params: any = { per_page: 12, sort: 'newest' }
    if (city && city !== 'All India') params.city = city

    // allSettled, not all: one failing endpoint should hide its own section,
    // not blank the entire homepage.
    Promise.allSettled([
      vehiclesApi.list(params),
      storesApi.list(),
      searchApi.facets(),
    ]).then(([v, s, f]) => {
      if (v.status === 'fulfilled') {
        setFeatured(v.value.items || [])
      } else {
        console.error('vehicles failed', v.reason)
        setLoadError(true)
      }
      if (s.status === 'fulfilled') setDealers(s.value.stores || [])
      if (f.status === 'fulfilled') setFacets(f.value)
    }).finally(() => setLoading(false))
  }, [city])

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl leading-tight max-w-lg">
            Sell your car.<br />
            <span className="text-brand-400">Dealers compete.</span><br />
            You win.
          </h1>
          <p className="text-white/50 mt-3 text-sm max-w-md leading-relaxed">
            India's smartest used vehicle marketplace. Buy from verified dealers or sell for the best price through competitive bidding.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/dashboard/seller/sell"><Button size="lg">Sell Your Car</Button></Link>
            <Link href="/buy"><Button size="lg" variant="secondary">Browse Cars</Button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Featured Vehicles */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base">Fresh listings</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Just added — be the first to bid</p>
            </div>
            <Link href="/explore" className="text-xs font-medium text-brand-500 flex items-center gap-1 hover:text-brand-600">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : loadError ? (
            <Card className="p-10 text-center">
              <p className="font-display font-bold">Couldn't load listings</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Something went wrong at our end. Please try again in a moment.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium"
              >
                Retry
              </button>
            </Card>
          ) : featured.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="font-display font-bold">No listings in {city} yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Be the first to list your vehicle here.
              </p>
              <Link href="/dashboard/seller/sell">
                <button className="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium">
                  Sell your car
                </button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featured.slice(0, 8).map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 md:p-6">
          <h2 className="font-display font-bold text-base text-center mb-5">Why XMotor?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: <Shield className="w-5 h-5" />, title: 'Verified sellers', desc: 'Identity checked' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'AI pricing', desc: 'Fair market value' },
              { icon: <Gavel className="w-5 h-5" />, title: 'Competitive bids', desc: 'Dealers compete' },
              { icon: <Clock className="w-5 h-5" />, title: '48hr avg sale', desc: 'Fast network' },
            ].map((t, i) => (
              <div key={i}>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-brand-300">{t.icon}</div>
                <h3 className="font-display font-bold text-sm">{t.title}</h3>
                <p className="text-white/40 text-xs">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Stories */}
        <div className="mt-10">
          <h2 className="font-display font-bold text-base mb-4">What our users say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Rahul M.', city: 'Mumbai', text: 'Sold my Creta in just 36 hours. Got 3 dealer bids and the final price was ₹40K above what I expected. The expert estimation helped a lot.', car: '2022 Hyundai Creta' },
              { name: 'Priya S.', city: 'Bangalore', text: 'As a first-time buyer, I loved how transparent everything was. The dealer was verified and the EMI calculator helped me plan my budget perfectly.', car: '2023 Maruti Swift' },
              { name: 'Vikram D.', city: 'Delhi', text: 'We registered as a dealer partner 6 months ago. XMotor has become our primary sourcing channel. The estimation certificates build real trust with sellers.', car: 'Dealer Partner' },
            ].map((t, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t.city} · {t.car}</p>
                  </div>
                  <div className="flex ml-auto">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">"{t.text}"</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Dealers */}
        {dealers.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base">Trusted dealers</h2>
              <Link href="/dealer" className="text-xs font-medium text-brand-500 flex items-center gap-1">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dealers.slice(0, 3).map(store => (
                <Link key={store.id} href={`/dealer/${store.slug}`}>
                  <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-lg shrink-0">{store.name?.charAt(0)}</div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm flex items-center gap-1 truncate">{store.name} {store.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}</h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.city} · <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {store.rating}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

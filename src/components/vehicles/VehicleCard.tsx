'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui'
import { formatPrice, formatMileage, getVehicleImage, listingAge, listingFreshness } from '@/lib/utils'
import { useAuth } from '@/lib/store'
import { Fuel, Gauge, Calendar, Eye, Gavel, BadgeCheck, MapPin, Heart, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { VehiclePlaceholder, NoPhotoTag } from './VehiclePlaceholder'
import type { Vehicle } from '@/types'

// Wishlist helpers
function getWishlist(): number[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('xm_saved') || '[]') } catch { return [] }
}
function toggleWishlist(id: number): boolean {
  const ids = getWishlist()
  const idx = ids.indexOf(id)
  if (idx >= 0) ids.splice(idx, 1); else ids.push(id)
  localStorage.setItem('xm_saved', JSON.stringify(ids))
  return idx < 0
}

interface VehicleCardProps {
  vehicle: Vehicle
  showBidInfo?: boolean
}

export function VehicleCard({ vehicle, showBidInfo = true }: VehicleCardProps) {
  const imageUrl = getVehicleImage(vehicle.images)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSaved(getWishlist().includes(vehicle.id)) }, [vehicle.id])

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast('Please sign in to save vehicles', { icon: '🔒' })
      router.push('/auth/login')
      return
    }
    const nowSaved = toggleWishlist(vehicle.id)
    setSaved(nowSaved)
    toast(nowSaved ? 'Saved to wishlist' : 'Removed from wishlist', { icon: nowSaved ? '❤️' : '💔', duration: 1500 })
  }

  return (
    <Link href={`/vehicle/${vehicle.id}`}>
      <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] bg-[var(--surface-1)] overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={vehicle.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <>
              <VehiclePlaceholder
                bodyType={vehicle.body_type}
                color={(vehicle as any).exterior_color}
                label={vehicle.title}
              />
              <NoPhotoTag />
            </>
          )}
          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {listingFreshness(vehicle.created_at) === 'new' && (
              <span className="px-2 py-0.5 rounded-md bg-green-500 text-white text-[10px] font-semibold shadow-sm">
                Just listed
              </span>
            )}
            {vehicle.is_featured && <Badge variant="brand">Featured</Badge>}
            {vehicle.listing_type === 'bid' && <Badge variant="warning">Open for Bids</Badge>}
          </div>
          {/* Top-right: dealer name */}
          {vehicle.store?.is_verified && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-medium text-green-700">
                <BadgeCheck className="w-3 h-3" /> {vehicle.store.name?.split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
          )}
          {/* Bottom-left: price */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-[var(--surface-0)]/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-lg font-display font-bold">{formatPrice(vehicle.price)}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors flex-1">{vehicle.title}</h3>
            {/* Heart in title row */}
            <button onClick={handleSave}
              className="w-7 h-7 rounded-full bg-[var(--surface-1)] flex items-center justify-center shrink-0 hover:bg-[var(--surface-2)] transition-all active:scale-90">
              <Heart className={`w-3.5 h-3.5 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-2 mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {vehicle.year}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {formatMileage(vehicle.mileage)}</span>
            <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" /> {vehicle.fuel_type || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 min-w-0">
              {showBidInfo && vehicle.listing_type === 'bid' ? (
                <span className="flex items-center gap-1 text-xs text-brand-600 font-medium truncate">
                  <Gavel className="w-3.5 h-3.5 shrink-0" /> {vehicle.bid_count || 0} bid{(vehicle.bid_count || 0) !== 1 ? 's' : ''}{vehicle.highest_bid ? ` · ${formatPrice(vehicle.highest_bid)}` : ''}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] truncate">
                  <MapPin className="w-3 h-3 shrink-0" /> {vehicle.store?.city || vehicle.city || 'India'}
                </span>
              )}
            </div>
            {vehicle.created_at && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] shrink-0">
                <Clock className="w-3 h-3" /> {listingAge(vehicle.created_at)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-3 w-1/2 shimmer rounded" />
        <div className="h-3 w-full shimmer rounded" />
      </div>
    </div>
  )
}

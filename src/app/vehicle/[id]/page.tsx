'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { vehicles as vehiclesApi, bids as bidsApi } from '@/lib/api'
import { useAuth } from '@/lib/store'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, formatMileage, timeAgo, listingAge, listingFreshness } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Phone, Mail, Shield, Eye, Gavel, Tag,
  Calendar, Gauge, Fuel, Cog, Car, Palette, MapPin,
  BadgeCheck, ChevronRight, ExternalLink, Star, Info,
  Zap, Key, Clock,
} from 'lucide-react'
import { VehiclePlaceholder } from '@/components/vehicles/VehiclePlaceholder'
import { VehicleAngle, ANGLE_LABELS } from '@/components/vehicles/VehicleAngle'
import type { Angle } from '@/components/vehicles/VehicleAngle'
import type { Vehicle, Bid, Store } from '@/types'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [existingBids, setBids] = useState<Bid[]>([])
  const [seller, setSeller] = useState<any>(null)
  const [estimationReport, setEstimationReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [activeAngle, setActiveAngle] = useState<Angle>('front')
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [bidding, setBidding] = useState(false)

  useEffect(() => {
    vehiclesApi.get(Number(id)).then(res => {
      setVehicle(res.vehicle)
      setStore(res.store)
      setBids(res.bids || [])
      setSeller(res.seller)
      setEstimationReport(res.estimation_report || null)
      // Set first available image as main
      const imgs = res.vehicle?.images
      if (imgs) {
        const first = imgs.front || imgs.rear || imgs.left || imgs.right || imgs.interior || imgs.dashboard || imgs.engine
        setMainImage(first)
      }
    }).catch(() => router.push('/explore'))
      .finally(() => setLoading(false))
  }, [id])

  // Collect all images for thumbnail strip
  const allImages: { key: string; url: string }[] = []
  if (vehicle?.images) {
    for (const key of ['front', 'rear', 'left', 'right', 'interior', 'dashboard', 'engine']) {
      const url = (vehicle.images as any)[key]
      if (url) allImages.push({ key, url })
    }
    if (vehicle.images.other) {
      vehicle.images.other.forEach((url, i) => {
        if (url) allImages.push({ key: `other-${i}`, url })
      })
    }
  }

  const handleBid = async () => {
    if (!vehicle || !bidAmount) return
    setBidding(true)
    try {
      await bidsApi.place(vehicle.id, Number(bidAmount), bidMessage)
      toast.success('Bid placed successfully!')
      const res = await vehiclesApi.get(vehicle.id)
      setBids(res.bids || [])
      setBidAmount('')
      setBidMessage('')
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to place bid')
    } finally {
      setBidding(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!vehicle) return null

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-0)]">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text-primary)]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/explore" className="hover:text-[var(--text-primary)]">Browse</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--text-secondary)]">{vehicle.make} {vehicle.model}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* ── Left Column ── */}
          <div className="space-y-4">

            {/* Gallery */}
            <Card className="p-3">
              {/* Main image */}
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[var(--surface-1)] mb-2 relative">
                {mainImage ? (
                  <img src={mainImage} alt={vehicle.title} className="w-full h-full object-cover" />
                ) : (
                  <VehicleAngle
                    angle={activeAngle}
                    bodyType={vehicle.body_type}
                    color={vehicle.exterior_color}
                  />
                )}
                {allImages.length > 0 ? (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium">
                    {allImages.findIndex(i => i.url === mainImage) + 1}/{allImages.length}
                  </span>
                ) : (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/45 backdrop-blur-sm text-white text-[10px] font-medium">
                    {ANGLE_LABELS[activeAngle]} — illustration, photos awaited
                  </span>
                )}
              </div>
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {allImages.map((img) => (
                    <button
                      key={img.key}
                      onClick={() => setMainImage(img.url)}
                      className={`w-[60px] h-[44px] rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        mainImage === img.url ? 'border-brand-500 ring-1 ring-brand-500/20' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.key} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Angle strip when the seller hasn't uploaded photos yet */}
              {allImages.length === 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {(['front','rear','left','right','interior','dashboard','engine'] as Angle[]).map(a => (
                    <button
                      key={a}
                      onClick={() => setActiveAngle(a)}
                      title={ANGLE_LABELS[a]}
                      className={`w-[60px] h-[44px] rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeAngle === a ? 'border-brand-500 ring-1 ring-brand-500/20' : 'border-transparent opacity-55 hover:opacity-100'
                      }`}
                    >
                      <VehicleAngle angle={a} bodyType={vehicle.body_type} color={vehicle.exterior_color} />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Title + Price */}
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <h1 className="font-display font-extrabold text-xl md:text-2xl leading-tight">{vehicle.title}</h1>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {estimationReport && (
                      <Badge variant="success">✓ Expert Verified · {estimationReport.condition_score}/10</Badge>
                    )}
                    {vehicle.listing_type === 'bid' ? (
                      <Badge variant="warning">🔨 Open for Bids</Badge>
                    ) : (
                      <Badge variant="success"><Tag className="w-3 h-3" /> Fixed Price</Badge>
                    )}
                    {vehicle.condition && <Badge>{vehicle.condition}</Badge>}
                    {vehicle.fuel_type === 'Electric' && <Badge variant="success">⚡ Electric</Badge>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[var(--text-muted)]">Asking Price</p>
                  <p className="font-display font-extrabold text-2xl md:text-3xl text-brand-500">{formatPrice(vehicle.price)}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center justify-end gap-1">
                    <Eye className="w-3 h-3" /> {vehicle.views} views
                  </p>
                  {vehicle.created_at && (
                    <p className={`text-xs mt-0.5 flex items-center justify-end gap-1 ${
                      listingFreshness(vehicle.created_at) === 'new'
                        ? 'text-green-600 font-medium'
                        : 'text-[var(--text-muted)]'
                    }`}>
                      <Clock className="w-3 h-3" /> {listingAge(vehicle.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Specifications */}
            <Card>
              <div className="px-5 py-3 border-b border-[var(--border)]">
                <h2 className="font-display font-bold text-sm flex items-center gap-2">
                  <Cog className="w-4 h-4 text-brand-500" /> Vehicle Specifications
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  <SpecRow label="Make" value={vehicle.make} />
                  <SpecRow label="Model" value={vehicle.model} />
                  <SpecRow label="Year" value={String(vehicle.year)} />
                  <SpecRow label="Kilometres" value={`${vehicle.mileage.toLocaleString('en-IN')} km`} />
                  <SpecRow label="Fuel Type" value={vehicle.fuel_type} />
                  <SpecRow label="Transmission" value={vehicle.transmission} />
                  {vehicle.engine && <SpecRow label="Engine" value={vehicle.engine} />}
                  <SpecRow label="Body Type" value={vehicle.body_type} />
                  {vehicle.drivetrain && <SpecRow label="Drive" value={vehicle.drivetrain} />}
                  <SpecRow label="Colour" value={vehicle.exterior_color} />
                  {vehicle.interior_color && vehicle.interior_color !== 'N/A' && (
                    <SpecRow label="Interior" value={vehicle.interior_color} />
                  )}
                  {vehicle.vin && <SpecRow label="VIN" value={vehicle.vin} />}
                </div>
              </div>
            </Card>

            {/* Description */}
            {vehicle.description && (
              <Card>
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <h2 className="font-display font-bold text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-500" /> Description
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {vehicle.description}
                  </p>
                </div>
              </Card>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <Card>
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <h2 className="font-display font-bold text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-brand-500" /> Features & Highlights
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] text-sm text-[var(--text-secondary)]">
                        <span className="text-green-500 text-xs">✓</span> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Expert Estimation Report */}
            {estimationReport && (
              <Card className="border-green-200 bg-green-50/30">
                <div className="px-5 py-3 border-b border-green-200 bg-green-50">
                  <h2 className="font-display font-bold text-sm flex items-center gap-2 text-green-800">
                    <Shield className="w-4 h-4 text-green-600" /> Expert Estimation Certificate
                  </h2>
                </div>
                <div className="p-5">
                  {/* Expert info */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-green-50">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-display font-bold">
                      {estimationReport.expert?.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-green-800">{estimationReport.expert?.name}</p>
                      <p className="text-xs text-green-600">{estimationReport.expert?.city} · Score: {estimationReport.expert?.fairness_score}/10</p>
                    </div>
                    <Badge variant="success" className="ml-auto">Verified</Badge>
                  </div>

                  {/* Scores grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-[var(--surface-0)] text-center border border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">Condition</p>
                      <p className="font-display font-extrabold text-xl text-green-600">{estimationReport.condition_score}/10</p>
                      <p className="text-xs text-[var(--text-muted)] capitalize">{estimationReport.overall_condition}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-0)] text-center border border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">Fair Value</p>
                      <p className="font-display font-extrabold text-xl text-brand-500">{formatPrice(estimationReport.estimated_value)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-0)] text-center border border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">Value Range</p>
                      <p className="text-xs font-medium mt-1">{formatPrice(estimationReport.estimated_value_low)} – {formatPrice(estimationReport.estimated_value_high)}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  {estimationReport.summary && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Expert Summary</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{estimationReport.summary}</p>
                    </div>
                  )}

                  {/* Issues */}
                  {estimationReport.issues_found?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Issues Found</p>
                      <div className="flex flex-wrap gap-1.5">
                        {estimationReport.issues_found.map((issue: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs">⚠ {issue}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {estimationReport.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Recommendations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {estimationReport.recommendations.map((rec: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs">💡 {rec}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Bids List */}
            {vehicle.listing_type === 'bid' && existingBids.length > 0 && (
              <Card>
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <h2 className="font-display font-bold text-sm flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-brand-500" /> Dealer Bids ({existingBids.length})
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {existingBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-display font-bold text-sm">
                          {bid.store?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{bid.store?.name || 'Dealer'}</p>
                          <p className="text-xs text-[var(--text-muted)]">{bid.store?.city || ''}</p>
                          {bid.message && (
                            <p className="text-xs text-[var(--text-muted)] italic mt-0.5">"{bid.message.slice(0, 80)}..."</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg">{formatPrice(bid.amount)}</p>
                        <p className="text-xs text-[var(--text-muted)]">{bid.created_at?.slice(0, 10)}</p>
                        {/* Accept button for vehicle owner */}
                        {isAuthenticated && user?.id === vehicle.seller_id && bid.status === 'pending' && (
                          <button
                            onClick={async () => {
                              if (confirm(`Accept this bid for ${formatPrice(bid.amount)}?`)) {
                                await bidsApi.accept(bid.id)
                                toast.success('Bid accepted!')
                                const res = await vehiclesApi.get(vehicle.id)
                                setBids(res.bids || [])
                              }
                            }}
                            className="mt-1 px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Bid / Action Card */}
            <div className="rounded-2xl overflow-hidden border border-[var(--border)]">
              {/* Price header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5">
                <p className="text-xs text-white/50">Asking Price</p>
                <p className="font-display font-extrabold text-2xl">{formatPrice(vehicle.price)}</p>
                <div className="flex gap-3 mt-2 text-xs text-white/50">
                  <span><Calendar className="w-3 h-3 inline" /> {vehicle.year}</span>
                  <span><Gauge className="w-3 h-3 inline" /> {vehicle.mileage.toLocaleString('en-IN')} km</span>
                </div>
              </div>
              <div className="bg-[var(--surface-0)] p-5 space-y-3">
                {/* Action buttons based on context */}
                {vehicle.listing_type === 'bid' && (
                  <>
                    {isAuthenticated && user?.account_type === 'partner' ? (
                      <Link href={`/dashboard/dealer/bid/${vehicle.id}`}>
                        <Button className="w-full" size="lg">
                          <Gavel className="w-4 h-4" /> Place Your Bid
                        </Button>
                      </Link>
                    ) : !isAuthenticated ? (
                      <Link href="/auth/register?type=partner">
                        <Button className="w-full" size="lg">
                          <Gavel className="w-4 h-4" /> Bid as Dealer
                        </Button>
                      </Link>
                    ) : null}
                  </>
                )}

                {vehicle.listing_type === 'sale' && store && (
                  <>
                    <Link href={`/dealer/${store.slug}`}>
                      <Button className="w-full" size="lg">
                        <MapPin className="w-4 h-4" /> View at Dealership
                      </Button>
                    </Link>
                    <TestDriveBooking vehicleTitle={vehicle.title} storeName={store.name} storePhone={store.phone} />
                  </>
                )}

                {seller?.phone && (
                  <>
                    <a href={`tel:${seller.phone}`}>
                      <Button variant="secondary" className="w-full">
                        <Phone className="w-4 h-4" /> Call Seller
                      </Button>
                    </a>
                    <a href={`https://wa.me/91${seller.phone?.replace(/\D/g, '').replace(/^91/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ${vehicle.title} listed on XMotor for ${formatPrice(vehicle.price)}. Is it still available?`)}`} target="_blank" rel="noopener">
                      <Button variant="secondary" className="w-full" style={{ background: '#25d366', color: 'white', borderColor: '#25d366' }}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.8-6.382-2.148l-.446-.346-3.144 1.053 1.053-3.144-.346-.446A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                        WhatsApp
                      </Button>
                    </a>
                  </>
                )}

                {/* Share button */}
                <button
                  onClick={() => {
                    const url = window.location.href
                    if (navigator.share) {
                      navigator.share({ title: vehicle.title, text: `Check out this ${vehicle.title} on XMotor for ${formatPrice(vehicle.price)}`, url })
                    } else {
                      navigator.clipboard.writeText(url)
                      toast.success('Link copied!')
                    }
                  }}
                  className="w-full h-10 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Share listing
                </button>

                {/* Divider */}
                <div className="border-t border-[var(--border)] my-3" />

                {/* Seller Info */}
                {store ? (
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Listed By</p>
                    <p className="font-bold text-sm">{store.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-500" /> {store.city}, {store.state}
                    </p>
                    {store.phone && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center justify-center gap-1">
                        <Phone className="w-3 h-3 text-brand-500" /> {store.phone}
                      </p>
                    )}
                  </div>
                ) : seller ? (
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Individual Seller</p>
                    <p className="font-bold text-sm">{seller.full_name || seller.username}</p>
                    {vehicle.listing_type === 'bid' && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 text-xs text-blue-700">
                        <Info className="w-3 h-3 inline" /> Dealer bids only. Accept the best offer.
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Safety Tips */}
                <div className="mt-4 p-3 rounded-lg bg-amber-50 text-xs text-amber-800">
                  <p className="font-bold mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Safety Tips
                  </p>
                  <ul className="list-disc list-inside space-y-1 leading-relaxed">
                    <li>Verify RC & documentation before payment</li>
                    <li>Use XMotor verified dealers only</li>
                    <li>Never pay advance without meeting</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* EMI Calculator */}
            <EMICalculator price={vehicle.price} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value || value === 'N/A' || value === '') return null
  return (
    <div>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function EMICalculator({ price }: { price: number }) {
  const [downPayment, setDownPayment] = useState(20)
  const [tenure, setTenure] = useState(36)
  const rate = 9.5 // Annual interest rate

  const loanAmount = price * (1 - downPayment / 100)
  const monthlyRate = rate / 12 / 100
  const emi = monthlyRate > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1))
    : Math.round(loanAmount / tenure)
  const totalPayable = emi * tenure
  const totalInterest = totalPayable - loanAmount

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          💰 EMI Calculator
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-center p-3 rounded-xl bg-brand-50">
          <p className="text-xs text-brand-600">Estimated EMI</p>
          <p className="font-display font-extrabold text-2xl text-brand-500">₹{emi.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-brand-400">per month for {tenure} months</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">Down Payment</label>
            <span className="text-xs font-display font-bold">{downPayment}% (₹{Math.round(price * downPayment / 100).toLocaleString('en-IN')})</span>
          </div>
          <input type="range" min={10} max={80} value={downPayment} onChange={e => setDownPayment(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-[var(--surface-2)] cursor-pointer accent-brand-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">Loan Tenure</label>
            <span className="text-xs font-display font-bold">{tenure} months</span>
          </div>
          <div className="flex gap-1.5">
            {[12, 24, 36, 48, 60].map(t => (
              <button key={t} onClick={() => setTenure(t)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${tenure === t ? 'bg-brand-500 text-white' : 'bg-[var(--surface-1)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
                {t}m
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-lg bg-[var(--surface-1)]">
            <p className="text-[var(--text-muted)]">Loan Amount</p>
            <p className="font-display font-bold text-xs mt-0.5">₹{Math.round(loanAmount).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-1)]">
            <p className="text-[var(--text-muted)]">Interest</p>
            <p className="font-display font-bold text-xs mt-0.5">₹{totalInterest.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-1)]">
            <p className="text-[var(--text-muted)]">Total</p>
            <p className="font-display font-bold text-xs mt-0.5">₹{totalPayable.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <p className="text-[9px] text-[var(--text-muted)] text-center">@ {rate}% p.a. Indicative only. Actual rates vary by bank.</p>
      </div>
    </Card>
  )
}

function TestDriveBooking({ vehicleTitle, storeName, storePhone }: { vehicleTitle: string; storeName: string; storePhone?: string }) {
  const [showForm, setShowForm] = useState(false)
  const [booked, setBooked] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '' })

  if (booked) {
    return (
      <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
        <p className="text-sm font-bold text-green-800 mb-1">✅ Test drive requested!</p>
        <p className="text-xs text-green-700">{storeName} will contact you to confirm your appointment.</p>
      </div>
    )
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)}
        className="w-full h-10 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors flex items-center justify-center gap-2">
        🚗 Book a test drive
      </button>
    )
  }

  return (
    <div className="p-3 rounded-xl bg-[var(--surface-1)] space-y-2 animate-slide-up">
      <p className="text-xs font-semibold text-[var(--text-muted)]">Book a test drive</p>
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full h-8 px-2 rounded-lg border border-[var(--border)] text-xs outline-none" />
      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" className="w-full h-8 px-2 rounded-lg border border-[var(--border)] text-xs outline-none" />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-8 px-2 rounded-lg border border-[var(--border)] text-xs outline-none" />
        <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="h-8 px-2 rounded-lg border border-[var(--border)] text-xs bg-[var(--surface-0)]">
          <option value="">Time</option>
          <option>10:00 AM</option><option>12:00 PM</option><option>2:00 PM</option><option>4:00 PM</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setBooked(true); toast.success('Test drive request sent!') }} className="flex-1 h-8 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600">Request</button>
        <button onClick={() => setShowForm(false)} className="h-8 px-3 rounded-lg border border-[var(--border)] text-xs">Cancel</button>
      </div>
    </div>
  )
}

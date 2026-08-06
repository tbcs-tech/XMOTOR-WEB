'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi, bids as bidsApi } from '@/lib/api'
import { StatCard, Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, timeAgo, getVehicleImage } from '@/lib/utils'
import { CarFront, Gavel, Clock, Eye, Plus, CheckCircle, XCircle, Shield, MessageSquare, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SellerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [myVehicles, setMyVehicles] = useState<any[]>([])
  const [receivedBids, setReceivedBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.account_type !== 'individual')) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, isLoading])

  useEffect(() => {
    if (!isAuthenticated || user?.account_type !== 'individual') return
    Promise.all([
      vehiclesApi.mine(),
      bidsApi.received(),
    ]).then(([vRes, bRes]) => {
      setMyVehicles(vRes.items)
      setReceivedBids(bRes.bids)
    }).finally(() => setLoading(false))
  }, [isAuthenticated, user])

  async function handleAcceptBid(bidId: number) {
    await bidsApi.accept(bidId)
    const bRes = await bidsApi.received()
    setReceivedBids(bRes.bids)
  }

  async function handleRejectBid(bidId: number) {
    await bidsApi.reject(bidId)
    const bRes = await bidsApi.received()
    setReceivedBids(bRes.bids)
  }

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const approved = myVehicles.filter(v => v.status === 'approved')
  const pending = myVehicles.filter(v => v.status === 'pending')
  const pendingBids = receivedBids.filter(b => b.status === 'pending')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Welcome, {user?.full_name}</p>
        <div className="flex gap-2 mt-3">
          <Link href="/dashboard/seller/estimation">
            <Button size="sm" variant="secondary"><Shield className="w-4 h-4" /> Estimations</Button>
          </Link>
          <Link href="/dashboard/seller/sell">
            <Button size="sm"><Plus className="w-4 h-4" /> List a Vehicle</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="My Listings" value={myVehicles.length} icon={<CarFront className="w-4 h-4" />} />
        <StatCard label="Live" value={approved.length} icon={<Eye className="w-4 h-4" />} sublabel="approved & visible" />
        <StatCard label="Pending" value={pending.length} icon={<Clock className="w-4 h-4" />} sublabel="awaiting approval" />
        <StatCard label="Bids Received" value={pendingBids.length} icon={<Gavel className="w-4 h-4" />} sublabel="needs your action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Vehicles */}
        <Card className="p-5">
          <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
            <CarFront className="w-4 h-4 text-brand-500" />
            My Listings ({myVehicles.length})
          </h3>
          {myVehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)]">No listings yet</p>
              <Button size="sm" className="mt-3" onClick={() => {}}>List Your First Car</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myVehicles.slice(0, 5).map(v => (
                <Link key={v.id} href={`/vehicle/${v.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors">
                    <div className="w-14 h-10 rounded-lg bg-[var(--surface-2)] shrink-0 overflow-hidden">
                      {getVehicleImage(v.images) && <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{v.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{formatPrice(v.price)}</p>
                    </div>
                    <Badge variant={v.status === 'approved' ? 'success' : v.status === 'pending' ? 'warning' : 'default'}>
                      {v.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Received Bids */}
        <Card className="p-5">
          <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
            <Gavel className="w-4 h-4 text-brand-500" />
            Dealer Bids ({pendingBids.length} pending)
          </h3>
          {receivedBids.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)]">No bids received yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Dealers will bid once your listings are approved</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedBids.slice(0, 8).map(b => (
                <div key={b.id} className="p-3 rounded-xl bg-[var(--surface-1)]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{b.vehicle?.title || `Vehicle #${b.vehicle_id}`}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        from {b.store?.name || b.bidder?.full_name || 'Dealer'} · {timeAgo(b.created_at)}
                      </p>
                    </div>
                    <span className="font-display font-bold text-lg">{formatPrice(b.amount)}</span>
                  </div>
                  {b.message && <p className="text-xs text-[var(--text-secondary)] mb-2">"{b.message}"</p>}
                  {b.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptBid(b.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleRejectBid(b.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <Badge variant={b.status === 'accepted' ? 'success' : 'danger'}>{b.status}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Counter Offers from Individuals */}
        <OffersSection vehicleIds={myVehicles.map((v: any) => v.id)} />
      </div>
    </div>
  )
}

function OffersSection({ vehicleIds }: { vehicleIds: number[] }) {
  const [offersList, setOffersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vehicleIds.length === 0) { setLoading(false); return }
    Promise.all(vehicleIds.map(id =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/offers/vehicle/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('xm_access')}` },
      }).then(r => r.ok ? r.json() : { offers: [] }).catch(() => ({ offers: [] }))
    )).then(results => {
      const all = results.flatMap(r => r.offers || [])
      setOffersList(all.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }).finally(() => setLoading(false))
  }, [vehicleIds])

  const handleAccept = async (id: number) => {
    try {
      const { offers: offersApi } = await import('@/lib/api')
      await offersApi.accept(id)
      setOffersList(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' } : o.vehicle_id === offersList.find(x => x.id === id)?.vehicle_id ? { ...o, status: 'rejected' } : o))
      toast.success('Offer accepted!')
    } catch { toast.error('Failed') }
  }

  const handleReject = async (id: number) => {
    try {
      const { offers: offersApi } = await import('@/lib/api')
      await offersApi.reject(id)
      setOffersList(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o))
      toast('Offer rejected')
    } catch { toast.error('Failed') }
  }

  const pending = offersList.filter(o => o.status === 'pending')

  return (
    <Card className="p-5 lg:col-span-2">
      <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-teal-500" />
        Counter Offers from Buyers ({pending.length} pending)
      </h3>
      {loading ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">Loading...</p>
      ) : offersList.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-muted)]">No counter offers yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Individual buyers can make counter offers on your listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {offersList.map(o => (
            <div key={o.id} className={`p-3 rounded-xl ${o.status === 'pending' ? 'bg-teal-50 border border-teal-200' : 'bg-[var(--surface-1)]'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">{o.buyer?.full_name || 'Buyer'}</p>
                <span className="font-display font-bold text-brand-500">{formatPrice(o.amount)}</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{o.buyer?.city || ''} · {timeAgo(o.created_at)}</p>
              {o.message && <p className="text-xs text-[var(--text-secondary)] mt-1 italic">"{o.message}"</p>}
              {o.status === 'pending' ? (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAccept(o.id)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200">
                    <CheckCircle className="w-3 h-3" /> Accept
                  </button>
                  <button onClick={() => handleReject(o.id)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                  {o.buyer?.phone && (
                    <a href={`tel:${o.buyer.phone}`} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--surface-0)] text-xs font-medium border border-[var(--border)]">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  )}
                </div>
              ) : (
                <Badge variant={o.status === 'accepted' ? 'success' : 'danger'} className="mt-2">{o.status}</Badge>
              )}
            </div>
          ))}
        </div>
      )}

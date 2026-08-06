'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { vehicles as vehiclesApi, bids as bidsApi } from '@/lib/api'
import { useAuth } from '@/lib/store'
import { Button, Card, Badge } from '@/components/ui'
import { formatPrice, getVehicleImage } from '@/lib/utils'
import toast from 'react-hot-toast'
export default function PlaceBidPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [vehicle, setVehicle] = useState<any>(null)
  const [existingBids, setBids] = useState<any[]>([])
  const [myBid, setMyBid] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    vehiclesApi.get(Number(id)).then(r => {
      setVehicle(r.vehicle); setBids(r.bids || [])
      const mb = r.bids?.find((b:any) => b.bidder_id === user?.id)
      if (mb) { setMyBid(mb); setAmount(String(mb.amount)); setMessage(mb.message || '') }
    })
  }, [id, user])
  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    try {
      await bidsApi.place(Number(id), Number(amount), message)
      toast.success(myBid ? 'Bid updated!' : 'Bid placed!')
      router.push('/dashboard/dealer/my-bids')
    } catch (e: any) { toast.error(e.data?.error || 'Failed') } finally { setLoading(false) }
  }
  if (!vehicle) return null
  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6"><div className="max-w-3xl mx-auto px-4"><Link href="/dashboard/dealer/browse" className="text-white/60 text-sm">← Browse Listings</Link><h1 className="font-display font-bold text-xl mt-1">Place a Bid</h1><p className="text-white/50 text-sm">{vehicle.title}</p></div></div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="overflow-hidden">
          {getVehicleImage(vehicle.images) && <img src={getVehicleImage(vehicle.images)!} alt="" className="w-full h-52 object-cover" />}
          <div className="p-5">
            <h3 className="font-display font-bold text-lg mb-2">{vehicle.title}</h3>
            <div className="flex flex-wrap gap-2 mb-3"><Badge>{vehicle.year}</Badge><Badge>{vehicle.mileage.toLocaleString()} km</Badge><Badge>{vehicle.fuel_type}</Badge><Badge>{vehicle.transmission}</Badge></div>
            <p className="text-sm">Asking Price: <strong className="text-brand-500 font-display text-lg">{formatPrice(vehicle.price)}</strong></p>
            {vehicle.description && <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3">{vehicle.description}</p>}
          </div>
          {existingBids.length > 0 && (
            <div className="px-5 pb-5 pt-3 border-t border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">Current Bids ({existingBids.length})</h4>
              {existingBids.map((b:any) => (
                <div key={b.id} className={`flex items-center justify-between py-2 text-sm ${b.bidder_id === user?.id ? 'bg-brand-50 -mx-2 px-2 rounded-lg' : ''}`}>
                  <span>{b.bidder_id === user?.id ? '⭐ My Bid' : '🏪 Dealer'}</span>
                  <strong className="font-display">{formatPrice(b.amount)}</strong>
                  <Badge variant={b.status === 'pending' ? 'warning' : b.status === 'accepted' ? 'success' : 'danger'}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">{myBid ? 'Update Your Bid' : 'Place Your Bid'}</h2>
          {myBid && <div className="p-3 rounded-lg bg-brand-50 text-brand-700 text-sm font-semibold mb-4">Your current bid: {formatPrice(myBid.amount)}</div>}
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Your Bid Amount (₹) *</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-semibold">₹</span><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full h-12 pl-7 pr-3 rounded-xl border border-[var(--border)] text-lg font-display font-bold outline-none focus:border-brand-500" placeholder={String(Math.floor(vehicle.price * 0.9))} /></div><p className="text-xs text-[var(--text-muted)] mt-1">Seller is asking {formatPrice(vehicle.price)}. Competitive bids win!</p></div>
            <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Message to Seller (optional)</label><textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none" rows={4} placeholder="Introduce yourself, mention your showroom, any pickup arrangements…" /></div>
            <div className="p-4 rounded-xl bg-[var(--surface-1)]"><p className="text-xs font-bold mb-2">💡 Tips for winning bids</p><ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1"><li>Offer competitive pricing close to the asking price</li><li>Mention your showroom credentials and location</li><li>Offer convenient pickup/paperwork assistance</li></ul></div>
            <div className="flex justify-end gap-3"><Link href="/dashboard/dealer/browse"><Button variant="secondary">Cancel</Button></Link><Button size="lg" loading={loading} onClick={handleSubmit}>{myBid ? 'Update Bid' : 'Submit Bid'}</Button></div>
          </div>
        </Card>
      </div>
    </div>
  )
}

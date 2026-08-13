'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { vehicles as vehiclesApi, bids as bidsApi, ai as aiApi } from '@/lib/api'
import type { BidAdvice } from '@/lib/api'
import { useAuth } from '@/lib/store'
import { Button, Card, Badge } from '@/components/ui'
import { formatPrice, getVehicleImage } from '@/lib/utils'
import { Sparkles, TrendingUp, Target } from 'lucide-react'
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
        <BidAdvisorPanel vehicleId={Number(id)} onUseSuggestion={(v) => setAmount(String(Math.round(v)))} />

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


function BidAdvisorPanel({ vehicleId, onUseSuggestion }: {
  vehicleId: number
  onUseSuggestion: (amount: number) => void
}) {
  const [advice, setAdvice] = useState<BidAdvice | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    aiApi.bidAdvice(vehicleId)
      .then(setAdvice)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [vehicleId])

  // Silently hide if the advisor is unavailable — never block the bid form
  if (failed || (!loading && !advice)) return null

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
          Analysing market and competing bids...
        </div>
      </Card>
    )
  }

  const a = advice!
  const winPct = Math.round((a.win_probability || 0) * 100)
  const winColor =
    winPct >= 70 ? 'text-green-600' : winPct >= 40 ? 'text-amber-600' : 'text-red-500'

  return (
    <Card className="p-5 mb-4 border-brand-200 bg-gradient-to-br from-brand-50/50 to-transparent">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border)]">
        <h2 className="font-display font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" /> Bid Advisor
        </h2>
        {a.market_position && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-1)] font-medium capitalize">
            {a.market_position.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Suggested bid</p>
          <p className="font-display font-extrabold text-2xl text-brand-600">
            {formatPrice(a.suggested_bid)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Win chance</p>
          <p className={`font-display font-bold text-xl ${winColor}`}>{winPct}%</p>
        </div>
      </div>

      {a.bid_range && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {([
            ['Conservative', a.bid_range.conservative],
            ['Competitive', a.bid_range.competitive],
            ['Aggressive', a.bid_range.aggressive],
          ] as const).map(([label, val]) => (
            <button
              key={label}
              onClick={() => onUseSuggestion(val)}
              className="p-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] hover:border-brand-400 transition-colors text-center active:scale-95"
            >
              <p className="text-[9px] text-[var(--text-muted)] font-semibold uppercase">{label}</p>
              <p className="font-display font-bold text-xs mt-0.5">{formatPrice(val)}</p>
            </button>
          ))}
        </div>
      )}

      {a.reasoning && (
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
          <span>{a.reasoning}</span>
        </p>
      )}

      {a.market_estimate?.fair_price ? (
        <p className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
          <Target className="w-3 h-3" /> Fair market value {formatPrice(a.market_estimate.fair_price)}
        </p>
      ) : null}

      <p className="text-[9px] text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">
        Guidance only — based on market data and current bids. Your call.
      </p>
    </Card>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { estimation as estApi, vehicles as vehiclesApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { Shield, Star, MapPin, Phone, CheckCircle, Clock, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

declare global { interface Window { Razorpay: any } }

export default function BookEstimationPage() {
  const { vehicleId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [vehicle, setVehicle] = useState<any>(null)
  const [experts, setExperts] = useState<any[]>([])
  const [allExperts, setAllExperts] = useState<any[]>([])
  const [selectedExpert, setSelectedExpert] = useState<any>(null)
  const [cityFilter, setCityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [form, setForm] = useState({ preferred_date: '', preferred_time: '', location: '', notes: '' })

  useEffect(() => {
    Promise.all([
      vehiclesApi.get(Number(vehicleId)),
      estApi.listExperts(),
    ]).then(([vRes, eRes]) => {
      setVehicle(vRes.vehicle)
      setAllExperts(eRes.experts)
      setExperts(eRes.experts)
    }).finally(() => setLoading(false))
  }, [vehicleId])

  useEffect(() => {
    if (cityFilter) setExperts(allExperts.filter(e => e.city.toLowerCase().includes(cityFilter.toLowerCase())))
    else setExperts(allExperts)
  }, [cityFilter, allExperts])

  const handleBook = async () => {
    if (!selectedExpert) { toast.error('Please select an expert'); return }
    if (!form.preferred_date) { toast.error('Please select a date'); return }
    setBooking(true)

    try {
      // Step 1: Create Razorpay order
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const token = localStorage.getItem('xm_access')
      const orderRes = await fetch(`${API}/api/v1/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: selectedExpert.inspection_fee, request_id: `${vehicleId}_${selectedExpert.id}` }),
      })
      const orderData = await orderRes.json()

      if (orderData.order?.simulated) {
        // Dev mode: skip Razorpay, directly book
        await completeBooking('sim_payment')
        return
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.order.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'XMotor',
        description: `Estimation deposit — ${selectedExpert.name}`,
        order_id: orderData.order.order_id,
        handler: async function (response: any) {
          // Step 3: Verify payment
          await fetch(`${API}/api/v1/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          })
          await completeBooking(response.razorpay_payment_id)
        },
        prefill: { name: user?.full_name, email: user?.email, contact: user?.phone },
        theme: { color: '#ff8c1a' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e: any) {
      toast.error(e.data?.error || 'Payment failed')
    } finally { setBooking(false) }
  }

  const completeBooking = async (paymentRef: string) => {
    try {
      await estApi.requestEstimation(Number(vehicleId), {
        expert_id: selectedExpert.id,
        ...form,
        payment_ref: paymentRef,
      })
      toast.success('Estimation booked! The expert will confirm shortly.')
      router.push('/dashboard/seller/estimation')
    } catch (e: any) {
      toast.error(e.data?.error || 'Booking failed')
    } finally { setBooking(false) }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><Skeleton className="h-96 rounded-2xl" /></div>

  const cities = [...new Set(allExperts.map(e => e.city))].sort()

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard/seller/estimation" className="text-xs text-[var(--text-muted)]">← Estimation Requests</Link>
          <h1 className="font-display font-bold text-xl mt-1">Book Expert Estimation</h1>
          {vehicle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{vehicle.title}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Vehicle summary */}
        {vehicle && (
          <Card className="p-3 flex items-center gap-3">
            <div className="w-16 h-12 rounded-lg bg-[var(--surface-1)] overflow-hidden shrink-0">
              {vehicle.images?.front && <img src={vehicle.images.front} alt="" className="w-full h-full object-cover" />}
            </div>
            <div><p className="font-medium text-sm">{vehicle.title}</p><p className="text-xs text-[var(--text-muted)]">{vehicle.year} · Asking {formatPrice(vehicle.price)}</p></div>
          </Card>
        )}

        {/* Step 1: Pick expert */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-xs">1</div>
            <h2 className="font-display font-bold">Choose an expert</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {experts.map(expert => (
              <Card key={expert.id} onClick={() => setSelectedExpert(expert)}
                className={`p-4 cursor-pointer transition-all ${selectedExpert?.id === expert.id ? 'ring-2 ring-brand-500 border-brand-500' : 'hover:border-brand-300'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-display font-bold shrink-0">{expert.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate flex items-center gap-1">{expert.name} {expert.is_verified && <CheckCircle className="w-3 h-3 text-blue-500" />}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-3 h-3" /> {expert.area}, {expert.city}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" /> {expert.fairness_score}/10</span>
                      <span className="font-bold text-brand-600">₹{expert.inspection_fee.toLocaleString()}</span>
                    </div>
                  </div>
                  {selectedExpert?.id === expert.id && <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 2: Schedule + Pay */}
        {selectedExpert && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-xs">2</div>
              <h2 className="font-display font-bold">Schedule & pay</h2>
            </div>
            <Card className="p-5">
              <div className="p-3 rounded-xl bg-brand-50 mb-4 flex items-center justify-between">
                <div><p className="text-sm font-medium text-brand-800">{selectedExpert.name}</p><p className="text-xs text-brand-600">{selectedExpert.area}, {selectedExpert.city}</p></div>
                <div className="text-right">
                  <p className="text-lg font-display font-bold text-brand-700">₹{selectedExpert.inspection_fee.toLocaleString()}</p>
                  <p className="text-[10px] text-brand-600">Refundable on sale</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Date *</label>
                  <input type="date" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Time</label>
                  <select value={form.preferred_time} onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                    <option value="">Select</option><option>9:00 AM – 11:00 AM</option><option>11:00 AM – 1:00 PM</option><option>2:00 PM – 4:00 PM</option><option>4:00 PM – 6:00 PM</option>
                  </select></div>
              </div>
              <div className="mb-4"><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Your address or expert's garage" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none" /></div>
              <div className="flex justify-end gap-3">
                <Link href="/dashboard/seller/estimation"><Button variant="secondary">Cancel</Button></Link>
                <Button size="lg" loading={booking} onClick={handleBook}>
                  <CreditCard className="w-4 h-4" /> Pay ₹{selectedExpert.inspection_fee.toLocaleString()} & Book
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

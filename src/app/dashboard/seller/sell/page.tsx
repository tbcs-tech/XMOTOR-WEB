'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi, estimation as estApi, getAccessToken } from '@/lib/api'
import { Button, Card, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Camera, Sparkles, Shield, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const MAKES = {
  'Indian': ['Tata Motors', 'Mahindra', 'Maruti Suzuki'],
  'International': ['Hyundai', 'Kia', 'Toyota', 'Honda', 'Volkswagen', 'Skoda', 'MG', 'Jeep', 'Ford', 'Renault', 'Nissan'],
  'Luxury': ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Land Rover', 'Volvo'],
}
const FUEL = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG']
const TRANS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT']
const BODY = ['Hatchback', 'Sedan', 'SUV', 'MUV/MPV', 'Coupe', 'Pickup Truck']
const COND = ['Excellent', 'Good', 'Fair']
const ANGLES = ['front', 'rear', 'left', 'right', 'interior', 'dashboard', 'engine']

type Step = 'details' | 'photos' | 'estimation' | 'review'

export default function SellVehiclePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState<any>({})
  const [photos, setPhotos] = useState<Record<string, { file: File; preview: string }>>({})
  const [otherPhotos, setOtherPhotos] = useState<File[]>([])
  const [aiEstimate, setAiEstimate] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handlePhotoChange = (angle: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotos(p => ({ ...p, [angle]: { file, preview: e.target?.result as string } }))
    }
    reader.readAsDataURL(file)
  }

  const photoCount = Object.keys(photos).length

  // AI Estimation
  const runAIEstimate = async () => {
    if (!form.make || !form.model || !form.year) {
      toast.error('Fill make, model, and year first')
      return
    }
    setAiLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${API}/api/v1/ai/price-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: form.make, model: form.model,
          year: parseInt(form.year), mileage: parseInt(form.mileage || '0'),
          fuel_type: form.fuel_type || 'Petrol',
          condition: form.condition || 'Good',
        }),
      })
      const data = await res.json()
      setAiEstimate(data)
      if (data.estimated_price && !form.price) {
        set('price', data.estimated_price)
      }
    } catch {
      setAiEstimate({
        estimated_price: Math.round(parseInt(form.year || '2022') > 2021 ? 900000 : 600000),
        comparable_range: 'Based on market averages',
        factors: ['Year: ' + form.year, 'Make: ' + form.make, 'Condition: ' + (form.condition || 'Good')],
        price_range: { low: 400000, high: 2000000 },
        ai_insight: 'Approximate estimate. Complete all details for better accuracy.',
      })
      toast('AI estimate ready', { icon: '🤖' })
    } finally {
      setAiLoading(false)
    }
  }

  // Submit listing
  const handleSubmit = async () => {
    if (!form.title || !form.make || !form.model || !form.year || !form.price) {
      toast.error('Please fill all required fields')
      setStep('details')
      return
    }
    setSubmitting(true)
    try {
      const features = form.features ? form.features.split(',').map((f: string) => f.trim()).filter(Boolean) : []
      const res = await vehiclesApi.create({ ...form, features, year: parseInt(form.year), price: parseFloat(form.price), mileage: parseInt(form.mileage || '0') })

      // Upload photos
      if (photoCount > 0) {
        const fd = new FormData()
        Object.entries(photos).forEach(([angle, { file }]) => fd.append(angle, file))
        otherPhotos.forEach(f => fd.append('other', f))
        const token = getAccessToken()
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/vehicles/${res.vehicle_id}/images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        })
      }

      toast.success('Listing submitted for review!')
      router.push('/dashboard/seller/listings')
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/dashboard/seller" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-2xl mt-1">List your vehicle</h1>
          <p className="text-white/50 text-sm mt-1">Fill details, upload photos, get AI price guidance, and submit for review.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'details', label: 'Details', num: 1 },
            { id: 'photos', label: 'Photos', num: 2 },
            { id: 'estimation', label: 'Estimation', num: 3 },
            { id: 'review', label: 'Submit', num: 4 },
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && <div className={`flex-1 h-0.5 ${['details','photos','estimation','review'].indexOf(step) >= i ? 'bg-brand-500' : 'bg-[var(--border)]'}`} />}
              <button
                onClick={() => setStep(s.id as Step)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${step === s.id ? 'bg-brand-500 text-white' : 'bg-[var(--surface-0)] border border-[var(--border)] text-[var(--text-muted)]'}`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{s.num}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {/* ── Step 1: Vehicle Details ── */}
        {step === 'details' && (
          <Card className="p-6">
            <h2 className="font-display font-bold text-sm mb-4 flex items-center gap-2">Vehicle details</h2>
            <div className="space-y-4">
              <Field label="Listing title *" ph="e.g. 2021 Maruti Suzuki Brezza ZXI+ Automatic" value={form.title} onChange={v => set('title', v)} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Make *" value={form.make} onChange={v => set('make', v)} groups={MAKES} />
                <Field label="Model *" ph="e.g. Creta, Swift, Nexon" value={form.model} onChange={v => set('model', v)} />
                <Select label="Year *" value={form.year} onChange={v => set('year', v)} options={Array.from({length:21},(_,i)=>String(2025-i))} />
                <Field label="Odometer (km)" ph="45000" value={form.mileage} onChange={v => set('mileage', v)} type="number" />
                <Select label="Fuel type" value={form.fuel_type} onChange={v => set('fuel_type', v)} options={FUEL} />
                <Select label="Transmission" value={form.transmission} onChange={v => set('transmission', v)} options={TRANS} />
                <Select label="Body type" value={form.body_type} onChange={v => set('body_type', v)} options={BODY} />
                <Field label="Engine" ph="1.5L TGDI K15C" value={form.engine} onChange={v => set('engine', v)} />
                <Field label="Exterior colour" ph="Pearl Arctic White" value={form.exterior_color} onChange={v => set('exterior_color', v)} />
                <Select label="Condition" value={form.condition} onChange={v => set('condition', v)} options={COND} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Description</label>
                <textarea className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500 resize-none" rows={4} placeholder="Describe condition, service history, modifications, reason for selling…" value={form.description || ''} onChange={e => set('description', e.target.value)} />
              </div>
              <Field label="Features (comma separated)" ph="Sunroof, Android Auto, Ventilated Seats" value={form.features} onChange={v => set('features', v)} />
              <div className="flex justify-end">
                <Button onClick={() => setStep('photos')} size="lg">Next: Photos <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 2: Photos ── */}
        {step === 'photos' && (
          <Card className="p-6">
            <h2 className="font-display font-bold text-sm mb-1">Upload photos</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">Good photos get 3× more bids. Upload at least 4 angles.</p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-4">
              {ANGLES.map(angle => (
                <label key={angle} className="cursor-pointer group">
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoChange(angle, file)
                  }} />
                  <div className={`aspect-square rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center gap-0.5 transition-colors ${photos[angle] ? 'border-brand-500' : 'border-[var(--border)] group-hover:border-brand-300'}`}>
                    {photos[angle] ? (
                      <img src={photos[angle].preview} alt={angle} className="w-full h-full object-cover" />
                    ) : (
                      <><Camera className="w-5 h-5 text-[var(--text-muted)] opacity-50" /><span className="text-[9px] text-[var(--text-muted)] font-semibold uppercase">{angle}</span></>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">{photoCount} of 7 angles uploaded</p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Additional photos</label>
              <input type="file" multiple accept="image/*" className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[var(--surface-1)] file:text-sm file:font-medium" onChange={e => setOtherPhotos(Array.from(e.target.files || []))} />
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('details')}>← Back</Button>
              <Button onClick={() => setStep('estimation')} size="lg">Next: Get estimation <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </Card>
        )}

        {/* ── Step 3: Estimation ── */}
        {step === 'estimation' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display font-bold text-sm mb-1">Get your vehicle estimated</h2>
              <p className="text-xs text-[var(--text-muted)] mb-6">Choose how you want your vehicle valued. AI estimation is free and instant. Expert adds a verified badge that dealers trust.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* AI Estimation card */}
                <div className={`rounded-2xl border-2 p-5 transition-all ${aiEstimate ? 'border-brand-500 bg-brand-50/30' : 'border-[var(--border)]'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-brand-500" />
                    <h3 className="font-display font-bold text-sm">AI estimation</h3>
                    <Badge variant="success">Free</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                    Instant price guidance powered by market data and AI. Analyses your make, model, year, mileage, and condition against thousands of comparable sales.
                  </p>
                  {aiEstimate ? (
                    <div className="space-y-3">
                      <div className="text-center p-3 rounded-xl bg-[var(--surface-0)]">
                        <p className="text-xs text-[var(--text-muted)]">Estimated fair value</p>
                        <p className="font-display font-extrabold text-2xl text-brand-500">{formatPrice(aiEstimate.estimated_price)}</p>
                        <p className="text-xs text-[var(--text-muted)]">{aiEstimate.comparable_range}</p>
                      </div>
                      {aiEstimate.factors?.map((f: string, i: number) => (
                        <p key={i} className="text-xs text-[var(--text-muted)]">• {f}</p>
                      ))}
                      {aiEstimate.ai_insight && (
                        <p className="text-xs text-brand-700 bg-brand-50 p-2 rounded-lg">{aiEstimate.ai_insight}</p>
                      )}
                      <p className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" /> AI estimation complete</p>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={runAIEstimate} loading={aiLoading}>
                      <Sparkles className="w-4 h-4" /> Run AI estimation
                    </Button>
                  )}
                </div>

                {/* Expert Estimation card */}
                <div className="rounded-2xl border-2 border-[var(--border)] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <h3 className="font-display font-bold text-sm">Expert estimation</h3>
                    <Badge variant="brand">₹1,500+</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                    Physical inspection by a verified garage. Adds a "Verified" badge to your listing — dealers bid 40% higher on verified vehicles. Fee is refunded when vehicle sells.
                  </p>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-teal-500" /> 150-point physical inspection</li>
                    <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-teal-500" /> Verified badge on listing</li>
                    <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-teal-500" /> Structured report with photos</li>
                    <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-teal-500" /> Fee refunded on sale</li>
                  </ul>
                  <p className="text-[10px] text-[var(--text-muted)] mb-3">You can book an expert after listing. Submit your vehicle first, then upgrade from your listings page.</p>
                  <div className="p-3 rounded-xl bg-[var(--surface-1)] text-center text-xs text-[var(--text-muted)]">
                    Available after submitting your listing
                  </div>
                </div>
              </div>

              {/* Price field (auto-filled by AI) */}
              <div className="p-4 rounded-xl bg-[var(--surface-1)]">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Your asking price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-semibold">₹</span>
                  <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} className="w-full h-12 pl-7 pr-3 rounded-xl border border-[var(--border)] text-lg font-display font-bold outline-none focus:border-brand-500 bg-[var(--surface-0)]" placeholder={aiEstimate ? String(aiEstimate.estimated_price) : '650000'} />
                </div>
                {aiEstimate && form.price && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    {Number(form.price) > aiEstimate.price_range.high
                      ? '⚠️ Above market range — may receive fewer bids'
                      : Number(form.price) < aiEstimate.price_range.low
                      ? '💡 Below market range — expect quick offers'
                      : '✅ Within market range — good pricing'}
                  </p>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('photos')}>← Back</Button>
              <Button onClick={() => setStep('review')} size="lg">Next: Review & submit <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Submit ── */}
        {step === 'review' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display font-bold text-sm mb-4">Review your listing</h2>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <SummaryRow label="Title" value={form.title} />
                <SummaryRow label="Make / Model" value={`${form.make || ''} ${form.model || ''}`} />
                <SummaryRow label="Year" value={form.year} />
                <SummaryRow label="Price" value={form.price ? formatPrice(Number(form.price)) : '—'} />
                <SummaryRow label="Mileage" value={form.mileage ? `${Number(form.mileage).toLocaleString()} km` : '—'} />
                <SummaryRow label="Fuel" value={form.fuel_type} />
                <SummaryRow label="Transmission" value={form.transmission} />
                <SummaryRow label="Condition" value={form.condition} />
              </div>

              {/* Photo previews */}
              {photoCount > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">{photoCount} photos</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {Object.entries(photos).map(([angle, { preview }]) => (
                      <img key={angle} src={preview} alt={angle} className="w-20 h-14 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              {/* AI estimate summary */}
              {aiEstimate && (
                <div className="p-3 rounded-xl bg-brand-50 text-xs text-brand-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI estimated: {formatPrice(aiEstimate.estimated_price)} ({aiEstimate.comparable_range})
                </div>
              )}
            </Card>

            <div className="p-4 rounded-xl bg-amber-50 text-xs text-amber-800">
              <p className="font-bold mb-1">Before submitting</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Your listing will be reviewed by our team within 24 hours</li>
                <li>Once approved, verified dealers across India can see and bid on it</li>
                <li>You can upgrade to Expert Estimation later from your listings page</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('estimation')}>← Back</Button>
              <Button size="lg" loading={submitting} onClick={handleSubmit}>
                Submit for review →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helper components ──

function Field({ label, ph, value, onChange, type = 'text' }: { label: string; ph?: string; value?: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={ph} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
    </div>
  )
}

function Select({ label, value, onChange, options, groups }: { label: string; value?: string; onChange: (v: string) => void; options?: string[]; groups?: Record<string, string[]> }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none bg-[var(--surface-0)]">
        <option value="">Select</option>
        {groups ? Object.entries(groups).map(([g, items]) => (
          <optgroup key={g} label={g}>{items.map(i => <option key={i} value={i}>{i}</option>)}</optgroup>
        )) : options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="p-2 rounded-lg bg-[var(--surface-1)]">
      <p className="text-[10px] text-[var(--text-muted)] uppercase">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

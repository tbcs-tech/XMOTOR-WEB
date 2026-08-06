'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi } from '@/lib/api'
import { Button, Card, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const FUEL = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG']
const TRANS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT']
const BODY = ['Hatchback', 'Sedan', 'SUV', 'MUV/MPV', 'Coupe', 'Pickup Truck']
const COND = ['Excellent', 'Good', 'Fair', 'Poor']

export default function EditVehiclePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    vehiclesApi.get(Number(id)).then(res => {
      const v = res.vehicle
      if (v.seller_id !== user?.id) { router.push('/dashboard/seller'); return }
      setForm({
        title: v.title, make: v.make, model: v.model, year: v.year,
        price: v.price, mileage: v.mileage, fuel_type: v.fuel_type,
        transmission: v.transmission, body_type: v.body_type,
        engine: v.engine, exterior_color: v.exterior_color,
        interior_color: v.interior_color, condition: v.condition,
        description: v.description, features: (v.features || []).join(', '),
      })
    }).finally(() => setLoading(false))
  }, [id, user])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const features = form.features ? form.features.split(',').map((f: string) => f.trim()).filter(Boolean) : []
      await vehiclesApi.update(Number(id), { ...form, features, year: parseInt(form.year), price: parseFloat(form.price), mileage: parseInt(form.mileage || '0') })
      toast.success('Listing updated!')
      router.push('/dashboard/seller/listings')
    } catch (e: any) {
      toast.error(e.data?.error || 'Failed to update')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-[var(--text-muted)]">Loading...</div>

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-24">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/dashboard/seller/listings" className="text-white/60 text-sm hover:text-white">← My Listings</Link>
          <h1 className="font-display font-bold text-xl mt-1">Edit listing</h1>
          <p className="text-white/50 text-sm mt-1">{form.title}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-4">Vehicle details</h2>
          <div className="space-y-4">
            <Fld label="Title" value={form.title} onChange={v => set('title', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Fld label="Make" value={form.make} onChange={v => set('make', v)} />
              <Fld label="Model" value={form.model} onChange={v => set('model', v)} />
              <Fld label="Year" value={String(form.year || '')} onChange={v => set('year', v)} type="number" />
              <Fld label="Price (₹)" value={String(form.price || '')} onChange={v => set('price', v)} type="number" />
              <Fld label="Mileage (km)" value={String(form.mileage || '')} onChange={v => set('mileage', v)} type="number" />
              <Sel label="Fuel" value={form.fuel_type} onChange={v => set('fuel_type', v)} options={FUEL} />
              <Sel label="Transmission" value={form.transmission} onChange={v => set('transmission', v)} options={TRANS} />
              <Sel label="Body type" value={form.body_type} onChange={v => set('body_type', v)} options={BODY} />
              <Fld label="Engine" value={form.engine} onChange={v => set('engine', v)} />
              <Fld label="Exterior colour" value={form.exterior_color} onChange={v => set('exterior_color', v)} />
              <Sel label="Condition" value={form.condition} onChange={v => set('condition', v)} options={COND} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Description</label>
              <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none focus:border-brand-500" />
            </div>
            <Fld label="Features (comma separated)" value={form.features} onChange={v => set('features', v)} />
          </div>
        </Card>
        <div className="flex justify-between">
          <Link href="/dashboard/seller/listings"><Button variant="secondary">Cancel</Button></Link>
          <Button size="lg" loading={saving} onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}

function Fld({ label, value, onChange, type = 'text' }: { label: string; value?: string; onChange: (v: string) => void; type?: string }) {
  return (<div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{label}</label><input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>)
}

function Sel({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: string[] }) {
  return (<div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{label}</label><select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]"><option value="">Select</option>{options.map(o => <option key={o}>{o}</option>)}</select></div>)
}

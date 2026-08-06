'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { vehicles as vehiclesApi, getAccessToken } from '@/lib/api'
import { Button, Card } from '@/components/ui'
import { Camera, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const MAKES = { 'Indian': ['Tata Motors', 'Mahindra', 'Maruti Suzuki'], 'International': ['Hyundai', 'Kia', 'Toyota', 'Honda', 'Volkswagen', 'Skoda', 'MG'], 'Luxury': ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Land Rover', 'Volvo'] }
const FUEL = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
const TRANS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT']
const BODY = ['Hatchback', 'Sedan', 'SUV', 'MUV/MPV', 'Coupe', 'Pickup Truck']
const ANGLES = ['front', 'rear', 'left', 'right', 'interior', 'dashboard', 'engine']

export default function DealerAddVehiclePage() {
  const router = useRouter()
  const [form, setForm] = useState<any>({ listing_type: 'sale' })
  const [photos, setPhotos] = useState<Record<string, { file: File; preview: string }>>({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handlePhotoChange = (angle: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setPhotos(p => ({ ...p, [angle]: { file, preview: e.target?.result as string } }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.make || !form.model || !form.year || !form.price) { toast.error('Fill all required fields'); return }
    setSubmitting(true)
    try {
      const features = form.features ? form.features.split(',').map((f: string) => f.trim()).filter(Boolean) : []
      const res = await vehiclesApi.create({ ...form, features, listing_type: 'sale', year: parseInt(form.year), price: parseFloat(form.price), mileage: parseInt(form.mileage || '0') })
      if (Object.keys(photos).length > 0) {
        const fd = new FormData()
        Object.entries(photos).forEach(([a, { file }]) => fd.append(a, file))
        const token = getAccessToken()
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/vehicles/${res.vehicle_id}/images`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd })
      }
      toast.success('Vehicle added to inventory!')
      router.push('/dashboard/dealer/inventory')
    } catch (e: any) { toast.error(e.data?.error || 'Failed') } finally { setSubmitting(false) }
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-24">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/dashboard/dealer/inventory" className="text-white/60 text-sm hover:text-white">← Inventory</Link>
          <h1 className="font-display font-bold text-xl mt-1">Add vehicle to inventory</h1>
          <p className="text-white/50 text-sm mt-1">This vehicle will appear in your dealership listing.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-4">Vehicle details</h2>
          <div className="space-y-4">
            <Fld label="Title *" ph="e.g. 2023 BMW X5 xDrive40i M Sport" value={form.title} onChange={v => set('title', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Sel label="Make *" value={form.make} onChange={v => set('make', v)} groups={MAKES} />
              <Fld label="Model *" ph="X5, GLC, Cayenne" value={form.model} onChange={v => set('model', v)} />
              <Sel label="Year *" value={form.year} onChange={v => set('year', v)} options={Array.from({length:21},(_,i)=>String(2025-i))} />
              <Fld label="Showroom price (₹) *" ph="9200000" value={form.price} onChange={v => set('price', v)} type="number" />
              <Fld label="Kilometres" ph="5200" value={form.mileage} onChange={v => set('mileage', v)} type="number" />
              <Sel label="Fuel" value={form.fuel_type} onChange={v => set('fuel_type', v)} options={FUEL} />
              <Sel label="Transmission" value={form.transmission} onChange={v => set('transmission', v)} options={TRANS} />
              <Sel label="Body type" value={form.body_type} onChange={v => set('body_type', v)} options={BODY} />
              <Fld label="Engine" ph="3.0L TwinPower Turbo" value={form.engine} onChange={v => set('engine', v)} />
              <Fld label="Colour" ph="Mineral White Metallic" value={form.exterior_color} onChange={v => set('exterior_color', v)} />
            </div>
            <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Description</label><textarea value={form.description||''} onChange={e => set('description', e.target.value)} rows={4} placeholder="Detailed description, warranty info, ownership history…" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none focus:border-brand-500" /></div>
            <Fld label="Features (comma separated)" ph="M Sport, HUD, Harman Kardon, Panoramic Roof" value={form.features} onChange={v => set('features', v)} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-3">Photos</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-4">
            {ANGLES.map(angle => (
              <label key={angle} className="cursor-pointer group"><input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoChange(angle, f) }} />
                <div className={`aspect-square rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center gap-0.5 transition-colors ${photos[angle] ? 'border-brand-500' : 'border-[var(--border)] group-hover:border-brand-300'}`}>
                  {photos[angle] ? <img src={photos[angle].preview} alt={angle} className="w-full h-full object-cover" /> : <><Camera className="w-5 h-5 text-[var(--text-muted)] opacity-50" /><span className="text-[9px] text-[var(--text-muted)] font-semibold uppercase">{angle}</span></>}
                </div>
              </label>
            ))}
          </div>
        </Card>
        <div className="flex justify-between">
          <Link href="/dashboard/dealer"><Button variant="secondary">Cancel</Button></Link>
          <Button size="lg" loading={submitting} onClick={handleSubmit}>Add to inventory</Button>
        </div>
      </div>
    </div>
  )
}

function Fld({ label, ph, value, onChange, type='text' }: any) { return (<div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{label}</label><input type={type} value={value||''} onChange={(e: any) => onChange(e.target.value)} placeholder={ph} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>) }
function Sel({ label, value, onChange, options, groups }: any) { return (<div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{label}</label><select value={value||''} onChange={(e: any) => onChange(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]"><option value="">Select</option>{groups ? Object.entries(groups).map(([g, items]: any) => <optgroup key={g} label={g}>{items.map((i: string) => <option key={i}>{i}</option>)}</optgroup>) : options?.map((o: string) => <option key={o}>{o}</option>)}</select></div>) }

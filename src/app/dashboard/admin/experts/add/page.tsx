'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { estimation as estApi } from '@/lib/api'
import { Button, Card } from '@/components/ui'
import toast from 'react-hot-toast'

export default function AddExpertPage() {
  const router = useRouter()
  const [form, setForm] = useState<any>({ type: 'garage', specialization: 'all', inspection_fee: 1500 })
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.city) { toast.error('Name and City are required'); return }
    setLoading(true)
    try {
      await estApi.adminCreateExpert(form)
      toast.success('Expert onboarded!')
      router.push('/dashboard/admin/experts')
    } catch (e: any) {
      toast.error(e.data?.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/dashboard/admin/experts" className="text-white/60 text-sm hover:text-white">← Expert Management</Link>
          <h1 className="font-display font-bold text-xl mt-1">Onboard New Expert</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">Expert / Garage Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Business Name *', ph: 'AutoCheck Pro Mumbai' },
              { key: 'phone', label: 'Phone', ph: '+91 98765 43210' },
              { key: 'email', label: 'Email', ph: 'inspect@garage.com' },
              { key: 'address', label: 'Address', ph: 'Shop 12, Auto Lane' },
              { key: 'city', label: 'City *', ph: 'Mumbai' },
              { key: 'state', label: 'State', ph: 'Maharashtra' },
              { key: 'area', label: 'Area / Locality', ph: 'Andheri West' },
              { key: 'pin_code', label: 'PIN Code', ph: '400058' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{f.label}</label>
                <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                <option value="garage">Garage</option>
                <option value="independent">Independent Inspector</option>
                <option value="certified">Certified Center</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Specialization</label>
              <select value={form.specialization} onChange={e => set('specialization', e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                <option value="all">All Vehicles</option>
                <option value="luxury">Luxury / Imported</option>
                <option value="commercial">Commercial</option>
                <option value="two-wheeler">Two Wheelers</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Inspection Fee (₹)</label>
              <input type="number" value={form.inspection_fee} onChange={e => set('inspection_fee', Number(e.target.value))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Description</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={4} placeholder="Certifications, experience, equipment, team size…" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm outline-none resize-none focus:border-brand-500" />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/admin/experts"><Button variant="secondary">Cancel</Button></Link>
          <Button size="lg" loading={loading} onClick={handleSubmit}>Onboard Expert</Button>
        </div>
      </div>
    </div>
  )
}

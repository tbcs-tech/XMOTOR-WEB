'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { stores as storesApi } from '@/lib/api'
import { Button, Card, Badge } from '@/components/ui'
import toast from 'react-hot-toast'

export default function StoreSettingsPage() {
  const { user } = useAuth()
  const [store, setStore] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    storesApi.mine().then(r => {
      if (r.store) { setStore(r.store); setForm(r.store) }
    }).finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await storesApi.update(form)
      setStore(res.store)
      toast.success('Store updated!')
    } catch (e: any) {
      toast.error(e.data?.error || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/dashboard/dealer" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Store Settings</h1>
          <p className="text-white/50 text-sm mt-1">Manage your dealership profile visible to sellers and buyers.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {store && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)]">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-xl">
              {store.name?.charAt(0)}
            </div>
            <div>
              <p className="font-display font-bold">{store.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{store.city}, {store.state}</p>
            </div>
            {store.is_verified && <Badge variant="success" className="ml-auto">✓ Verified</Badge>}
          </div>
        )}

        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">Store Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Store Name *', ph: 'Your Dealership Name' },
              { key: 'tagline', label: 'Tagline', ph: 'Short catchy line' },
              { key: 'phone', label: 'Phone', ph: '+91 98765 43210' },
              { key: 'email', label: 'Email', ph: 'store@email.com' },
              { key: 'website', label: 'Website', ph: 'https://yoursite.com' },
              { key: 'hours', label: 'Business Hours', ph: 'Mon–Sat: 9AM–7PM' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{f.label}</label>
                <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'address', label: 'Street Address', ph: '123 Auto Street' },
              { key: 'city', label: 'City *', ph: 'Mumbai' },
              { key: 'state', label: 'State', ph: 'Maharashtra' },
              { key: 'zip', label: 'PIN Code', ph: '400001' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">{f.label}</label>
                <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">About Your Dealership</h2>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={5} placeholder="Tell customers about your dealership — history, specializations, certifications, why they should buy from you…" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500 resize-none" />
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/dealer"><Button variant="secondary">Cancel</Button></Link>
          <Button loading={saving} onClick={handleSave} size="lg">Save Store Settings</Button>
        </div>
      </div>
    </div>
  )
}

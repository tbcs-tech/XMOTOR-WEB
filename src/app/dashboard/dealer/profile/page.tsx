'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { auth as authApi, stores as storesApi } from '@/lib/api'
import { Button, Card } from '@/components/ui'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DealerProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth()
  const [store, setStore] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/auth/login') }, [isAuthenticated, isLoading])
  useEffect(() => {
    if (user) { setName(user.full_name || ''); setPhone(user.phone || '') }
    storesApi.mine().then(r => setStore(r.store)).catch(() => {})
  }, [user])

  const save = async () => {
    setSaving(true)
    try { const r = await authApi.updateProfile({ full_name: name, phone }); updateUser(r.user); toast.success('Updated') }
    catch { toast.error('Failed') } finally { setSaving(false) }
  }

  if (!user) return null

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard/dealer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">My Profile</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <Card className="p-5 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-500 text-white font-display font-bold text-3xl flex items-center justify-center mx-auto mb-3">{user.full_name?.charAt(0) || 'D'}</div>
          <h3 className="font-display font-bold">{user.full_name}</h3>
          <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">Dealer Partner</span>
          {store && (
            <Link href="/dashboard/dealer/store" className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-[var(--surface-1)] text-sm font-semibold hover:bg-[var(--surface-2)] transition-colors">
              <span>🏪</span> {store.name}
            </Link>
          )}
          {!store && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 text-xs text-amber-700">
              <p className="font-semibold mb-1">Complete your store profile</p>
              <p>Set up your showroom details to get a verified badge and appear in the dealer directory.</p>
              <Link href="/dashboard/dealer/store" className="text-brand-500 font-medium mt-1 inline-block hover:underline">Set up store →</Link>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
            <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
          </div>
          <div className="flex justify-end"><Button loading={saving} onClick={save}>Save Changes</Button></div>
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <div><p className="font-semibold text-sm">Store Profile</p><p className="text-xs text-[var(--text-muted)]">Showroom name, location, photos</p></div>
            <Link href="/dashboard/dealer/store"><Button variant="secondary" size="sm">Manage Store</Button></Link>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <Button variant="danger" onClick={() => { logout(); router.push('/') }}>Sign Out</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

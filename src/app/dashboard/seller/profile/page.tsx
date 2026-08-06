'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { auth as authApi } from '@/lib/api'
import { Button, Card } from '@/components/ui'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Lucknow', 'Chandigarh']

export default function SellerProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCityVal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/auth/login') }, [isAuthenticated, isLoading])
  useEffect(() => { if (user) { setName(user.full_name || ''); setPhone(user.phone || ''); setCityVal(user.city || '') } }, [user])

  const save = async () => {
    setSaving(true)
    try {
      const r = await authApi.updateProfile({ full_name: name, phone, city: city })
      updateUser(r.user)
      toast.success('Profile updated')
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  if (!user) return null

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard/seller" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">My Profile</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <Card className="p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-500 text-white font-display font-bold text-3xl flex items-center justify-center mx-auto mb-3">
              {user.full_name?.charAt(0) || '?'}
            </div>
            <h3 className="font-display font-bold">{user.full_name}</h3>
            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
            {user.city && <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {user.city}</p>}
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">Individual</span>
            <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-2">
              <div className="flex justify-between"><span>Member Since</span><strong>{user.created_at?.slice(0, 10)}</strong></div>
              <div className="flex justify-between"><span>Status</span><strong className={user.is_approved ? 'text-green-600' : 'text-amber-600'}>{user.is_approved ? 'Verified' : 'Pending'}</strong></div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b border-[var(--border)]">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block flex items-center gap-1"><MapPin className="w-3 h-3" /> City</label>
                <select value={city} onChange={e => setCityVal(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Email</label>
              <input value={user.email} disabled className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-1)] text-[var(--text-muted)]" />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Email cannot be changed.</p>
            </div>
            <div className="flex justify-end"><Button onClick={save} loading={saving}>Save Changes</Button></div>
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <Button variant="danger" onClick={() => { logout(); router.push('/') }}>Sign Out</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

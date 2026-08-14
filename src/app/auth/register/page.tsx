'use client'
// @ts-nocheck

import React, { useState , Suspense} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useCity } from '@/lib/store'
import { Button, Card } from '@/components/ui'
import { User, Store, ArrowRight, ArrowLeft, CheckCircle, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const SUPPORTED_CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Lucknow', 'Chandigarh']

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const { setCity } = useCity()

  const [step, setStep] = useState<'type' | 'form'>(searchParams.get('type') ? 'form' : 'type')
  const [accountType, setAccountType] = useState(searchParams.get('type') || '')
  const [form, setForm] = useState({ full_name: '', email: '', username: '', password: '', confirm_password: '', phone: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const selectType = (type: string) => { setAccountType(type); setStep('form') }

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name || !form.email || !form.username || !form.password || !form.city) {
      setError('Please fill all required fields including city'); return
    }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError('Password needs at least one uppercase letter and one number'); return
    }
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await register({ ...form, account_type: accountType || 'individual' })
      setCity(form.city)
      toast.success('Account created! Awaiting approval.')
      router.push('/auth/pending')
    } catch (err: any) {
      setError(err.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="10" width="18" height="8" rx="2" stroke="white" strokeWidth="2"/><path d="M5 10L7.5 5H16.5L19 10" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="7.5" cy="15" r="1.5" fill="white"/><circle cx="16.5" cy="15" r="1.5" fill="white"/></svg>
          </div>
          <h1 className="font-display font-extrabold text-2xl">Create your account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Join XMotor to buy or sell vehicles</p>
        </div>

        {/* Step 1: Choose type */}
        {step === 'type' && (
          <div className="space-y-3 animate-slide-up">
            <p className="text-sm font-medium text-center text-[var(--text-secondary)] mb-4">I want to...</p>
            <button onClick={() => selectType('individual')} className="w-full text-left">
              <Card className="p-4 hover:border-brand-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><User className="w-6 h-6 text-blue-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-sm">Buy or sell my car</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Individual account — browse dealers, list your vehicle for bids, get AI pricing</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </div>
              </Card>
            </button>
            <button onClick={() => selectType('partner')} className="w-full text-left">
              <Card className="p-4 hover:border-brand-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0"><Store className="w-6 h-6 text-teal-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-sm">Register as dealer</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Dealer account — bid on vehicles, manage inventory, grow your showroom</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </div>
              </Card>
            </button>
            <p className="text-xs text-center text-[var(--text-muted)] mt-4">Already have an account? <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">Sign in</Link></p>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 'form' && (
          <div className="animate-slide-up">
            <Card className="p-5">
              <button onClick={() => setStep('type')} className="flex items-center gap-2 mb-4 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <ArrowLeft className="w-4 h-4" />
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--surface-1)] text-xs font-medium">
                  {accountType === 'partner' ? '🏪 Dealer' : '👤 Individual'}
                  <CheckCircle className="w-3 h-3 text-brand-500" />
                </span>
              </button>

              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-4">{error}</div>}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Full Name *</label>
                  <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder={accountType === 'partner' ? 'Dealership or owner name' : 'Your full name'} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Username *</label>
                    <input value={form.username} onChange={e => set('username', e.target.value)} placeholder="Choose username" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                  </div>
                </div>

                {/* City selector */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Your City *</label>
                  <select value={form.city} onChange={e => set('city', e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none bg-[var(--surface-0)] focus:border-brand-500">
                    <option value="">Select your city</option>
                    {SUPPORTED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="_other">My city is not listed</option>
                  </select>
                  {form.city === '_other' && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                      <p className="font-semibold text-amber-800 mb-1">We're expanding! 🚀</p>
                      <p className="text-xs text-amber-700 leading-relaxed">XMotor is currently available in {SUPPORTED_CITIES.length} cities across India. We're working hard to bring our platform to more cities soon.</p>
                      <p className="text-xs text-amber-700 mt-2 font-medium">Available cities:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {SUPPORTED_CITIES.map(c => <span key={c} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">{c}</span>)}
                      </div>
                      <p className="text-xs text-amber-600 mt-2 italic">Drop your email above and we'll notify you when we launch in your city!</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Password *</label>
                    <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Confirm *</label>
                    <input type="password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} placeholder="Repeat" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">Password: 8+ characters, one uppercase, one number.</p>

                {/* Dealer extra info prompt */}
                {accountType === 'partner' && (
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                    <p className="text-xs text-teal-800 font-semibold mb-1">🏪 Dealer registration</p>
                    <p className="text-[11px] text-teal-700 leading-relaxed">Once your account is approved, you'll be able to set up your store profile — add your showroom name, address, GST details, photos, and contact info. Complete profiles get verified badges and appear in our dealer directory.</p>
                  </div>
                )}
              </div>

              <Button className="w-full mt-4" size="lg" onClick={handleSubmit} loading={loading} disabled={form.city === '_other'}>
                Create account
              </Button>

              {accountType === 'partner' && (
                <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">Dealer accounts require admin approval within 24 hours.</p>
              )}
            </Card>
            <p className="text-xs text-center text-[var(--text-muted)] mt-4">Already have an account? <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">Sign in</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[var(--text-muted)]">Loading…</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}

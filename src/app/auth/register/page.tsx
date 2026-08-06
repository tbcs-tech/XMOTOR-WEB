'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useCity } from '@/lib/store'
import { otp as otpApi } from '@/lib/api'
import { Button, Card } from '@/components/ui'
import { User, Store, ArrowRight, ArrowLeft, CheckCircle, MapPin, Mail, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const SUPPORTED_CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Lucknow', 'Chandigarh']

type Step = 'type' | 'form' | 'otp' | 'done'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const { setCity } = useCity()

  const [step, setStep] = useState<Step>(searchParams.get('type') ? 'form' : 'type')
  const [accountType, setAccountType] = useState(searchParams.get('type') || '')
  const [form, setForm] = useState({ full_name: '', email: '', username: '', password: '', confirm_password: '', phone: '', city: '' })
  const [otpCode, setOtpCode] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return
    const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    return () => clearTimeout(t)
  }, [otpTimer])

  const selectType = (type: string) => { setAccountType(type); setStep('form') }

  // Validate form and send OTP
  const handleSendOtp = async () => {
    setError('')
    if (!form.full_name || !form.email || !form.username || !form.password || !form.city) {
      setError('Please fill all required fields'); return
    }
    if (form.city === '_other') { setError('Please select a supported city'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError('Password needs one uppercase letter and one number'); return
    }
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }

    setOtpSending(true)
    try {
      const res = await otpApi.send(form.email, 'verify')
      if (res.dev_otp) setDevOtp(res.dev_otp) // Dev mode: show OTP
      setStep('otp')
      setOtpTimer(120) // 2 minute countdown
      toast.success('Verification code sent to your email')
    } catch (err: any) {
      setError(err.data?.error || 'Failed to send verification code')
    } finally { setOtpSending(false) }
  }

  // Verify OTP then create account
  const handleVerifyAndRegister = async () => {
    setError('')
    if (otpCode.length !== 6) { setError('Enter the 6-digit code'); return }

    setLoading(true)
    try {
      // Verify OTP first
      await otpApi.verify(form.email, otpCode, 'verify')

      // Then create account
      await register({ ...form, account_type: accountType || 'individual' })
      setCity(form.city)
      setStep('done')
      toast.success('Account created!')
      setTimeout(() => router.push('/auth/pending'), 2000)
    } catch (err: any) {
      setError(err.data?.error || 'Verification failed')
    } finally { setLoading(false) }
  }

  // Resend OTP
  const handleResend = async () => {
    if (otpTimer > 0) return
    setOtpSending(true)
    try {
      const res = await otpApi.send(form.email, 'verify')
      if (res.dev_otp) setDevOtp(res.dev_otp)
      setOtpTimer(120)
      toast.success('New code sent')
    } catch { toast.error('Failed to resend') }
    finally { setOtpSending(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="10" width="18" height="8" rx="2" stroke="white" strokeWidth="2"/><path d="M5 10L7.5 5H16.5L19 10" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="7.5" cy="15" r="1.5" fill="white"/><circle cx="16.5" cy="15" r="1.5" fill="white"/></svg>
          </div>
          <h1 className="font-display font-extrabold text-2xl">
            {step === 'otp' ? 'Verify your email' : step === 'done' ? 'You\'re in!' : 'Create your account'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {step === 'otp' ? `Enter the code sent to ${form.email}` : step === 'done' ? 'Account created successfully' : 'Join XMotor to buy or sell vehicles'}
          </p>
        </div>

        {/* Step 1: Choose type */}
        {step === 'type' && (
          <div className="space-y-3 animate-slide-up">
            <p className="text-sm font-medium text-center text-[var(--text-secondary)] mb-4">I want to...</p>
            <button onClick={() => selectType('individual')} className="w-full text-left">
              <Card className="p-4 hover:border-brand-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><User className="w-6 h-6 text-blue-600" /></div>
                  <div className="flex-1"><h3 className="font-display font-bold text-sm">Buy or sell my car</h3><p className="text-xs text-[var(--text-muted)] mt-0.5">Browse dealers, list vehicles, get AI pricing</p></div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </div>
              </Card>
            </button>
            <button onClick={() => selectType('partner')} className="w-full text-left">
              <Card className="p-4 hover:border-brand-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0"><Store className="w-6 h-6 text-teal-600" /></div>
                  <div className="flex-1"><h3 className="font-display font-bold text-sm">Register as dealer</h3><p className="text-xs text-[var(--text-muted)] mt-0.5">Bid on vehicles, manage inventory, grow showroom</p></div>
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
                  {accountType === 'partner' ? '🏪 Dealer' : '👤 Individual'} <CheckCircle className="w-3 h-3 text-brand-500" />
                </span>
              </button>
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-4">{error}</div>}
              <div className="space-y-3">
                <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Full Name *</label>
                  <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder={accountType === 'partner' ? 'Dealership or owner name' : 'Your full name'} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Username *</label>
                    <input value={form.username} onChange={e => set('username', e.target.value)} placeholder="Choose username" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                  <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                </div>
                <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block flex items-center gap-1"><MapPin className="w-3 h-3" /> City *</label>
                  <select value={form.city} onChange={e => set('city', e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                    <option value="">Select your city</option>
                    {SUPPORTED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="_other">My city is not listed</option>
                  </select>
                  {form.city === '_other' && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                      <p className="font-semibold text-amber-800 mb-1">We're expanding! 🚀</p>
                      <p className="text-xs text-amber-700">Currently available in: {SUPPORTED_CITIES.join(', ')}. We'll notify you when we launch in your city!</p>
                    </div>
                  )}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Password *</label>
                    <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                  <div><label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Confirm *</label>
                    <input type="password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} placeholder="Repeat" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" /></div>
                </div>
                {accountType === 'partner' && (
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                    <p className="text-xs text-teal-800 font-semibold mb-1">🏪 Dealer registration</p>
                    <p className="text-[11px] text-teal-700">After approval, you'll set up your store profile with showroom details, photos, and GST info.</p>
                  </div>
                )}
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSendOtp} loading={otpSending} disabled={form.city === '_other'}>
                <Shield className="w-4 h-4" /> Verify email & create account
              </Button>
            </Card>
            <p className="text-xs text-center text-[var(--text-muted)] mt-4">Already have an account? <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">Sign in</Link></p>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 'otp' && (
          <div className="animate-slide-up">
            <Card className="p-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">We sent a 6-digit code to</p>
                <p className="font-medium text-sm">{form.email}</p>
              </div>

              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-4">{error}</div>}

              {/* Dev mode OTP hint */}
              {devOtp && (
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-xs mb-4 text-center">
                  🔧 Dev mode — your code is: <strong className="text-lg">{devOtp}</strong>
                </div>
              )}

              {/* OTP input */}
              <div className="mb-4">
                <input
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full h-14 text-center text-2xl font-display font-bold tracking-[0.5em] rounded-xl border border-[var(--border)] outline-none focus:border-brand-500"
                  autoFocus
                  maxLength={6}
                />
              </div>

              <Button className="w-full" size="lg" onClick={handleVerifyAndRegister} loading={loading} disabled={otpCode.length !== 6}>
                Verify & create account
              </Button>

              <div className="text-center mt-4">
                {otpTimer > 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Resend code in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</p>
                ) : (
                  <button onClick={handleResend} className="text-xs text-brand-500 font-medium hover:underline" disabled={otpSending}>
                    {otpSending ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </div>

              <button onClick={() => { setStep('form'); setError(''); setOtpCode('') }}
                className="w-full mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] text-center">
                ← Change email address
              </button>
            </Card>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'done' && (
          <div className="animate-slide-up text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Account created!</h2>
            <p className="text-sm text-[var(--text-muted)]">Redirecting to approval page...</p>
          </div>
        )}
      </div>
    </div>
  )
}

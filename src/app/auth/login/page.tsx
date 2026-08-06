'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useCity } from '@/lib/store'
import { Button, Card } from '@/components/ui'
import { User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const SUPPORTED_CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Lucknow', 'Chandigarh']

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { setCity } = useCity()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill both fields'); return }
    setLoading(true)
    try {
      const result = await login(email, password)
      toast.success('Welcome back!')

      const userCity = result?.user?.city || ''
      if (userCity && SUPPORTED_CITIES.includes(userCity)) {
        setCity(userCity)
      } else if (userCity) {
        setCity('All India')
        toast(`We're not in ${userCity} yet — showing All India`, { icon: '📍', duration: 4000 })
      }

      const role = result?.user?.account_type || useAuth.getState().user?.account_type
      if (role === 'admin') router.push('/dashboard/admin')
      else if (role === 'partner') router.push('/dashboard/dealer')
      else router.push('/dashboard/seller')
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="10" width="18" height="8" rx="2" stroke="white" strokeWidth="2"/><path d="M5 10L7.5 5H16.5L19 10" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="7.5" cy="15" r="1.5" fill="white"/><circle cx="16.5" cy="15" r="1.5" fill="white"/></svg>
          </div>
          <h1 className="font-display font-extrabold text-2xl">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your XMotor account</p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" autoFocus />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"
                  className="w-full h-10 px-3 pr-10 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>Sign in</Button>
          </form>
        </Card>

        <p className="text-xs text-center text-[var(--text-muted)] mt-4">
          Don't have an account? <Link href="/auth/register" className="text-brand-500 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Button, Input, Card } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Minus, Sparkles,
  ChevronDown, Info,
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface PriceEstimate {
  estimated_price: number
  price_range: { low: number; fair: number; high: number }
  confidence: number
  depreciation_pct: number
  factors: string[]
  ai_insight: string | null
  comparable_range: string
}

export function PriceEstimator() {
  const [form, setForm] = useState({
    make: '', model: '', year: '', mileage: '',
    fuel_type: 'Petrol', condition: 'Good', city: '',
  })
  const [result, setResult] = useState<PriceEstimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleEstimate = async () => {
    if (!form.make || !form.model || !form.year || !form.mileage) {
      setError('Please fill all required fields')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/price-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year),
          mileage: parseInt(form.mileage),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Estimation failed')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">AI Price Estimator</h2>
            <p className="text-xs text-[var(--text-muted)]">Get your car's market value in seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Input label="Make *" placeholder="e.g. Hyundai" value={form.make} onChange={(e) => set('make', e.target.value)} />
          <Input label="Model *" placeholder="e.g. Creta" value={form.model} onChange={(e) => set('model', e.target.value)} />
          <Input label="Year *" type="number" placeholder="2022" value={form.year} onChange={(e) => set('year', e.target.value)} />
          <Input label="Mileage (km) *" type="number" placeholder="25000" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Fuel</label>
            <select value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-0)] text-sm outline-none">
              {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map(f => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Condition</label>
            <select value={form.condition} onChange={(e) => set('condition', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-0)] text-sm outline-none">
              {['Excellent', 'Good', 'Fair', 'Poor'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <Input label="City (optional)" placeholder="e.g. Mumbai" value={form.city}
          onChange={(e) => set('city', e.target.value)} className="mb-4" />

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <Button className="w-full" size="lg" onClick={handleEstimate} loading={loading}>
          <Sparkles className="w-4 h-4" />
          Get Price Estimate
        </Button>
      </Card>

      {/* Results */}
      {result && (
        <Card className="mt-4 p-6 animate-slide-up">
          {/* Main price */}
          <div className="text-center mb-6">
            <p className="text-sm text-[var(--text-muted)] mb-1">Estimated Market Value</p>
            <p className="text-4xl font-display font-extrabold text-brand-500">
              {formatPrice(result.estimated_price)}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Range: {result.comparable_range}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="h-1.5 w-20 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {Math.round(result.confidence * 100)}% confidence
              </span>
            </div>
          </div>

          {/* Price range bar */}
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">Low</p>
              <p className="text-sm font-medium">{formatPrice(result.price_range.low)}</p>
            </div>
            <div className="flex-1 h-3 bg-gradient-to-r from-red-200 via-green-200 to-red-200 rounded-full relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-500 rounded-full border-2 border-white shadow"
                style={{
                  left: `${((result.estimated_price - result.price_range.low) /
                    (result.price_range.high - result.price_range.low)) * 100}%`,
                }}
              />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">High</p>
              <p className="text-sm font-medium">{formatPrice(result.price_range.high)}</p>
            </div>
          </div>

          {/* Factors */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase">Price Factors</p>
            {result.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {f.includes('+') ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : f.includes('-') ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                )}
                <span className="text-[var(--text-secondary)]">{f}</span>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          {result.ai_insight && (
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-xs font-medium text-brand-700">AI Market Insight</span>
              </div>
              <p className="text-sm text-brand-800 dark:text-brand-300 leading-relaxed">
                {result.ai_insight}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

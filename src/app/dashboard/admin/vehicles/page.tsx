'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { admin as adminApi, vehicles as vehiclesApi, ai as aiApi } from '@/lib/api'
import type { FraudCheck } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, getVehicleImage } from '@/lib/utils'
import { CheckCircle, XCircle, Eye, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminVehiclesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    vehiclesApi.list({ per_page: 100 }).then(r => {
      let filtered = r.items
      if (filter === 'pending') filtered = filtered.filter((v: any) => v.status === 'pending' || v.status === 'store_only')
      else if (filter === 'approved') filtered = filtered.filter((v: any) => v.status === 'approved')
      else if (filter === 'rejected') filtered = filtered.filter((v: any) => v.status === 'rejected')
      setItems(filtered)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const approve = async (id: number) => {
    await adminApi.approveVehicle(id)
    toast.success('Vehicle approved')
    load()
  }

  const reject = async (id: number) => {
    await adminApi.rejectVehicle(id, 'Does not meet listing standards')
    toast.success('Vehicle rejected')
    load()
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/dashboard/admin" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Vehicle Management</h1>
          <p className="text-white/50 text-sm mt-1">{items.length} vehicles</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-brand-500 text-white' : 'bg-[var(--surface-0)] border border-[var(--border)] text-[var(--text-secondary)]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Skeleton className="h-64 rounded-2xl" /> : items.length === 0 ? (
          <Card className="p-12 text-center"><p className="text-sm text-[var(--text-muted)]">No vehicles in this category.</p></Card>
        ) : (
          <div className="space-y-3">
            {items.map(v => (
              <Card key={v.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-18 rounded-xl bg-[var(--surface-1)] shrink-0 overflow-hidden">
                    {getVehicleImage(v.images) ? <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-2xl opacity-30">🚗</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{v.title}</h3>
                      <Badge variant={v.status === 'approved' ? 'success' : v.status === 'pending' || v.status === 'store_only' ? 'warning' : 'danger'}>{v.status}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{v.year} · {v.make} {v.model} · <strong className="text-brand-500">{formatPrice(v.price)}</strong> · {v.fuel_type} · {v.mileage?.toLocaleString()} km</p>
                    {v.description && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{v.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {(v.status === 'pending' || v.status === 'store_only') && (
                        <>
                          <button onClick={() => approve(v.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                          <button onClick={() => reject(v.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                        </>
                      )}
                      <Link href={`/vehicle/${v.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] text-[var(--text-muted)] text-xs font-medium hover:bg-[var(--surface-2)]"><Eye className="w-3.5 h-3.5" /> View</Link>
                      {(v.status === 'pending' || v.status === 'store_only') && <RiskCheck vehicleId={v.id} />}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


/**
 * Inline fraud risk check for the approval queue.
 * Runs on demand rather than on page load — one call per listing reviewed,
 * not per listing rendered.
 */
function RiskCheck({ vehicleId }: { vehicleId: number }) {
  const [result, setResult] = useState<FraudCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)

  const run = async () => {
    if (result) { setOpen(!open); return }
    setLoading(true)
    try {
      setResult(await aiApi.fraudCheck(vehicleId))
      setOpen(true)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (failed) return null

  const tone = !result
    ? 'bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
    : result.risk_level === 'low'
    ? 'bg-green-50 text-green-700 hover:bg-green-100'
    : result.risk_level === 'medium'
    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
    : 'bg-red-50 text-red-700 hover:bg-red-100'

  return (
    <>
      <button onClick={run} disabled={loading}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tone}`}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : result?.risk_level === 'low' ? <ShieldCheck className="w-3.5 h-3.5" />
          : <ShieldAlert className="w-3.5 h-3.5" />}
        {loading ? 'Checking...'
          : result ? `Risk ${result.risk_score}/100 · ${result.risk_level}`
          : 'Risk check'}
      </button>

      {open && result && (
        <div className="w-full mt-2 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] animate-slide-up">
          {result.flags.length === 0 ? (
            <p className="text-xs text-green-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> No risk signals detected
              {result.auto_approve && ' — safe to auto-approve'}
            </p>
          ) : (
            <>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                {result.flags.length} signal{result.flags.length !== 1 ? 's' : ''}
              </p>
              <ul className="space-y-1 mb-2">
                {result.flags.map((f, i) => (
                  <li key={i} className="text-xs flex gap-2">
                    <span className={`shrink-0 px-1.5 rounded text-[9px] font-bold uppercase self-start mt-0.5 ${
                      f.severity === 'high' ? 'bg-red-100 text-red-700'
                      : f.severity === 'medium' ? 'bg-amber-100 text-amber-700'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                      {f.severity}
                    </span>
                    <span className="text-[var(--text-secondary)]">{f.detail}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.recommendations?.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              {result.recommendations.join(' · ')}
            </p>
          )}
        </div>
      )}
    </>
  )
}

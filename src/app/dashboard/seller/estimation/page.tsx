'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { estimation as estApi, vehicles as vehiclesApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, timeAgo } from '@/lib/utils'
import { Shield, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react'

export default function EstimationRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [myVehicles, setMyVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      estApi.myRequests().catch(() => ({ requests: [] })),
      vehiclesApi.mine(),
    ]).then(([rRes, vRes]) => {
      setRequests(rRes.requests)
      setMyVehicles(vRes.items)
    }).finally(() => setLoading(false))
  }, [])

  // Vehicles that don't yet have an estimation request
  const eligibleVehicles = myVehicles.filter(v =>
    !requests.find(r => r.vehicle_id === v.id) && v.status !== 'rejected'
  )

  const statusColors: Record<string, 'warning' | 'success' | 'brand' | 'default'> = {
    requested: 'warning', confirmed: 'brand', inspecting: 'brand', completed: 'success',
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/dashboard/seller" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Expert Estimation Certificates</h1>
          <p className="text-white/50 text-sm mt-1">Get your vehicle professionally inspected. Verified listings get 3× more bids.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Info banner */}
        <Card className="p-5 border-l-4 border-l-brand-500">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-sm mb-1">How it works</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Pick an expert near you → pay a refundable deposit → expert inspects your vehicle on-site → you get a verified report attached to your listing. The deposit is refunded when your vehicle sells. Verified listings build dealer trust and attract higher bids.
              </p>
            </div>
          </div>
        </Card>

        {/* Eligible vehicles to get estimated */}
        {eligibleVehicles.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-sm mb-3">Get your vehicle estimated</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eligibleVehicles.map(v => (
                <Card key={v.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{v.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{v.year} · {formatPrice(v.price)}</p>
                    </div>
                    <Link href={`/dashboard/seller/estimation/book/${v.id}`}>
                      <Button size="sm">
                        <Shield className="w-3.5 h-3.5" /> Get Estimated
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Existing requests */}
        <div>
          <h2 className="font-display font-bold text-sm mb-3">Your estimation requests</h2>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
          ) : requests.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No estimation requests yet.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Select a vehicle above to book an expert inspection.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold shrink-0">
                      {r.expert?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{r.vehicle?.title || `Vehicle #${r.vehicle_id}`}</p>
                        <Badge variant={statusColors[r.status] || 'default'}>{r.status}</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Expert: <strong>{r.expert?.name}</strong> · {r.expert?.city}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Fee: ₹{r.fee_amount?.toLocaleString()} {r.fee_paid ? '(paid)' : ''} {r.fee_refunded ? '✓ refunded' : ''}
                      </p>
                      {r.confirmed_date && (
                        <p className="text-xs text-brand-600 mt-1">📅 Scheduled: {r.confirmed_date} at {r.confirmed_time}</p>
                      )}
                      {r.report && (
                        <div className="mt-2 p-2 rounded-lg bg-green-50 text-xs text-green-700">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                          Report submitted — Condition: <strong>{r.report.overall_condition}</strong> · Score: <strong>{r.report.condition_score}/10</strong> · Value: <strong>{formatPrice(r.report.estimated_value)}</strong>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] shrink-0">{timeAgo(r.created_at)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

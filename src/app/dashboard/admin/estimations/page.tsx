'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { estimation as estApi } from '@/lib/api'
import { Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, timeAgo } from '@/lib/utils'
import { Shield, Star, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AdminEstimationsPage() {
  const [experts, setExperts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    estApi.adminListExperts().then(r => setExperts(r.experts)).finally(() => setLoading(false))
  }, [])

  // Sort by number of inspections (most active first)
  const sorted = [...experts].sort((a, b) => b.total_inspections - a.total_inspections)

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/dashboard/admin" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Estimation Reports Overview</h1>
          <p className="text-white/50 text-sm mt-1">Monitor expert performance and estimation accuracy across the platform.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBox label="Total Experts" value={experts.length} color="blue" />
          <StatBox label="Total Inspections" value={experts.reduce((s, e) => s + e.total_inspections, 0)} color="green" />
          <StatBox label="Avg Fairness" value={experts.length > 0 ? (experts.reduce((s, e) => s + e.fairness_score, 0) / experts.length).toFixed(1) : '—'} color="amber" />
          <StatBox label="Suspended" value={experts.filter(e => e.is_suspended).length} color={experts.filter(e => e.is_suspended).length > 0 ? 'red' : 'green'} />
        </div>

        {loading ? <Skeleton className="h-64 rounded-2xl" /> : (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-sm mb-2">Expert performance rankings</h2>
            {sorted.map((e, rank) => (
              <Card key={e.id} className={`p-4 ${e.is_suspended ? 'opacity-60 border-red-200' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-1)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                    #{rank + 1}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg ${
                    e.fairness_score >= 8 ? 'bg-green-50 text-green-700' :
                    e.fairness_score >= 5 ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {e.fairness_score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-display font-bold text-sm">{e.name}</p>
                      {e.is_verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                      {e.is_suspended && <Badge variant="danger">Suspended</Badge>}
                      {e.fairness_score < 4 && !e.is_suspended && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Low score
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{e.city} · {e.type} · {e.specialization}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-display font-bold">{e.total_inspections}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">inspections</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">₹{e.inspection_fee?.toLocaleString()}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">per inspection</p>
                  </div>
                </div>
                {e.is_suspended && e.suspended_reason && (
                  <p className="text-xs text-red-600 mt-2 ml-20">Reason: {e.suspended_reason}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700', amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700',
  }
  return (
    <Card className={`p-4 text-center ${colors[color] || ''}`}>
      <p className="font-display font-extrabold text-2xl">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </Card>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { estimation as estApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { Plus, Star, Shield, Ban, CheckCircle, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    estApi.adminListExperts().then(r => setExperts(r.experts)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const suspend = async (id: number, name: string) => {
    if (!confirm(`Suspend ${name}? They won't receive new inspection requests.`)) return
    await estApi.adminSuspendExpert(id, 'Suspended by admin — performance review')
    toast.success(`${name} suspended`)
    load()
  }

  const activate = async (id: number, name: string) => {
    await estApi.adminActivateExpert(id)
    toast.success(`${name} re-activated`)
    load()
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard/admin" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
            <h1 className="font-display font-bold text-xl mt-1">Expert Management</h1>
            <p className="text-white/50 text-sm mt-1">{experts.length} experts onboarded</p>
          </div>
          <Link href="/dashboard/admin/experts/add">
            <Button size="sm"><Plus className="w-4 h-4" /> Onboard Expert</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? <Skeleton className="h-64 rounded-2xl" /> : experts.length === 0 ? (
          <Card className="p-12 text-center">
            <Shield className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No experts yet</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Onboard garages and inspectors to enable the estimation certificate system.</p>
            <Link href="/dashboard/admin/experts/add"><Button>Onboard First Expert</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {experts.map(e => (
              <Card key={e.id} className={`p-4 ${e.is_suspended ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                    e.fairness_score >= 8 ? 'bg-green-50 text-green-700' :
                    e.fairness_score >= 5 ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {e.fairness_score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display font-bold text-sm">{e.name}</p>
                      {e.is_verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                      {e.is_suspended && <Badge variant="danger">Suspended</Badge>}
                      <Badge variant="default">{e.type}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {e.area}, {e.city}, {e.state}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> <strong>{e.fairness_score}/10</strong> fairness</span>
                      <span>{e.total_inspections} inspections</span>
                      <span>₹{e.inspection_fee?.toLocaleString()} per inspection</span>
                      <span>{e.specialization}</span>
                    </div>
                    {e.is_suspended && e.suspended_reason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {e.suspended_reason}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {e.is_suspended ? (
                      <button onClick={() => activate(e.id, e.name)} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100">
                        <CheckCircle className="w-3.5 h-3.5 inline mr-1" />Re-activate
                      </button>
                    ) : (
                      <button onClick={() => suspend(e.id, e.name)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">
                        <Ban className="w-3.5 h-3.5 inline mr-1" />Suspend
                      </button>
                    )}
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

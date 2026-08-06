'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { estimation as estApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, timeAgo } from '@/lib/utils'
import { Shield, Clock, CheckCircle, ClipboardList, Star, Calendar, MapPin, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExpertDashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    estApi.expertRequests().then(r => setRequests(r.requests)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const confirmRequest = async (reqId: number, date: string, time: string) => {
    try {
      await estApi.expertConfirm(reqId, date, time)
      toast.success('Appointment confirmed!')
      load()
    } catch (e: any) { toast.error(e.data?.error || 'Failed') }
  }

  const pending = requests.filter(r => r.status === 'requested')
  const confirmed = requests.filter(r => r.status === 'confirmed')
  const completed = requests.filter(r => r.status === 'completed')

  const statusColors: Record<string, 'warning' | 'brand' | 'success' | 'default'> = {
    requested: 'warning', confirmed: 'brand', inspecting: 'brand', completed: 'success',
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-display font-bold text-2xl">Expert Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Manage your inspection requests and submit reports.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center bg-amber-50"><p className="font-display font-extrabold text-2xl text-amber-700">{pending.length}</p><p className="text-xs text-amber-600">Pending</p></Card>
          <Card className="p-4 text-center bg-blue-50"><p className="font-display font-extrabold text-2xl text-blue-700">{confirmed.length}</p><p className="text-xs text-blue-600">Confirmed</p></Card>
          <Card className="p-4 text-center bg-green-50"><p className="font-display font-extrabold text-2xl text-green-700">{completed.length}</p><p className="text-xs text-green-600">Completed</p></Card>
          <Card className="p-4 text-center"><p className="font-display font-extrabold text-2xl">{requests.length}</p><p className="text-xs text-[var(--text-muted)]">Total</p></Card>
        </div>

        {loading ? <Skeleton className="h-64 rounded-2xl" /> : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl mb-2">No inspection requests yet</h2>
            <p className="text-sm text-[var(--text-muted)]">When sellers book you for an inspection, requests will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Pending requests — need action */}
            {pending.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Pending requests ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map(r => (
                    <RequestCard key={r.id} request={r} onConfirm={confirmRequest} />
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed — upcoming inspections */}
            {confirmed.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Upcoming inspections ({confirmed.length})
                </h2>
                <div className="space-y-3">
                  {confirmed.map(r => (
                    <Card key={r.id} className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{r.vehicle?.title || `Vehicle #${r.vehicle_id}`}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Seller: {r.seller?.full_name || 'Unknown'} · {r.inspection_location || 'Location TBD'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">📅 {r.confirmed_date} at {r.confirmed_time}</p>
                        </div>
                        <Link href={`/dashboard/expert/report/${r.id}`}>
                          <Button size="sm"><FileText className="w-3.5 h-3.5" /> Submit Report</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Completed ({completed.length})
                </h2>
                <div className="space-y-3">
                  {completed.map(r => (
                    <Card key={r.id} className="p-4 opacity-80">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{r.vehicle?.title || `Vehicle #${r.vehicle_id}`}</p>
                          <p className="text-xs text-[var(--text-muted)]">{timeAgo(r.created_at)}</p>
                        </div>
                        {r.report && (
                          <div className="text-right">
                            <Badge variant="success">Score: {r.report.condition_score}/10</Badge>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{formatPrice(r.report.estimated_value)}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RequestCard({ request: r, onConfirm }: { request: any; onConfirm: (id: number, date: string, time: string) => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [date, setDate] = useState(r.preferred_date || '')
  const [time, setTime] = useState(r.preferred_time || '')

  return (
    <Card className="p-4 border-l-4 border-l-amber-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{r.vehicle?.title || `Vehicle #${r.vehicle_id}`}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {r.vehicle?.year} · {r.vehicle?.make} {r.vehicle?.model} · {r.vehicle?.fuel_type}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Seller: <strong>{r.seller?.full_name || 'Unknown'}</strong>
          </p>
          {r.inspection_location && <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {r.inspection_location}</p>}
          {r.seller_notes && <p className="text-xs text-[var(--text-secondary)] italic mt-1">"{r.seller_notes}"</p>}
          <p className="text-xs text-amber-600 mt-1">Preferred: {r.preferred_date} {r.preferred_time}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-brand-500">₹{r.fee_amount?.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{timeAgo(r.created_at)}</p>
        </div>
      </div>

      {!showConfirm ? (
        <Button size="sm" onClick={() => setShowConfirm(true)}>
          <CheckCircle className="w-3.5 h-3.5" /> Confirm appointment
        </Button>
      ) : (
        <div className="p-3 rounded-xl bg-[var(--surface-1)] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 block">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                <option value="">Select</option>
                <option>9:00 AM – 11:00 AM</option>
                <option>11:00 AM – 1:00 PM</option>
                <option>2:00 PM – 4:00 PM</option>
                <option>4:00 PM – 6:00 PM</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onConfirm(r.id, date, time)}>Confirm</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

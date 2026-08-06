'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { estimation as estApi, vehicles as vehiclesApi } from '@/lib/api'
import { Button, Card, Badge } from '@/components/ui'
import { formatPrice, getVehicleImage } from '@/lib/utils'
import { FileText, CheckCircle, AlertTriangle, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const EXTERIOR_ITEMS = ['Body panels', 'Paint finish', 'Bumpers', 'Headlights & taillights', 'Windshield & glass', 'Door hinges & handles', 'Mirrors', 'Tyres & wheels', 'Underbody rust', 'Spare wheel']
const INTERIOR_ITEMS = ['Seats (fabric/leather)', 'Dashboard', 'Steering wheel', 'AC & climate control', 'Infotainment system', 'Instrument cluster', 'Carpet & upholstery', 'Sunroof/moonroof', 'Seat belts', 'Boot space']
const MECHANICAL_ITEMS = ['Engine start & idle', 'Engine sound', 'Clutch/Gearbox', 'Brakes & ABS', 'Suspension & shocks', 'Power steering', 'Exhaust system', 'Coolant & radiator', 'Oil level & quality', 'Drive shaft & CV joints']
const ELECTRICAL_ITEMS = ['Battery condition', 'Alternator', 'Starter motor', 'All lights working', 'Power windows', 'Central locking', 'Horn & wipers', 'Sensors & cameras', 'OBD-II scan results', 'Wiring condition']
const DOCUMENT_ITEMS = ['RC book (original)', 'Insurance validity', 'Service records', 'PUC certificate', 'Road tax paid', 'Hypothecation status', 'Chassis number match', 'NOC (if interstate)']

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'N/A']

type SectionData = Record<string, { rating: string; note: string }>

export default function SubmitReportPage() {
  const { requestId } = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<any>(null)
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(0)

  // Report data
  const [exterior, setExterior] = useState<SectionData>({})
  const [interior, setInterior] = useState<SectionData>({})
  const [mechanical, setMechanical] = useState<SectionData>({})
  const [electrical, setElectrical] = useState<SectionData>({})
  const [documents, setDocuments] = useState<SectionData>({})
  const [overall, setOverall] = useState({ condition: 'Good', score: '7', value: '', valueLow: '', valueHigh: '', summary: '' })
  const [issues, setIssues] = useState('')
  const [recommendations, setRecommendations] = useState('')

  useEffect(() => {
    estApi.expertRequests().then(r => {
      const req = r.requests.find((x: any) => x.id === Number(requestId))
      if (req) {
        setRequest(req)
        setVehicle(req.vehicle)
        if (req.vehicle?.price) {
          setOverall(o => ({
            ...o,
            value: String(req.vehicle.price),
            valueLow: String(Math.round(req.vehicle.price * 0.85)),
            valueHigh: String(Math.round(req.vehicle.price * 1.1)),
          }))
        }
      }
    }).finally(() => setLoading(false))
  }, [requestId])

  const sections = [
    { title: 'Exterior', items: EXTERIOR_ITEMS, data: exterior, setData: setExterior, icon: '🚗' },
    { title: 'Interior', items: INTERIOR_ITEMS, data: interior, setData: setInterior, icon: '💺' },
    { title: 'Mechanical', items: MECHANICAL_ITEMS, data: mechanical, setData: setMechanical, icon: '⚙️' },
    { title: 'Electrical', items: ELECTRICAL_ITEMS, data: electrical, setData: setElectrical, icon: '⚡' },
    { title: 'Documents', items: DOCUMENT_ITEMS, data: documents, setData: setDocuments, icon: '📄' },
  ]

  const handleSubmit = async () => {
    if (!overall.value || !overall.summary) { toast.error('Fill overall assessment and summary'); return }
    setSubmitting(true)
    try {
      await estApi.expertSubmitReport(Number(requestId), {
        overall_condition: overall.condition.toLowerCase(),
        condition_score: parseFloat(overall.score),
        estimated_value: parseFloat(overall.value),
        estimated_value_low: parseFloat(overall.valueLow || overall.value),
        estimated_value_high: parseFloat(overall.valueHigh || overall.value),
        exterior, interior, mechanical, electrical, documents,
        summary: overall.summary,
        issues_found: issues.split('\n').map(s => s.trim()).filter(Boolean),
        recommendations: recommendations.split('\n').map(s => s.trim()).filter(Boolean),
      })
      toast.success('Report submitted successfully!')
      router.push('/dashboard/expert')
    } catch (e: any) {
      toast.error(e.data?.error || 'Failed to submit report')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-[var(--text-muted)]">Loading...</div>
  if (!request || !vehicle) return <div className="max-w-3xl mx-auto px-4 py-12 text-center">Request not found</div>

  const currentSection = step < sections.length ? sections[step] : null

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-24">
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/dashboard/expert" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">Inspection report</h1>
          <p className="text-white/50 text-sm mt-1">{vehicle.title}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-1">
          {[...sections.map(s => s.title), 'Summary'].map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className={`flex-1 h-0.5 ${step >= i ? 'bg-teal-500' : 'bg-[var(--border)]'}`} />}
              <button onClick={() => setStep(i)} className={`px-2 py-1 rounded-full text-[10px] font-medium ${step === i ? 'bg-teal-500 text-white' : step > i ? 'bg-teal-100 text-teal-700' : 'bg-[var(--surface-0)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
                {label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {/* Vehicle summary */}
        <Card className="p-3 flex items-center gap-3">
          <div className="w-16 h-12 rounded-lg bg-[var(--surface-1)] overflow-hidden shrink-0">
            {getVehicleImage(vehicle.images) && <img src={getVehicleImage(vehicle.images)} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{vehicle.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{vehicle.year} · {vehicle.mileage?.toLocaleString()} km · Asking {formatPrice(vehicle.price)}</p>
          </div>
        </Card>

        {/* Inspection sections (steps 0-4) */}
        {currentSection && (
          <Card className="p-6">
            <h2 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <span className="text-lg">{currentSection.icon}</span> {currentSection.title} Inspection
            </h2>
            <div className="space-y-3">
              {currentSection.items.map(item => (
                <div key={item} className="p-3 rounded-xl bg-[var(--surface-1)]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{item}</p>
                    <div className="flex gap-1">
                      {CONDITIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => currentSection.setData(d => ({ ...d, [item]: { ...d[item], rating: c } }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            currentSection.data[item]?.rating === c
                              ? c === 'Excellent' ? 'bg-green-500 text-white'
                              : c === 'Good' ? 'bg-blue-500 text-white'
                              : c === 'Fair' ? 'bg-amber-500 text-white'
                              : c === 'Poor' ? 'bg-red-500 text-white'
                              : 'bg-gray-400 text-white'
                              : 'bg-[var(--surface-0)] text-[var(--text-muted)] border border-[var(--border)]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    placeholder="Notes (optional)"
                    value={currentSection.data[item]?.note || ''}
                    onChange={e => currentSection.setData(d => ({ ...d, [item]: { ...d[item], note: e.target.value } }))}
                    className="w-full h-8 px-2 rounded-lg border border-[var(--border)] text-xs outline-none focus:border-teal-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {step > 0 && <Button variant="secondary" size="sm" onClick={() => setStep(step - 1)}>← Back</Button>}
              <Button size="sm" onClick={() => setStep(step + 1)} className="ml-auto">Next →</Button>
            </div>
          </Card>
        )}

        {/* Summary (step 5) */}
        {step >= sections.length && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-teal-500" /> Overall Assessment
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Condition *</label>
                  <select value={overall.condition} onChange={e => setOverall(o => ({ ...o, condition: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
                    <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Score (1-10) *</label>
                  <input type="number" min="1" max="10" step="0.5" value={overall.score} onChange={e => setOverall(o => ({ ...o, score: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Fair market value (₹) *</label>
                  <input type="number" value={overall.value} onChange={e => setOverall(o => ({ ...o, value: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none font-display font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Low</label>
                    <input type="number" value={overall.valueLow} onChange={e => setOverall(o => ({ ...o, valueLow: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">High</label>
                    <input type="number" value={overall.valueHigh} onChange={e => setOverall(o => ({ ...o, valueHigh: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-sm outline-none" />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block">Expert summary *</label>
                <textarea value={overall.summary} onChange={e => setOverall(o => ({ ...o, summary: e.target.value }))} rows={4} placeholder="Overall assessment — paint condition, mechanical health, value for money, any red flags for potential buyers…" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none focus:border-teal-500" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Issues found (one per line)</label>
                <textarea value={issues} onChange={e => setIssues(e.target.value)} rows={3} placeholder="Minor scratch on rear bumper&#10;AC compressor needs servicing&#10;Front left tyre worn" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5 block flex items-center gap-1"><CheckCircle className="w-3 h-3 text-blue-500" /> Recommendations (one per line)</label>
                <textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} rows={3} placeholder="Replace front tyres within 5000km&#10;Service AC before summer&#10;Get alignment done" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none" />
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(step - 1)}>← Back</Button>
              <Button size="lg" loading={submitting} onClick={handleSubmit} style={{ background: '#0d9488' }}>
                <FileText className="w-4 h-4" /> Submit report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

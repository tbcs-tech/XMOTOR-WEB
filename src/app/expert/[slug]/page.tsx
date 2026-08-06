'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { estimation as estApi } from '@/lib/api'
import { Card, Badge, Skeleton } from '@/components/ui'
import { Shield, Star, MapPin, Phone, Mail, CheckCircle, Clock } from 'lucide-react'

export default function ExpertProfilePage() {
  const { slug } = useParams()
  const [expert, setExpert] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find expert by slug from the list
    estApi.listExperts().then(r => {
      const found = r.experts.find((e: any) => e.slug === slug)
      setExpert(found || null)
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12"><Skeleton className="h-96 rounded-2xl" /></div>
  if (!expert) return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p className="text-lg">Expert not found</p></div>

  const scoreColor = expert.fairness_score >= 8 ? 'text-green-600' : expert.fairness_score >= 5 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-display font-bold mx-auto mb-4">
            {expert.name.charAt(0)}
          </div>
          <h1 className="font-display font-extrabold text-2xl flex items-center justify-center gap-2">
            {expert.name}
            {expert.is_verified && <CheckCircle className="w-5 h-5 text-teal-300" />}
          </h1>
          <p className="text-white/60 mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {expert.area}, {expert.city}, {expert.state}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="default">{expert.type}</Badge>
            <Badge variant="default">{expert.specialization}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className={`font-display font-extrabold text-3xl ${scoreColor}`}>{expert.fairness_score}</p>
            <p className="text-xs text-[var(--text-muted)]">Fairness score /10</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="font-display font-extrabold text-3xl">{expert.total_inspections}</p>
            <p className="text-xs text-[var(--text-muted)]">Inspections done</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="font-display font-extrabold text-3xl">₹{expert.inspection_fee?.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Per inspection</p>
          </Card>
        </div>

        {/* About */}
        {expert.description && (
          <Card className="p-5 mb-4">
            <h2 className="font-display font-bold text-sm mb-3">About</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{expert.description}</p>
          </Card>
        )}

        {/* Contact */}
        <Card className="p-5 mb-4">
          <h2 className="font-display font-bold text-sm mb-3">Contact & location</h2>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--text-muted)]" /> {expert.address}, {expert.area}, {expert.city} — {expert.pin_code}</p>
            {expert.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--text-muted)]" /> {expert.phone}</p>}
            {expert.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--text-muted)]" /> {expert.email}</p>}
          </div>
        </Card>

        {/* Trust info */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-500" /> Trust & verification</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              {expert.is_verified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
              {expert.is_verified ? 'XMotor verified expert' : 'Verification pending'}
            </p>
            <p className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Fairness score based on {expert.total_inspections} real inspections
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
              The fairness score measures how accurately this expert's estimates match actual sale prices. A score above 8 indicates highly accurate and fair valuations. Experts with scores below 3 are automatically suspended.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

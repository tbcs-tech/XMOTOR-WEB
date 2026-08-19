'use client'
// @ts-nocheck

import React from 'react'
import { LEGAL, fullAddress, missingLegalFields } from '@/lib/legal'
import { Card } from '@/components/ui'
import { Mail, Phone, MapPin, MessageCircle, Clock, ShieldAlert, AlertTriangle } from 'lucide-react'

export default function ContactPage() {
  const missing = missingLegalFields()

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 text-center">
        <h1 className="font-display font-extrabold text-3xl">Get in touch</h1>
        <p className="text-white/50 mt-2 max-w-md mx-auto text-sm">
          Questions, support, or a complaint — here's how to reach us.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {missing.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300">
            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              This page is incomplete — do not publish yet
            </p>
            <p className="text-xs text-amber-800 mt-1.5">
              Fill in the real entity, address and contact details in{' '}
              <code className="font-mono">src/lib/legal.ts</code> before launch.
              Placeholder contact details will fail payment-gateway review.
            </p>
          </div>
        )}

        {/* Primary contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-sm">Email</h3>
            <a href={`mailto:${LEGAL.supportEmail}`} className="text-brand-500 text-sm hover:underline">
              {LEGAL.supportEmail}
            </a>
            <p className="text-xs text-[var(--text-muted)] mt-1">{LEGAL.supportHours}</p>
          </Card>

          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-sm">Phone</h3>
            <a href={`tel:${LEGAL.supportPhone}`} className="text-brand-500 text-sm hover:underline">
              {LEGAL.supportPhone}
            </a>
            <p className="text-xs text-[var(--text-muted)] mt-1">{LEGAL.supportHours}</p>
          </Card>

          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-sm">WhatsApp</h3>
            <a
              href={`https://wa.me/91${(LEGAL.supportPhone || '').replace(/\D/g, '')}`}
              target="_blank" rel="noopener"
              className="text-brand-500 text-sm hover:underline"
            >
              {LEGAL.supportPhone}
            </a>
            <p className="text-xs text-[var(--text-muted)] mt-1">Fastest response</p>
          </Card>

          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-sm">Registered office</h3>
            <p className="text-sm text-[var(--text-secondary)]">{fullAddress()}</p>
          </Card>
        </div>

        {/* Grievance officer — legally required, kept distinct from general support */}
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-brand-500" />
            <h2 className="font-display font-bold text-sm">Grievance Officer</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
            As required under the Consumer Protection (E-Commerce) Rules 2020 and
            the Digital Personal Data Protection Act 2023, complaints that general
            support has not resolved can be escalated here.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--text-muted)] text-xs">Name &amp; designation</p>
              <p className="font-medium">{LEGAL.grievanceOfficerName}</p>
              <p className="text-xs text-[var(--text-muted)]">{LEGAL.grievanceOfficerDesignation}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Contact</p>
              <a href={`mailto:${LEGAL.grievanceOfficerEmail}`} className="text-brand-500 hover:underline block">
                {LEGAL.grievanceOfficerEmail}
              </a>
              <p>{LEGAL.grievanceOfficerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            Acknowledged within {LEGAL.grievanceAckHours} hours · resolved within{' '}
            {LEGAL.grievanceResolutionDays} days
          </div>
        </Card>

        {/* What to contact us about */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { h: 'Buying or selling', d: 'Questions about listings, bids, offers or the estimation certificate.', to: LEGAL.supportEmail },
            { h: 'A dealer partnership', d: 'Onboarding your dealership, bulk uploads, or account approval.', to: LEGAL.supportEmail },
            { h: 'Privacy or data', d: 'Access, correction or deletion requests under the DPDP Act.', to: LEGAL.dataProtectionEmail },
          ].map((c) => (
            <Card key={c.h} className="p-4">
              <h4 className="font-display font-bold text-sm">{c.h}</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1 mb-2">{c.d}</p>
              <a href={`mailto:${c.to}`} className="text-xs text-brand-500 hover:underline">{c.to}</a>
            </Card>
          ))}
        </div>

        {/* Entity details */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-sm mb-3">Entity details</h2>
          <div className="text-sm space-y-1">
            <p><span className="text-[var(--text-muted)]">Legal name:</span> {LEGAL.legalName}</p>
            <p><span className="text-[var(--text-muted)]">CIN:</span> {LEGAL.cin}</p>
            <p><span className="text-[var(--text-muted)]">GSTIN:</span> {LEGAL.gstin}</p>
            <p><span className="text-[var(--text-muted)]">Registered office:</span> {fullAddress()}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--border)] text-xs">
            <a href="/terms" className="text-[var(--text-muted)] hover:text-brand-500">Terms of Service</a>
            <a href="/privacy" className="text-[var(--text-muted)] hover:text-brand-500">Privacy Policy</a>
            <a href="/refunds" className="text-[var(--text-muted)] hover:text-brand-500">Refunds &amp; Cancellation</a>
          </div>
        </Card>
      </div>
    </div>
  )
}

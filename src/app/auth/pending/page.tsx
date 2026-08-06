'use client'

import React from 'react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { Clock, CheckCircle, Bell, ArrowRight } from 'lucide-react'

export default function PendingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-3">Account under review</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          Thank you for joining XMotor! Our team is reviewing your account details. You'll be approved and notified shortly.
        </p>

        <Card className="p-5 text-left mb-6">
          <h3 className="font-display font-bold text-sm mb-3">What happens next?</h3>
          <div className="space-y-3">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-500" />, title: 'Details submitted', desc: 'We received your registration', done: true },
              { icon: <Clock className="w-4 h-4 text-amber-500" />, title: 'Admin review', desc: 'Usually within 2–4 hours', done: false },
              { icon: <Bell className="w-4 h-4 text-[var(--text-muted)]" />, title: 'Get notified', desc: 'Email when your account is approved', done: false },
              { icon: <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />, title: 'Start using XMotor', desc: 'List vehicles, browse, place bids', done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-green-50' : 'bg-[var(--surface-1)]'}`}>{s.icon}</div>
                <div>
                  <p className={`text-sm font-medium ${s.done ? 'text-green-700' : ''}`}>{s.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Link href="/auth/login"><Button className="w-full">Try signing in</Button></Link>
          <Link href="/"><Button variant="secondary" className="w-full">Back to home</Button></Link>
        </div>
      </div>
    </div>
  )
}

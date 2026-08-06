'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui'
import { Shield, Users, Zap, Globe, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display font-extrabold text-3xl">About XMotor</h1>
          <p className="text-white/50 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            Transforming India's ₹6 lakh crore used vehicle market with transparency, technology, and trust.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Story */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl mb-4">The problem we're solving</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              Over 4 crore used vehicles are sold annually in India. Yet the market remains plagued by middlemen who pocket 10-15% commissions, opaque pricing that leaves sellers underpaid and buyers overpaying, and documentation fraud that causes legal nightmares.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              XMotor was built to fix this. We connect individual sellers directly with a verified network of 500+ dealers through a competitive bidding system. No middlemen, no hidden charges, no surprises.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Our AI pricing engine analyses thousands of comparable sales to give sellers a fair market value. Our expert estimation certificate system brings third-party verified inspections that dealers trust. The result: sellers get better prices, dealers get quality inventory, and everyone saves time.
            </p>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: '10,000+', l: 'Vehicles listed', icon: '🚗' },
                { v: '500+', l: 'Verified dealers', icon: '🏪' },
                { v: '₹250 Cr+', l: 'Deals closed', icon: '💰' },
                { v: '48 hrs', l: 'Avg. sale time', icon: '⚡' },
              ].map((s, i) => (
                <Card key={i} className="p-4 text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="font-display font-extrabold text-xl text-brand-500 mt-1">{s.v}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{s.l}</p>
                </Card>
              ))}
            </div>
            <Card className="p-4">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Operating in</p>
              <div className="flex flex-wrap gap-1.5">
                {['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'].map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">{c}</span>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="mt-12">
          <h2 className="font-display font-extrabold text-xl text-center mb-6">Our values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Shield className="w-5 h-5" />, title: 'Transparency first', desc: 'Every price, every bid, every dealer — completely open. No hidden fees ever.' },
              { icon: <Users className="w-5 h-5" />, title: 'Verified trust', desc: 'Aadhaar-linked verification for every user. Expert estimation certificates for vehicles.' },
              { icon: <Globe className="w-5 h-5" />, title: 'Made for India', desc: 'Designed for Indian vehicles, documentation, and the way Indians buy and sell.' },
              { icon: <Zap className="w-5 h-5" />, title: 'Speed matters', desc: 'Most vehicles sell within 48 hours. AI pricing in seconds. Instant notifications.' },
            ].map((v, i) => (
              <Card key={i} className="p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-3">{v.icon}</div>
                <h3 className="font-display font-bold text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12">
          <h2 className="font-display font-extrabold text-xl text-center mb-6">Get in touch</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Phone className="w-5 h-5" />, title: 'Call us', value: '+91 98765 43210', sub: 'Mon–Sat, 9AM–7PM' },
              { icon: <Mail className="w-5 h-5" />, title: 'Email', value: 'support@xmotor.in', sub: 'Response within 4 hours' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp', value: '+91 98765 43210', sub: 'Available 24×7' },
              { icon: <MapPin className="w-5 h-5" />, title: 'Head Office', value: 'Mumbai, MH', sub: 'India — 400001' },
            ].map((c, i) => (
              <Card key={i} className="p-4 text-center">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-1)] flex items-center justify-center mx-auto mb-2 text-[var(--text-muted)]">{c.icon}</div>
                <h4 className="font-display font-bold text-sm">{c.title}</h4>
                <p className="text-xs font-semibold text-brand-500 mt-0.5">{c.value}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{c.sub}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

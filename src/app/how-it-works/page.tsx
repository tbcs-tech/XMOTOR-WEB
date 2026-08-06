'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { Shield, CheckCircle, Clock, Zap } from 'lucide-react'

type Tab = 'sell' | 'buy' | 'dealer'

const STEPS: Record<Tab, { icon: string; title: string; desc: string; detail: string }[]> = {
  sell: [
    { icon: '📝', title: 'List your vehicle', desc: 'Create a free listing in under 10 minutes', detail: 'Add photos from 7 angles, enter RC details, describe condition. Our AI instantly estimates your car\'s market value so you can set a competitive asking price.' },
    { icon: '🤖', title: 'Get AI + Expert estimation', desc: 'Know your car\'s true worth', detail: 'Free AI pricing powered by market data. Optionally upgrade to Expert Estimation — a verified garage inspects your car and issues a certificate that dealers trust. Deposit refunded on sale.' },
    { icon: '🔔', title: 'Receive dealer bids', desc: 'Verified dealers compete for your car', detail: 'Your listing goes live to 500+ verified dealers across India. Receive real-time bid notifications with amounts and dealer profiles. Average seller gets 3-5 bids within 48 hours.' },
    { icon: '✅', title: 'Accept & complete', desc: 'Choose the best offer, drive home happy', detail: 'Accept the highest bid, meet the dealer at their showroom or arrange home pickup. XMotor supports full RC transfer and documentation. Payment secured before handover.' },
  ],
  buy: [
    { icon: '🔍', title: 'Browse verified inventory', desc: 'Thousands of dealer-inspected vehicles', detail: 'Search across all verified dealerships in your city. Filter by make, model, fuel type, price range, and body type. Every vehicle is dealer-inspected and documented.' },
    { icon: '💰', title: 'Check pricing & EMI', desc: 'Know if the price is fair', detail: 'Our AI pricing engine tells you if a vehicle is fairly priced. Built-in EMI calculator helps you plan financing. Compare across dealers instantly.' },
    { icon: '🚗', title: 'Book a test drive', desc: 'Try before you buy', detail: 'Request a test drive directly from the listing page. Visit the dealer showroom or arrange home delivery of the vehicle for testing. No pressure, no commitment.' },
    { icon: '🤝', title: 'Complete the deal', desc: 'Full documentation support', detail: 'RC transfer assistance, insurance transfer, loan processing — all handled. Every dealer is verified and rated. Pay only when you\'re 100% satisfied.' },
  ],
  dealer: [
    { icon: '🏪', title: 'Register your dealership', desc: 'Get set up in 24 hours', detail: 'Create a partner account, add your showroom details, GST number, and photos. Admin approval within 24 hours. Your store profile goes live on XMotor\'s dealer directory.' },
    { icon: '💰', title: 'Browse & bid on stock', desc: 'Source inventory from individual sellers', detail: 'Access individual sellers across India looking for the best price. Place competitive bids on vehicles you want for your inventory. No sourcing fees until a deal closes.' },
    { icon: '📦', title: 'Manage your inventory', desc: 'List, track, and sell from one dashboard', detail: 'Add your own vehicles to your XMotor showroom page. Track views, enquiries, and leads. Manage everything from a single dashboard designed for dealers.' },
    { icon: '📈', title: 'Grow your business', desc: 'Free marketing, verified badge, analytics', detail: 'Get a verified badge that builds trust. Appear in our dealer directory. Free marketing to thousands of buyers. Track your performance with analytics.' },
  ],
}

const TRUST = [
  { icon: <Shield className="w-5 h-5" />, title: 'Identity verified', desc: 'Every user is Aadhaar + PAN verified before getting approved on the platform.' },
  { icon: <CheckCircle className="w-5 h-5" />, title: 'RC transfer support', desc: 'Full RC transfer assistance through official RTO process. No paperwork headaches.' },
  { icon: <Clock className="w-5 h-5" />, title: '24×7 support', desc: 'Dedicated support in Hindi and English. Call, WhatsApp, or chat anytime.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Zero hidden fees', desc: 'No surprises. Transparent pricing. You only pay when a deal closes successfully.' },
]

export default function HowItWorksPage() {
  const [tab, setTab] = useState<Tab>('sell')

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 text-center">
        <h1 className="font-display font-extrabold text-3xl">How XMotor Works</h1>
        <p className="text-white/50 mt-2 max-w-md mx-auto text-sm">The most transparent way to buy and sell vehicles in India.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface-1)] w-fit mx-auto mb-8">
          {([
            { id: 'sell' as Tab, label: 'I want to sell' },
            { id: 'buy' as Tab, label: 'I want to buy' },
            { id: 'dealer' as Tab, label: "I'm a dealer" },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-[var(--surface-0)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-10">
          {STEPS[tab].map((s, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-sm shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{s.icon}</span>
                    <h3 className="font-display font-bold">{s.title}</h3>
                  </div>
                  <p className="text-sm font-medium text-brand-600 mb-2">{s.desc}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{s.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center border-0 mb-10">
          <h3 className="font-display font-bold text-lg mb-2">
            {tab === 'sell' ? 'Ready to sell your car?' : tab === 'buy' ? 'Find your dream vehicle' : 'Join as dealer partner'}
          </h3>
          <p className="text-white/50 text-sm mb-4">
            {tab === 'sell' ? 'List for free and get bids within 48 hours.' : tab === 'buy' ? 'Browse verified dealer inventory across India.' : 'Start sourcing inventory and growing your business.'}
          </p>
          <Link href={tab === 'buy' ? '/buy' : '/auth/register'}>
            <Button size="lg" style={{ background: 'white', color: '#111' }}>Get started →</Button>
          </Link>
        </Card>

        {/* Trust */}
        <h2 className="font-display font-extrabold text-xl text-center mb-6">Why trust XMotor?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map((t, i) => (
            <Card key={i} className="p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-2">{t.icon}</div>
              <h4 className="font-display font-bold text-sm mb-1">{t.title}</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

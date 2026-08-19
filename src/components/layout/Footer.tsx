'use client'

import React from 'react'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'

/**
 * Footer with the legal links. Without this, /terms /privacy /refunds
 * /contact exist but nothing on the site points to them — which defeats the
 * purpose, since Razorpay and the DPDP Act require these to be reachable
 * from the site, not just resolvable by URL.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="hidden md:block bg-[var(--surface-0)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
              Marketplace
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
              <Link href="/buy" className="hover:text-brand-500">Buy a car</Link>
              <Link href="/dashboard/seller/sell" className="hover:text-brand-500">Sell your car</Link>
              <Link href="/explore" className="hover:text-brand-500">Explore</Link>
              <Link href="/dealer" className="hover:text-brand-500">Dealers</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
              Company
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
              <Link href="/about" className="hover:text-brand-500">About</Link>
              <Link href="/how-it-works" className="hover:text-brand-500">How it works</Link>
              <Link href="/contact" className="hover:text-brand-500">Contact</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
              Legal
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
              <Link href="/terms" className="hover:text-brand-500">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-brand-500">Privacy Policy</Link>
              <Link href="/refunds" className="hover:text-brand-500">Refunds &amp; Cancellation</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
              Get in touch
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
              <a href={`mailto:${LEGAL.supportEmail}`} className="hover:text-brand-500">
                {LEGAL.supportEmail}
              </a>
              <a href={`tel:${LEGAL.supportPhone}`} className="hover:text-brand-500">
                {LEGAL.supportPhone}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            © {year} {LEGAL.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {LEGAL.brandName} is an intermediary platform and is not a party to
            any sale.
          </p>
        </div>
      </div>
    </footer>
  )
}

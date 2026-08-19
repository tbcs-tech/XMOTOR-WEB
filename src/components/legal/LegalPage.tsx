'use client'

import React from 'react'
import Link from 'next/link'
import { LEGAL, missingLegalFields } from '@/lib/legal'
import { AlertTriangle } from 'lucide-react'

/**
 * Shared chrome for the legal pages.
 *
 * If LEGAL still holds TODO_ placeholders, this renders a warning at the top.
 * Publishing a policy with placeholder text is worse than not publishing one,
 * and payment gateways reject accounts over it during review.
 */
export function LegalPage({
  title, intro, children,
}: {
  title: string
  intro?: string
  children: React.ReactNode
}) {
  const missing = missingLegalFields()

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ← Home
          </Link>
          <h1 className="font-display font-extrabold text-2xl mt-2">{title}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Last updated: {LEGAL.lastUpdated}
          </p>
          {intro && (
            <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
              {intro}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {missing.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300">
            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              This policy is incomplete — do not publish yet
            </p>
            <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
              {missing.length} required detail{missing.length === 1 ? '' : 's'} still
              hold placeholder values in <code className="font-mono">src/lib/legal.ts</code>:{' '}
              {missing.join(', ')}.
            </p>
            <p className="text-xs text-amber-800 mt-1.5">
              Indian e-commerce rules require a real legal name, registered
              address, customer care contact and a named Grievance Officer.
            </p>
          </div>
        )}

        <article className="space-y-6">{children}</article>

        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            Questions about this policy? Write to{' '}
            <a href={`mailto:${LEGAL.supportEmail}`} className="text-brand-500 hover:underline">
              {LEGAL.supportEmail}
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <Link href="/terms" className="text-[var(--text-muted)] hover:text-brand-500">Terms of Service</Link>
            <Link href="/privacy" className="text-[var(--text-muted)] hover:text-brand-500">Privacy Policy</Link>
            <Link href="/refunds" className="text-[var(--text-muted)] hover:text-brand-500">Refunds &amp; Cancellation</Link>
            <Link href="/contact" className="text-[var(--text-muted)] hover:text-brand-500">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Section({ n, title, children }: {
  n?: string; title: string; children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="font-display font-bold text-base mb-2">
        {n && <span className="text-brand-500 mr-2">{n}</span>}{title}
      </h2>
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  )
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-brand-500 shrink-0">·</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

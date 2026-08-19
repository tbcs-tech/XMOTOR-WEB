'use client'
// @ts-nocheck

import React from 'react'
import { LEGAL, fullAddress } from '@/lib/legal'
import { LegalPage, Section, Bullets } from '@/components/legal/LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`How ${LEGAL.legalName} collects, uses and protects your personal data when you use ${LEGAL.brandName}. Written to align with the Digital Personal Data Protection Act 2023.`}
    >
      <Section n="1." title="Who is responsible for your data">
        <p>
          {LEGAL.legalName} is the Data Fiduciary for the personal data described
          here. Our registered office is {fullAddress()}. For any question about
          this policy or your data, write to{' '}
          <a href={`mailto:${LEGAL.dataProtectionEmail}`} className="text-brand-500 hover:underline">
            {LEGAL.dataProtectionEmail}
          </a>.
        </p>
      </Section>

      <Section n="2." title="What we collect and why">
        <p>We collect only what we need to run the marketplace.</p>

        <div className="mt-3 space-y-3">
          {[
            {
              h: 'Account details',
              d: 'Name, email address, phone number, city, password (stored only as a salted hash), and account type.',
              w: 'To create and secure your account, verify you are a real person, and contact you about your listings, bids and offers.',
            },
            {
              h: 'Vehicle listing details',
              d: 'Make, model, year, odometer reading, registration number, photographs, description and asking price.',
              w: 'To publish your listing and let dealers and buyers evaluate it.',
            },
            {
              h: 'Transaction details',
              d: 'Bids, counter offers, estimation bookings, and payment references returned by our payment gateway.',
              w: 'To operate the bidding and estimation features and to keep a record of what was agreed.',
            },
            {
              h: 'Technical data',
              d: 'IP address, browser type, device information, and pages visited.',
              w: 'To keep the service secure, apply rate limits, diagnose faults and understand which features are used.',
            },
            {
              h: 'Communications',
              d: 'Messages you send us, and messages you attach to a bid or offer.',
              w: 'To provide support and to investigate disputes.',
            },
          ].map((row) => (
            <div key={row.h} className="p-3 rounded-xl bg-[var(--surface-0)] border border-[var(--border)]">
              <p className="font-medium text-sm">{row.h}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{row.d}</p>
              <p className="text-xs mt-1"><span className="text-[var(--text-muted)]">Purpose: </span>{row.w}</p>
            </div>
          ))}
        </div>

        <p className="mt-3">
          We do not collect financial instrument details. Card and UPI details are
          entered directly with our payment gateway and never reach our servers.
        </p>
      </Section>

      <Section n="3." title="Consent and lawful basis">
        <p>
          We process your data on the basis of the consent you give when you create
          an account and when you submit a listing, bid or booking, and for the
          legitimate uses permitted under the DPDP Act — such as responding to a
          request you have made, and complying with a legal obligation.
        </p>
        <p>
          You may withdraw consent at any time by writing to{' '}
          <a href={`mailto:${LEGAL.dataProtectionEmail}`} className="text-brand-500 hover:underline">
            {LEGAL.dataProtectionEmail}
          </a>. Withdrawing consent does not affect processing already carried out,
          and may mean we can no longer provide parts of the service.
        </p>
      </Section>

      <Section n="4." title="What other users can see">
        <p>
          A published listing is public. Anyone visiting {LEGAL.brandName} can see
          the vehicle details, photographs, asking price, city and how long it has
          been listed.
        </p>
        <Bullets items={[
          'Your phone number is shown only to signed-in users, and only on listings where you have chosen to be contacted.',
          'Your email address is never displayed to other users.',
          'When you place a bid or make an offer, the seller sees your name, city and phone number so they can respond.',
          'Dealers see your name and city on listings they bid on.',
        ]} />
      </Section>

      <Section n="5." title="Who we share data with">
        <p>We share data only with processors who help us run the service:</p>
        <Bullets items={[
          <><strong>Cloudflare R2</strong> — stores the photographs you upload.</>,
          <><strong>Razorpay</strong> — processes payments. They receive your name, email and phone to complete a transaction, under their own privacy policy.</>,
          <><strong>Resend</strong> — sends transactional email such as verification codes and bid notifications.</>,
          <><strong>Sentry</strong> — receives error diagnostics. Credentials, passwords, one-time codes and payment identifiers are stripped before transmission.</>,
          <><strong>Google (Gemini)</strong> — where AI features are enabled, listing text and photographs may be sent for price estimation, search interpretation and document reading.</>,
        ]} />
        <p>
          We do not sell your personal data, and we do not share it with
          advertisers. We may disclose data where required by law, court order or a
          lawful request from a government authority.
        </p>
      </Section>

      <Section n="6." title="Where data is stored">
        <p>
          Our servers are located in India. Some processors listed above may
          process data outside India in accordance with their own safeguards and as
          permitted under the DPDP Act.
        </p>
      </Section>

      <Section n="7." title="How long we keep it">
        <Bullets items={[
          'Account data: for as long as your account is open, and for up to three years afterwards where we need it to resolve disputes or meet a legal obligation.',
          'Listings and transaction records: up to eight years, in line with tax and accounting requirements.',
          'Technical logs: up to 90 days.',
          'Backups: rotated on a 14-day daily and 8-week weekly cycle.',
        ]} />
      </Section>

      <Section n="8." title="Your rights">
        <p>Under the DPDP Act 2023 you may:</p>
        <Bullets items={[
          'ask for a summary of the personal data we hold about you and how it is processed;',
          'ask us to correct anything inaccurate, or complete anything incomplete;',
          'ask us to erase your data where it is no longer needed for the purpose it was collected;',
          'nominate another person to exercise these rights on your behalf if you die or become incapacitated;',
          'raise a grievance, and escalate to the Data Protection Board of India if you are not satisfied with our response.',
        ]} />
        <p>
          Most of this can be done from your profile page. For anything else, write
          to{' '}
          <a href={`mailto:${LEGAL.dataProtectionEmail}`} className="text-brand-500 hover:underline">
            {LEGAL.dataProtectionEmail}
          </a>. We respond within {LEGAL.grievanceResolutionDays} days.
        </p>
      </Section>

      <Section n="9." title="How we protect your data">
        <Bullets items={[
          'Passwords are stored as PBKDF2-SHA256 hashes and are never recoverable in plain text.',
          'All traffic is encrypted in transit over HTTPS.',
          'Access to production data is limited to people who need it to operate the service.',
          'Authentication endpoints are rate limited to resist brute-force attempts.',
          'Uploaded content is validated and sanitised before storage.',
        ]} />
        <p>
          No system is perfectly secure. If a breach occurs that is likely to affect
          you, we will notify you and the Data Protection Board as required.
        </p>
      </Section>

      <Section n="10." title="Children">
        <p>
          {LEGAL.brandName} is not intended for anyone under 18, and we do not
          knowingly collect data from children. If you believe a child has given us
          personal data, write to us and we will delete it.
        </p>
      </Section>

      <Section n="11." title="Cookies">
        <p>
          We use cookies and browser storage only to keep you signed in and to
          remember your selected city. We do not use advertising or cross-site
          tracking cookies. Clearing them signs you out.
        </p>
      </Section>

      <Section n="12." title="Grievances">
        <div className="p-3 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-sm">
          <p className="font-medium">{LEGAL.grievanceOfficerName}</p>
          <p className="text-[var(--text-muted)]">{LEGAL.grievanceOfficerDesignation}</p>
          <p className="mt-1">{LEGAL.grievanceOfficerEmail}</p>
          <p>{LEGAL.grievanceOfficerPhone}</p>
        </div>
        <p>
          We acknowledge within {LEGAL.grievanceAckHours} hours and resolve within{' '}
          {LEGAL.grievanceResolutionDays} days. If you remain dissatisfied you may
          approach the Data Protection Board of India.
        </p>
      </Section>
    </LegalPage>
  )
}

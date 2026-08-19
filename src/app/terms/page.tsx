'use client'
// @ts-nocheck

import React from 'react'
import { LEGAL, fullAddress } from '@/lib/legal'
import { LegalPage, Section, Bullets } from '@/components/legal/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms govern your use of ${LEGAL.brandName}, operated by ${LEGAL.legalName}. By creating an account or using the platform you agree to them.`}
    >
      <Section n="1." title="What XMotor is">
        <p>
          {LEGAL.brandName} is an online marketplace that connects people selling
          used vehicles with dealers and buyers. We are an intermediary. We do not
          own, inspect, warrant, sell or take custody of any vehicle listed on the
          platform, and we are not a party to the sale contract between a buyer and
          a seller.
        </p>
        <p>
          Prices, descriptions, photographs and condition claims on a listing are
          supplied by the seller. Where we display an AI-generated price estimate
          or an Expert Estimation Certificate, that is an opinion offered for
          guidance and is not a guarantee of value, condition or roadworthiness.
        </p>
      </Section>

      <Section n="2." title="Eligibility and accounts">
        <Bullets items={[
          'You must be at least 18 years old and legally able to enter contracts under Indian law.',
          'You must provide accurate registration details and keep them current. Accounts are approved manually and may be rejected or suspended.',
          'You are responsible for activity under your account and for keeping your password confidential. Tell us immediately if you suspect unauthorised access.',
          'Dealer accounts require a valid business identity. We may ask for GST registration, trade licence or other proof before approval.',
          'One person or business may hold only one account of each type unless we agree otherwise in writing.',
        ]} />
      </Section>

      <Section n="3." title="Listing a vehicle">
        <p>By listing a vehicle you confirm that:</p>
        <Bullets items={[
          'You own the vehicle or are authorised to sell it, and it is free of any undisclosed loan, lien, hypothecation or legal dispute.',
          'The registration certificate, insurance and pollution certificate details you provide are accurate.',
          'The odometer reading is genuine and has not been tampered with.',
          'You have disclosed accident history, flood damage, and any structural or engine repair you are aware of.',
          'The photographs are of the actual vehicle being sold, taken by you or with permission. Stock photographs, images of a different vehicle, or photographs you do not have rights to are not permitted.',
        ]} />
        <p>
          Listings that misrepresent a vehicle will be removed. Repeated or
          deliberate misrepresentation will result in permanent suspension, and we
          may report it to the affected buyer and to the authorities.
        </p>
      </Section>

      <Section n="4." title="Bids and offers">
        <Bullets items={[
          'A dealer bid or a buyer offer is an expression of interest at that price, subject to physical inspection and verification of documents.',
          'A seller is free to accept, reject or ignore any bid or offer.',
          'Accepting a bid does not by itself transfer ownership. The sale completes only when the parties execute the transfer, settle payment, and complete RTO formalities.',
          'We do not hold the sale consideration, act as escrow, or guarantee that either party will perform.',
        ]} />
      </Section>

      <Section n="5." title="Expert Estimation Certificate">
        <p>
          Where you book an inspection, the inspection is carried out by an
          independent third-party garage or assessor listed on the platform. The
          certificate records that assessor’s findings on the date of inspection.
        </p>
        <Bullets items={[
          'The certificate is not a warranty, guarantee or insurance of any kind.',
          'It reflects what was reasonably observable during a visual and functional inspection. It does not cover latent defects or anything requiring dismantling to detect.',
          'The refundable deposit is governed by our Refunds and Cancellation Policy.',
          'Assessors are rated for fairness. We may suspend an assessor whose ratings indicate bias, but we do not underwrite their conclusions.',
        ]} />
      </Section>

      <Section n="6." title="Fees">
        <p>
          Listing a vehicle is currently free. Charges that do apply — such as an
          Expert Estimation deposit — are shown to you before you pay. We may
          introduce or revise fees, and will give notice on the platform before a
          change takes effect. Applicable GST is charged in addition.
        </p>
      </Section>

      <Section n="7." title="Prohibited conduct">
        <Bullets items={[
          'Listing a stolen vehicle, one with a tampered chassis or engine number, or one you are not entitled to sell.',
          'Posting false, misleading or duplicate listings, or manipulating bids.',
          'Contacting other users for purposes unrelated to a genuine transaction, including marketing or spam.',
          'Scraping, crawling, reverse engineering, or attempting to gain unauthorised access to the platform or other users’ data.',
          'Uploading content that infringes anyone’s intellectual property, or that is unlawful, defamatory or obscene.',
          'Circumventing the platform to avoid fees where fees apply.',
        ]} />
      </Section>

      <Section n="8." title="Content you upload">
        <p>
          You keep ownership of the photographs and text you upload. You grant us a
          non-exclusive, royalty-free licence to host, display, resize and
          distribute that content for the purpose of operating and promoting the
          platform. You confirm you have the rights necessary to grant this.
        </p>
      </Section>

      <Section n="9." title="Limitation of liability">
        <p>
          The platform is provided on an “as is” basis. To the maximum extent
          permitted by law, we are not liable for:
        </p>
        <Bullets items={[
          'the condition, legality, roadworthiness or title of any vehicle listed;',
          'the conduct of any buyer, seller, dealer or assessor;',
          'any loss arising from a transaction you enter into through the platform;',
          'indirect or consequential loss, loss of profit, or loss of opportunity.',
        ]} />
        <p>
          Where liability cannot be excluded, our total liability to you is limited
          to the fees you have paid us in the three months before the claim arose.
          Nothing here limits liability for fraud, or for anything that cannot be
          limited under Indian law, including your rights under the Consumer
          Protection Act 2019.
        </p>
      </Section>

      <Section n="10." title="Suspension and termination">
        <p>
          You may close your account at any time by writing to{' '}
          <a href={`mailto:${LEGAL.supportEmail}`} className="text-brand-500 hover:underline">
            {LEGAL.supportEmail}
          </a>
          . We may suspend or terminate an account that breaches these terms, or
          where we reasonably suspect fraud or unlawful activity. We will normally
          give notice and a chance to respond, unless doing so would prejudice an
          investigation or put other users at risk.
        </p>
      </Section>

      <Section n="11." title="Grievance redressal">
        <p>
          As required under the Consumer Protection (E-Commerce) Rules 2020, our
          Grievance Officer is:
        </p>
        <div className="mt-2 p-3 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-sm">
          <p className="font-medium">{LEGAL.grievanceOfficerName}</p>
          <p className="text-[var(--text-muted)]">{LEGAL.grievanceOfficerDesignation}</p>
          <p className="mt-1">{LEGAL.grievanceOfficerEmail}</p>
          <p>{LEGAL.grievanceOfficerPhone}</p>
          <p className="text-[var(--text-muted)] mt-1">{fullAddress()}</p>
        </div>
        <p>
          We acknowledge complaints within {LEGAL.grievanceAckHours} hours and aim
          to resolve them within {LEGAL.grievanceResolutionDays} days of receipt.
        </p>
      </Section>

      <Section n="12." title="Changes to these terms">
        <p>
          We may update these terms. Material changes will be notified on the
          platform or by email at least seven days before they take effect.
          Continuing to use {LEGAL.brandName} after that date means you accept the
          revised terms.
        </p>
      </Section>

      <Section n="13." title="Governing law">
        <p>
          These terms are governed by the laws of India. The courts at{' '}
          {LEGAL.governingLawCity} have exclusive jurisdiction, without prejudice
          to any consumer forum you are entitled to approach under the Consumer
          Protection Act 2019.
        </p>
      </Section>

      <Section title="Entity details">
        <div className="p-3 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-sm space-y-0.5">
          <p><span className="text-[var(--text-muted)]">Legal name:</span> {LEGAL.legalName}</p>
          <p><span className="text-[var(--text-muted)]">CIN:</span> {LEGAL.cin}</p>
          <p><span className="text-[var(--text-muted)]">GSTIN:</span> {LEGAL.gstin}</p>
          <p><span className="text-[var(--text-muted)]">Registered office:</span> {fullAddress()}</p>
        </div>
      </Section>
    </LegalPage>
  )
}

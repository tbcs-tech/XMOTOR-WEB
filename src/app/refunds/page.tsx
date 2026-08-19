'use client'
// @ts-nocheck

import React from 'react'
import { LEGAL } from '@/lib/legal'
import { LegalPage, Section, Bullets } from '@/components/legal/LegalPage'

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refunds & Cancellation Policy"
      intro={`This explains the only payment ${LEGAL.brandName} currently collects directly — the Expert Estimation deposit — and how vehicle sales themselves work, since we do not process those payments.`}
    >
      <Section n="1." title="What XMotor does and does not charge for">
        <p>
          Listing a vehicle on {LEGAL.brandName} is free. Placing a bid, making a
          counter offer, and browsing are free.
        </p>
        <p>
          The <strong>only payment currently processed through the platform</strong> is
          the refundable deposit for an Expert Estimation inspection.
        </p>
        <p>
          The eventual sale of a vehicle — the price a seller and a buyer or dealer
          agree on — is settled directly between them. {LEGAL.brandName} does not
          collect, hold, or route that payment, and this policy does not cover it.
          Please arrange safe, verifiable payment directly with the other party.
        </p>
      </Section>

      <Section n="2." title="Expert Estimation deposit">
        <p>
          When you book an inspection, you pay a deposit shown to you before
          checkout. This deposit exists to discourage no-shows and to compensate
          the assessor for their time and travel.
        </p>

        <div className="mt-3 p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border)]">
          <p className="font-medium text-sm mb-2">The deposit is refunded in full when:</p>
          <Bullets items={[
            'the inspection is completed and a certificate is issued;',
            <>the vehicle sells through {LEGAL.brandName} within a reasonable period after inspection (the certificate is treated as having served its purpose);</>,
            'you cancel the booking at least 24 hours before the scheduled inspection time;',
            'the assessor fails to show up, or the inspection cannot proceed for a reason on our or the assessor’s side.',
          ]} />
        </div>

        <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="font-medium text-sm mb-2 text-amber-900">
            The deposit is <strong>not</strong> refunded when:
          </p>
          <Bullets items={[
            'you cancel with less than 24 hours’ notice, and the assessor had already blocked that slot;',
            'the assessor arrives at the agreed time and place and you are not available, or the vehicle is not available for inspection;',
            'you gave an incorrect or inaccessible location and the assessor could not reach the vehicle.',
          ]} />
        </div>

        <p className="mt-3">
          Refunds are issued to the original payment method within{' '}
          {LEGAL.estimationFeeRefundDays} business days of the refund being
          approved. Your bank or card network may take a few additional days to
          reflect it in your account.
        </p>
      </Section>

      <Section n="3." title="Disputing an inspection outcome">
        <p>
          If you believe an inspection was conducted unfairly or the certificate is
          inaccurate, write to{' '}
          <a href={`mailto:${LEGAL.supportEmail}`} className="text-brand-500 hover:underline">
            {LEGAL.supportEmail}
          </a>{' '}
          with the booking reference and details. We review the assessor's report
          and fairness rating history. This may result in a re-inspection at no
          extra cost, or a refund of the deposit, at our discretion — it does not
          entitle you to a refund of any amount you may separately have paid the
          assessor beyond the platform deposit.
        </p>
      </Section>

      <Section n="4." title="How to request a refund">
        <p>
          Cancel a booking directly from your dashboard where possible — refunds
          for straightforward cancellations are processed automatically. For
          anything else, write to{' '}
          <a href={`mailto:${LEGAL.supportEmail}`} className="text-brand-500 hover:underline">
            {LEGAL.supportEmail}
          </a>{' '}
          with your booking reference, and we will respond within{' '}
          {LEGAL.grievanceAckHours} hours.
        </p>
      </Section>

      <Section n="5." title="Payment processing">
        <p>
          Payments are processed by Razorpay. We do not store your card, UPI or
          bank details. Refunds are issued through the same channel and, in most
          cases, to the same instrument used to pay.
        </p>
      </Section>

      <Section n="6." title="As we add paid features">
        <p>
          If we introduce other paid features — such as promoted listings or
          premium dealer tools — this page will be updated before those features go
          live, and the applicable refund terms will be shown to you at the point
          of purchase.
        </p>
      </Section>
    </LegalPage>
  )
}

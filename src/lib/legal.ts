/**
 * Legal and contact details, in one place.
 *
 * Every legal page and the About page read from here, so these are filled in
 * once. Anything left as a TODO_ placeholder renders a visible warning banner
 * on the affected page — an incomplete legal page is worse than none, and
 * Razorpay will reject the account during review if it spots placeholder text.
 *
 * Required by:
 *   - Consumer Protection (E-Commerce) Rules 2020, Rule 4(2) and 5(3):
 *     legal name, registered address, customer care contact, and a named
 *     Grievance Officer with designation and contact details
 *   - Digital Personal Data Protection Act 2023: a contactable person for
 *     data-protection questions and grievances
 *   - Razorpay onboarding: legal name, address, contact, and published
 *     Terms / Privacy / Refund policies
 */

export const LEGAL = {
  // ── Entity ──
  brandName: 'XMotor',
  legalName: 'TODO_LEGAL_ENTITY_NAME',        // e.g. 'TBCS Tech Private Limited'
  cin: 'TODO_CIN',                            // Corporate Identity Number
  gstin: 'TODO_GSTIN',

  // ── Registered address ──
  addressLine1: 'TODO_ADDRESS_LINE_1',
  addressLine2: '',
  city: 'TODO_CITY',
  state: 'TODO_STATE',
  pincode: 'TODO_PINCODE',
  country: 'India',

  // ── Contact ──
  supportEmail: 'TODO_SUPPORT_EMAIL',         // e.g. 'support@askxmotor.com'
  supportPhone: 'TODO_SUPPORT_PHONE',
  supportHours: 'Monday to Saturday, 10:00 – 19:00 IST',

  // ── Grievance Officer (legally required, must be a named person) ──
  grievanceOfficerName: 'TODO_GRIEVANCE_OFFICER_NAME',
  grievanceOfficerDesignation: 'Grievance Officer',
  grievanceOfficerEmail: 'TODO_GRIEVANCE_EMAIL',
  grievanceOfficerPhone: 'TODO_GRIEVANCE_PHONE',

  // ── Data protection contact (DPDP Act 2023) ──
  dataProtectionEmail: 'TODO_PRIVACY_EMAIL',

  // ── Policy dates ──
  lastUpdated: 'TODO_DATE',                   // e.g. '17 August 2026'
  governingLawCity: 'TODO_JURISDICTION_CITY', // courts of this city have jurisdiction

  // ── Commercials referenced by the refund policy ──
  estimationFeeRefundDays: 7,
  grievanceAckHours: 48,
  grievanceResolutionDays: 30,
} as const

/** Fields still holding placeholders. */
export function missingLegalFields(): string[] {
  return Object.entries(LEGAL)
    .filter(([, v]) => typeof v === 'string' && v.startsWith('TODO_'))
    .map(([k]) => k)
}

export function fullAddress(): string {
  return [
    LEGAL.addressLine1,
    LEGAL.addressLine2,
    `${LEGAL.city}, ${LEGAL.state} ${LEGAL.pincode}`,
    LEGAL.country,
  ].filter(Boolean).join(', ')
}

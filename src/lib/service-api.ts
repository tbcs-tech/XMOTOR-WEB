/* ── Service API layer ─────────────────────────────────────────────
   All paths match actual Flask blueprint url_prefix values.
   next.config.js proxies: /services/* → http://localhost:5000/services/*
   Service paths already include full route, no prefix needed.
   ─────────────────────────────────────────────────────────────────── */

const SVC_BASE = '';  // service routes are proxied directly via /services/*

/**
 * Get JWT token from localStorage — tries multiple possible keys
 * because the auth store might save it under different names.
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Direct key (set explicitly by store or login)
  const direct = localStorage.getItem('af_access_token');
  if (direct) return direct;

  // 2. Zustand persist store — parses JSON blob to extract token
  //    Zustand persist stores as: { state: { token: '...' }, version: 0 }
  const STORE_KEYS = ['af-auth', 'af-auth-storage', 'auth-storage', 'accountflow-auth'];
  for (const key of STORE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const state = parsed?.state || parsed;
      const token = state?.token || state?.accessToken || state?.access_token;
      if (token && typeof token === 'string' && token.length > 20) return token;
    } catch { /* not JSON or wrong structure */ }
  }

  // 3. Other common key names
  for (const key of ['token', 'access_token', 'accessToken', 'jwt', 'auth_token']) {
    const val = localStorage.getItem(key);
    if (val && val.length > 20) return val;
  }

  return null;
}

async function svcFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('[service-api] No JWT token found in localStorage — API calls will fail with 302');
  }
  
  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Tell fetch NOT to follow redirects — we want to catch 302s
  const res = await fetch(`${SVC_BASE}${path}`, {
    ...opts,
    redirect: 'manual',
    headers: { ...headers, ...(opts.headers as Record<string, string> || {}) },
  });

  // Handle redirect (302) — Flask login_required redirects to login page
  if (res.status === 302 || res.status === 301 || res.type === 'opaqueredirect') {
    console.error('[service-api] Got redirect — JWT token missing or invalid. Path:', path);
    throw { error: 'Authentication failed — please log in again', status: 302 };
  }

  if (!res.ok) {
    // Guard against HTML responses (login page, error pages)
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      console.error('[service-api] Got HTML instead of JSON. Path:', path, 'Status:', res.status);
      throw { error: 'Server returned HTML instead of JSON — auth or proxy issue', status: res.status };
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw err;
  }
  return res.json();
}

// ── Invoice Digitization ───────────────────────────────────────
export const invDigApi = {
  extract:      (formData: FormData) => svcFetch('/services/invoice-digitization/api/extract', { method: 'POST', body: formData }),
  save:         (d: any) => svcFetch('/services/invoice-digitization/api/save', { method: 'POST', body: JSON.stringify(d) }),
  invoices:     (p?: string) => svcFetch(`/services/invoice-digitization/api/invoices${p ? `?${p}` : ''}`),
  invoice:      (id: string) => svcFetch(`/services/invoice-digitization/api/invoices/${id}`),
  deleteInv:    (id: string) => svcFetch(`/services/invoice-digitization/api/invoices/${id}`, { method: 'DELETE' }),
  vendors:      () => svcFetch('/services/invoice-digitization/api/vendors'),
  settings:     () => svcFetch('/services/invoice-digitization/api/settings'),
  saveSettings: (d: any) => svcFetch('/services/invoice-digitization/api/settings', { method: 'POST', body: JSON.stringify(d) }),
  parties:      () => svcFetch('/services/invoice-digitization/api/parties'),
  addParty:     (d: any) => svcFetch('/services/invoice-digitization/api/parties', { method: 'POST', body: JSON.stringify(d) }),
  deleteParty:  (id: string) => svcFetch(`/services/invoice-digitization/api/parties/${id}`, { method: 'DELETE' }),
};

// ── Bank Categorization ────────────────────────────────────────
export const bankCatApi = {
  accounts:          () => svcFetch('/services/bank-categorization/api/accounts'),
  addAccount:        (d: any) => svcFetch('/services/bank-categorization/api/accounts', { method: 'POST', body: JSON.stringify(d) }),
  deleteAccount:     (key: string) => svcFetch(`/services/bank-categorization/api/accounts/${encodeURIComponent(key)}`, { method: 'DELETE' }),
  categories:        () => svcFetch('/services/bank-categorization/api/categories'),
  saveCategories:    (d: any) => svcFetch('/services/bank-categorization/api/categories', { method: 'POST', body: JSON.stringify(d) }),
  groups:            () => svcFetch('/services/bank-categorization/api/groups'),
  saveGroups:        (d: any) => svcFetch('/services/bank-categorization/api/groups', { method: 'POST', body: JSON.stringify(d) }),
  hints:             () => svcFetch('/services/bank-categorization/api/category-hints'),
  saveHints:         (d: any) => svcFetch('/services/bank-categorization/api/category-hints', { method: 'POST', body: JSON.stringify(d) }),
  parseTransactions: (formData: FormData) => svcFetch('/services/bank-categorization/api/transactions', { method: 'POST', body: formData }),
  saveTransactions:  (d: any) => svcFetch('/services/bank-categorization/api/save-transactions', { method: 'POST', body: JSON.stringify(d) }),
  savedStatements:   (d: any) => svcFetch('/services/bank-categorization/api/saved-statements', { method: 'POST', body: JSON.stringify(d) }),
  pendingStatements: () => svcFetch('/services/bank-categorization/api/pending-statements'),
  markProcessed:     (id: string) => svcFetch(`/services/bank-categorization/api/pending-statements/${id}/mark-processed`, { method: 'POST' }),
  passwords:         () => svcFetch('/services/bank-categorization/api/pdf-passwords'),
  savePasswords:     (d: any) => svcFetch('/services/bank-categorization/api/pdf-passwords', { method: 'POST', body: JSON.stringify(d) }),
};

// ── Bookkeeping ────────────────────────────────────────────────
export const bookkeepingApi = {
  documents:     (p?: string) => svcFetch(`/services/bookkeeping/api/documents${p ? `?${p}` : ''}`),
  upload:        (formData: FormData) => svcFetch('/services/bookkeeping/api/upload', { method: 'POST', body: formData }),
  summarise:     (id: string) => svcFetch(`/services/bookkeeping/api/summarise/${id}`, { method: 'POST' }),
  entries:       (p?: string) => svcFetch(`/services/bookkeeping/api/entries${p ? `?${p}` : ''}`),
  deleteDoc:     (id: string) => svcFetch(`/services/bookkeeping/api/documents/${id}`, { method: 'DELETE' }),
};

// ── Reconciliation ─────────────────────────────────────────────
export const reconApi = {
  getSession:   () => svcFetch('/services/reconciliation/api/session'),
  startSession: (formData: FormData) => svcFetch('/services/reconciliation/api/start', { method: 'POST', body: formData }),
  saveSession:  (d: any) => svcFetch('/services/reconciliation/api/save', { method: 'POST', body: JSON.stringify(d) }),
  runMatch:     () => svcFetch('/services/reconciliation/api/match', { method: 'POST' }),
  confirmMatch: (id: string) => svcFetch(`/services/reconciliation/api/confirm/${id}`, { method: 'POST' }),
  revokeMatch:  (id: string) => svcFetch(`/services/reconciliation/api/revoke/${id}`, { method: 'POST' }),
  manualLink:   (d: any) => svcFetch('/services/reconciliation/api/manual-link', { method: 'POST', body: JSON.stringify(d) }),
  setException: (id: string, d: any) => svcFetch(`/services/reconciliation/api/exception/${id}`, { method: 'POST', body: JSON.stringify(d) }),
  complete:     () => svcFetch('/services/reconciliation/api/complete', { method: 'POST' }),
  history:      () => svcFetch('/services/reconciliation/api/history'),
};

// ── Regular Invoicing ──────────────────────────────────────────
export const invoicingApi = {
  documents:     (p?: string) => svcFetch(`/services/invoicing/api/documents${p ? `?${p}` : ''}`),
  createDoc:     (d: any) => svcFetch('/services/invoicing/api/documents', { method: 'POST', body: JSON.stringify(d) }),
  updateDoc:     (id: string, d: any) => svcFetch(`/services/invoicing/api/documents/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteDoc:     (id: string) => svcFetch(`/services/invoicing/api/documents/${id}`, { method: 'DELETE' }),
  products:      () => svcFetch('/services/invoicing/api/products'),
  addProduct:    (d: any) => svcFetch('/services/invoicing/api/products', { method: 'POST', body: JSON.stringify(d) }),
  updateProduct: (id: string, d: any) => svcFetch(`/services/invoicing/api/products/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  parties:       () => svcFetch('/services/invoicing/api/parties'),
  addParty:      (d: any) => svcFetch('/services/invoicing/api/parties', { method: 'POST', body: JSON.stringify(d) }),
  updateParty:   (id: string, d: any) => svcFetch(`/services/invoicing/api/parties/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  company:       () => svcFetch('/services/invoicing/api/company'),
  saveCompany:   (d: any) => svcFetch('/services/invoicing/api/company', { method: 'POST', body: JSON.stringify(d) }),
};

// ── GST Filing ─────────────────────────────────────────────────
export const gstApi = {
  returns:    (p?: string) => svcFetch(`/services/gst-filing/api/returns${p ? `?${p}` : ''}`),
  generate:   (d: any) => svcFetch('/services/gst-filing/api/generate', { method: 'POST', body: JSON.stringify(d) }),
  preview:    (id: string) => svcFetch(`/services/gst-filing/api/preview/${id}`),
};

// ── Reports ────────────────────────────────────────────────────
export const reportsApi = {
  generate: (d: any) => svcFetch('/services/reports/api/generate', { method: 'POST', body: JSON.stringify(d) }),
  list:     () => svcFetch('/services/reports/api/list'),
};

// ── TDS Tracker ────────────────────────────────────────────────
export const tdsApi = {
  deducted:    () => svcFetch('/services/tds-tracker/api/deducted'),
  addDeducted: (d: any) => svcFetch('/services/tds-tracker/api/deducted', { method: 'POST', body: JSON.stringify(d) }),
  receivable:    () => svcFetch('/services/tds-tracker/api/receivable'),
  addReceivable: (d: any) => svcFetch('/services/tds-tracker/api/receivable', { method: 'POST', body: JSON.stringify(d) }),
};

// ── Payroll ────────────────────────────────────────────────────
export const payrollApi = {
  employees:   () => svcFetch('/services/payroll/api/employees'),
  addEmployee: (d: any) => svcFetch('/services/payroll/api/employees', { method: 'POST', body: JSON.stringify(d) }),
  updateEmployee: (id: string, d: any) => svcFetch(`/services/payroll/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  process:     (d: any) => svcFetch('/services/payroll/api/process', { method: 'POST', body: JSON.stringify(d) }),
  history:     () => svcFetch('/services/payroll/api/history'),
};

/**
 * XMotor API Client
 * Handles all backend communication with automatic JWT refresh.
 */
import type {
  AuthTokens, User, Vehicle, Bid, Store, StoreCompact,
  Notification, PaginatedResponse, SearchFacets, SearchFilters, AdminStats,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const API_V1 = `${API_BASE}/api/v1`

// ── Token Storage ────────────────────────────────────────────────────────

let accessToken: string | null = null
let refreshToken: string | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  if (typeof window !== 'undefined') {
    localStorage.setItem('xm_access', access)
    localStorage.setItem('xm_refresh', refresh)
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('xm_access')
  }
  return accessToken
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('xm_access')
    localStorage.removeItem('xm_refresh')
  }
}

function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken
  if (typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('xm_refresh')
  }
  return refreshToken
}

// ── Base Fetch ───────────────────────────────────────────────────────────

class ApiError extends Error {
  status: number
  data: any
  constructor(status: number, message: string, data?: any) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  // Don't set Content-Type for FormData (browser sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_V1}${path}`, {
    ...options,
    headers,
  })

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return apiFetch<T>(path, options, false)
    }
    clearTokens()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'))
    }
    throw new ApiError(401, 'Session expired')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Request failed', data)
  }

  return data as T
}

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken()
  if (!rt) return false

  try {
    const res = await fetch(`${API_V1}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rt}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      accessToken = data.access_token
      if (typeof window !== 'undefined') {
        localStorage.setItem('xm_access', data.access_token)
      }
      return true
    }
  } catch {}
  return false
}

// ── Auth API ─────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string; username: string; password: string;
    confirm_password: string; account_type: string;
    full_name?: string; phone?: string;
  }) =>
    apiFetch<{ message: string; user_id: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiFetch<{ user: User }>('/auth/me'),

  updateProfile: (data: Partial<Pick<User, 'full_name' | 'phone'>>) =>
    apiFetch<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (current: string, newPwd: string) =>
    apiFetch<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: current, new_password: newPwd }),
    }),
}

// ── Vehicles API ─────────────────────────────────────────────────────────

export const vehicles = {
  list: (filters?: SearchFilters) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params.set(k, String(v))
        }
      })
    }
    return apiFetch<PaginatedResponse<Vehicle> & { filters: any }>(
      `/vehicles?${params.toString()}`,
    )
  },

  get: (id: number) =>
    apiFetch<{ vehicle: Vehicle; seller: any; store: Store | null; bids: Bid[] }>(
      `/vehicles/${id}`,
    ),

  create: (data: any) =>
    apiFetch<{ message: string; vehicle_id: number }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiFetch<{ message: string; vehicle: Vehicle }>(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  uploadImages: (id: number, formData: FormData) =>
    apiFetch<{ message: string; images: any }>(`/vehicles/${id}/images`, {
      method: 'POST',
      body: formData,
    }),

  mine: () =>
    apiFetch<{ items: Vehicle[] }>('/my/vehicles'),
}

// ── Bids API ─────────────────────────────────────────────────────────────

export const bids = {
  forVehicle: (vehicleId: number) =>
    apiFetch<{ bids: Bid[] }>(`/vehicles/${vehicleId}/bids`),

  place: (vehicleId: number, amount: number, message?: string) =>
    apiFetch<{ message: string; bid_id: number }>(`/vehicles/${vehicleId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount, message }),
    }),

  accept: (bidId: number) =>
    apiFetch<{ message: string }>(`/bids/${bidId}/accept`, { method: 'POST' }),

  reject: (bidId: number) =>
    apiFetch<{ message: string }>(`/bids/${bidId}/reject`, { method: 'POST' }),

  mine: () => apiFetch<{ bids: Bid[] }>('/my/bids'),

  received: () => apiFetch<{ bids: Bid[] }>('/my/received-bids'),
}

// ── Stores API ───────────────────────────────────────────────────────────

export const stores = {
  list: () => apiFetch<{ stores: StoreCompact[] }>('/stores'),

  get: (slug: string) =>
    apiFetch<{ store: Store; vehicles: Vehicle[]; owner: any }>(`/stores/${slug}`),

  mine: () => apiFetch<{ store: Store | null }>('/my/store'),

  update: (data: Partial<Store>) =>
    apiFetch<{ store: Store }>('/my/store', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ── Search API ───────────────────────────────────────────────────────────

export const search = {
  suggestions: (q: string) =>
    apiFetch<{ suggestions: { type: string; text: string }[] }>(
      `/search/suggestions?q=${encodeURIComponent(q)}`,
    ),

  facets: () => apiFetch<SearchFacets>('/search/facets'),
}

// ── Notifications API ────────────────────────────────────────────────────

export const notifications = {
  list: (unread = false, limit = 50) =>
    apiFetch<{ notifications: Notification[]; unread_count: number }>(
      `/notifications?unread=${unread}&limit=${limit}`,
    ),

  markRead: (id: number) =>
    apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllRead: () =>
    apiFetch<{ message: string }>('/notifications/read-all', { method: 'POST' }),

  count: () =>
    apiFetch<{ unread_count: number }>('/notifications/count'),
}

// ── Admin API ────────────────────────────────────────────────────────────

export const admin = {
  stats: () => apiFetch<{ stats: AdminStats }>('/admin/stats'),

  users: (type?: string, status?: string) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    return apiFetch<{ users: User[]; total: number }>(`/admin/users?${params}`)
  },

  approveUser: (id: number) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/approve`, { method: 'POST' }),

  rejectUser: (id: number) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/reject`, { method: 'POST' }),

  approveVehicle: (id: number) =>
    apiFetch<{ message: string }>(`/admin/vehicles/${id}/approve`, { method: 'POST' }),

  rejectVehicle: (id: number, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/vehicles/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

// ── Estimation API ───────────────────────────────────────────────────────

export const estimation = {
  // Browse experts
  listExperts: (city?: string, area?: string) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (area) params.set('area', area)
    return apiFetch<{ experts: any[] }>(`/experts?${params}`)
  },

  getExpert: (id: number) => apiFetch<{ expert: any }>(`/experts/${id}`),

  // Seller: book estimation
  requestEstimation: (vehicleId: number, data: any) =>
    apiFetch<{ request: any; message: string }>(`/vehicles/${vehicleId}/estimation`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  myRequests: () => apiFetch<{ requests: any[] }>('/my/estimation-requests'),

  // Get report for a vehicle
  getReport: (vehicleId: number) =>
    apiFetch<{ report: any }>(`/vehicles/${vehicleId}/estimation-report`),

  // Admin: manage experts
  adminListExperts: () => apiFetch<{ experts: any[] }>('/admin/experts'),

  adminCreateExpert: (data: any) =>
    apiFetch<{ expert: any; message: string }>('/admin/experts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminSuspendExpert: (id: number, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/experts/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  adminActivateExpert: (id: number) =>
    apiFetch<{ message: string }>(`/admin/experts/${id}/activate`, {
      method: 'POST',
    }),

  // Expert dashboard
  expertRequests: () => apiFetch<{ requests: any[] }>('/expert/requests'),

  expertConfirm: (requestId: number, date: string, time: string) =>
    apiFetch<{ message: string; request: any }>(`/expert/requests/${requestId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ date, time }),
    }),

  expertSubmitReport: (requestId: number, data: any) =>
    apiFetch<{ report: any; message: string }>(`/expert/requests/${requestId}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Expert by slug (public profile)
  getExpertBySlug: (slug: string) => apiFetch<{ expert: any }>(`/experts/slug/${slug}`),
}

// Default export for convenience
// ── OTP API ──────────────────────────────────────────────────────────────

export const otp = {
  send: (email: string, purpose?: string) =>
    apiFetch<{ message: string; dev_otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose: purpose || 'verify' }),
    }),

  verify: (email: string, otpCode: string, purpose?: string) =>
    apiFetch<{ message: string; verified: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp: otpCode, purpose: purpose || 'verify' }),
    }),
}

// ── Offers API ────────────────────────────────────────────────────────────

export const offers = {
  create: (data: { vehicle_id: number; amount: number; message?: string }) =>
    apiFetch<{ message: string; offer: any }>('/offers', {
      method: 'POST', body: JSON.stringify(data),
    }),

  forVehicle: (vehicleId: number) =>
    apiFetch<{ offers: any[] }>(`/offers/vehicle/${vehicleId}`),

  mine: () =>
    apiFetch<{ offers: any[] }>('/offers/mine'),

  accept: (offerId: number) =>
    apiFetch<{ message: string }>(`/offers/${offerId}/accept`, { method: 'POST' }),

  reject: (offerId: number) =>
    apiFetch<{ message: string }>(`/offers/${offerId}/reject`, { method: 'POST' }),
}

// ── AI API ────────────────────────────────────────────────────────────────

export interface BidAdvice {
  suggested_bid: number
  bid_range: { aggressive: number; competitive: number; conservative: number }
  win_probability: number
  reasoning: string
  strategy: string
  market_position: string
  market_estimate?: { fair_price: number; range: string }
}

export interface FraudCheck {
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  flags: { type: string; severity: string; detail: string }[]
  recommendations: string[]
  auto_approve: boolean
}

export const ai = {
  /** Dealer-only. Suggested bid for a vehicle, with win probability. */
  bidAdvice: (vehicleId: number, budget?: number) =>
    apiFetch<BidAdvice>(
      `/ai/bid-advice/${vehicleId}` + (budget ? `?budget=${budget}` : '')
    ),

  /** Admin-only. Risk analysis for a listing. */
  fraudCheck: (vehicleId: number) =>
    apiFetch<FraudCheck>(`/ai/fraud-check/${vehicleId}`),
}

const api = { auth, vehicles, bids, stores, search, notifications, admin, estimation, otp, offers, ai }
export default api

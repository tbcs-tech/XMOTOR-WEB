// ── User Types ────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  phone: string
  account_type: 'individual' | 'partner' | 'admin'
  is_approved: boolean
  is_active: boolean
  avatar: string | null
  created_at: string
}

export interface UserPublic {
  id: number
  username: string
  full_name: string
  account_type: string
  avatar: string | null
}

// ── Store Types ──────────────────────────────────────────────────────────

export interface Store {
  id: number
  owner_id: number
  name: string
  slug: string
  tagline: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  website: string
  logo: string | null
  cover_image: string | null
  hours: string
  is_verified: boolean
  is_featured: boolean
  rating: number
  review_count: number
  created_at: string
}

export interface StoreCompact {
  id: number
  name: string
  slug: string
  city: string
  state: string
  logo: string | null
  is_verified: boolean
  rating: number
  review_count: number
}

// ── Vehicle Types ────────────────────────────────────────────────────────

export interface VehicleImages {
  front: string | null
  rear: string | null
  left: string | null
  right: string | null
  interior: string | null
  dashboard: string | null
  engine: string | null
  other: string[]
}

export interface Vehicle {
  id: number
  seller_id: number
  store_id: number | null
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  vin: string
  fuel_type: string
  transmission: string
  drivetrain: string
  engine: string
  body_type: string
  doors: number
  exterior_color: string
  interior_color: string
  condition: string
  description: string
  features: string[]
  images: VehicleImages
  video_url: string
  listing_type: 'bid' | 'sale'
  status: string
  is_featured: boolean
  views: number
  created_at: string
  bid_count?: number
  highest_bid?: number
  store?: StoreCompact | null
}

export interface VehicleCreateInput {
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  fuel_type?: string
  transmission?: string
  body_type?: string
  condition?: string
  description?: string
  features?: string[]
  listing_type?: 'bid' | 'sale'
}

// ── Bid Types ────────────────────────────────────────────────────────────

export interface Bid {
  id: number
  vehicle_id: number
  bidder_id: number
  store_id: number | null
  amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  vehicle?: Vehicle
  bidder?: UserPublic
  store?: StoreCompact | null
}

// ── Notification Types ───────────────────────────────────────────────────

export interface Notification {
  id: number
  user_id: number
  type: 'bid_received' | 'bid_accepted' | 'bid_rejected' | 'vehicle_approved' | 'account_approved'
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
}

// ── API Response Types ───────────────────────────────────────────────────

export interface Pagination {
  page: number
  per_page: number
  total: number
  pages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

export interface SearchFacets {
  makes: { value: string; count: number }[]
  body_types: { value: string; count: number }[]
  fuel_types: { value: string; count: number }[]
  transmissions: { value: string; count: number }[]
  conditions: { value: string; count: number }[]
  cities: { value: string; count: number }[]
  price_range: { min: number; max: number }
  year_range: { min: number; max: number }
  total_vehicles: number
  total_stores: number
}

export interface SearchFilters {
  q?: string
  make?: string
  model?: string
  city?: string
  min_price?: number
  max_price?: number
  year_from?: number
  year_to?: number
  fuel_type?: string
  transmission?: string
  body_type?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular'
  page?: number
  per_page?: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  user: User
}

export interface AdminStats {
  total_users: number
  pending_users: number
  individuals: number
  partners: number
  total_vehicles: number
  approved_vehicles: number
  pending_vehicles: number
  total_bids: number
  pending_bids: number
  total_stores: number
}

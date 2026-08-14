import { clsx, type ClassValue } from 'clsx'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Format price in Indian Rupees */
export function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

/** Format mileage */
export function formatMileage(km: number): string {
  if (km >= 100000) return `${(km / 1000).toFixed(0)}K km`
  return `${km.toLocaleString('en-IN')} km`
}

/** Relative time string */
export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/**
 * How long a listing has been live, phrased for display.
 *
 * Deliberately separate from timeAgo(): buyers read this as freshness ("just
 * listed" pulls attention) and dealers read the same field as aged stock,
 * so it needs full words rather than "3d ago".
 */
export function listingAge(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''

  const days = Math.floor((Date.now() - d.getTime()) / 86400000)

  if (days < 0) return 'Just listed'
  if (days === 0) return 'Listed today'
  if (days === 1) return 'Listed yesterday'
  if (days < 7) return `Listed ${days} days ago`
  if (days < 14) return 'Listed 1 week ago'
  if (days < 30) return `Listed ${Math.floor(days / 7)} weeks ago`
  if (days < 60) return 'Listed 1 month ago'
  if (days < 365) return `Listed ${Math.floor(days / 30)} months ago`
  const y = Math.floor(days / 365)
  return `Listed ${y} year${y > 1 ? 's' : ''} ago`
}

/** Days on the platform — for aging reports and stale-stock highlighting. */
export function listingDays(dateStr?: string | null): number {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
}

/** Freshness bucket. Drives colour so aged stock is visible at a glance. */
export function listingFreshness(dateStr?: string | null): 'new' | 'recent' | 'aging' | 'stale' {
  const d = listingDays(dateStr)
  if (d <= 3) return 'new'
  if (d <= 30) return 'recent'
  if (d <= 60) return 'aging'
  return 'stale'
}

/** Get first available vehicle image URL */
export function getVehicleImage(images: any): string | null {
  if (!images) return null
  for (const key of ['front', 'left', 'right', 'rear', 'interior']) {
    if (images[key]) return images[key]
  }
  if (images.other?.length > 0) return images.other[0]
  return null
}

/** Truncate text */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

/** Debounce function */
export function debounce<T extends (...args: any[]) => any>(
  fn: T, delay: number,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

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

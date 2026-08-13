'use client'

import React from 'react'

/**
 * Placeholder shown when a listing has no photos yet.
 *
 * Deliberately a drawn silhouette rather than a generated photo: an
 * AI-rendered car that doesn't match the real vehicle creates a
 * misrepresentation problem the moment a buyer turns up to view it. This reads
 * as "no photo yet" at a glance while still looking intentional.
 *
 * Silhouette follows the body type, tint follows the colour the seller entered,
 * so a red SUV and a white hatchback don't look identical in a grid.
 */

const COLOR_MAP: Record<string, string> = {
  white: '#E8E8E8', 'pearl white': '#EDEDED', silver: '#C4C8CC',
  grey: '#9AA0A6', gray: '#9AA0A6', black: '#3A3D42',
  red: '#D14343', maroon: '#8C2F39', blue: '#3B6FB6',
  'navy blue': '#2C4A7C', skyblue: '#6FA8DC',
  green: '#4C8C5A', brown: '#8B6F47', beige: '#CFC0A8',
  gold: '#C9A961', orange: '#E08A3C', yellow: '#D9BC4A',
  bronze: '#A67C52', purple: '#7B5EA7',
}

function tintFor(color?: string): string {
  if (!color) return '#B8BEC6'
  const key = color.trim().toLowerCase()
  if (COLOR_MAP[key]) return COLOR_MAP[key]
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (key.includes(name)) return hex
  }
  return '#B8BEC6'
}

/** Rough profile per body type — enough to read correctly at card size. */
function bodyPath(bodyType?: string): string {
  const t = (bodyType || '').toLowerCase()

  if (t.includes('suv') || t.includes('jeep')) {
    return 'M14 46 L18 30 Q20 25 26 24 L54 24 Q60 24 64 29 L74 40 L86 43 Q92 45 92 51 L92 58 Q92 61 89 61 L14 61 Q11 61 11 58 L11 51 Q11 47 14 46 Z'
  }
  if (t.includes('muv') || t.includes('mpv') || t.includes('van')) {
    return 'M12 46 L15 27 Q17 22 23 22 L62 22 Q69 22 73 28 L84 42 L88 44 Q93 46 93 52 L93 58 Q93 61 90 61 L13 61 Q10 61 10 58 L10 51 Q10 47 12 46 Z'
  }
  if (t.includes('pickup') || t.includes('truck')) {
    return 'M12 47 L16 31 Q18 26 24 26 L44 26 Q49 26 52 30 L58 40 L58 43 L90 43 Q94 43 94 47 L94 57 Q94 60 91 60 L13 60 Q10 60 10 57 L10 51 Q10 48 12 47 Z'
  }
  if (t.includes('coupe') || t.includes('convertible')) {
    return 'M12 50 L18 40 Q24 32 36 30 L56 30 Q66 31 74 37 L86 45 Q92 47 92 53 L92 58 Q92 61 89 61 L14 61 Q11 61 11 58 L11 53 Q11 51 12 50 Z'
  }
  if (t.includes('sedan')) {
    return 'M11 49 L17 37 Q21 30 32 29 L58 29 Q68 30 75 36 L86 44 Q92 46 92 52 L92 58 Q92 61 89 61 L14 61 Q11 61 11 58 L11 52 Q11 50 11 49 Z'
  }
  // hatchback / default
  return 'M13 48 L18 34 Q22 28 32 27 L56 27 Q64 28 70 34 L80 43 Q86 45 88 48 Q91 50 91 54 L91 58 Q91 61 88 61 L14 61 Q11 61 11 58 L11 52 Q11 49 13 48 Z'
}

interface Props {
  bodyType?: string
  color?: string
  label?: string
  className?: string
  /** 'card' hides the caption; 'detail' shows it. */
  variant?: 'card' | 'detail'
}

export function VehiclePlaceholder({
  bodyType, color, label, className = '', variant = 'card',
}: Props) {
  const tint = tintFor(color)
  const id = React.useId()

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-[var(--surface-1)] ${className}`}
      role="img"
      aria-label={label ? `${label} — photo not available yet` : 'Photo not available yet'}
    >
      <svg viewBox="0 0 104 72" className="w-[62%] max-w-[190px]" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint} stopOpacity="0.95" />
            <stop offset="100%" stopColor={tint} stopOpacity="0.62" />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="52" cy="66" rx="38" ry="3.2"
                 fill="currentColor" className="text-black" opacity="0.06" />

        {/* body */}
        <path d={bodyPath(bodyType)} fill={`url(#g-${id})`} />

        {/* windows */}
        <path
          d={
            (bodyType || '').toLowerCase().includes('suv')
              ? 'M25 33 Q26 29 30 29 L52 29 Q56 29 59 32 L66 39 L25 39 Z'
              : 'M27 35 Q28 31 33 31 L54 31 Q58 31 61 34 L67 40 L27 40 Z'
          }
          fill="#FFFFFF" opacity="0.34"
        />

        {/* wheels */}
        <circle cx="30" cy="60" r="8.5" fill="#2E3238" />
        <circle cx="30" cy="60" r="3.6" fill="#8D939B" />
        <circle cx="74" cy="60" r="8.5" fill="#2E3238" />
        <circle cx="74" cy="60" r="3.6" fill="#8D939B" />
      </svg>

      {variant === 'detail' && (
        <p className="mt-3 text-xs text-[var(--text-muted)] font-medium">
          Photos coming soon
        </p>
      )}
    </div>
  )
}

/** Small corner tag for cards, so the state is unmistakable. */
export function NoPhotoTag() {
  return (
    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/45 backdrop-blur-sm text-white text-[9px] font-medium tracking-wide">
      Photos coming soon
    </span>
  )
}

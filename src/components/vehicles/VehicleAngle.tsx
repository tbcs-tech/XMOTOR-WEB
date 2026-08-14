'use client'

import React from 'react'

/**
 * Multi-angle vehicle illustrations.
 *
 * These are drawn, not photographic, and that is deliberate. A generated or
 * stock photo that doesn't match the actual vehicle creates a
 * misrepresentation problem the moment a buyer turns up to view it — so a
 * gallery placeholder must never be mistakable for the real car.
 *
 * Each angle is a distinct drawing so a listing gallery reads as populated
 * rather than as seven copies of the same silhouette. Tinted by the colour the
 * seller entered, shaped by body type.
 */

export type Angle =
  | 'front' | 'rear' | 'left' | 'right'
  | 'interior' | 'dashboard' | 'engine'

export const ANGLE_LABELS: Record<Angle, string> = {
  front: 'Front', rear: 'Rear', left: 'Left side', right: 'Right side',
  interior: 'Interior', dashboard: 'Dashboard', engine: 'Engine bay',
}

const COLORS: Record<string, string> = {
  white: '#E9EAEC', 'pearl white': '#EFF0F2', silver: '#C2C7CD',
  grey: '#93999F', gray: '#93999F', black: '#383B40',
  red: '#C94040', maroon: '#8A2E38', blue: '#3A6CAF',
  'navy blue': '#2B4877', skyblue: '#6BA3D6', green: '#4A8757',
  brown: '#846B48', beige: '#CBBCA5', gold: '#C3A45E',
  orange: '#DB8639', yellow: '#D4B747', bronze: '#A17A52',
  purple: '#7659A0',
}

function tint(color?: string): string {
  if (!color) return '#AEB4BC'
  const k = color.trim().toLowerCase()
  if (COLORS[k]) return COLORS[k]
  for (const [n, hex] of Object.entries(COLORS)) if (k.includes(n)) return hex
  return '#AEB4BC'
}

/** Darken a hex colour for shadowed panels. */
function shade(hex: string, amt = 0.78): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * amt)
  const g = Math.round(((n >> 8) & 255) * amt)
  const b = Math.round((n & 255) * amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function isTall(bodyType?: string): boolean {
  const t = (bodyType || '').toLowerCase()
  return t.includes('suv') || t.includes('muv') || t.includes('mpv')
      || t.includes('van') || t.includes('jeep') || t.includes('pickup')
}

interface Props {
  angle?: Angle
  bodyType?: string
  color?: string
  className?: string
  showLabel?: boolean
}

export function VehicleAngle({
  angle = 'front', bodyType, color, className = '', showLabel = false,
}: Props) {
  const base = tint(color)
  const dark = shade(base)
  const tall = isTall(bodyType)
  // React's useId returns values like ":r1:" — colons inside url(#...)
  // references are unreliable across browsers, so strip them.
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '')

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-[var(--surface-1)] ${className}`}>
      <svg viewBox="0 0 160 110" className="w-[78%] max-w-[280px]" aria-hidden="true">
        <defs>
          <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={base} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id={`glass${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#C9D6E2" />
            <stop offset="100%" stopColor="#8FA3B5" />
          </linearGradient>
        </defs>

        <ellipse cx="80" cy="98" rx="58" ry="4" fill="#000" opacity="0.07" />

        {angle === 'front'  && <Front  b={`url(#b${uid})`} g={`url(#glass${uid})`} tall={tall} dark={dark} />}
        {angle === 'rear'   && <Rear   b={`url(#b${uid})`} g={`url(#glass${uid})`} tall={tall} dark={dark} />}
        {(angle === 'left' || angle === 'right') && (
          <g transform={angle === 'right' ? 'translate(160,0) scale(-1,1)' : undefined}>
            <Side b={`url(#b${uid})`} g={`url(#glass${uid})`} tall={tall} dark={dark} />
          </g>
        )}
        {angle === 'interior'  && <Interior dark={dark} />}
        {angle === 'dashboard' && <Dashboard dark={dark} />}
        {angle === 'engine'    && <Engine dark={dark} />}
      </svg>

      {showLabel && (
        <p className="mt-2 text-[10px] text-[var(--text-muted)] font-medium">
          {ANGLE_LABELS[angle]} — illustration
        </p>
      )}
    </div>
  )
}

/* ── Angles ─────────────────────────────────────────────────────────────── */

function Front({ b, g, tall, dark }: any) {
  const top = tall ? 20 : 28
  return (
    <g>
      {/* roof + body */}
      <path d={`M38 ${top + 6} Q40 ${top} 48 ${top} L112 ${top} Q120 ${top} 122 ${top + 6} L128 52 L32 52 Z`} fill={b} />
      <rect x="26" y="50" width="108" height="38" rx="8" fill={b} />
      {/* windscreen */}
      <path d={`M44 ${top + 6} Q46 ${top + 2} 52 ${top + 2} L108 ${top + 2} Q114 ${top + 2} 116 ${top + 6} L121 48 L39 48 Z`} fill={g} opacity="0.9" />
      {/* bonnet crease */}
      <line x1="80" y1="52" x2="80" y2="62" stroke={dark} strokeWidth="1" opacity="0.4" />
      {/* headlights */}
      <path d="M31 60 L52 58 Q56 58 56 62 Q56 66 52 66 L31 68 Q28 68 28 64 Z" fill="#F2F4F6" />
      <path d="M129 60 L108 58 Q104 58 104 62 Q104 66 108 66 L129 68 Q132 68 132 64 Z" fill="#F2F4F6" />
      <circle cx="42" cy="63" r="2.4" fill="#9FB6C9" />
      <circle cx="118" cy="63" r="2.4" fill="#9FB6C9" />
      {/* grille */}
      <rect x="58" y="60" width="44" height="13" rx="3" fill={dark} />
      {[63, 66, 69].map(y => (
        <line key={y} x1="61" y1={y} x2="99" y2={y} stroke="#000" strokeWidth="0.9" opacity="0.28" />
      ))}
      {/* bumper + intake */}
      <rect x="28" y="76" width="104" height="12" rx="5" fill={dark} opacity="0.85" />
      <rect x="62" y="79" width="36" height="6" rx="2" fill="#000" opacity="0.3" />
      {/* fog lamps */}
      <circle cx="42" cy="82" r="2.6" fill="#E8EBEE" opacity="0.8" />
      <circle cx="118" cy="82" r="2.6" fill="#E8EBEE" opacity="0.8" />
      {/* plate */}
      <rect x="66" y="88" width="28" height="8" rx="1.5" fill="#F5F5F5" stroke="#C8CCD0" strokeWidth="0.6" />
      {/* mirrors */}
      <ellipse cx="22" cy="54" rx="6" ry="3.4" fill={dark} />
      <ellipse cx="138" cy="54" rx="6" ry="3.4" fill={dark} />
      {/* tyres */}
      <rect x="26" y="86" width="12" height="9" rx="2" fill="#2C3035" />
      <rect x="122" y="86" width="12" height="9" rx="2" fill="#2C3035" />
    </g>
  )
}

function Rear({ b, g, tall, dark }: any) {
  const top = tall ? 20 : 28
  return (
    <g>
      <path d={`M38 ${top + 6} Q40 ${top} 48 ${top} L112 ${top} Q120 ${top} 122 ${top + 6} L128 52 L32 52 Z`} fill={b} />
      <rect x="26" y="50" width="108" height="38" rx="8" fill={b} />
      {/* rear glass */}
      <path d={`M45 ${top + 6} Q47 ${top + 2} 53 ${top + 2} L107 ${top + 2} Q113 ${top + 2} 115 ${top + 6} L119 47 L41 47 Z`} fill={g} opacity="0.82" />
      {/* wiper */}
      <line x1="70" y1="44" x2="88" y2="38" stroke={dark} strokeWidth="1.2" opacity="0.6" />
      {/* tail lights */}
      <path d="M28 58 L54 57 Q58 57 58 61 L58 68 Q58 72 54 72 L28 71 Q25 71 25 67 L25 62 Q25 58 28 58 Z" fill="#C0392B" opacity="0.9" />
      <path d="M132 58 L106 57 Q102 57 102 61 L102 68 Q102 72 106 72 L132 71 Q135 71 135 67 L135 62 Q135 58 132 58 Z" fill="#C0392B" opacity="0.9" />
      <rect x="30" y="66" width="14" height="3" rx="1" fill="#F0C24B" opacity="0.85" />
      <rect x="116" y="66" width="14" height="3" rx="1" fill="#F0C24B" opacity="0.85" />
      {/* boot line + handle */}
      <line x1="30" y1="74" x2="130" y2="74" stroke={dark} strokeWidth="1" opacity="0.45" />
      <rect x="74" y="60" width="12" height="3" rx="1.5" fill={dark} opacity="0.6" />
      {/* bumper */}
      <rect x="28" y="77" width="104" height="11" rx="5" fill={dark} opacity="0.85" />
      {/* plate */}
      <rect x="62" y="79" width="36" height="9" rx="1.5" fill="#F5F5F5" stroke="#C8CCD0" strokeWidth="0.6" />
      {/* exhaust */}
      <rect x="104" y="88" width="10" height="4" rx="2" fill="#6B7076" />
      <rect x="26" y="86" width="12" height="9" rx="2" fill="#2C3035" />
      <rect x="122" y="86" width="12" height="9" rx="2" fill="#2C3035" />
    </g>
  )
}

function Side({ b, g, tall, dark }: any) {
  const roof = tall ? 26 : 32
  const winTop = roof + 4
  return (
    <g>
      {/* body */}
      <path d={tall
        ? `M14 68 L18 44 Q20 36 30 34 L96 34 Q106 35 112 43 L128 60 L142 64 Q150 66 150 74 L150 84 Q150 88 146 88 L18 88 Q14 88 14 84 Z`
        : `M12 70 L20 50 Q24 40 38 38 L94 38 Q106 39 114 47 L130 62 L142 66 Q150 68 150 76 L150 84 Q150 88 146 88 L16 88 Q12 88 12 84 Z`}
        fill={b} />
      {/* windows */}
      <path d={`M32 ${winTop + 6} Q34 ${winTop} 42 ${winTop} L68 ${winTop} L68 ${winTop + 20} L30 ${winTop + 20} Z`} fill={g} opacity="0.9" />
      <path d={`M73 ${winTop} L94 ${winTop} Q102 ${winTop} 107 ${winTop + 7} L114 ${winTop + 20} L73 ${winTop + 20} Z`} fill={g} opacity="0.9" />
      {/* door lines */}
      <line x1="70" y1={winTop} x2="70" y2="86" stroke={dark} strokeWidth="1.1" opacity="0.5" />
      <line x1="116" y1={winTop + 18} x2="118" y2="86" stroke={dark} strokeWidth="1.1" opacity="0.35" />
      {/* handles */}
      <rect x="54" y={winTop + 25} width="10" height="2.6" rx="1.3" fill={dark} opacity="0.65" />
      <rect x="88" y={winTop + 25} width="10" height="2.6" rx="1.3" fill={dark} opacity="0.65" />
      {/* mirror */}
      <path d={`M30 ${winTop + 7} L23 ${winTop + 9} L23 ${winTop + 13} L30 ${winTop + 12} Z`} fill={dark} />
      {/* sill shadow */}
      <rect x="16" y="82" width="130" height="4" fill="#000" opacity="0.1" />
      {/* wheels */}
      <circle cx="44" cy="86" r="13" fill="#2C3035" />
      <circle cx="44" cy="86" r="6.5" fill="#A8AEB5" />
      <circle cx="44" cy="86" r="2.4" fill="#6E747B" />
      <circle cx="120" cy="86" r="13" fill="#2C3035" />
      <circle cx="120" cy="86" r="6.5" fill="#A8AEB5" />
      <circle cx="120" cy="86" r="2.4" fill="#6E747B" />
      {/* arch trim */}
      <path d="M31 86 A13 13 0 0 1 57 86" fill="none" stroke={dark} strokeWidth="2" opacity="0.5" />
      <path d="M107 86 A13 13 0 0 1 133 86" fill="none" stroke={dark} strokeWidth="2" opacity="0.5" />
    </g>
  )
}

function Interior({ dark }: any) {
  return (
    <g>
      {/* cabin shell */}
      <rect x="18" y="20" width="124" height="72" rx="8" fill="#4A4E54" />
      <rect x="24" y="26" width="112" height="30" rx="5" fill="#6E757D" opacity="0.5" />
      {/* rear bench */}
      <rect x="30" y="52" width="100" height="26" rx="6" fill="#5B6067" />
      <rect x="30" y="44" width="100" height="14" rx="5" fill="#676D75" />
      {/* seat stitching */}
      <line x1="63" y1="46" x2="63" y2="76" stroke="#4A4E54" strokeWidth="1.6" />
      <line x1="97" y1="46" x2="97" y2="76" stroke="#4A4E54" strokeWidth="1.6" />
      {/* headrests */}
      {[46, 80, 114].map(x => (
        <rect key={x} x={x - 8} y="34" width="16" height="11" rx="4" fill="#71787F" />
      ))}
      {/* belts */}
      <line x1="36" y1="44" x2="44" y2="76" stroke="#8C939B" strokeWidth="2.4" />
      <line x1="124" y1="44" x2="116" y2="76" stroke="#8C939B" strokeWidth="2.4" />
      {/* windows */}
      <rect x="22" y="24" width="22" height="18" rx="3" fill="#B8C6D4" opacity="0.55" />
      <rect x="116" y="24" width="22" height="18" rx="3" fill="#B8C6D4" opacity="0.55" />
      {/* floor */}
      <rect x="26" y="78" width="108" height="12" rx="3" fill="#3C4046" />
    </g>
  )
}

function Dashboard({ dark }: any) {
  return (
    <g>
      <rect x="14" y="26" width="132" height="64" rx="8" fill="#4A4E54" />
      {/* windscreen band */}
      <rect x="20" y="30" width="120" height="12" rx="4" fill="#B8C6D4" opacity="0.35" />
      {/* instrument cluster */}
      <rect x="26" y="46" width="42" height="26" rx="5" fill="#2F3237" />
      <circle cx="38" cy="59" r="8" fill="none" stroke="#8FA0B0" strokeWidth="1.6" />
      <circle cx="56" cy="59" r="8" fill="none" stroke="#8FA0B0" strokeWidth="1.6" />
      <line x1="38" y1="59" x2="34" y2="54" stroke="#E08A3C" strokeWidth="1.4" />
      <line x1="56" y1="59" x2="60" y2="55" stroke="#E08A3C" strokeWidth="1.4" />
      {/* infotainment */}
      <rect x="76" y="44" width="34" height="22" rx="3" fill="#22252A" />
      <rect x="80" y="48" width="26" height="2.6" rx="1.3" fill="#6E7A86" />
      <rect x="80" y="54" width="18" height="2.6" rx="1.3" fill="#6E7A86" opacity="0.7" />
      <rect x="80" y="60" width="22" height="2.6" rx="1.3" fill="#6E7A86" opacity="0.5" />
      {/* vents */}
      <rect x="116" y="46" width="22" height="10" rx="2" fill="#33373C" />
      {[48.5, 51, 53.5].map(y => (
        <line key={y} x1="118" y1={y} x2="136" y2={y} stroke="#5A6067" strokeWidth="0.9" />
      ))}
      {/* steering wheel */}
      <circle cx="47" cy="78" r="14" fill="none" stroke="#33373C" strokeWidth="5" />
      <circle cx="47" cy="78" r="4.5" fill="#3F444A" />
      <line x1="33" y1="78" x2="61" y2="78" stroke="#33373C" strokeWidth="3" />
      {/* centre console */}
      <rect x="80" y="70" width="30" height="18" rx="3" fill="#3C4046" />
      <rect x="86" y="74" width="8" height="10" rx="2" fill="#575D64" />
      <circle cx="103" cy="79" r="3.4" fill="#575D64" />
    </g>
  )
}

function Engine({ dark }: any) {
  return (
    <g>
      {/* bay */}
      <rect x="16" y="24" width="128" height="66" rx="6" fill="#53585F" />
      <rect x="22" y="30" width="116" height="54" rx="4" fill="#42464C" />
      {/* engine block */}
      <rect x="46" y="42" width="52" height="30" rx="4" fill="#6B7178" />
      <rect x="52" y="36" width="40" height="10" rx="3" fill="#7C838B" />
      {/* cam cover ribs */}
      {[56, 64, 72, 80, 88].map(x => (
        <line key={x} x1={x} y1="38" x2={x} y2="44" stroke="#5A6067" strokeWidth="1.6" />
      ))}
      {/* airbox + hose */}
      <rect x="102" y="38" width="26" height="20" rx="4" fill="#5F656C" />
      <path d="M102 48 Q98 48 96 44 L96 42" stroke="#4A4E54" strokeWidth="4" fill="none" />
      {/* battery */}
      <rect x="26" y="40" width="18" height="16" rx="2" fill="#5A6067" />
      <rect x="29" y="37" width="4" height="4" rx="1" fill="#C0392B" />
      <rect x="37" y="37" width="4" height="4" rx="1" fill="#33373C" />
      {/* fluid caps */}
      <circle cx="34" cy="66" r="4" fill="#D8B23A" opacity="0.85" />
      <circle cx="48" cy="78" r="3.4" fill="#4E90C4" opacity="0.85" />
      {/* belt */}
      <circle cx="112" cy="70" r="7" fill="none" stroke="#33373C" strokeWidth="3" />
      <circle cx="128" cy="74" r="4.5" fill="none" stroke="#33373C" strokeWidth="2.4" />
      {/* strut towers */}
      <circle cx="30" cy="30" r="5" fill="#6B7178" opacity="0.6" />
      <circle cx="130" cy="30" r="5" fill="#6B7178" opacity="0.6" />
    </g>
  )
}

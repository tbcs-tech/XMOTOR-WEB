'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, useCity } from '@/lib/store'
import { notifications as notifApi } from '@/lib/api'
import { Heart, Bell, User, LogOut, LayoutDashboard, MapPin, X, ChevronDown, Locate } from 'lucide-react'

const CITIES = [
  { name: 'Mumbai', icon: '🏙️' },
  { name: 'Delhi NCR', icon: '🕌' },
  { name: 'Bangalore', icon: '💻' },
  { name: 'Hyderabad', icon: '🏰' },
  { name: 'Chennai', icon: '🛕' },
  { name: 'Pune', icon: '🏔️' },
  { name: 'Kolkata', icon: '🌉' },
  { name: 'Ahmedabad', icon: '🏛️' },
  { name: 'Gurgaon', icon: '🏢' },
  { name: 'Noida', icon: '🌆' },
  { name: 'Jaipur', icon: '🏰' },
  { name: 'Lucknow', icon: '🕌' },
  { name: 'Chandigarh', icon: '🌳' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { city, setCity } = useCity()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return
    const poll = () => notifApi.count().then(r => setUnread(r.unread_count)).catch(() => {})
    poll()
    const t = setInterval(poll, 30000)
    return () => clearInterval(t)
  }, [isAuthenticated])

  useEffect(() => { setMenuOpen(false); setCityOpen(false) }, [pathname])

  const dashboardLink = user?.account_type === 'admin'
    ? '/dashboard/admin' : user?.account_type === 'partner'
    ? '/dashboard/dealer' : '/dashboard/seller'

  const filteredCities = citySearch
    ? CITIES.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : CITIES

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-0)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="10" width="18" height="8" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M5 10L7.5 5H16.5L19 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="7.5" cy="15" r="1.5" fill="white"/>
              <circle cx="16.5" cy="15" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl">
            <span className="text-brand-500">X</span>Motor
          </span>
        </Link>

        <div className="flex-1" />

        {/* City Selector — near account */}
        <button onClick={() => setCityOpen(!cityOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors text-sm w-[130px]">
          <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span className="font-medium text-[var(--text-primary)] truncate text-xs flex-1 text-left">{city}</span>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
        </button>

        {/* Account with notification badge */}
        <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors">
              {isAuthenticated ? (
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              ) : (
                <User className="w-[18px] h-[18px]" />
              )}
            </button>
            {isAuthenticated && unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-[var(--surface-0)] pointer-events-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-56 bg-[var(--surface-0)] rounded-2xl shadow-xl shadow-black/10 border border-[var(--border)] z-50 overflow-hidden animate-slide-up">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="font-semibold text-sm truncate">{user?.full_name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <DropLink href={dashboardLink} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" onClick={() => setMenuOpen(false)} />
                        <DropLink href="/notifications" icon={<Bell className="w-4 h-4" />} label="Notifications" badge={unread} onClick={() => setMenuOpen(false)} />
                        <DropLink href="/saved" icon={<Heart className="w-4 h-4" />} label="Saved vehicles" onClick={() => setMenuOpen(false)} />
                      </div>
                      <div className="border-t border-[var(--border)] py-1">
                        <button onClick={() => { logout(); setMenuOpen(false); router.push('/') }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <DropLink href="/auth/login" icon={<User className="w-4 h-4" />} label="Sign in" onClick={() => setMenuOpen(false)} />
                      <DropLink href="/auth/register" icon={<LayoutDashboard className="w-4 h-4" />} label="Create account" onClick={() => setMenuOpen(false)} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
      </div>

      {/* City Popup */}
      {cityOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setCityOpen(false)} />
          <div className="fixed inset-x-4 top-16 z-50 bg-[var(--surface-0)] rounded-2xl shadow-2xl border border-[var(--border)] max-w-sm mx-auto animate-slide-up overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold">{city}</h2>
                <button onClick={() => setCityOpen(false)} className="w-7 h-7 rounded-full bg-[var(--surface-1)] flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <input value={citySearch} onChange={e => setCitySearch(e.target.value)} placeholder="Search city"
                    className="w-full h-9 pl-8 pr-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-brand-500" />
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
                <button className="h-9 px-3 rounded-xl bg-brand-500 text-white text-xs font-medium flex items-center gap-1 shrink-0">
                  <Locate className="w-3.5 h-3.5" /> Detect
                </button>
              </div>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Popular cities</p>
              <div className="grid grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pb-2">
                <button onClick={() => { setCity('All India'); setCityOpen(false); setCitySearch('') }}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${city === 'All India' ? 'bg-brand-50 border-2 border-brand-500' : 'bg-[var(--surface-1)] border-2 border-transparent hover:border-brand-200'}`}>
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-0)] border border-[var(--border)] flex items-center justify-center text-lg">🇮🇳</div>
                  <span className="text-[10px] font-medium">All India</span>
                </button>
                {filteredCities.map(c => (
                  <button key={c.name} onClick={() => { setCity(c.name); setCityOpen(false); setCitySearch('') }}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${city === c.name ? 'bg-brand-50 border-2 border-brand-500' : 'bg-[var(--surface-1)] border-2 border-transparent hover:border-brand-200'}`}>
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-0)] border border-[var(--border)] flex items-center justify-center text-lg">{c.icon}</div>
                    <span className="text-[10px] font-medium">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

function DropLink({ href, icon, label, badge, onClick }: { href: string; icon: React.ReactNode; label: string; badge?: number; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors">
      {icon}<span className="flex-1">{label}</span>
      {badge ? <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">{badge}</span> : null}
    </Link>
  )
}

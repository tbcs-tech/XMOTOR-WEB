'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Home, ShoppingBag, PlusCircle, Search, Store,
  LayoutDashboard, Gavel, User, Users, CarFront, Shield,
} from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const role = user?.account_type

  const navItems = getNavItems(role, isAuthenticated)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-0)]/95 backdrop-blur-xl border-t border-[var(--border)] safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-[56px]',
                active
                  ? 'text-brand-500'
                  : 'text-[var(--text-muted)] active:text-[var(--text-primary)]',
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function getNavItems(role: string | undefined, isAuthenticated: boolean) {
  // Admin gets their own nav
  if (isAuthenticated && role === 'admin') {
    return [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
      { href: '/dashboard/admin/vehicles', icon: CarFront, label: 'Vehicles' },
      { href: '/dashboard/admin/experts', icon: Shield, label: 'Experts' },
    ]
  }

  // Dealer gets their own nav
  if (isAuthenticated && role === 'partner') {
    return [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/dashboard/dealer', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/dealer/browse', icon: Search, label: 'Browse' },
      { href: '/dashboard/dealer/my-bids', icon: Gavel, label: 'Bids' },
      { href: '/dashboard/dealer/profile', icon: User, label: 'Profile' },
    ]
  }

  // Guest + Individual: same public nav
  return [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/buy', icon: ShoppingBag, label: 'Buy' },
    { href: '/dashboard/seller/sell', icon: PlusCircle, label: 'Sell' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/dealer', icon: Store, label: 'Dealers' },
  ]
}

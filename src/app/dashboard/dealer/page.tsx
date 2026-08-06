'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { vehicles as vehiclesApi, bids as bidsApi, stores as storesApi } from '@/lib/api'
import { StatCard, Button, Badge, Card, Skeleton } from '@/components/ui'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { formatPrice, timeAgo, getVehicleImage } from '@/lib/utils'
import {
  CarFront, Gavel, Building2, TrendingUp, Eye, Plus,
  Package, Search,
} from 'lucide-react'
import Link from 'next/link'

export default function DealerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [store, setStore] = useState<any>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [myBids, setMyBids] = useState<any[]>([])
  const [browsable, setBrowsable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'bids' | 'browse'>('overview')

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.account_type !== 'partner')) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, isLoading])

  useEffect(() => {
    if (!isAuthenticated || user?.account_type !== 'partner') return
    Promise.all([
      storesApi.mine(),
      vehiclesApi.mine(),
      bidsApi.mine(),
      vehiclesApi.list({ per_page: 12, sort: 'newest' }),
    ]).then(([sRes, vRes, bRes, browseRes]) => {
      setStore(sRes.store)
      setInventory(vRes.items)
      setMyBids(bRes.bids)
      setBrowsable(browseRes.items.filter((v: any) => v.listing_type === 'bid'))
    }).finally(() => setLoading(false))
  }, [isAuthenticated, user])

  if (isLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const activeBids = myBids.filter(b => b.status === 'pending')
  const wonBids = myBids.filter(b => b.status === 'accepted')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'inventory', label: `Inventory (${inventory.length})` },
    { id: 'bids', label: `My Bids (${activeBids.length})` },
    { id: 'browse', label: 'Browse & Bid' },
  ] as const

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Welcome, {user?.full_name} {store?.is_verified && '✓'}
        </p>
        <div className="flex gap-2 mt-3">
          <Link href="/dashboard/dealer/inventory">
            <Button size="sm" variant="secondary"><Package className="w-4 h-4" /> Inventory</Button>
          </Link>
          <Link href="/dashboard/dealer/add-vehicle">
            <Button size="sm"><Plus className="w-4 h-4" /> Add Vehicle</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Inventory" value={inventory.length} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Active Bids" value={activeBids.length} icon={<Gavel className="w-4 h-4" />} />
        <StatCard label="Won Deals" value={wonBids.length} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard
          label="Inventory Value"
          value={formatPrice(inventory.reduce((s, v) => s + (v.price || 0), 0))}
          icon={<Building2 className="w-4 h-4" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--surface-1)] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--surface-0)] shadow-sm text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inventory */}
          <Card className="p-5">
            <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-brand-500" /> Recent Inventory
            </h3>
            {inventory.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">No vehicles in inventory</p>
            ) : (
              <div className="space-y-3">
                {inventory.slice(0, 5).map(v => (
                  <Link key={v.id} href={`/vehicle/${v.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors">
                      <div className="w-14 h-10 rounded-lg bg-[var(--surface-2)] shrink-0 overflow-hidden">
                        {getVehicleImage(v.images) && <img src={getVehicleImage(v.images)!} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{v.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatPrice(v.price)}</p>
                      </div>
                      <Badge variant={v.status === 'approved' ? 'success' : 'warning'}>{v.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* My Active Bids */}
          <Card className="p-5">
            <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
              <Gavel className="w-4 h-4 text-brand-500" /> My Active Bids
            </h3>
            {myBids.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-muted)]">No bids placed yet</p>
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => setActiveTab('browse')}>
                  <Search className="w-3.5 h-3.5" /> Browse Vehicles
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myBids.slice(0, 8).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.vehicle?.title || `Vehicle #${b.vehicle_id}`}</p>
                      <p className="text-xs text-[var(--text-muted)]">{timeAgo(b.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-display font-bold">{formatPrice(b.amount)}</p>
                      <Badge variant={b.status === 'pending' ? 'warning' : b.status === 'accepted' ? 'success' : 'danger'}>
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          {inventory.length === 0 && (
            <div className="col-span-full text-center py-16">
              <CarFront className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Your inventory is empty</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bids' && (
        <div className="space-y-3">
          {myBids.map(b => (
            <Card key={b.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded-xl bg-[var(--surface-1)] shrink-0 overflow-hidden">
                  {b.vehicle && getVehicleImage(b.vehicle.images) && (
                    <img src={getVehicleImage(b.vehicle.images)!} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.vehicle?.title || `Vehicle #${b.vehicle_id}`}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Asking: {b.vehicle ? formatPrice(b.vehicle.price) : 'N/A'} · Bid: {formatPrice(b.amount)}
                  </p>
                </div>
                <Badge variant={b.status === 'pending' ? 'warning' : b.status === 'accepted' ? 'success' : 'danger'}>
                  {b.status}
                </Badge>
              </div>
            </Card>
          ))}
          {myBids.length === 0 && (
            <div className="text-center py-16">
              <Gavel className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No bids placed yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-4">Individual listings open for bidding</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {browsable.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            {browsable.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-sm text-[var(--text-muted)]">No vehicles open for bidding right now</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

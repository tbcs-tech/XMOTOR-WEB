'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { admin as adminApi, vehicles as vehiclesApi } from '@/lib/api'
import { StatCard, Button, Badge, Card, Skeleton } from '@/components/ui'
import { formatPrice, timeAgo } from '@/lib/utils'
import {
  Users, CarFront, Gavel, Building2, Clock, CheckCircle,
  XCircle, AlertTriangle, Shield, TrendingUp, Eye, Sparkles,
  ChevronRight, BarChart3, Activity,
} from 'lucide-react'
import Link from 'next/link'
import type { AdminStats, User, Vehicle } from '@/types'

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([])
  const [aiReview, setAiReview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vehicles' | 'bids' | 'ai'>('overview')

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.account_type !== 'admin')) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, authLoading])

  useEffect(() => {
    if (!isAuthenticated || user?.account_type !== 'admin') return
    loadData()
  }, [isAuthenticated, user])

  async function loadData() {
    setLoading(true)
    try {
      const [statsRes, usersRes, vehiclesRes] = await Promise.all([
        adminApi.stats(),
        adminApi.users('all', 'pending'),
        vehiclesApi.list({ sort: 'newest', per_page: 100 }),
      ])
      setStats(statsRes.stats)
      setPendingUsers(usersRes.users)
      setPendingVehicles(vehiclesRes.items.filter((v: Vehicle) =>
        v.status === 'pending' || v.status === 'store_only'
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveUser(userId: number) {
    await adminApi.approveUser(userId)
    setPendingUsers(u => u.filter(x => x.id !== userId))
    if (stats) setStats({ ...stats, pending_users: stats.pending_users - 1 })
  }

  async function handleRejectUser(userId: number) {
    await adminApi.rejectUser(userId)
    setPendingUsers(u => u.filter(x => x.id !== userId))
    if (stats) setStats({ ...stats, pending_users: stats.pending_users - 1 })
  }

  async function handleApproveVehicle(vehicleId: number) {
    await adminApi.approveVehicle(vehicleId)
    setPendingVehicles(v => v.filter(x => x.id !== vehicleId))
    if (stats) setStats({
      ...stats,
      pending_vehicles: stats.pending_vehicles - 1,
      approved_vehicles: stats.approved_vehicles + 1,
    })
  }

  async function handleRejectVehicle(vehicleId: number) {
    await adminApi.rejectVehicle(vehicleId, 'Does not meet listing requirements')
    setPendingVehicles(v => v.filter(x => x.id !== vehicleId))
    if (stats) setStats({ ...stats, pending_vehicles: stats.pending_vehicles - 1 })
  }

  async function runAIReview() {
    try {
      const token = (await import('@/lib/api')).getAccessToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/ai/auto-review`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      setAiReview(await res.json())
    } catch { /* silent */ }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!stats) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: `Users${stats.pending_users ? ` (${stats.pending_users})` : ''}`, icon: Users },
    { id: 'vehicles', label: `Vehicles${stats.pending_vehicles ? ` (${stats.pending_vehicles})` : ''}`, icon: CarFront },
    { id: 'ai', label: 'AI Review', icon: Sparkles },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Welcome, {user?.full_name}</p>
        <div className="flex items-center gap-2 mt-3">
          {stats.pending_users > 0 && (
            <Badge variant="warning">{stats.pending_users} pending users</Badge>
          )}
          {stats.pending_vehicles > 0 && (
            <Badge variant="brand">{stats.pending_vehicles} pending vehicles</Badge>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Users" value={stats.total_users} icon={<Users className="w-4 h-4" />} sublabel={`${stats.individuals} sellers · ${stats.partners} dealers`} />
        <StatCard label="Vehicles" value={stats.total_vehicles} icon={<CarFront className="w-4 h-4" />} sublabel={`${stats.approved_vehicles} live`} />
        <StatCard label="Total Bids" value={stats.total_bids} icon={<Gavel className="w-4 h-4" />} sublabel={`${stats.pending_bids} active`} />
        <StatCard label="Stores" value={stats.total_stores} icon={<Building2 className="w-4 h-4" />} />
        <StatCard label="Pending Review" value={stats.pending_users + stats.pending_vehicles} icon={<Clock className="w-4 h-4" />} sublabel="needs your attention" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--surface-1)] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--surface-0)] shadow-sm text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} pendingUsers={pendingUsers} pendingVehicles={pendingVehicles} onApproveUser={handleApproveUser} onApproveVehicle={handleApproveVehicle} />}
      {activeTab === 'users' && <UsersTab pendingUsers={pendingUsers} onApprove={handleApproveUser} onReject={handleRejectUser} />}
      {activeTab === 'vehicles' && <VehiclesTab pendingVehicles={pendingVehicles} onApprove={handleApproveVehicle} onReject={handleRejectVehicle} />}
      {activeTab === 'ai' && <AIReviewTab aiReview={aiReview} onRunReview={runAIReview} pendingVehicles={pendingVehicles} onApprove={handleApproveVehicle} onReject={handleRejectVehicle} />}
    </div>
  )
}

// ── Overview Tab ─────────────────────────────────────────────────────────

function OverviewTab({ stats, pendingUsers, pendingVehicles, onApproveUser, onApproveVehicle }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pending Users */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            Pending Users ({pendingUsers.length})
          </h3>
        </div>
        {pendingUsers.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">All caught up!</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.slice(0, 5).map((u: User) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-1)]">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold shrink-0">
                  {u.full_name?.charAt(0) || u.username?.charAt(0) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.full_name || u.username}</p>
                  <p className="text-xs text-[var(--text-muted)]">{u.email} · <Badge variant={u.account_type === 'partner' ? 'brand' : 'default'}>{u.account_type}</Badge></p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onApproveUser(u.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => {}} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Vehicles */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <CarFront className="w-4 h-4 text-brand-500" />
            Pending Vehicles ({pendingVehicles.length})
          </h3>
        </div>
        {pendingVehicles.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No vehicles pending review</p>
        ) : (
          <div className="space-y-3">
            {pendingVehicles.slice(0, 5).map((v: Vehicle) => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-1)]">
                <div className="w-14 h-10 rounded-lg bg-[var(--surface-2)] shrink-0 overflow-hidden">
                  {v.images?.front && <img src={v.images.front} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{v.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatPrice(v.price)} · {v.year}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onApproveVehicle(v.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Stats Chart */}
      <Card className="p-5 lg:col-span-2">
        <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-brand-500" />
          Platform Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Approval Rate" value={`${stats.total_vehicles > 0 ? Math.round((stats.approved_vehicles / stats.total_vehicles) * 100) : 0}%`} color="green" />
          <MiniStat label="Active Bids" value={stats.pending_bids} color="amber" />
          <MiniStat label="Dealer Ratio" value={`${stats.total_users > 0 ? Math.round((stats.partners / stats.total_users) * 100) : 0}%`} color="blue" />
          <MiniStat label="Queue Depth" value={stats.pending_users + stats.pending_vehicles} color={stats.pending_users + stats.pending_vehicles > 10 ? 'red' : 'green'} />
        </div>
      </Card>
    </div>
  )
}

// ── Users Tab ────────────────────────────────────────────────────────────

function UsersTab({ pendingUsers, onApprove, onReject }: any) {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filter, setFilter] = useState({ type: 'all', status: 'all' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.users(filter.type !== 'all' ? filter.type : undefined, filter.status !== 'all' ? filter.status : undefined)
      .then(r => setAllUsers(r.users))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
          <option value="all">All types</option>
          <option value="individual">Individuals</option>
          <option value="partner">Partners</option>
          <option value="admin">Admins</option>
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)]">User</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)]">Type</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)]">Status</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)]">Joined</th>
                <th className="text-right p-3 text-xs font-medium text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : allUsers).map(u => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-1)] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{u.full_name || u.username}</p>
                        <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><Badge variant={u.account_type === 'partner' ? 'brand' : u.account_type === 'admin' ? 'danger' : 'default'}>{u.account_type}</Badge></td>
                  <td className="p-3"><Badge variant={u.is_approved ? 'success' : 'warning'}>{u.is_approved ? 'Approved' : 'Pending'}</Badge></td>
                  <td className="p-3 text-[var(--text-muted)]">{timeAgo(u.created_at)}</td>
                  <td className="p-3 text-right">
                    {!u.is_approved && u.account_type !== 'admin' && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onApprove(u.id)} className="px-2 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium">Approve</button>
                        <button onClick={() => onReject(u.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Vehicles Tab ─────────────────────────────────────────────────────────

function VehiclesTab({ pendingVehicles, onApprove, onReject }: any) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-4">Pending Approval ({pendingVehicles.length})</h3>
      {pendingVehicles.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-[var(--text-muted)]">All vehicles reviewed — queue is empty!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingVehicles.map((v: Vehicle) => (
            <Card key={v.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-18 rounded-xl bg-[var(--surface-1)] shrink-0 overflow-hidden">
                  {v.images?.front ? (
                    <img src={v.images.front} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><CarFront className="w-6 h-6 text-[var(--text-muted)]" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm">{v.title}</h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {v.year} · {v.make} {v.model} · {formatPrice(v.price)}
                      </p>
                    </div>
                    <Badge variant={v.status === 'pending' ? 'warning' : 'default'}>{v.status}</Badge>
                  </div>
                  {v.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{v.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" onClick={() => onApprove(v.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onReject(v.id)}>
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                    <Link href={`/vehicle/${v.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── AI Review Tab ────────────────────────────────────────────────────────

function AIReviewTab({ aiReview, onRunReview, pendingVehicles, onApprove, onReject }: any) {
  const [loading, setLoading] = useState(false)

  const handleRun = async () => {
    setLoading(true)
    await onRunReview()
    setLoading(false)
  }

  return (
    <div>
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-medium">AI Auto-Review</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Scans all pending listings for fraud, spam, and quality — auto-approves clean ones
            </p>
          </div>
          <Button className="ml-auto" onClick={handleRun} loading={loading}>
            <Shield className="w-4 h-4" /> Run AI Review
          </Button>
        </div>

        {aiReview && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 text-center">
              <p className="text-2xl font-display font-bold text-green-600">{aiReview.auto_approvable}</p>
              <p className="text-xs text-green-700">Auto-approvable</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-center">
              <p className="text-2xl font-display font-bold text-amber-600">{aiReview.needs_review}</p>
              <p className="text-xs text-amber-700">Needs review</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-1)] text-center">
              <p className="text-2xl font-display font-bold">{aiReview.reviews?.length || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">Total scanned</p>
            </div>
          </div>
        )}
      </Card>

      {aiReview?.reviews && (
        <div className="space-y-3">
          {aiReview.reviews.map((r: any) => {
            const vehicle = pendingVehicles.find((v: Vehicle) => v.id === r.vehicle_id)
            const riskColors = {
              low: 'text-green-600 bg-green-50',
              medium: 'text-amber-600 bg-amber-50',
              high: 'text-red-600 bg-red-50',
              critical: 'text-red-800 bg-red-100',
            }
            const color = riskColors[r.risk_level as keyof typeof riskColors] || riskColors.medium

            return (
              <Card key={r.vehicle_id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg ${color}`}>
                    {r.risk_score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={r.risk_level === 'low' ? 'success' : r.risk_level === 'critical' ? 'danger' : 'warning'}>
                        {r.risk_level} risk
                      </Badge>
                      {r.flag_count > 0 && (
                        <span className="text-xs text-[var(--text-muted)]">{r.flag_count} flag{r.flag_count > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {r.auto_approve ? (
                      <Button size="sm" onClick={() => onApprove(r.vehicle_id)}>
                        <CheckCircle className="w-3.5 h-3.5" /> Auto-approve
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => onApprove(r.vehicle_id)}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => onReject(r.vehicle_id)}>Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700 dark:bg-green-900/10',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/10',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/10',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/10',
  }
  return (
    <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-xl font-display font-bold">{value}</p>
    </div>
  )
}

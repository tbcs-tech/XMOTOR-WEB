'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/store'
import { admin as adminApi } from '@/lib/api'
import { Button, Badge, Card, Skeleton } from '@/components/ui'
import { timeAgo } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = () => {
    setLoading(true)
    adminApi.users(
      filterType !== 'all' ? filterType : undefined,
      filterStatus !== 'all' ? filterStatus : undefined,
    ).then(r => setUsers(r.users)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterType, filterStatus])

  const approve = async (id: number) => {
    await adminApi.approveUser(id)
    toast.success('User approved')
    load()
  }

  const reject = async (id: number) => {
    if (!confirm('Reject this user? This will delete their account.')) return
    await adminApi.rejectUser(id)
    toast.success('User rejected')
    load()
  }

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/dashboard/admin" className="text-white/60 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="font-display font-bold text-xl mt-1">User Management</h1>
          <p className="text-white/50 text-sm mt-1">{users.length} users total</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
            <option value="all">All Types</option>
            <option value="individual">Individuals</option>
            <option value="partner">Partners</option>
            <option value="admin">Admins</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface-0)]">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {loading ? <Skeleton className="h-64 rounded-2xl" /> : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">User</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Type</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Phone</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)]">Joined</th>
                    <th className="text-right p-3 text-xs font-semibold text-[var(--text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-1)] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">{u.full_name?.charAt(0) || '?'}</div>
                          <div><p className="font-medium">{u.full_name || u.username}</p><p className="text-xs text-[var(--text-muted)]">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="p-3"><Badge variant={u.account_type === 'partner' ? 'brand' : u.account_type === 'admin' ? 'danger' : 'default'}>{u.account_type}</Badge></td>
                      <td className="p-3"><Badge variant={u.is_approved ? 'success' : 'warning'}>{u.is_approved ? 'Approved' : 'Pending'}</Badge></td>
                      <td className="p-3 text-[var(--text-muted)]">{u.phone || '—'}</td>
                      <td className="p-3 text-[var(--text-muted)]">{timeAgo(u.created_at)}</td>
                      <td className="p-3 text-right">
                        {!u.is_approved && u.account_type !== 'admin' && (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => approve(u.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => reject(u.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><XCircle className="w-4 h-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <p className="p-8 text-center text-sm text-[var(--text-muted)]">No users match the filters.</p>}
          </Card>
        )}
      </div>
    </div>
  )
}

'use client'
// @ts-nocheck

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { bulk as bulkApi } from '@/lib/api'
import type { BulkBatch, BulkRow } from '@/lib/api'
import { Button, Card, Badge, Skeleton } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import {
  Download, Upload, FileSpreadsheet, Images, CheckCircle2, AlertTriangle,
  XCircle, ArrowRight, Trash2, Info, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Stage = 'pick' | 'preview' | 'done'

export default function BulkUploadPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [stage, setStage] = useState<Stage>('pick')
  const [sheet, setSheet] = useState<File | null>(null)
  const [photos, setPhotos] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [error, setError] = useState('')

  const [batch, setBatch] = useState<BulkBatch | null>(null)
  const [unmatched, setUnmatched] = useState<string[]>([])
  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'ok' | 'warning' | 'error'>('all')
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)

  const sheetRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login')
    if (!isLoading && user && user.account_type !== 'partner') {
      toast.error('Dealer accounts only')
      router.push('/')
    }
  }, [isAuthenticated, isLoading, user])

  const downloadTemplate = async () => {
    try {
      const res = await fetch(bulkApi.templateUrl(), {
        headers: { Authorization: `Bearer ${localStorage.getItem('xm_access')}` },
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'xmotor-inventory-template.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Template downloaded')
    } catch {
      toast.error('Could not download the template')
    }
  }

  const handleUpload = async () => {
    if (!sheet) { setError('Choose your filled-in spreadsheet first'); return }
    setError('')
    setUploading(true)
    try {
      const res = await bulkApi.upload(sheet, photos)
      setBatch(res.batch)
      setUnmatched(res.unmatched_photos || [])
      setStage('preview')
      const s = res.summary
      if (s.error > 0) {
        toast(`${s.error} row(s) need fixing before they can be published`,
              { icon: '⚠️', duration: 4000 })
      } else {
        toast.success(`${s.total} vehicles read successfully`)
      }
    } catch (e: any) {
      setError(e?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCommit = async () => {
    if (!batch) return
    setCommitting(true)
    try {
      const res = await bulkApi.commit(batch.id, Array.from(skipped))
      setResult({ created: res.created, skipped: res.skipped })
      setStage('done')
    } catch (e: any) {
      toast.error(e?.data?.error || 'Could not publish')
    } finally {
      setCommitting(false)
    }
  }

  const reset = () => {
    setStage('pick'); setSheet(null); setPhotos(null); setBatch(null)
    setSkipped(new Set()); setResult(null); setError('')
    if (sheetRef.current) sheetRef.current.value = ''
    if (photoRef.current) photoRef.current.value = ''
  }

  const rows = batch?.rows || []
  const shown = filter === 'all' ? rows : rows.filter(r => r._status === filter)
  const publishable = rows.filter(
    r => r._status !== 'error' && !skipped.has(r.stock_id)).length

  return (
    <div className="bg-[var(--surface-1)] min-h-screen pb-20">
      <div className="bg-[var(--surface-0)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard/dealer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ← Dashboard
          </Link>
          <h1 className="font-display font-bold text-xl mt-1">Bulk Upload Inventory</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            List your whole lot from one spreadsheet
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* ── Stage: pick files ── */}
        {stage === 'pick' && (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-sm shrink-0">1</div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-sm">Download the template</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    One row per vehicle. Dropdowns keep the values consistent, and the
                    “How to use” tab explains photo naming. Up to 500 vehicles per upload.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-3" onClick={downloadTemplate}>
                    <Download className="w-4 h-4" /> Download template (.xlsx)
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-sm shrink-0">2</div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-sm">Name your photos</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    Start each filename with that vehicle’s Stock ID, then zip them together.
                  </p>
                  <div className="mt-2 p-2.5 rounded-lg bg-[var(--surface-1)] font-mono text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    STK-001_front.jpg &nbsp; STK-001_interior.jpg<br />
                    STK-002_1.jpg &nbsp; STK-002_2.jpg
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                    Angles recognised: front, rear, left, right, interior, dashboard, engine
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-sm shrink-0">3</div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-sm mb-3">Upload</h2>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-3">{error}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FilePicker
                      inputRef={sheetRef}
                      accept=".xlsx,.xlsm"
                      icon={<FileSpreadsheet className="w-5 h-5" />}
                      label="Spreadsheet"
                      hint="Required · .xlsx"
                      file={sheet}
                      onPick={setSheet}
                    />
                    <FilePicker
                      inputRef={photoRef}
                      accept=".zip"
                      icon={<Images className="w-5 h-5" />}
                      label="Photos"
                      hint="Optional · .zip"
                      file={photos}
                      onPick={setPhotos}
                    />
                  </div>

                  <Button className="w-full mt-4" size="lg"
                          loading={uploading} onClick={handleUpload}>
                    <Upload className="w-4 h-4" /> Upload &amp; preview
                  </Button>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                    Nothing is published yet — you’ll review everything first.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── Stage: preview ── */}
        {stage === 'preview' && batch && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {([
                ['all', batch.total_rows, 'Total', 'text-[var(--text-primary)]'],
                ['ok', batch.valid_rows, 'Ready', 'text-green-600'],
                ['warning', batch.warn_rows, 'Warnings', 'text-amber-600'],
                ['error', batch.error_rows, 'Errors', 'text-red-600'],
              ] as const).map(([key, n, label, color]) => (
                <button key={key} onClick={() => setFilter(key as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    filter === key
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-[var(--border)] bg-[var(--surface-0)] hover:border-brand-300'}`}>
                  <p className={`font-display font-extrabold text-xl ${color}`}>{n}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">{label}</p>
                </button>
              ))}
            </div>

            {batch.error_rows > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>{batch.error_rows} row(s) can’t be published.</strong> They’ll be
                  skipped. Fix them in your sheet and upload again — the rows that are fine
                  now will publish immediately, so nothing is wasted.
                </p>
              </div>
            )}

            {unmatched.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--surface-0)] border border-[var(--border)]">
                <p className="text-xs font-semibold mb-1">
                  {unmatched.length} photo(s) didn’t match any Stock ID
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">
                  {unmatched.slice(0, 6).join(', ')}
                  {unmatched.length > 6 && ` +${unmatched.length - 6} more`}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {shown.map(row => (
                <RowCard
                  key={`${row._row_num}-${row.stock_id}`}
                  row={row}
                  skipped={skipped.has(row.stock_id)}
                  onToggleSkip={() => {
                    const next = new Set(skipped)
                    next.has(row.stock_id) ? next.delete(row.stock_id)
                                           : next.add(row.stock_id)
                    setSkipped(next)
                  }}
                />
              ))}
              {shown.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-sm text-[var(--text-muted)]">No rows in this category.</p>
                </Card>
              )}
            </div>

            <Card className="p-4 sticky bottom-16 md:bottom-4 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display font-bold text-sm">
                    {publishable} listing{publishable !== 1 ? 's' : ''} ready
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Goes to our team for approval, usually within a few hours
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={reset}>Start over</Button>
                  <Button size="sm" loading={committing} disabled={publishable === 0}
                          onClick={handleCommit}>
                    Publish <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── Stage: done ── */}
        {stage === 'done' && result && (
          <Card className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-display font-extrabold text-2xl mb-2">
              {result.created} listing{result.created !== 1 ? 's' : ''} submitted
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-1">
              Our team reviews them before they go live — usually within a few hours.
            </p>
            {result.skipped > 0 && (
              <p className="text-xs text-amber-600 mb-4">
                {result.skipped} row(s) were skipped. Fix them in your sheet and upload again.
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/dashboard/dealer/inventory">
                <Button>View inventory</Button>
              </Link>
              <Button variant="secondary" onClick={reset}>Upload more</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function FilePicker({ inputRef, accept, icon, label, hint, file, onPick }: any) {
  return (
    <button
      onClick={() => inputRef.current?.click()}
      className={`p-4 rounded-xl border-2 border-dashed text-left transition-all ${
        file ? 'border-brand-500 bg-brand-50' : 'border-[var(--border)] hover:border-brand-300'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
             onChange={e => onPick(e.target.files?.[0] || null)} />
      <div className="flex items-center gap-2 mb-1">
        <span className={file ? 'text-brand-500' : 'text-[var(--text-muted)]'}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {file ? (
        <p className="text-xs text-brand-600 truncate">
          {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
        </p>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </button>
  )
}

function RowCard({ row, skipped, onToggleSkip }: {
  row: BulkRow; skipped: boolean; onToggleSkip: () => void
}) {
  const [open, setOpen] = useState(false)
  const isError = row._status === 'error'
  const issues = [...(row._errors || []), ...(row._warnings || [])]

  const tone = isError ? 'border-l-red-400'
    : row._status === 'warning' ? 'border-l-amber-400'
    : 'border-l-green-400'

  return (
    <Card className={`p-3 border-l-4 ${tone} ${skipped || isError ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {isError ? <XCircle className="w-4 h-4 text-red-500" />
            : row._status === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" />
            : <CheckCircle2 className="w-4 h-4 text-green-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-1)] text-[var(--text-muted)] shrink-0">
              {row.stock_id || `row ${row._row_num}`}
            </span>
            <p className="font-medium text-sm truncate">
              {row.title || <span className="text-[var(--text-muted)] italic">incomplete</span>}
            </p>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {row.price ? formatPrice(row.price) : '— price'}
            {row.mileage != null && ` · ${row.mileage.toLocaleString()} km`}
            {row.fuel_type && ` · ${row.fuel_type}`}
            {row.transmission && ` · ${row.transmission}`}
            {` · ${row._images?.length || 0} photo${row._images?.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {issues.length > 0 && (
            <button onClick={() => setOpen(!open)}
              className="text-[10px] px-2 py-1 rounded-lg bg-[var(--surface-1)] font-medium hover:bg-[var(--surface-2)]">
              {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </button>
          )}
          {!isError && (
            <button onClick={onToggleSkip}
              title={skipped ? 'Include this row' : 'Skip this row'}
              className={`p-1.5 rounded-lg transition-colors ${
                skipped ? 'bg-brand-50 text-brand-600' : 'bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && issues.length > 0 && (
        <ul className="mt-2 pt-2 border-t border-[var(--border)] space-y-1">
          {(row._errors || []).map((e, i) => (
            <li key={`e${i}`} className="text-xs text-red-600 flex gap-1.5">
              <span className="shrink-0">•</span>{e}
            </li>
          ))}
          {(row._warnings || []).map((w, i) => (
            <li key={`w${i}`} className="text-xs text-amber-600 flex gap-1.5">
              <span className="shrink-0">•</span>{w}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

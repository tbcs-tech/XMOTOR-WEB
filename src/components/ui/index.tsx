'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ── Button ───────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary', size = 'md', loading, children,
  className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20',
    secondary: 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-2)]',
    ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-1)]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-xl border bg-[var(--surface-0)] text-sm',
          'border-[var(--border)] focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20',
          'placeholder:text-[var(--text-muted)] outline-none transition-all',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'

// ── Badge ────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--surface-1)] text-[var(--text-secondary)]',
    success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────

export function Card({
  className, children, ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface-0)]',
        'overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Skeleton (loading placeholder) ───────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg', className)} />
}

// ── Empty State ──────────────────────────────────────────────────────────

export function EmptyState({
  icon, title, description, action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
        {icon}
      </div>
      <h3 className="text-base font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────────

export function StatCard({
  label, value, sublabel, icon,
}: {
  label: string
  value: string | number
  sublabel?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        {icon && <span className="text-[var(--text-muted)]">{icon}</span>}
      </div>
      <div className="text-2xl font-display font-semibold">{value}</div>
      {sublabel && (
        <span className="text-xs text-[var(--text-muted)]">{sublabel}</span>
      )}
    </div>
  )
}

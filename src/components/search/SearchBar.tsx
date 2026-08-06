'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { search as searchApi } from '@/lib/api'
import { debounce } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSelect?: () => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ type: string; text: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSuggestions = debounce(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return }
    try {
      const result = await searchApi.suggestions(q)
      setSuggestions(result.suggestions)
      setShowSuggestions(true)
    } catch {
      setSuggestions([])
    }
  }, 250)

  useEffect(() => {
    fetchSuggestions(query)
  }, [query])

  const handleSubmit = (q?: string) => {
    const searchQuery = q || query
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
      onSelect?.()
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search cars, brands, models..."
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-[var(--surface-1)] border border-transparent focus:border-brand-500 focus:bg-[var(--surface-0)] text-sm outline-none transition-all placeholder:text-[var(--text-muted)]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--surface-2)]"
          >
            <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
          <div className="absolute top-full mt-1 w-full bg-[var(--surface-0)] rounded-xl border border-[var(--border)] shadow-xl z-50 overflow-hidden animate-slide-up">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s.text)
                  handleSubmit(s.text)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--surface-1)] transition-colors text-left"
              >
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span>{s.text}</span>
                <span className="ml-auto text-xs text-[var(--text-muted)] capitalize">
                  {s.type}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export function ScrollButton() {
  const [showUp, setShowUp] = useState(false)
  const [showDown, setShowDown] = useState(false)

  useEffect(() => {
    const check = () => {
      const scrollY = window.scrollY
      const windowH = window.innerHeight
      const docH = document.documentElement.scrollHeight

      setShowUp(scrollY > 300)
      setShowDown(scrollY + windowH < docH - 200)
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    // Also check on resize and after content loads
    window.addEventListener('resize', check)
    const timer = setTimeout(check, 1000)

    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      clearTimeout(timer)
    }
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  if (!showUp && !showDown) return null

  return (
    <div className="fixed right-4 bottom-[8.5rem] md:bottom-24 z-20 flex flex-col gap-1.5">
      {showUp && (
        <button
          onClick={scrollToTop}
          className="w-9 h-9 rounded-full bg-[var(--surface-0)] border border-[var(--border)] shadow-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:shadow-lg transition-all active:scale-90"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      {showDown && (
        <button
          onClick={scrollToBottom}
          className="w-9 h-9 rounded-full bg-[var(--surface-0)] border border-[var(--border)] shadow-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:shadow-lg transition-all active:scale-90"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

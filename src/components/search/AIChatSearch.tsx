'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button, Card } from '@/components/ui'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { formatPrice } from '@/lib/utils'
import { Bot, Send, Sparkles, ArrowRight } from 'lucide-react'
import type { Vehicle } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface Message {
  role: 'user' | 'assistant'
  content: string
  vehicles?: Vehicle[]
  suggestions?: string[]
}

export function AIChatSearch() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (text?: string) => {
    const query = text || input
    if (!query.trim()) return

    const userMsg: Message = { role: 'user', content: query }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context: {} }),
      })
      const data = await res.json()

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response_text || 'Here are some results.',
        vehicles: data.vehicles?.slice(0, 6),
        suggestions: data.follow_up_suggestions,
      }
      setMessages([...newMessages, assistantMsg])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Try again?',
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 z-30 w-14 h-14 rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 flex items-center justify-center hover:bg-brand-600 transition-all hover:scale-105 active:scale-95"
        aria-label="Open AI search"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 w-[360px] max-w-[calc(100vw-2rem)] animate-slide-up">
      <Card className="flex flex-col h-[500px] max-h-[70vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">XMotor AI</h3>
              <p className="text-xs text-[var(--text-muted)]">Search in natural language</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            Close
          </button>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-brand-300 mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Ask me anything about cars
              </p>
              <div className="space-y-2">
                {[
                  'Family SUV under 15 lakh',
                  'Best automatic cars for city driving',
                  'Electric vehicles in Mumbai',
                  'Luxury cars with low mileage',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="block w-full text-left px-3 py-2 rounded-xl text-xs bg-[var(--surface-1)] hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
              {msg.role === 'user' ? (
                <div className="max-w-[80%] bg-brand-500 text-white px-3.5 py-2 rounded-2xl rounded-br-md text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[var(--surface-1)] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm">
                    {msg.content}
                  </div>

                  {/* Vehicle results */}
                  {msg.vehicles && msg.vehicles.length > 0 && (
                    <div className="space-y-2">
                      {msg.vehicles.slice(0, 3).map((v) => (
                        <a
                          key={v.id}
                          href={`/vehicle/${v.id}`}
                          className="flex items-center gap-3 p-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] hover:border-brand-300 transition-colors"
                        >
                          <div className="w-16 h-12 rounded-lg bg-[var(--surface-1)] shrink-0 overflow-hidden">
                            {v.images?.front && (
                              <img src={v.images.front} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{v.title}</p>
                            <p className="text-xs text-brand-600 font-bold">{formatPrice(v.price)}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] ml-auto shrink-0" />
                        </a>
                      ))}
                      {msg.vehicles.length > 3 && (
                        <p className="text-xs text-[var(--text-muted)] text-center">
                          +{msg.vehicles.length - 3} more results
                        </p>
                      )}
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => sendMessage(s)}
                          className="px-2.5 py-1 rounded-full text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Searching...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Try: 'SUV under 12 lakh in Pune'"
              className="flex-1 h-10 px-3 rounded-xl bg-[var(--surface-1)] text-sm outline-none focus:ring-1 focus:ring-brand-500/20"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

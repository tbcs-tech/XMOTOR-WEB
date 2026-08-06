/**
 * Auth Store — Zustand state management for authentication.
 * Handles login, logout, token persistence, and user state.
 */
import { create } from 'zustand'
import type { User } from '@/types'
import { auth as authApi, setTokens, clearTokens, getAccessToken } from '@/lib/api'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<any>
  register: (data: any) => Promise<{ user_id: number }>
  logout: () => void
  loadUser: () => Promise<void>
  updateUser: (partial: Partial<User>) => void
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const result = await authApi.login(email, password)
    setTokens(result.access_token, result.refresh_token)
    set({
      user: result.user,
      isAuthenticated: true,
      isLoading: false,
    })
    return result
  },

  register: async (data) => {
    const result = await authApi.register(data)
    return result
  },

  logout: () => {
    clearTokens()
    set({ user: null, isAuthenticated: false, isLoading: false })
    // Reset city to All India
    if (typeof window !== 'undefined') {
      localStorage.setItem('xm_city', 'All India')
    }
    useCity.setState({ city: 'All India' })
  },

  loadUser: async () => {
    const token = getAccessToken()
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const result = await authApi.me()
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateUser: (partial) => {
    const current = get().user
    if (current) {
      set({ user: { ...current, ...partial } })
    }
  },
}))

// ── City Store (global super filter) ─────────────────────────────────────

interface CityState {
  city: string
  setCity: (city: string) => void
}

export const useCity = create<CityState>((set) => ({
  city: 'All India',
  setCity: (city) => {
    set({ city })
    // Persist in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('xm_city', city)
    }
  },
}))

// Hydrate city from localStorage on load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('xm_city')
  if (saved) useCity.setState({ city: saved })
}

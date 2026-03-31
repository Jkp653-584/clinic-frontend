// LoadingContext.tsx
import { createContext, useContext, useState } from 'react'
import GlobalLoadingOverlay from './GlobalLoadingOverlay'

const LoadingContext = createContext<{
  loading: boolean
  start: () => void
  stop: () => void
} | null>(null)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)

  const start = () => setCount(c => c + 1)
  const stop = () => setCount(c => Math.max(0, c - 1))

  return (
    <LoadingContext.Provider
      value={{
        loading: count > 0,
        start,
        stop,
      }}
    >
      {children}
      {count > 0 && <GlobalLoadingOverlay />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used inside LoadingProvider')
  return ctx
}

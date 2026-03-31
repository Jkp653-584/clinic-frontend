// fetchWithLoading.ts
import { useLoading } from './LoadingContext'

export function useFetchWithLoading() {
  const { start, stop } = useLoading()

  return async function fetchWithLoading(
    input: RequestInfo,
    init?: RequestInit
  ) {
    start()
    try {
      const res = await fetch(input, init)
      return res
    } finally {
      stop()
    }
  }
}
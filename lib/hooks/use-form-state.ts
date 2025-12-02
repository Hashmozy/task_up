import { useState } from "react"

export interface FormState {
  isLoading: boolean
  error: string | null
}

export interface UseFormStateReturn extends FormState {
  setError: (error: string | null) => void
  handleSubmit: (fn: () => Promise<void>) => Promise<void>
  reset: () => void
}

/**
 * Custom hook for managing form state with loading and error handling
 */
export function useFormState(): UseFormStateReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (fn: () => Promise<void>) => {
    setIsLoading(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setIsLoading(false)
    setError(null)
  }

  return { isLoading, error, setError, handleSubmit, reset }
}

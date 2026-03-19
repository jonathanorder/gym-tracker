import { useState, useEffect } from 'react'
import { Exercise } from '@/lib/types'

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/exercises')

        if (!response.ok) {
          throw new Error('Failed to fetch exercises')
        }

        const data = await response.json()
        setExercises(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        setExercises([])
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  return { exercises, loading, error }
}

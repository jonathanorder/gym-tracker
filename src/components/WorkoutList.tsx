'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { Trash2, Eye } from 'lucide-react'

interface WorkoutWithExercises {
  id: string
  date: string
  notes?: string
  workout_exercises: Array<{
    id: string
    exercise_id: number
    sets: number
    reps: number
    weight?: number
    rpe?: number
    exercises?: { name: string }
  }>
}

interface WorkoutListProps {
  userId: string
  refresh?: number
}

export default function WorkoutList({ userId, refresh = 0 }: WorkoutListProps) {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkouts()
  }, [userId, refresh])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('training_sessions')
        .select(`
          id,
          date,
          notes,
          workout_exercises (
            id,
            exercise_id,
            sets,
            reps,
            weight,
            rpe,
            exercises (name)
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(20)

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setWorkouts((data || []) as unknown as WorkoutWithExercises[])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (workoutId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', workoutId)

      if (deleteError) {
        setError(deleteError.message)
        return
      }

      setWorkouts(workouts.filter(w => w.id !== workoutId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="text-slate-400">Cargando entrenamientos...</div>
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No hay entrenamientos registrados aún
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-slate-600 transition"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-slate-100">
                {new Date(workout.date).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <p className="text-sm text-slate-400">
                {workout.workout_exercises.length} ejercicio(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/training/${workout.id}`}
                className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition"
                title="Ver detalles"
              >
                <Eye size={18} />
              </Link>
              <button
                onClick={() => handleDelete(workout.id)}
                className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300 transition"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Lista de ejercicios resumida */}
          <div className="text-xs text-slate-400 space-y-1">
            {workout.workout_exercises.slice(0, 3).map((ex, idx) => (
              <p key={idx}>
                • {ex.exercises?.name || 'Ejercicio desconocido'} - {ex.sets}x{ex.reps}
                {ex.weight && ` @ ${ex.weight}kg`}
              </p>
            ))}
            {workout.workout_exercises.length > 3 && (
              <p className="text-slate-500">
                + {workout.workout_exercises.length - 3} más
              </p>
            )}
          </div>

          {workout.notes && (
            <p className="text-xs text-slate-400 mt-2 italic">
              Nota: {workout.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

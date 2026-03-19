'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useExercises } from '../../lib/useExercises'
import { X, Plus } from 'lucide-react'

interface WorkoutExerciseInput {
  exercise_id: number
  sets: number
  reps: number
  weight?: number
  rpe?: number
}

interface WorkoutFormProps {
  userId: string
  onSuccess?: () => void
}

export default function WorkoutForm({ userId, onSuccess }: WorkoutFormProps) {
  const { exercises } = useExercises()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseInput[]>([
    { exercise_id: 0, sets: 3, reps: 8, weight: undefined, rpe: undefined }
  ])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addExercise = () => {
    setWorkoutExercises([
      ...workoutExercises,
      { exercise_id: 0, sets: 3, reps: 8, weight: undefined, rpe: undefined }
    ])
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...workoutExercises]
    updated[index] = { ...updated[index], [field]: value }
    setWorkoutExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (workoutExercises.length === 0) {
        setError('Debes añadir al menos 1 ejercicio')
        return
      }

      if (workoutExercises.some(ex => ex.exercise_id === 0)) {
        setError('Todos los ejercicios deben estar seleccionados')
        return
      }

      // Crear training session
      const { data: session, error: sessionError } = await supabase
        .from('training_sessions')
        .insert([
          {
            user_id: userId,
            date,
            notes: notes || null,
          }
        ])
        .select()
        .single()

      if (sessionError || !session) {
        setError(sessionError?.message || 'Error creando sesión')
        return
      }

      // Insertar ejercicios
      const exercisesToInsert = workoutExercises.map((ex, idx) => ({
        training_session_id: session.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || null,
        rpe: ex.rpe || null,
        order: idx,
      }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert)

      if (exercisesError) {
        setError(exercisesError.message)
        return
      }

      // Reset form
      setDate(new Date().toISOString().split('T')[0])
      setWorkoutExercises([{ exercise_id: 0, sets: 3, reps: 8 }])
      setNotes('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Nuevo Entrenamiento</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            required
            className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Ejercicios */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Ejercicios
          </label>

          {workoutExercises.map((exercise, idx) => (
            <div key={idx} className="mb-4 p-4 bg-slate-700 rounded border border-slate-600">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Ejercicio {idx + 1}
                </h3>
                {workoutExercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Selector de ejercicio */}
              <select
                value={exercise.exercise_id}
                onChange={(e) => updateExercise(idx, 'exercise_id', parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 bg-slate-600 text-slate-100 rounded border border-slate-500 mb-3 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value={0}>Selecciona un ejercicio...</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.muscle_group})
                  </option>
                ))}
              </select>

              {/* Series, Reps, Peso, RPE */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Series</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={exercise.weight || ''}
                    onChange={(e) => updateExercise(idx, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    disabled={loading}
                    className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">RPE (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={exercise.rpe || ''}
                    onChange={(e) => updateExercise(idx, 'rpe', e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={loading}
                    className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addExercise}
            disabled={loading}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-2"
          >
            <Plus size={16} />
            Agregar otro ejercicio
          </button>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            placeholder="Ej: Sentí muy fuerte hoy..."
            rows={3}
            className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading ? 'Guardando...' : 'Guardar entrenamiento'}
        </button>
      </form>
    </div>
  )
}

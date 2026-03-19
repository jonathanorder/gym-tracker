'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DailyMetric } from '../../lib/types'

interface DailyMetricsProps {
  userId: string
  onSuccess?: () => void
}

export default function DailyMetrics({ userId, onSuccess }: DailyMetricsProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [rpe, setRpe] = useState(5)
  const [fatigue, setFatigue] = useState(5)
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [bodyWeight, setBodyWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingMetric, setExistingMetric] = useState<DailyMetric | null>(null)

  useEffect(() => {
    fetchTodayMetric()
  }, [userId, date])

  const fetchTodayMetric = async () => {
    try {
      const { data } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (data) {
        setExistingMetric(data)
        setRpe(data.rpe || 5)
        setFatigue(data.fatigue || 5)
        setSleepHours(data.sleep_hours || 7)
        setSleepQuality(data.sleep_quality || 5)
        setBodyWeight(data.body_weight?.toString() || '')
        setNotes(data.notes || '')
      } else {
        setExistingMetric(null)
        setRpe(5)
        setFatigue(5)
        setSleepHours(7)
        setSleepQuality(5)
        setBodyWeight('')
        setNotes('')
      }
    } catch (err) {
      console.error('Error fetching metric:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!bodyWeight) {
        setError('El peso es obligatorio')
        return
      }

      const weightNum = parseFloat(bodyWeight)
      if (weightNum < 30 || weightNum > 200) {
        setError('El peso debe estar entre 30 y 200 kg')
        return
      }

      const metricData = {
        user_id: userId,
        date,
        rpe: rpe || null,
        fatigue: fatigue || null,
        sleep_hours: sleepHours || null,
        sleep_quality: sleepQuality || null,
        body_weight: weightNum,
        notes: notes || null,
      }

      if (existingMetric) {
        // Update
        const { error: updateError } = await supabase
          .from('daily_metrics')
          .update({
            ...metricData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingMetric.id)

        if (updateError) {
          setError(updateError.message)
          return
        }
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('daily_metrics')
          .insert([metricData])

        if (insertError) {
          setError(insertError.message)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onSuccess?.()
      await fetchTodayMetric()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Métricas del Día</h2>

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
            className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* RPE */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-300">
              RPE (Rate of Perceived Exertion)
            </label>
            <span className="text-lg font-bold text-blue-400">{rpe}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(parseInt(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-slate-500 mt-1">
            1 = muy fácil, 10 = máximo esfuerzo
          </p>
        </div>

        {/* Fatiga */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-300">
              Fatiga muscular
            </label>
            <span className="text-lg font-bold text-orange-400">{fatigue}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={fatigue}
            onChange={(e) => setFatigue(parseInt(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-slate-500 mt-1">
            1 = sin fatiga, 10 = muy cansado
          </p>
        </div>

        {/* Sueño */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Horas de sueño
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">
                Calidad
              </label>
              <span className="text-sm font-bold text-purple-400">{sleepQuality}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              disabled={loading}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Peso actual (kg) *
          </label>
          <input
            type="number"
            step="0.1"
            min="30"
            max="200"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            disabled={loading}
            required
            placeholder="75.5"
            className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
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
            placeholder="Ej: Descansé bien, me sentí fuerte..."
            rows={2}
            className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-900/20 border border-green-700 rounded text-green-400 text-sm">
            ✓ Métrica guardada correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading ? 'Guardando...' : existingMetric ? 'Actualizar métrica' : 'Guardar métrica'}
        </button>
      </form>
    </div>
  )
}

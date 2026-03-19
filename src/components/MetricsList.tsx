'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DailyMetric } from '../../lib/types'

interface MetricsListProps {
  userId: string
  refresh?: number
}

export default function MetricsList({ userId, refresh = 0 }: MetricsListProps) {
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [userId, refresh])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setMetrics(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-slate-400 text-sm">Cargando métricas...</div>
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        No hay métricas registradas aún
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-red-900/20 border border-red-700 rounded text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Fecha</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">RPE</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Fatiga</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Sueño</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Peso</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr
                key={metric.id}
                className="border-b border-slate-700 hover:bg-slate-700/30 transition"
              >
                <td className="py-2 px-3 text-slate-100">
                  {new Date(metric.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="py-2 px-3">
                  {metric.rpe ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-900/30 text-blue-400 text-xs font-bold">
                      {metric.rpe}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {metric.fatigue ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-900/30 text-orange-400 text-xs font-bold">
                      {metric.fatigue}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-100">
                  {metric.sleep_hours ? (
                    <span>
                      {metric.sleep_hours}h{' '}
                      {metric.sleep_quality && (
                        <span className="text-slate-500">
                          ({metric.sleep_quality}/10)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-100">
                  {metric.body_weight ? `${metric.body_weight} kg` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

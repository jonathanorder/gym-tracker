'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity, Scale, Zap, Moon } from 'lucide-react'

interface StatsCardsProps {
  userId: string
  refresh?: number
}

interface Stats {
  workoutsThisWeek: number
  currentWeight: number | null
  avgRpeWeek: number | null
  avgSleepWeek: number | null
}

export default function StatsCards({ userId, refresh = 0 }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats>({
    workoutsThisWeek: 0,
    currentWeight: null,
    avgRpeWeek: null,
    avgSleepWeek: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId, refresh])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Obtener fecha hace 7 días
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

      // 1. Entrenamientos esta semana
      const { data: workouts } = await supabase
        .from('training_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgoStr)

      const workoutsThisWeek = workouts?.length || 0

      // 2. Peso actual (última métrica)
      const { data: latestMetric } = await supabase
        .from('daily_metrics')
        .select('body_weight')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      const currentWeight = latestMetric?.body_weight || null

      // 3. RPE promedio semanal
      const { data: weekMetrics } = await supabase
        .from('daily_metrics')
        .select('rpe')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgoStr)

      const avgRpe =
        weekMetrics && weekMetrics.length > 0
          ? (
              weekMetrics.reduce((sum, m) => sum + (m.rpe || 0), 0) /
              weekMetrics.filter(m => m.rpe).length
            ).toFixed(1)
          : null

      // 4. Horas de sueño promedio semanal
      const { data: sleepMetrics } = await supabase
        .from('daily_metrics')
        .select('sleep_hours')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgoStr)

      const avgSleep =
        sleepMetrics && sleepMetrics.length > 0
          ? (
              sleepMetrics.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) /
              sleepMetrics.filter(m => m.sleep_hours).length
            ).toFixed(1)
          : null

      setStats({
        workoutsThisWeek,
        currentWeight,
        avgRpeWeek: avgRpe ? parseFloat(avgRpe) : null,
        avgSleepWeek: avgSleep ? parseFloat(avgSleep) : null,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800 p-6 rounded-lg border border-slate-700 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Entrenamientos esta semana */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-lg border border-blue-700/30 hover:border-blue-600/50 transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">
              Entrenamientos
            </p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.workoutsThisWeek}
            </p>
            <p className="text-xs text-slate-500 mt-1">esta semana</p>
          </div>
          <Activity size={24} className="text-blue-400 opacity-50" />
        </div>
      </div>

      {/* Peso actual */}
      <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-lg border border-green-700/30 hover:border-green-600/50 transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">
              Peso actual
            </p>
            <p className="text-3xl font-bold text-green-400">
              {stats.currentWeight ? `${stats.currentWeight.toFixed(1)}` : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-1">kg</p>
          </div>
          <Scale size={24} className="text-green-400 opacity-50" />
        </div>
      </div>

      {/* RPE promedio */}
      <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 p-6 rounded-lg border border-orange-700/30 hover:border-orange-600/50 transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">
              RPE promedio
            </p>
            <p className="text-3xl font-bold text-orange-400">
              {stats.avgRpeWeek ? stats.avgRpeWeek.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-1">esta semana</p>
          </div>
          <Zap size={24} className="text-orange-400 opacity-50" />
        </div>
      </div>

      {/* Sueño promedio */}
      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-lg border border-purple-700/30 hover:border-purple-600/50 transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">
              Sueño promedio
            </p>
            <p className="text-3xl font-bold text-purple-400">
              {stats.avgSleepWeek ? stats.avgSleepWeek.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-1">horas/día</p>
          </div>
          <Moon size={24} className="text-purple-400 opacity-50" />
        </div>
      </div>
    </div>
  )
}

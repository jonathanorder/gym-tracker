'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navigation from '../../components/navigation'
import WorkoutForm from '../../components/workoutForm'
import WorkoutList from '../../components/workoutList'
import DailyMetrics from '../../components/dailyMetrics'
import StatsCards from '../../components/statsCards'
import MetricsList from '../../components/metricsList'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        // Verificar que tenga perfil
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          router.push('/onboarding')
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error('Error:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-100 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <StatsCards userId={user.id} refresh={refreshTrigger} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Últimos entrenamientos */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Últimos Entrenamientos
              </h2>
              <WorkoutList
                userId={user.id}
                refresh={refreshTrigger}
              />
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Histórico de Métricas
              </h2>
              <MetricsList
                userId={user.id}
                refresh={refreshTrigger}
              />
            </div>
          </div>

          {/* Columna derecha: Formularios */}
          <div className="space-y-8">
            <WorkoutForm
              userId={user.id}
              onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />

            <DailyMetrics
              userId={user.id}
              onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

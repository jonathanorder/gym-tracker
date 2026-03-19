'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        setUser(session.user)
      } catch (err) {
        console.error(err)
        router.push('/auth')
      } finally {
        setPageLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        setError('No hay sesión activa')
        return
      }

      if (!weight || !height) {
        setError('Peso y altura son obligatorios')
        return
      }

      const weightNum = parseFloat(weight)
      const heightNum = parseInt(height)

      if (weightNum < 30 || weightNum > 200) {
        setError('El peso debe estar entre 30 y 200 kg')
        return
      }

      if (heightNum < 100 || heightNum > 250) {
        setError('La altura debe estar entre 100 y 250 cm')
        return
      }

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            weight: weightNum,
            height: heightNum,
            dob: dob || null,
          },
        ])

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Redirigir a dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al crear perfil')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-slate-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-slate-700">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 text-center">
          Bienvenido 👋
        </h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Primero, dime tus datos básicos
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Peso (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="200"
              placeholder="75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={loading}
              required
              className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
            />
            <p className="text-xs text-slate-500 mt-1">Mínimo 30 kg, máximo 200 kg</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Altura (cm) *
            </label>
            <input
              type="number"
              min="100"
              max="250"
              placeholder="180"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={loading}
              required
              className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
            />
            <p className="text-xs text-slate-500 mt-1">Mínimo 100 cm, máximo 250 cm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de nacimiento (opcional)
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !weight || !height}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded transition mt-6"
          >
            {loading ? 'Guardando...' : 'Continuar al dashboard'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Estos datos se pueden editar después en el perfil
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navigation from '../../components/navigation'
import { UserProfile } from '../../lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (fetchError) {
          console.error('Error fetching profile:', fetchError)
          router.push('/onboarding')
          return
        }

        if (data) {
          setProfile(data)
          setWeight(data.weight.toString())
          setHeight(data.height.toString())
          setDob(data.dob || '')
        }
      } catch (err) {
        console.error('Error:', err)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!profile) return

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

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          weight: weightNum,
          height: heightNum,
          dob: dob || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-8">Mi Perfil</h1>

          {profile && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.id}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-400 rounded border border-slate-600 disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  El email no se puede cambiar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/20 border border-green-700 rounded text-green-400 text-sm">
                  ✓ Perfil actualizado correctamente
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded transition"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

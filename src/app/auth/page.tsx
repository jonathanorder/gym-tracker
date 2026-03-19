'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        setError('Email y contraseña son obligatorios')
        setLoading(false)
        return
      }

      if (isSignup) {
        // Signup
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signupError) {
          setError(signupError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          // Redirigir a onboarding
          router.push('/onboarding')
        }
      } else {
        // Login
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          setError(loginError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          // Redirigir al home (que maneja la lógica)
          router.push('/')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al autenticar')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-slate-700">
        <h1 className="text-4xl font-bold text-slate-100 mb-2 text-center">
          💪 Gym Tracker
        </h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Tu app personal para trackear entrenamientos
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded transition"
          >
            {loading ? 'Procesando...' : isSignup ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400 text-center mb-4">
            {isSignup ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup)
              setError(null)
              setEmail('')
              setPassword('')
            }}
            className="w-full text-blue-400 hover:text-blue-300 font-semibold py-2 px-4 transition"
          >
            {isSignup ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Email + contraseña. Sin magic links, sin límites.
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          // Sin sesión → login
          router.push('/auth')
          return
        }

        // Con sesión, verificar perfil
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          // Tiene perfil → dashboard
          router.push('/dashboard')
        } else {
          // Sin perfil → onboarding
          router.push('/onboarding')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth')
      } finally {
        
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <p className="text-slate-400">Cargando...</p>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

export default function Navigation() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-slate-100 hover:text-slate-200">
          <span className="text-2xl">💪</span>
          Gym Tracker
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded transition"
          >
            <User size={18} />
            Perfil
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded transition"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}

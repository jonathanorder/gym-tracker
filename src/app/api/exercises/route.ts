import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Obtener parámetros de query (opcional)
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const muscleGroup = searchParams.get('muscle_group')

    // Construir query
    let query = supabase.from('exercises').select('*').eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (muscleGroup) {
      query = query.eq('muscle_group', muscleGroup)
    }

    // Ordenar por nombre
    query = query.order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

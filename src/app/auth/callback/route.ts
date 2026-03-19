import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Con email + password no necesitamos callback
  // Simplemente redirigir a home
  return NextResponse.redirect(new URL('/', request.url))
}

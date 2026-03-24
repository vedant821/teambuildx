import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isAdminRoute = pathname.startsWith('/admin')
  const isUserRoute = pathname.startsWith('/dashboard')
  
  if (!user && (isAdminRoute || isUserRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    if (isAuthRoute || pathname === '/') {
      const { data: profile } = await supabase.from('users_profile').select('role').eq('id', user.id).single()
      const role = profile?.role || 'user'
      
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase.from('users_profile').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

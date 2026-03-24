import Link from 'next/link'
import { CalendarDays, LogOut, Ticket } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'user'
  if (user) {
    const { data: profile } = await supabase.from('users_profile').select('role').eq('id', user.id).single()
    role = (profile as any)?.role || 'user' // cast to any temporarily to silence TS if never
  }

  return (
    <nav className="glass sticky top-0 z-50 w-full px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-[#3B82F6]" />
        <span className="text-xl font-bold tracking-tight text-gray-900">EventFlex</span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link 
              href={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            {role === 'user' && (
              <Link 
                href="/dashboard/tickets"
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Ticket className="h-4 w-4" />
                My Tickets
              </Link>
            )}
            <form action={signOut}>
              <button 
                type="submit"
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link 
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup"
              className="rounded-md bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

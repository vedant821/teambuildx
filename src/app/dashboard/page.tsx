import { createClient } from '@/utils/supabase/server'
import { EventList } from '@/components/user/EventList'

export default async function UserDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all upcoming events. In a real app we'd filter by date > now().
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  // Also fetch the user's registrations to determine if they are already registered
  const { data: registrations } = await supabase
    .from('registrations')
    .select('event_id, status')
    .eq('user_id', user.id)

  const registrationMap = registrations?.reduce((acc: any, reg: any) => {
    acc[reg.event_id] = reg.status
    return acc
  }, {}) || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FDFDFD] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="mt-1 text-sm text-gray-500">Discover and register for amazing events happening around you.</p>
      </div>

      <EventList events={events || []} registrations={registrationMap} />
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { UnifiedDashboard } from '@/components/admin/UnifiedDashboard'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all events for this organizer
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .order('date', { ascending: false })

  // Fetch ALL registrations (for all events of this organizer) with participant profile
  const eventIds = events?.map(e => e.id) ?? []
  const { data: registrations } = eventIds.length > 0
    ? await supabase
        .from('registrations')
        .select('*, users_profile:user_id (full_name, skills)')
        .in('event_id', eventIds)
    : { data: [] }

  return (
    <UnifiedDashboard
      initialEvents={events ?? []}
      initialRegistrations={(registrations as any[]) ?? []}
    />
  )
}

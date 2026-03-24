import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Calendar } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .order('date', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FDFDFD] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your events and attendees.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
        >
          <PlusCircle className="h-4 w-4" />
          Create Event
        </Link>
      </div>

      <div className="bg-white clean-border rounded-xl soft-shadow overflow-hidden">
        {events && events.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.is_paid ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-[#10B981]'}`}>
                        {event.is_paid ? `Paid (₹${event.fee_amount})` : 'Free'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/events/${event.id}/registrations`}
                    className="text-sm font-medium text-[#3B82F6] hover:text-blue-700 transition-colors"
                  >
                    Manage Registrations
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No events</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
            <div className="mt-6">
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-2 rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
              >
                <PlusCircle className="h-4 w-4" />
                Create Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

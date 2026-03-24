import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, MapPin, Share2, ArrowRight } from 'lucide-react'

// Shareable public event page
export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select(`*, organizer:users_profile!events_created_by_fkey(full_name)`)
    .eq('id', params.id)
    .single()

  if (error || !event) {
    return notFound()
  }

  const isCollege = event.title?.startsWith('[COLLEGE]') || event.is_college_event
  const displayTitle = event.title?.replace('[COLLEGE] ', '') || event.title
  const eventDate = new Date(event.date)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Navbar Minimal */}
      <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          EventFlex
        </Link>
        <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          Go to Dashboard →
        </Link>
      </nav>

      {/* Hero Content */}
      <main className="w-full max-w-3xl px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Header Banner */}
          <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative p-8 flex flex-col justify-end">
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm">
                {event.is_paid ? `🎫 ₹${event.fee_amount}` : '🆓 Free Entry'}
              </span>
              {isCollege && (
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  🎓 College Event
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              {displayTitle}
            </h1>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="flex flex-wrap gap-6 border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Date & Time</p>
                  <p className="text-sm font-bold text-gray-900">
                    {eventDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' • '}
                    {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Organizer</p>
                  <p className="text-sm font-bold text-gray-900">{event.organizer?.full_name || 'EventFlex Host'}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-sm md:prose-base prose-purple max-w-none mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About the Event</h3>
              {/* Splitting newlines into paragraphs to handle the rules and payment markdown injected earlier */}
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">Ready to join?</p>
                <p className="text-xs text-gray-500">Log in to your dashboard to complete registration.</p>
              </div>
              <Link
                href={`/dashboard?event=${event.id}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Register Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

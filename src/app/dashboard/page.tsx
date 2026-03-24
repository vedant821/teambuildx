import { createClient } from '@/utils/supabase/server'
import { EventList } from '@/components/user/EventList'
import { Trophy, Zap, Users, Search } from 'lucide-react'

export default async function UserDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  const { data: registrations } = await supabase
    .from('registrations')
    .select('event_id, status')
    .eq('user_id', user.id)

  const registrationMap = registrations?.reduce((acc: any, reg: any) => {
    acc[reg.event_id] = reg.status
    return acc
  }, {}) || {}

  const totalEvents = events?.length ?? 0
  const myRegistrations = registrations?.length ?? 0

  return (
    <div className="min-h-screen bg-[#F4F4F8]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                <Zap className="h-3 w-3 text-yellow-400" />
                Live Opportunities for You
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Explore Events & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Opportunities
                </span>
              </h1>
              <p className="text-white/50 mt-3 text-sm max-w-md">
                Find hackathons, workshops, and competitions. Register in one click, upload payment proof, and get your digital pass.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white">{totalEvents}</p>
                <p className="text-xs text-white/50 mt-1">Live Events</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white">{myRegistrations}</p>
                <p className="text-xs text-white/50 mt-1">My Registrations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-2 items-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap mr-2">Browse:</span>
          {['All', 'Hackathon', 'Workshop', 'Quiz', 'Case Study', 'Free Events'].map(cat => (
            <span key={cat}
              className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <EventList events={events || []} registrations={registrationMap} />
      </div>
    </div>
  )
}

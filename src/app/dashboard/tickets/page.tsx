import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Calendar, Ticket as TicketIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default async function UserTicketsPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id,
      status,
      events (
        id,
        title,
        date,
        description
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'approved')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FDFDFD] min-h-screen">
      <div className="mb-8">
         <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">Your approved digital passes for upcoming events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {registrations && registrations.length > 0 ? (
          registrations.map((reg: any) => {
            const event = reg.events
            if (!event) return null
            return (
              <div key={reg.id} className="bg-white clean-border rounded-xl soft-shadow overflow-hidden flex flex-col">
                <div className="bg-[#3B82F6] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
                  <h3 className="text-xl font-bold mb-1 relative z-10">{event.title}</h3>
                  <div className="flex items-center text-blue-100 text-sm relative z-10">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col items-center justify-center bg-gray-50 zigzag-border relative">
                  {/* Decorative ticket cutouts */}
                  <div className="absolute top-0 left-[-10px] w-5 h-5 bg-[#FDFDFD] rounded-full border border-gray-200 transform -translate-y-1/2"></div>
                  <div className="absolute top-0 right-[-10px] w-5 h-5 bg-[#FDFDFD] rounded-full border border-gray-200 transform -translate-y-1/2"></div>
                  
                  <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-widest">Entry Pass</p>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
                    <QRCodeSVG 
                      value={reg.id} 
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="font-mono text-xs text-gray-400 text-center uppercase tracking-wider">
                    ID: {reg.id.split('-')[0]}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white clean-border soft-shadow rounded-xl">
             <TicketIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
             <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
             <p className="mt-1 text-gray-500 mb-6">Looks like you don't have any approved tickets right now.</p>
             <Link href="/dashboard" className="inline-flex items-center rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow">
               Browse Events
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}

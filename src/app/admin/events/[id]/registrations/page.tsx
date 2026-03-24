import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, ShieldCheck, Clock } from 'lucide-react'
import { ApproveButton } from '@/components/admin/ApproveButton'
import { notFound } from 'next/navigation'

export default async function ManageRegistrationsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event || event.created_by !== user.id) {
    notFound()
  }

  // Fetch registrations joining with the users_profile
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      users_profile:user_id (
        full_name,
        skills
      )
    `)
    .eq('event_id', params.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FDFDFD] min-h-screen">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
        <p className="mt-1 text-sm text-gray-500">Event: {event.title}</p>
      </div>

      <div className="bg-white clean-border rounded-xl soft-shadow overflow-hidden overflow-x-auto">
        {registrations && registrations.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Proof</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((reg: any) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reg.users_profile?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reg.users_profile?.skills || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reg.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {reg.status === 'approved' ? <ShieldCheck className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                      {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.is_paid && reg.transaction_id ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs">{reg.transaction_id}</span>
                        {reg.screenshot_url && (
                          <a href={reg.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#3B82F6] hover:text-blue-700">
                            View Screenshot <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="italic text-gray-400">Free Event</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {reg.status === 'pending' && (
                      <ApproveButton registrationId={reg.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No registrations found for this event yet.
          </div>
        )}
      </div>
    </div>
  )
}

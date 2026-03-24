import { CreateEventForm } from '@/components/admin/CreateEventForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FDFDFD] min-h-screen">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-1 text-sm text-gray-500">Fill in the details to publish a new event.</p>
      </div>
      
      <CreateEventForm />
    </div>
  )
}

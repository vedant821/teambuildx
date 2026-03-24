'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Ticket, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { registerForEvent } from '@/app/actions/user'

type Event = any // type from DB would be here
type RegistrationsMap = Record<string, 'pending' | 'approved' | 'rejected'>

export function EventList({ events, registrations }: { events: Event[], registrations: RegistrationsMap }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white clean-border rounded-xl soft-shadow overflow-hidden flex flex-col transition-all cursor-default"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${event.is_paid ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-emerald-700'}`}>
                  {event.is_paid ? `Paid • ₹${event.fee_amount}` : 'Free'}
                </span>
                <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              {registrations[event.id] ? (
                <div className={`w-full text-center px-4 py-2 rounded-md text-sm font-semibold ${
                  registrations[event.id] === 'approved' ? 'bg-green-100 text-green-800' :
                  registrations[event.id] === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {registrations[event.id] === 'approved' ? 'Ticket Confirmed' : 
                   registrations[event.id] === 'pending' ? 'Registration Pending' : 'Registration Rejected'}
                </div>
              ) : (
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors"
                >
                  <Ticket className="h-4 w-4" />
                  Register Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <RegistrationModal 
        event={selectedEvent} 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  )
}

function RegistrationModal({ event, isOpen, onClose }: { event: Event | null, isOpen: boolean, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorText, setErrorText] = useState('')

  if (!isOpen || !event) return null

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsUploading(true)
    setErrorText('')

    let finalScreenshotUrl = null

    try {
      if (event!.is_paid) {
        if (!file || !transactionId) {
          setErrorText('Please attach proof of payment and transaction ID.')
          setIsUploading(false)
          return
        }

        const supabase = createClient()
        const ext = file.name.split('.').pop()
        const fileName = `${event?.id}_${Date.now()}.${ext}`

        // Upload to supabase storage 'payment_proofs' bucket
        const { data, error } = await supabase.storage.from('payment_proofs').upload(fileName, file)
        
        if (error) {
          throw new Error('Screenshot upload failed: ' + error.message)
        }

        const { data: publicData } = supabase.storage.from('payment_proofs').getPublicUrl(data.path)
        finalScreenshotUrl = publicData.publicUrl
      }

      const formData = new FormData()
      formData.append('event_id', event!.id)
      if (transactionId) formData.append('transaction_id', transactionId)
      if (finalScreenshotUrl) formData.append('screenshot_url', finalScreenshotUrl)

      const result = await registerForEvent(undefined, formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      onClose()
    } catch (err: any) {
      setErrorText(err.message || 'An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden clean-border p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Register for {event.title}</h2>
          
          <form onSubmit={handleRegister} className="mt-6 space-y-6">
            {event.is_paid ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-1">Payment Required: ₹{event.fee_amount}</p>
                  <p className="text-xs text-blue-600">Please send the amount to the following UPI ID and upload a screenshot along with the transaction ID.</p>
                  <div className="mt-2 bg-white px-3 py-2 rounded border border-blue-100 font-mono text-center font-bold text-gray-900 shadow-sm">
                    {event.upi_id}
                  </div>
                </div>

                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">Transaction ID / UTR</label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">Payment Screenshot</label>
                  <input
                    type="file"
                    id="screenshot"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-800">This is a free event. Just click below to confirm your registration!</p>
              </div>
            )}

            {errorText && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {errorText}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center justify-center rounded-md bg-[#3B82F6] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUploading ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

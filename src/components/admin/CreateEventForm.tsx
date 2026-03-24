'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createEvent } from '@/app/actions/admin'
import { SubmitButton } from '@/components/ui/SubmitButton'

export function CreateEventForm() {
  const [state, formAction] = useFormState(createEvent, null)
  const [isPaid, setIsPaid] = useState(false)

  return (
    <form action={formAction} className="space-y-6">
      <div className="bg-white clean-border rounded-xl soft-shadow p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] transition-colors sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] transition-colors sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            required
            className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] transition-colors sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            id="is_paid"
            name="is_paid"
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
          />
          <label htmlFor="is_paid" className="ml-2 block text-sm font-medium text-gray-700">
            This is a paid event
          </label>
        </div>

        <AnimatePresence>
          {isPaid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div>
                <label htmlFor="fee_amount" className="block text-sm font-medium text-gray-700">Fee Amount (₹)</label>
                <input
                  type="number"
                  id="fee_amount"
                  name="fee_amount"
                  min="0"
                  step="0.01"
                  required={isPaid}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] transition-colors sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700">Receiving UPI ID</label>
                <input
                  type="text"
                  id="upi_id"
                  name="upi_id"
                  required={isPaid}
                  placeholder="merchant@upi"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] transition-colors sm:text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state?.error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200 flex flex-col justify-center text-center">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="text-sm text-[#10B981] bg-green-50 p-3 rounded-md border border-green-200 flex flex-col justify-center text-center">
          {state.success}
        </div>
      )}

      <div className="flex justify-end">
        <SubmitButton pendingText="Creating..." className="w-auto px-8">Create Event</SubmitButton>
      </div>
    </form>
  )
}

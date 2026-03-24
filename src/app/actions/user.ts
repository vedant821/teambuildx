'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerForEvent(prevState: any, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const event_id = formData.get('event_id') as string
  const transaction_id = formData.get('transaction_id') as string | null
  const screenshot_url = formData.get('screenshot_url') as string | null

  // We could fetch the event to see if it's paid and demand trans/screenshot,
  // but we enforce this mostly in the UI component and rely on the fact that
  // if trans is provided, it's pending. If free, it can be auto-approved depending on logic.
  
  const { data: event } = await supabase.from('events').select('is_paid').eq('id', event_id).single()

  const status = event?.is_paid ? 'pending' : 'approved'

  const { error } = await supabase.from('registrations').insert({
    user_id: user.id,
    event_id,
    status,
    transaction_id,
    screenshot_url
  })

  if (error) {
    // Unique constraint on (user_id, event_id) should handle duplicate registrations.
    return { error: 'Registration failed or already registered' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tickets')
  return { success: 'Successfully registered' }
}

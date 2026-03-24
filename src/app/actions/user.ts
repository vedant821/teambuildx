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
  const full_name = formData.get('full_name') as string | null
  const phone = formData.get('phone') as string | null
  const college_name = formData.get('college_name') as string | null
  const college_id = formData.get('college_id') as string | null
  const college_proof_url = formData.get('college_proof_url') as string | null
  const team_name = formData.get('team_name') as string | null

  const { data: event } = await supabase
    .from('events')
    .select('is_paid')
    .eq('id', event_id)
    .single()

  const status = event?.is_paid ? 'pending' : 'approved'

  const { error } = await supabase.from('registrations').insert({
    user_id: user.id,
    event_id,
    status,
    transaction_id: transaction_id || null,
    screenshot_url: screenshot_url || null,
    full_name: full_name || null,
    phone: phone || null,
    college_name: college_name || null,
    college_id: college_id || null,
    college_proof_url: college_proof_url || null,
    team_name: team_name || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You are already registered for this event.' }
    // If the extra columns don't exist yet in DB, retry without them
    const { error: error2 } = await supabase.from('registrations').insert({
      user_id: user.id,
      event_id,
      status,
      transaction_id: transaction_id || null,
      screenshot_url: screenshot_url || null,
    })
    if (error2) return { error: 'Registration failed or already registered' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tickets')
  return { success: 'Successfully registered' }
}

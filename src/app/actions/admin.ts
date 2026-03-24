'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEvent(prevState: any, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const is_paid = formData.get('is_paid') === 'on'
  const fee_amount = is_paid ? parseFloat(formData.get('fee_amount') as string) : null
  const upi_id = is_paid ? formData.get('upi_id') as string : null

  if (!title || !description || !date) {
    return { error: 'Missing required fields' }
  }

  if (is_paid && (!fee_amount || !upi_id)) {
    return { error: 'Fee Amount and UPI ID are required for paid events' }
  }

  const { error } = await supabase.from('events').insert({
    title,
    description,
    date,
    is_paid,
    fee_amount,
    upi_id,
    created_by: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: 'Event created successfully' }
}

export async function approveRegistration(registrationId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify that the user owns the event this registration is for
  const { data: registration, error: regError } = await supabase
    .from('registrations')
    .select('event_id, events(created_by)')
    .eq('id', registrationId)
    .single()
  
  if (regError || !registration || (registration as any).events?.created_by !== user.id) {
    return { error: 'Cannot approve this registration' }
  }

  const { error } = await supabase
    .from('registrations')
    .update({ status: 'approved' })
    .eq('id', registrationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/events/[id]/registrations', 'page')
  return { success: true }
}

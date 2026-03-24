'use client'

import { useTransition } from 'react'
import { approveRegistration } from '@/app/actions/admin'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

export function ApproveButton({ registrationId }: { registrationId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <motion.button
      whileHover={!isPending ? { scale: 1.05 } : {}}
      whileTap={!isPending ? { scale: 0.95 } : {}}
      disabled={isPending}
      onClick={() => startTransition(() => { approveRegistration(registrationId) })}
      className="inline-flex items-center rounded-md bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
      {isPending ? 'Working...' : 'Approve'}
    </motion.button>
  )
}

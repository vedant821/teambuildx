'use client'

import { useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
  children: React.ReactNode;
}

export function SubmitButton({ children, pendingText, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <motion.button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      whileHover={!pending ? { scale: 1.02, y: -2 } : {}}
      whileTap={!pending ? { scale: 0.98 } : {}}
      className={`flex w-full justify-center items-center rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-70 disabled:cursor-not-allowed ${props.className || ''}`}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText || 'Submitting...'}
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

'use client'

import { useFormState } from 'react-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, null)

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FDFDFD]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create an EventFlex account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#3B82F6] hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200"
        >
          <form className="space-y-6" action={formAction}>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-200 pl-10 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] sm:text-sm transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-200 pl-10 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="block w-full appearance-none rounded-md border border-gray-200 pl-10 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {state?.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-red-500 text-center"
              >
                {state.error}
              </motion.div>
            )}

            <div>
              <SubmitButton pendingText="Creating account...">Sign up</SubmitButton>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

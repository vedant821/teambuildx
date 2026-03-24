'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'
import { adminLogin } from '@/app/auth/actions'
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const initialState = { error: '' }

// SubmitButton must be a separate child so useFormStatus works
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-purple-500/30"
    >
      {pending ? (
        <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      {pending ? 'Signing in...' : 'Sign in to Admin Portal'}
    </button>
  )
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(adminLogin, initialState)
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4 relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">EventFlex Admin</h1>
          <p className="text-purple-300 text-sm mt-1">Organizer &amp; Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-6">Sign in with your admin credentials to manage events.</p>

          <form action={formAction} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue="admin@eventflex.com"
                  placeholder="admin@eventflex.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  defaultValue="Admin@1234"
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="text-xs text-red-300 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2.5">
                ❌ {state.error}
              </div>
            )}

            <SubmitButton />
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Demo Admin Credentials</p>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-purple-300">📧 admin@eventflex.com</p>
              <p className="text-blue-300">🔑 Admin@1234</p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Not an admin?{' '}
          <a href="/login" className="text-purple-300 hover:text-white transition-colors">
            Go to User Login →
          </a>
        </p>
      </motion.div>
    </div>
  )
}

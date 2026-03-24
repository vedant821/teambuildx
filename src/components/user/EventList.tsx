'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Calendar, Ticket, Loader2, Search, SlidersHorizontal,
  Clock, Users, X, CheckCircle, Zap, ArrowRight, ArrowLeft,
  User, Phone, Building2, CreditCard, Upload, Hash, ShieldCheck, QrCode, Cpu
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { registerForEvent } from '@/app/actions/user'

type Event = any
type RegistrationsMap = Record<string, 'pending' | 'approved' | 'rejected'>

// ─── Category Colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS = [
  { bg: 'from-violet-500 to-purple-600', icon: '🏆' },
  { bg: 'from-blue-500 to-cyan-500', icon: '💡' },
  { bg: 'from-orange-400 to-rose-500', icon: '🎤' },
  { bg: 'from-emerald-400 to-teal-600', icon: '📐' },
  { bg: 'from-pink-500 to-rose-400', icon: '🎯' },
  { bg: 'from-yellow-400 to-orange-500', icon: '⚡' },
  { bg: 'from-indigo-500 to-blue-600', icon: '🔐' },
  { bg: 'from-red-400 to-pink-600', icon: '🎓' },
]
function getColor(i: number) { return CATEGORY_COLORS[i % CATEGORY_COLORS.length] }

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Registered ✓' },
    pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="h-3.5 w-3.5" />, label: 'Pending Review' },
    rejected: { cls: 'bg-red-50 text-red-700 border-red-200', icon: <X className="h-3.5 w-3.5" />, label: 'Rejected' },
  }
  const { cls, icon, label } = map[status]
  return (
    <div className={`flex items-center gap-1.5 w-full justify-center py-2 rounded-xl text-xs font-semibold border ${cls}`}>
      {icon}{label}
    </div>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, registration, idx, onRegister, onViewTicket, onFindTeam }: {
  event: Event; registration?: 'pending' | 'approved' | 'rejected'
  idx: number; onRegister: (e: Event) => void
  onViewTicket: (e: Event) => void
  onFindTeam: (e: Event) => void
}) {
  const { bg, icon } = getColor(idx)
  const eventDate = new Date(event.date)
  const daysLeft = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / 86400000))
  const isCollege = event.title?.startsWith('[COLLEGE]') || event.is_college_event
  const displayTitle = event.title?.replace('[COLLEGE] ', '') || event.title

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Gradient Banner */}
      <div className={`bg-gradient-to-br ${bg} p-5 relative overflow-hidden h-36`}>
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-white/10 rounded-full" />
        {/* Badges top row */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white">
            {event.is_paid ? `₹${event.fee_amount}` : '🆓 Free'}
          </span>
        </div>
        {isCollege && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[11px] font-bold rounded-full flex items-center gap-1">
              🎓 College
            </span>
          </div>
        )}
        {!isCollege && daysLeft <= 7 && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[11px] font-bold rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" />{daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-5 text-4xl">{icon}</div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1 mb-2">
          {isCollege && <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-yellow-50 text-yellow-700">🎓 College Event</span>}
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-50 text-purple-700">
            {event.is_paid ? 'Paid' : 'Free'}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 flex-none">{displayTitle}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">{event.description || 'No description.'}</p>

        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-4 border-t border-gray-50 pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />Open
          </span>
        </div>

        {registration ? (
          <div className="space-y-2">
            <StatusBadge status={registration} />
            {registration === 'approved' && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => onViewTicket(event)} className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-gray-900/20">
                  <Ticket className="h-3.5 w-3.5" /> Digital Pass
                </button>
                <button onClick={() => onFindTeam(event)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-500/20">
                  <Cpu className="h-3.5 w-3.5" /> Find Team
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => onRegister(event)}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all">
            Register Now →
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all ${i <= current ? 'bg-purple-600 flex-1' : 'bg-gray-200 w-4'}`} />
      ))}
    </div>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────
function FieldRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-gray-400" />{label}
      </label>
      {children}
    </div>
  )
}
const inputCls = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"

// ─── Registration Modal ───────────────────────────────────────────────────────
function RegistrationModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)

  const isCollege = event.title?.startsWith('[COLLEGE]') || event.is_college_event

  const [form, setForm] = useState({
    full_name: '', phone: '', college_name: '', college_id: '',
    team_name: '', transaction_id: '',
  })
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [collegeProofFile, setCollegeProofFile] = useState<File | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Steps: 0 = Personal, 1 = College Details, 2 = Payment (if paid), 3 = Review
  const steps = isCollege
    ? (event.is_paid ? ['Personal Info', 'College Details', 'Payment', 'Confirm'] : ['Personal Info', 'College Details', 'Confirm'])
    : (event.is_paid ? ['Personal Info', 'Payment', 'Confirm'] : ['Personal Info', 'Confirm'])

  function sendOTP() {
    if (!form.phone || form.phone.length < 10) { setError('Enter a valid 10-digit phone number'); return }
    setError('')
    setOtpSent(true)
    // Simulate OTP sent
  }
  function verifyOTP() {
    if (otpValue === '1234') { setOtpVerified(true); setError('') }
    else setError('Invalid OTP. (Hint: use 1234 for demo)')
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    let finalPaymentUrl = null
    let finalCollegeProofUrl = null
    const supabase = createClient()

    try {
      if (event.is_paid && paymentFile) {
        const ext = paymentFile.name.split('.').pop()
        const { data, error: upErr } = await supabase.storage.from('payment_proofs').upload(`${event.id}_pay_${Date.now()}.${ext}`, paymentFile)
        if (upErr) throw new Error('Payment upload failed: ' + upErr.message)
        const { data: pub } = supabase.storage.from('payment_proofs').getPublicUrl(data.path)
        finalPaymentUrl = pub.publicUrl
      }
      if (isCollege && collegeProofFile) {
        const ext2 = collegeProofFile.name.split('.').pop()
        const { data: cData, error: cErr } = await supabase.storage.from('payment_proofs').upload(`${event.id}_college_${Date.now()}.${ext2}`, collegeProofFile)
        if (cErr) throw new Error('College proof upload failed: ' + cErr.message)
        const { data: cPub } = supabase.storage.from('payment_proofs').getPublicUrl(cData.path)
        finalCollegeProofUrl = cPub.publicUrl
      }

      const fd = new FormData()
      fd.append('event_id', event.id)
      fd.append('full_name', form.full_name)
      fd.append('phone', form.phone)
      if (form.college_name) fd.append('college_name', form.college_name)
      if (form.college_id) fd.append('college_id', form.college_id)
      if (form.team_name) fd.append('team_name', form.team_name)
      if (form.transaction_id) fd.append('transaction_id', form.transaction_id)
      if (finalPaymentUrl) fd.append('screenshot_url', finalPaymentUrl)
      if (finalCollegeProofUrl) fd.append('college_proof_url', finalCollegeProofUrl)

      const res = await registerForEvent(undefined, fd)
      if (res.error) throw new Error(res.error)
      setSuccess(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const displayTitle = event.title?.replace('[COLLEGE] ', '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-200 text-xs font-medium mb-1">{isCollege ? '🎓 College Event Registration' : '📋 Event Registration'}</p>
              <h2 className="text-white font-bold text-base line-clamp-2">{displayTitle}</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="mt-4">
            <StepIndicator current={step} total={steps.length} />
            <p className="text-purple-200 text-xs mt-1.5">Step {step + 1} of {steps.length}: <span className="font-semibold text-white">{steps[step]}</span></p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {success ? (
            <div className="py-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Registration Submitted!</h3>
              <p className="text-sm text-gray-400">
                {event.is_paid ? 'Awaiting payment verification from the organizer.' : "You're confirmed! Check My Tickets."}
              </p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {/* STEP 0 — Personal Info */}
                {step === 0 && (
                  <>
                    <FieldRow icon={User} label="Full Name *">
                      <input required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                        className={inputCls} placeholder="Enter your full name" />
                    </FieldRow>
                    <FieldRow icon={Phone} label="Phone Number *">
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 shrink-0">+91</div>
                        <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className={inputCls} placeholder="10-digit mobile number" maxLength={10} />
                      </div>
                    </FieldRow>
                    {/* OTP Verification */}
                    {!otpVerified ? (
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        {!otpSent ? (
                          <button type="button" onClick={sendOTP}
                            className="w-full py-2 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            📱 Send OTP for Verification
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-purple-600 font-medium">OTP sent to +91 {form.phone}</p>
                            <div className="flex gap-2">
                              <input value={otpValue} onChange={e => setOtpValue(e.target.value)} maxLength={6}
                                className="flex-1 rounded-xl border border-purple-200 px-3 py-2 text-sm text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                                placeholder="Enter OTP" />
                              <button type="button" onClick={verifyOTP}
                                className="px-3 py-2 bg-purple-600 text-white text-xs rounded-xl font-semibold hover:bg-purple-700">
                                Verify
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-400">Demo: use OTP 1234</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Phone Verified ✓</span>
                      </div>
                    )}
                    {form.team_name !== undefined && (
                      <FieldRow icon={Users} label="Team Name (Optional)">
                        <input value={form.team_name} onChange={e => set('team_name', e.target.value)}
                          className={inputCls} placeholder="e.g. Team Phoenix" />
                      </FieldRow>
                    )}
                  </>
                )}

                {/* STEP 1 (college) — College Details */}
                {isCollege && step === 1 && (
                  <>
                    <FieldRow icon={Building2} label="College / University Name *">
                      <input required value={form.college_name} onChange={e => set('college_name', e.target.value)}
                        className={inputCls} placeholder="e.g. MIT Pune" />
                    </FieldRow>
                    <FieldRow icon={Hash} label="College ID / Enrollment Number *">
                      <input required value={form.college_id} onChange={e => set('college_id', e.target.value)}
                        className={inputCls} placeholder="e.g. 22CS1234" />
                    </FieldRow>
                    <FieldRow icon={Upload} label="College ID Card / Proof *">
                      <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <Upload className="h-5 w-5 text-purple-400" />
                        <span className="text-xs text-gray-500 text-center">
                          {collegeProofFile ? `✅ ${collegeProofFile.name}` : 'Upload your college ID card or bonafide certificate'}
                        </span>
                        <input type="file" accept="image/*,.pdf" className="hidden"
                          onChange={e => setCollegeProofFile(e.target.files?.[0] || null)} />
                      </label>
                    </FieldRow>
                  </>
                )}

                {/* Payment Step */}
                {event.is_paid && step === (isCollege ? 2 : 1) && (
                  <>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-700 mb-0.5">💳 Pay ₹{event.fee_amount} to:</p>
                      <div className="font-mono text-center text-sm font-bold text-gray-900 bg-white border border-purple-100 rounded-lg px-3 py-2 my-2">
                        {event.upi_id || 'eventflex@upi'}
                      </div>
                      <p className="text-[11px] text-gray-400">After payment, enter transaction details below.</p>
                    </div>
                    <FieldRow icon={CreditCard} label="Transaction / UTR ID *">
                      <input required value={form.transaction_id} onChange={e => set('transaction_id', e.target.value)}
                        className={inputCls} placeholder="e.g. 3274829140501" />
                    </FieldRow>
                    <FieldRow icon={Upload} label="Payment Screenshot *">
                      <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <Upload className="h-5 w-5 text-blue-400" />
                        <span className="text-xs text-gray-500 text-center">
                          {paymentFile ? `✅ ${paymentFile.name}` : 'Upload your UPI payment screenshot'}
                        </span>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => setPaymentFile(e.target.files?.[0] || null)} />
                      </label>
                    </FieldRow>
                  </>
                )}

                {/* Confirm Step */}
                {step === steps.length - 1 && !success && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-800">Review Your Details</h3>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs">
                      {[
                        ['Name', form.full_name],
                        ['Phone', `+91 ${form.phone}`],
                        form.college_name && ['College', form.college_name],
                        form.college_id && ['College ID', form.college_id],
                        form.team_name && ['Team', form.team_name],
                        form.transaction_id && ['UTR ID', form.transaction_id],
                        paymentFile && ['Payment Proof', '✅ Attached'],
                        collegeProofFile && ['College Proof', '✅ Attached'],
                      ].filter(Boolean).map(([label, val]: any) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-gray-800 font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                    {event.is_paid && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                        ⚠️ Your registration will be pending until the organizer verifies your payment.
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer Buttons */}
        {!success && (
          <div className="px-5 pb-5 flex gap-2 border-t border-gray-100 pt-4">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 0) {
                    if (!form.full_name) { setError('Please enter your full name'); return }
                    if (!form.phone || form.phone.length < 10) { setError('Please enter a valid phone number'); return }
                  }
                  setError('')
                  setStep(s => s + 1)
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🎫'}
                {loading ? 'Submitting...' : 'Confirm Registration'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Digital Pass Modal (3D Tilt) ──────────────────────────────────────────────
function TicketModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [15, -15])
  const rotateY = useTransform(x, [-100, 100], [-15, 15])

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }
  function resetMouse() { x.set(0); y.set(0) }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 perspective-1000">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouse} onMouseLeave={resetMouse}
        className="relative z-10 w-full max-w-sm rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl"
      >
        <div className="absolute top-4 right-4 z-20">
          <button onClick={onClose} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-full backdrop-blur-md transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Inner Ticket */}
        <div className="bg-[#1a1a2e] bg-opacity-95 backdrop-blur-xl rounded-[1.8rem] overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-6 text-center border-b border-white/10 relative overflow-hidden" style={{ transform: 'translateZ(30px)' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <p className="text-purple-300 text-xs font-bold tracking-[0.2em] uppercase mb-1">VIP Access Pass</p>
            <h2 className="text-2xl font-black text-white px-4 leading-tight">{event.title.replace('[COLLEGE] ', '')}</h2>
          </div>

          {/* Holographic Line */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 relative top-1/2" />

          {/* Details */}
          <div className="p-6 flex-1 flex flex-col justify-center gap-4 text-white" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
              <span className="text-gray-400">Date</span>
              <span className="font-bold">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
              <span className="text-gray-400">Pass Type</span>
              <span className="font-bold text-emerald-400">All-Access / Confirmed</span>
            </div>
            
            {/* Fake QR */}
            <div className="mx-auto mt-4 bg-white p-2 rounded-xl z-20" style={{ transform: 'translateZ(40px)' }}>
              <QrCode className="w-32 h-32 text-gray-900" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Team Finder Modal (AI Simulation) ────────────────────────────────────────
function TeamFinderModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    let t: any;
    if (loading) {
      t = setTimeout(() => {
        setLoading(false); setComplete(true)
      }, 3000)
    }
    return () => clearTimeout(t)
  }, [loading])

  const dummies = [
    { name: 'Sarah Chen', role: 'Fullstack Dev', match: '98%', img: '👩‍💻' },
    { name: 'Alex Patel', role: 'UI/UX Designer', match: '95%', img: '🎨' },
    { name: 'Jamie Lee', role: 'Backend/AI', match: '91%', img: '🤖' }
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 p-6 text-center relative overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Find Your Dream Team</h2>
          <p className="text-white/80 text-xs mt-1 px-4">Our AI will scan other solo hackers registered for {event.title.replace('[COLLEGE] ', '')} and find perfect skill matches.</p>
        </div>

        <div className="p-6">
          {!loading && !complete ? (
            <div className="text-center py-8">
              <button onClick={() => setLoading(true)} className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-fuchsia-500/25 transition-all hover:scale-[1.02]">
                ✨ Scan for Teammates
              </button>
            </div>
          ) : loading ? (
            <div className="py-12 flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-fuchsia-500 animate-spin mb-4" />
              <p className="font-bold text-gray-800 animate-pulse">Analyzing tech stacks...</p>
              <p className="text-xs text-gray-400 mt-2">Finding complementary skills for your profile.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Optimal Matches Found
              </h3>
              {dummies.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-fuchsia-100 bg-fuchsia-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">{m.img}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                      <p className="text-xs text-fuchsia-600 font-semibold">{m.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">{m.match} Match</span>
                    <button className="block mt-2 text-xs font-bold text-blue-600 hover:text-blue-800">Invite +</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main EventList ───────────────────────────────────────────────────────────
export function EventList({ events, registrations }: { events: Event[]; registrations: RegistrationsMap }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [ticketEvent, setTicketEvent] = useState<Event | null>(null)
  const [teamEvent, setTeamEvent] = useState<Event | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'paid' | 'college'>('all')

  const filtered = useMemo(() => {
    return events.filter(e => {
      const isCollege = e.title?.startsWith('[COLLEGE]') || e.is_college_event
      const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all'
        || (filter === 'free' && !e.is_paid)
        || (filter === 'paid' && e.is_paid)
        || (filter === 'college' && isCollege)
      return matchesSearch && matchesFilter
    })
  }, [events, search, filter])

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events, hackathons, workshops..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 shadow-sm">
          <SlidersHorizontal className="h-4 w-4 text-gray-400 mx-1" />
          {([['all', 'All'], ['college', '🎓 College'], ['free', 'Free'], ['paid', 'Paid']] as const).map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 font-medium mb-5 uppercase tracking-wider">
        {filtered.length} {filtered.length === 1 ? 'Opportunity' : 'Opportunities'} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No events found</h3>
          <p className="text-sm text-gray-400">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} registration={registrations[event.id]} idx={i} onRegister={setSelectedEvent} onViewTicket={setTicketEvent} onFindTeam={setTeamEvent} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
        {ticketEvent && (
          <TicketModal event={ticketEvent} onClose={() => setTicketEvent(null)} />
        )}
        {teamEvent && (
          <TeamFinderModal event={teamEvent} onClose={() => setTeamEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

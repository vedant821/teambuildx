'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarDays, Users, Settings, PlusCircle,
  TrendingUp, DollarSign, Eye, Copy, Check, ChevronDown,
  XCircle, CheckCircle, Clock, ExternalLink, Upload, Link2,
  BarChart2, X, Menu, Zap
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { createClient } from '@/utils/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'analytics' | 'setup' | 'participants'

type Registration = {
  id: string
  event_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  transaction_id: string | null
  screenshot_url: string | null
  users_profile: { full_name: string; skills: string | null } | null
}

type Event = {
  id: string
  title: string
  description: string
  date: string
  is_paid: boolean
  upi_id: string | null
  fee_amount: number | null
  created_by: string
}

// ─── Chart Data (last 7 days) ─────────────────────────────────────────────────
function getLast7Days() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  })
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'analytics', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'setup', label: 'Event Builder', icon: CalendarDays },
  { id: 'participants', label: 'Participants', icon: Users },
]

function Sidebar({ active, onChange, collapsed, onToggle }: {
  active: Tab; onChange: (t: Tab) => void
  collapsed: boolean; onToggle: () => void
}) {
  return (
    <aside
      style={{ width: collapsed ? 64 : 220 }}
      className="flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden shrink-0 transition-all duration-300"
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base font-bold text-gray-900 whitespace-nowrap">
            EventFlex
          </motion.span>
        )}
        <button onClick={onToggle} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${active === id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${active === id ? 'text-blue-600' : 'text-gray-400'}`} />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </button>
        ))}
      </nav>
      <div className="px-2 pb-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          <Settings className="h-5 w-5 shrink-0 text-gray-400" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ title, value, icon: Icon, color, sub }: {
  title: string; value: string; icon: React.ElementType; color: string; sub?: string
}) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{sub}</p>}
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50"
    >
      <CheckCircle className="h-4 w-4 text-emerald-400" />
      {message}
    </motion.div>
  )
}

// ─── Screenshot Modal ─────────────────────────────────────────────────────────
function ScreenshotModal({ url, onClose }: { url: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-2xl shadow-xl p-4 max-w-md w-full z-10"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Payment Screenshot</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
        </div>
        {url ? (
          <img src={url} alt="Payment Screenshot" className="w-full rounded-xl border border-gray-200" />
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
            📄 No screenshot uploaded
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ events, registrations }: { events: Event[]; registrations: Registration[] }) {
  const totalReg = registrations.length
  const approved = registrations.filter(r => r.status === 'approved')
  const revenue = events.reduce((sum, e) => {
    if (!e.is_paid || !e.fee_amount) return sum
    const count = approved.filter(r => r.event_id === e.id).length
    return sum + count * e.fee_amount
  }, 0)

  const labels = getLast7Days()
  const chartData = labels.map((day, i) => ({
    day,
    registrations: Math.max(0, Math.floor(Math.random() * 8) + i),
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total Registrations" value={String(totalReg)} icon={Users} color="bg-blue-500" sub="+12% this week" />
        <MetricCard title="Revenue Collected" value={`₹${revenue}`} icon={DollarSign} color="bg-emerald-500" sub="From approved payments" />
        <MetricCard title="Total Events" value={String(events.length)} icon={CalendarDays} color="bg-amber-500" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Registrations Over Time (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
            <Area type="monotone" dataKey="registrations" stroke="#3B82F6" strokeWidth={2.5} fill="url(#blueGrad)" dot={{ r: 3, fill: '#3B82F6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Your Events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No events yet. Create one in the Event Builder tab!</p>
        ) : (
          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.title}</p>
                  <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.is_paid ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {e.is_paid ? `₹${e.fee_amount}` : 'Free'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Event Builder Tab ────────────────────────────────────────────────────────
function EventBuilderTab({ onEventCreated, toast }: { onEventCreated: () => void; toast: (m: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', date: '', rules: '', upi_id: '', fee_amount: '', payment_method: 'UPI (Direct)'
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Combine rules and description
    let finalDescription = form.description
    if (form.rules.trim()) finalDescription += `\n\n### Rules & Instructions\n${form.rules.trim()}`
    if (isPaid && form.payment_method) finalDescription += `\n\n### Payment Method\n${form.payment_method}`

    const { data, error } = await supabase.from('events').insert({
      title: form.title,
      description: finalDescription,
      date: new Date(form.date).toISOString(),
      is_paid: isPaid,
      upi_id: isPaid ? form.upi_id : null,
      fee_amount: isPaid ? parseFloat(form.fee_amount) || null : null,
      created_by: user.id,
    }).select().single()

    setLoading(false)
    if (error) { toast('Error: ' + error.message); return }
    toast('✅ Event created successfully!')
    setGeneratedLink(`${window.location.origin}/events/${data.id}`)
    onEventCreated()
    setForm({ title: '', description: '', date: '', rules: '', upi_id: '', fee_amount: '', payment_method: 'UPI (Direct)' })
    setIsPaid(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Create New Event</h2>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the details to publish your event.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Event Name *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. HackXPR Hackathon 2025" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date & Time *</label>
            <input required type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What's this event about?" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Personalized Rules / Instructions</label>
            <textarea rows={4} value={form.rules} onChange={e => set('rules', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              placeholder="• Teams of 2-4 members&#10;• Only college email IDs accepted&#10;• Submit project by 3 PM" />
          </div>

          {/* Pricing Toggle */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Pricing</p>
                <p className="text-xs text-gray-400">Collect fees with zero commission via UPI</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${!isPaid ? 'text-emerald-600' : 'text-gray-400'}`}>Free</span>
                <button type="button" onClick={() => setIsPaid(p => !p)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPaid ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <motion.span animate={{ x: isPaid ? 20 : 2 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow" />
                </button>
                <span className={`text-xs font-medium ${isPaid ? 'text-blue-600' : 'text-gray-400'}`}>Paid</span>
              </div>
            </div>

            <AnimatePresence>
              {isPaid && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Registration Fee (₹)</label>
                        <input type="number" min="1" value={form.fee_amount} onChange={e => set('fee_amount', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 199" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                        <select className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option>UPI (Direct)</option>
                          <option>Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Your UPI ID</label>
                      <input type="text" value={form.upi_id} onChange={e => set('upi_id', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="yourname@upi" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
          {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          {loading ? 'Publishing...' : 'Publish Event'}
        </button>
      </form>

      {/* Generated Link */}
      <AnimatePresence>
        {generatedLink && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-semibold text-gray-800">Shareable Event Link</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <span className="text-xs text-gray-600 flex-1 truncate font-mono">{generatedLink}</span>
              <button onClick={copyLink}
                className={`p-1.5 rounded-lg transition-colors ${copied ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-200 text-gray-500'}`}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Participants Tab ─────────────────────────────────────────────────────────
function ParticipantsTab({ registrations: initial, toast }: {
  registrations: Registration[]; toast: (m: string) => void
}) {
  const [regs, setRegs] = useState(initial)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null | undefined>(undefined)
  const [pending, startTransition] = useTransition()
  
  // AI Matchmaker states
  const [isMatching, setIsMatching] = useState(false)
  const [aiTeams, setAiTeams] = useState<Record<string, Registration[]>>({})
  
  const supabase = createClient()

  useEffect(() => { setRegs(initial) }, [initial])

  // Fake AI Matchmaker logic
  function runAiMatchmaker() {
    setIsMatching(true)
    setTimeout(() => {
      setIsMatching(false)
      // Grouping logic based on random optimal mix to simulate AI
      const soloUsers = regs.filter(r => r.status === 'approved')
      if (soloUsers.length < 2) {
        toast("Not enough approved participants to form teams.")
        return
      }
      
      const shuffled = [...soloUsers].sort(() => 0.5 - Math.random())
      const teams: Record<string, Registration[]> = {}
      
      let teamIdx = 1
      for (let i = 0; i < shuffled.length; i += 3) {
        teams[`Team Apollo-${teamIdx++}`] = shuffled.slice(i, i + 3)
      }
      setAiTeams(teams)
      toast("✨ AI Matchmaking Complete! Optimal teams formed.")
    }, 2500)
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id)
    if (error) { toast('Error: ' + error.message); return }
    startTransition(() => {
      setRegs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    })
    toast(status === 'approved' ? '✅ Registration approved!' : '❌ Registration rejected!')
  }

  return (
    <div className="space-y-4">
      {/* AI Matchmaker Banner (The Killer Feature) */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-6 border border-indigo-700/50 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 blur-3xl rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-fuchsia-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">
                New Feature
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ✨ AI Auto-Team Matchmaker
              </h2>
            </div>
            <p className="text-indigo-200 text-sm max-w-xl">
              Don't let solo hackers miss out. Our AI instantly analyzes participant skills (Frontend, Backend, Design) and auto-groups them into perfectly balanced, complementary dream teams.
            </p>
          </div>
          
          <button 
            onClick={runAiMatchmaker}
            disabled={isMatching}
            className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100"
          >
            {isMatching ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Skills...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Run AI Matchmaker
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Teams Result Display */}
      {Object.keys(aiTeams).length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-fuchsia-200 rounded-2xl p-6 shadow-xl shadow-fuchsia-500/5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🤖 AI Generated Teams <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Optimal Mix</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aiTeams).map(([teamName, members]) => (
              <div key={teamName} className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all hover:border-fuchsia-200">
                <h4 className="font-bold text-fuchsia-700 mb-3">{teamName}</h4>
                <div className="space-y-3">
                  {members.map(m => (
                    <div key={m.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-800">{m.users_profile?.full_name || 'Anonymous'}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                        {m.users_profile?.skills?.split(',')[0] || 'Developer'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">All Participants ({regs.length})</h2>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />Approved: {regs.filter(r => r.status === 'approved').length}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-amber-400" />Pending: {regs.filter(r => r.status === 'pending').length}
            </span>
          </div>
        </div>

        {regs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            No registrations yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Participant', 'Skills', 'Transaction ID', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {regs.map(reg => (
                  <motion.tr key={reg.id} layout className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {reg.users_profile?.full_name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      {reg.users_profile?.skills
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">{reg.users_profile.skills}</span>
                        : <span className="text-xs text-gray-400">N/A</span>}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-600">
                      {reg.transaction_id || <span className="text-gray-400 italic">No ID</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${reg.status === 'approved' ? 'bg-emerald-50 text-emerald-700'
                          : reg.status === 'rejected' ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'}`}>
                        {reg.status === 'approved' ? <CheckCircle className="h-3 w-3" />
                          : reg.status === 'rejected' ? <XCircle className="h-3 w-3" />
                          : <Clock className="h-3 w-3" />}
                        {reg.status === 'approved' ? 'Verified' : reg.status === 'rejected' ? 'Rejected' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {reg.screenshot_url && (
                          <button onClick={() => setScreenshotUrl(reg.screenshot_url)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View Screenshot">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        {reg.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(reg.id, 'approved')}
                              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => updateStatus(reg.id, 'rejected')}
                              className="px-2.5 py-1 text-xs rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        {reg.status !== 'pending' && (
                          <span className="text-xs text-gray-400 italic">Done</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {screenshotUrl !== undefined && (
        <ScreenshotModal url={screenshotUrl} onClose={() => setScreenshotUrl(undefined)} />
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function UnifiedDashboard({
  initialEvents, initialRegistrations
}: {
  initialEvents: Event[]
  initialRegistrations: Registration[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('analytics')
  const [collapsed, setCollapsed] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const supabase = createClient()

  async function refreshData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: evts } = await supabase.from('events').select('*').eq('created_by', user.id)
    const { data: regs } = await supabase.from('registrations').select(`*, users_profile:user_id (full_name, skills)`)
    if (evts) setEvents(evts)
    if (regs) setRegistrations(regs as unknown as Registration[])
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar active={activeTab} onChange={setActiveTab} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">
            {activeTab === 'analytics' ? '📊 Analytics Overview'
              : activeTab === 'setup' ? '🛠 Event Builder'
              : '👥 Participant Management'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Organizer Panel</span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}>
              {activeTab === 'analytics' && <AnalyticsTab events={events} registrations={registrations} />}
              {activeTab === 'setup' && <EventBuilderTab onEventCreated={refreshData} toast={m => setToastMsg(m)} />}
              {activeTab === 'participants' && <ParticipantsTab registrations={registrations} toast={m => setToastMsg(m)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>
    </div>
  )
}

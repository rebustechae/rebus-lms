'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, X, Mail, Loader2, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WhitelistManager({ 
  courseId, 
  initialWhitelist, 
  isPrivate 
}: { 
  courseId: string, 
  initialWhitelist: any[], 
  isPrivate: boolean 
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    const { error } = await supabase
      .from('course_access')
      .insert([{ course_id: courseId, user_email: email.toLowerCase() }])

    if (error) {
      alert("Registry Error: User could not be added to the whitelist.")
    } else {
      setEmail('')
      router.refresh()
    }
    setLoading(false)
  }

  const removeEmail = async (id: string) => {
    const { error } = await supabase
      .from('course_access')
      .delete()
      .eq('id', id)

    if (!error) router.refresh()
  }

  return (
    <div className={`space-y-6 transition-all duration-300 ${!isPrivate ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
      
      {/* INPUT SECTION */}
      <form onSubmit={addEmail} className="flex gap-3">
        <div className="relative flex-1 group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00ADEF] transition-colors" size={16} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter personnel email address..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-11 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all"
          />
        </div>
        <button 
          type="submit"
          disabled={loading || !email}
          className="bg-slate-900 text-white px-6 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center gap-2 shrink-0 shadow-sm"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          Grant Access
        </button>
      </form>

      {/* WHITELIST ENTRIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Personnel</span>
            <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">{initialWhitelist.length} Units</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {initialWhitelist.length === 0 ? (
            <div className="w-full p-8 border border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-xs font-medium text-slate-400">Registry is currently empty.</p>
            </div>
          ) : (
            initialWhitelist.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 bg-white border border-slate-200 pl-3 pr-2 py-1.5 rounded-lg shadow-sm hover:border-[#00ADEF]/30 transition-colors group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700">{item.user_email}</span>
                <button 
                  onClick={() => removeEmail(item.id)}
                  className="p-1 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Revoke Access"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* STATUS OVERRIDE NOTICE */}
      {!isPrivate && (
        <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-lg border border-slate-200">
          <ShieldCheck size={14} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
            System Note: Whitelist is inactive. Course visibility is set to <span className="text-[#00ADEF]">Public</span>.
          </p>
        </div>
      )}
    </div>
  )
}
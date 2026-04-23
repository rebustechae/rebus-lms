'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, X, Mail } from 'lucide-react'
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

    if (!error) {
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
    <div className={`space-y-4 transition-opacity ${!isPrivate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
      <form onSubmit={addEmail} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@rebus.ae"
            className="w-full border-2 border-black p-3 pl-10 font-bold text-xs outline-none focus:bg-zinc-50"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 font-black text-[10px] uppercase hover:bg-zinc-800 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          {loading ? 'Adding...' : 'Grant Access'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {initialWhitelist.length === 0 && (
          <p className="text-[10px] font-bold text-zinc-400 italic uppercase">No users whitelisted yet.</p>
        )}
        {initialWhitelist.map((item) => (
          <div key={item.id} className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-tight">{item.user_email}</span>
            <button 
              onClick={() => removeEmail(item.id)}
              className="text-red-600 hover:scale-125 transition-transform"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {!isPrivate && (
        <p className="text-[10px] font-black text-red-600 uppercase">
          Note: This list is ignored while Course is in Public Mode.
        </p>
      )}
    </div>
  )
}
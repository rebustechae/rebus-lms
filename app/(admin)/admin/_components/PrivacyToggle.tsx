'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Lock, Unlock, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyToggle({ courseId, isPrivate }: { courseId: string, isPrivate: boolean }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const togglePrivacy = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('courses')
      .update({ is_private: !isPrivate })
      .eq('id', courseId)

    if (error) {
      alert("Security Update Failed: Unable to modify access protocols.")
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={togglePrivacy}
        disabled={loading}
        className={`w-full group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
          isPrivate 
            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' 
            : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border transition-colors ${
            isPrivate 
              ? 'bg-white border-amber-200 text-amber-600' 
              : 'bg-white border-emerald-200 text-emerald-600'
          }`}>
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isPrivate ? (
              <Lock size={18} />
            ) : (
              <Unlock size={18} />
            )}
          </div>
          <div className="text-left">
            <p className={`text-xs font-bold uppercase tracking-wider ${
              isPrivate ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {isPrivate ? 'Restricted Access' : 'Internal Public'}
            </p>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5">
              {isPrivate ? 'Only whitelisted users can view' : 'Visible to all registered personnel'}
            </p>
          </div>
        </div>

        {/* Status indicator pill */}
        <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border ${
          isPrivate 
            ? 'bg-amber-100 border-amber-200 text-amber-700' 
            : 'bg-emerald-100 border-emerald-200 text-emerald-700'
        }`}>
          {isPrivate ? 'Private' : 'Open'}
        </div>
      </button>

      {/* Security Context Note */}
      <div className="flex items-start gap-2 px-1">
        {isPrivate ? (
          <ShieldAlert size={12} className="text-amber-500 mt-0.5" />
        ) : (
          <ShieldCheck size={12} className="text-emerald-500 mt-0.5" />
        )}
        <p className="text-[10px] text-slate-400 font-medium italic leading-tight">
          Personnel requires manual whitelisting in private mode.
        </p>
      </div>
    </div>
  )
}
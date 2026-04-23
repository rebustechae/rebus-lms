'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Lock, Unlock, Loader2 } from 'lucide-react'
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

    if (!error) router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={togglePrivacy}
      disabled={loading}
      className={`w-full p-4 border-2 border-black font-black uppercase text-xs flex items-center justify-center gap-3 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
        isPrivate ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : isPrivate ? (
        <><Lock size={18} /> Private Mode</>
      ) : (
        <><Unlock size={18} /> Public Mode</>
      )}
    </button>
  )
}
'use client'

import { useState, use } from 'react' // 1. Added use here
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'

// 2. Update the type to reflect that params is a Promise
export default function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // 3. Unwrap the params here
  const resolvedParams = use(params)
  const courseId = resolvedParams.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const { error } = await supabase.from('lessons').insert({
      course_id: courseId, // Use the unwrapped ID
      title: formData.get('title'),
      content: formData.get('content'),
      order_index: parseInt(formData.get('order') as string) || 0,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold hover:underline">
        <ArrowLeft size={14} /> DISCARD AND RETURN
      </button>

      {/* ... the rest of your form remains exactly the same ... */}
      <form onSubmit={handleSubmit} className="space-y-6 border-2 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Lesson Metadata</label>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <input name="title" required placeholder="LESSON TITLE" className="w-full border-2 border-black p-3 font-bold focus:bg-zinc-50 outline-none" />
            </div>
            <div>
              <input name="order" type="number" placeholder="ORDER (e.g. 1)" className="w-full border-2 border-black p-3 font-bold focus:bg-zinc-50 outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Lesson Body (Text/Content)</label>
          <textarea 
            name="content" 
            required 
            rows={15} 
            className="w-full border-2 border-black p-4 font-mono text-sm focus:bg-zinc-50 outline-none resize-none"
            placeholder="Paste or type your lesson content here..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white p-4 font-black uppercase tracking-widest hover:invert transition-all flex justify-center items-center gap-2"
        >
          <Save size={18} /> {loading ? 'SAVING...' : 'COMMIT LESSON TO REGISTRY'}
        </button>
      </form>
    </div>
  )
}
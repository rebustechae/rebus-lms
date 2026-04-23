'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import QuizManager from "@/app/(admin)/admin/_components/QuizManager"

export default function EditLessonPage({ params: paramsPromise }: { params: Promise<{ id: string, lessonId: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lesson, setLesson] = useState({ title: '', content: '', order_index: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchLesson() {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', params.lessonId)
        .single()
      
      if (data) setLesson(data)
      setLoading(false)
    }
    fetchLesson()
  }, [params.lessonId])

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('lessons')
      .update({
        title: lesson.title,
        content: lesson.content,
        order_index: lesson.order_index,
      })
      .eq('id', params.lessonId)

    if (error) {
      alert(error.message)
      setSaving(false)
    } else {
      router.push(`/admin/courses/${params.id}`)
      router.refresh()
    }
  }

  if (loading) return <div className="p-10 font-black animate-pulse">LOADING_DATA...</div>

  return (
    <div className="max-w-3xl space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold hover:underline">
        <ArrowLeft size={14} /> CANCEL_EDIT
      </button>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Lesson Title</label>
          <input 
            value={lesson.title}
            onChange={(e) => setLesson({...lesson, title: e.target.value})}
            className="w-full border-2 border-black p-4 font-bold text-xl uppercase outline-none focus:bg-zinc-50"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Index</label>
            <input 
              type="number"
              value={lesson.order_index}
              onChange={(e) => setLesson({...lesson, order_index: parseInt(e.target.value)})}
              className="w-full border-2 border-black p-4 font-mono outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Content (Markdown Supported)</label>
          <textarea 
            value={lesson.content}
            onChange={(e) => setLesson({...lesson, content: e.target.value})}
            rows={15}
            className="w-full border-2 border-black p-4 font-mono text-sm outline-none resize-none focus:bg-zinc-50"
            required
          />
        </div>

        <button 
          disabled={saving}
          className="w-full bg-black text-white p-6 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:invert transition-all disabled:opacity-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Update Lesson Entry
        </button>
      </form>
      <QuizManager lessonId={params.lessonId} />
    </div>
  )
}
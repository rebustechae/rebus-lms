'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, Save, Loader2, FileText, Hash, Layout } from 'lucide-react'
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
      alert(`System Error: ${error.message}`)
      setSaving(false)
    } else {
      router.push(`/admin/courses/${params.id}`)
      router.refresh()
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto p-20 flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Retrieving Secure Records...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
      {/* NAVIGATION */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Cancel Changes
      </button>

      {/* HEADER */}
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2 rounded-lg text-white">
                <FileText size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Content Editor</span>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Edit Module Entry</h2>
        <p className="text-slate-500 mt-1 font-medium italic">Modify lesson parameters and instructional content.</p>
      </header>

      {/* MAIN EDITOR FORM */}
      <form onSubmit={handleUpdate} className="space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        
        {/* TOP METADATA ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                    <Layout size={14} className="text-[#00ADEF]" /> Lesson Title
                </label>
                <input 
                    value={lesson.title}
                    onChange={(e) => setLesson({...lesson, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all"
                    required
                    placeholder="ENTER TITLE"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                    <Hash size={14} className="text-[#00ADEF]" /> Sequence
                </label>
                <input 
                    type="number"
                    value={lesson.order_index}
                    onChange={(e) => setLesson({...lesson, order_index: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all"
                    required
                />
            </div>
        </div>

        {/* CONTENT BOX */}
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
            <FileText size={14} className="text-[#00ADEF]" /> Instructional Content (Markdown)
          </label>
          <textarea 
            value={lesson.content}
            onChange={(e) => setLesson({...lesson, content: e.target.value})}
            rows={15}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono text-sm leading-relaxed text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all resize-none shadow-inner"
            required
          />
        </div>

        <button 
          disabled={saving}
          className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-3 shadow-lg shadow-slate-200 group"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Synchronizing...' : 'Update Module Entry'}
        </button>
      </form>
    </div>
  )
}
'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, Save, Loader2, Hash, FileText } from 'lucide-react'

export default function NewModulePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const resolvedParams = use(params)
  const courseId = resolvedParams.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.from('modules').insert({
      course_id: courseId,
      title: formData.get('title'),
      description: formData.get('description'),
      order_index: parseInt(formData.get('order') as string) || 0,
    })

    if (error) {
      alert(`Error creating module: ${error.message}`)
      setLoading(false)
    } else {
      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* NAVIGATION */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Discard and Return
      </button>

      {/* HEADER */}
      <header className="border-b border-slate-200 pb-6">
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">New Module</h2>
        <p className="text-slate-500 mt-1 font-medium italic">Create a new module for course ID: {courseId.split('-')[0]}</p>
      </header>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        
        {/* METADATA SECTION */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Hash size={14} className="text-[#00ADEF]" /> Module Metadata
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 group">
              <input 
                name="title" 
                required 
                placeholder="MODULE TITLE (e.g., Safety Fundamentals)" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all" 
              />
            </div>
            <div className="group">
              <input 
                name="order" 
                type="number" 
                required
                placeholder="MODULE #" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all" 
              />
            </div>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <FileText size={14} className="text-[#00ADEF]" /> Module Description
          </label>
          <div className="relative group">
            <textarea
                name="description"
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono text-sm leading-relaxed text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all resize-none shadow-inner"
                placeholder="Brief description of what this module covers (optional)..."
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex justify-center items-center gap-3 shadow-lg shadow-slate-200 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} /> 
              Create Module
            </>
          )}
        </button>
      </form>
    </div>
  )
}

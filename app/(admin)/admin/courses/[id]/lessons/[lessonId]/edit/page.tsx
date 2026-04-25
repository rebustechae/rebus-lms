'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, Save, Loader2, FileText, Hash, Layout, Video, Upload, X } from 'lucide-react'
import { uploadVideoFile } from '@/utils/supabase/storage'
import QuizManager from "@/app/(admin)/admin/_components/QuizManager"

export default function EditLessonPage({ params: paramsPromise }: { params: Promise<{ id: string, lessonId: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lesson, setLesson] = useState({ title: '', content: '', order_index: 0, video_url: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
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
        video_url: lesson.video_url,
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

  async function handleVideoUpload(file: File) {
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB

    if (file.size > MAX_SIZE) {
      setUploadProgress(`File too large. Maximum size is 100MB (your file: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      setTimeout(() => setUploadProgress(''), 4000);
      return;
    }

    setUploading(true)
    setUploadProgress('Uploading...')

    const publicUrl = await uploadVideoFile(file, params.id, params.lessonId)

    if (publicUrl) {
      setLesson({ ...lesson, video_url: publicUrl })
      setUploadProgress('Upload successful!')
      setSelectedFile(null)
      setTimeout(() => setUploadProgress(''), 2000)
    } else {
      setUploadProgress('Upload failed. Please try again.')
      setTimeout(() => setUploadProgress(''), 3000)
    }

    setUploading(false)
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

        {/* VIDEO UPLOAD */}
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
            <Video size={14} className="text-[#00ADEF]" /> Upload Video File
          </label>

          {lesson.video_url ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-700 font-medium">✓ Video uploaded</div>
                <button
                  type="button"
                  onClick={() => setLesson({ ...lesson, video_url: '' })}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="text-xs text-green-600 break-all font-mono">{lesson.video_url}</div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-[#00ADEF] hover:bg-blue-50/30 transition-all cursor-pointer relative"
              onClick={() => document.getElementById('video-upload')?.click()}
            >
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    handleVideoUpload(file)
                  }
                }}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-[#00ADEF] animate-spin" />
                  <p className="text-sm font-semibold text-slate-700">{uploadProgress}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={32} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Click or drag video to upload</p>
                    <p className="text-xs text-slate-500 mt-1">MP4, WebM, or other video formats (max 100MB)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadProgress && uploadProgress !== 'Upload successful!' && (
            <p className="text-[10px] text-slate-500 italic">{uploadProgress}</p>
          )}
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
'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, Save, Loader2, BookOpen, Hash, FileText, Video, Upload, X } from 'lucide-react'
import { uploadVideoFile } from '@/utils/supabase/storage'

export default function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const supabase = createClient()

  const resolvedParams = use(params)
  const courseId = resolvedParams.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.from('lessons').insert({
      course_id: courseId,
      title: formData.get('title'),
      content: formData.get('content'),
      order_index: parseInt(formData.get('order') as string) || 0,
      video_url: videoUrl || null,
    })

    if (error) {
      alert(`Deployment Error: ${error.message}`)
      setLoading(false)
    } else {
      router.push(`/admin/courses/${courseId}`)
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

    const publicUrl = await uploadVideoFile(file, courseId, 'new-lesson')

    if (publicUrl) {
      setVideoUrl(publicUrl)
      setUploadProgress('Upload successful!')
      setTimeout(() => setUploadProgress(''), 2000)
    } else {
      setUploadProgress('Upload failed. Please try again.')
      setTimeout(() => setUploadProgress(''), 3000)
    }

    setUploading(false)
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
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">New Lesson Entry</h2>
        <p className="text-slate-500 mt-1 font-medium italic">Constructing core curriculum for course ID: {courseId.split('-')[0]}</p>
      </header>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        
        {/* METADATA SECTION */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Hash size={14} className="text-[#00ADEF]" /> Lesson Metadata
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 group">
              <input 
                name="title" 
                required 
                placeholder="LESSON TITLE (e.g., Introduction to Safety Protocols)" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all" 
              />
            </div>
            <div className="group">
              <input 
                name="order" 
                type="number" 
                required
                placeholder="LESSON #" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all" 
              />
            </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <FileText size={14} className="text-[#00ADEF]" /> Instructional Content
          </label>
          <div className="relative group">
            <textarea
                name="content"
                required
                rows={15}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono text-sm leading-relaxed text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all resize-none shadow-inner"
                placeholder="Enter instructional text, Markdown, or technical documentation..."
            />
            <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white/80 px-2 py-1 rounded border">
                Draft Mode Active
            </div>
          </div>
        </div>

        {/* VIDEO URL SECTION */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Video size={14} className="text-[#00ADEF]" /> Upload Video (Optional)
          </label>

          {videoUrl ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-700 font-medium">✓ Video uploaded</div>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="text-xs text-green-600 break-all font-mono">{videoUrl}</div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-[#00ADEF] hover:bg-blue-50/30 transition-all cursor-pointer relative"
              onClick={() => document.getElementById('new-video-upload')?.click()}
            >
              <input
                id="new-video-upload"
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
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
              Add Lesson to Course
            </>
          )}
        </button>
      </form>
    </div>
  )
}
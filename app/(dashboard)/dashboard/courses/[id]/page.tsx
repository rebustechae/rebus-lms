import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PlayCircle, Lock, BookOpen } from "lucide-react"

export default async function CourseDirectory({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Course and Lessons
  const { data: course } = await supabase.from('courses').select('*').eq('id', id).single()
  const { data: lessons } = await supabase.from('lessons').select('*').eq('course_id', id).order('order_index', { ascending: true })

  // 2. Fetch User Progress for locking logic
  const { data: { user } } = await supabase.auth.getUser()
  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user?.id)

  const completedIds = new Set(progress?.map((p) => p.lesson_id))

  if (!course) notFound()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12 select-none">
      {/* BREATHING ROOM TOP NAV */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#00ADEF] hover:text-[#0096d1] transition-colors tracking-widest">
        <ArrowLeft size={14} /> RETURN TO DASHBOARD
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Enterprise Track
          </span>
        </div>
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
          {course.title}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
          {course.description}
        </p>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Available Modules</h3>
          <span className="text-xs font-bold text-slate-400 uppercase">
            {completedIds.size} / {lessons?.length || 0} Complete
          </span>
        </div>

        <div className="grid gap-3">
          {lessons?.map((lesson, idx) => {
            const isCompleted = completedIds.has(lesson.id);
            const isFirst = idx === 0;
            const isUnlocked = isFirst || completedIds.has(lessons[idx - 1].id);

            if (!isUnlocked) {
              return (
                <div 
                  key={lesson.id} 
                  className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex justify-between items-center opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Section {idx + 1}</span>
                      <span className="font-bold text-slate-400 text-lg">{lesson.title}</span>
                    </div>
                  </div>
                  <Lock size={20} className="text-slate-300 mr-2" />
                </div>
              );
            }

            return (
              <Link 
                key={lesson.id} 
                href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                className="group bg-white border border-slate-200 p-5 rounded-2xl flex justify-between items-center hover:border-[#00ADEF] hover:shadow-md hover:shadow-cyan-500/5 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-[#00ADEF]"
                  }`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section {idx + 1}</span>
                      {isCompleted && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">Completed</span>}
                    </div>
                    <span className="font-bold text-slate-900 text-lg group-hover:text-[#00ADEF] transition-colors">
                      {lesson.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-300 group-hover:text-[#00ADEF] transition-all transform group-hover:translate-x-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">
                    {isCompleted ? "Review" : "Initialize"}
                  </span>
                  <PlayCircle size={24} strokeWidth={1.5} />
                </div>
              </Link>
            );
          })}

          {lessons?.length === 0 && (
            <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">Modules are currently being finalized.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
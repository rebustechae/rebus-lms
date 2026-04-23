import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { CheckCircle2, Circle, BookOpen } from "lucide-react"

export default async function CourseLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()
  const { id } = await params
  
  // 1. Fetch lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_index')
    .eq('course_id', id)
    .order('order_index', { ascending: true })

  // 2. Get current user's progress
  const { data: { user } } = await supabase.auth.getUser()
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', user?.id)

  const completedIds = new Set(progress?.map(p => p.lesson_id))

  // 3. Check if ALL lessons are finished
  const allLessonsCompleted = lessons && lessons.length > 0 
    ? lessons.every(l => completedIds.has(l.id)) 
    : false

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-80 space-y-4">
        <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky top-24">
          <h3 className="font-black uppercase text-sm tracking-widest mb-4 border-b-2 border-black pb-2">
            Course Syllabus
          </h3>
          
          <nav className="space-y-2">
            {lessons?.map((lesson) => {
              const isCompleted = completedIds.has(lesson.id)
              return (
                <Link 
                  key={lesson.id}
                  href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                  className="flex items-center gap-3 p-3 border-2 border-transparent hover:border-black transition-all group"
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-zinc-300 shrink-0 group-hover:text-black" />
                  )}
                  <span className={`text-xs font-bold uppercase truncate ${isCompleted ? 'text-zinc-500 line-through decoration-zinc-300' : ''}`}>
                    {lesson.title}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* FINAL QUIZ BUTTON - ONLY SHOWS IF ALL COMPLETED */}
          {allLessonsCompleted && (
            <div className="mt-8 pt-6 border-t-2 border-black border-dashed">
              <Link 
                href={`/dashboard/courses/${id}/final-quiz`}
                className="flex items-center gap-3 p-4 bg-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
              >
                <BookOpen size={20} className="shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">Assessment</span>
                  <span className="text-sm font-black uppercase leading-tight">Final Exam</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
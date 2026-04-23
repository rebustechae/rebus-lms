import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// 1. Change the type definition to Promise
export default async function StudentCoursePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()

  // 2. Await the params before using them
  const { id } = await params

  // 3. Fetch Course Details using the unwrapped 'id'
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) notFound()

  // 4. Fetch Lessons for this course using the unwrapped 'id'
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', id)
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      {/* Breadcrumbs */}
      <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold hover:underline group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        RETURN TO DASHBOARD
      </Link>

      {/* Course Header */}
      <header className="space-y-4 border-b-4 border-black pb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Course Registry</p>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">{course.title}</h1>
        </div>
        <p className="text-xl text-zinc-600 max-w-2xl leading-relaxed italic">
          {course.description}
        </p>
      </header>

      {/* Lesson List */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-sm font-black uppercase tracking-widest border-l-4 border-black pl-3">Module Directory</h2>
          <p className="text-[10px] font-mono text-zinc-400">{lessons?.length || 0} SECTIONS DETECTED</p>
        </div>

        <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {lessons?.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 italic font-bold uppercase">
              Content pending deployment...
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {(lessons || []).map((lesson, idx) => (
                <div key={lesson.id} className="p-6 flex items-center justify-between group hover:bg-zinc-50">
                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-black text-zinc-200 group-hover:text-black transition-colors leading-none">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold uppercase tracking-tight">{lesson.title}</h3>
                      <p className="text-xs font-mono text-zinc-400 uppercase">Status: Available for viewing</p>
                    </div>
                  </div>
                  
                  {/* Use the unwrapped 'id' variable here */}
                  <Link 
                    href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                    className="border-2 border-black bg-black text-white px-6 py-2 text-[10px] font-black uppercase hover:invert transition-all"
                  >
                    Enter Module
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
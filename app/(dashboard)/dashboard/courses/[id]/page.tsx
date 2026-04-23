import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PlayCircle } from "lucide-react"

export default async function CourseDirectory({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: course } = await supabase.from('courses').select('*').eq('id', id).single()
  const { data: lessons } = await supabase.from('lessons').select('*').eq('course_id', id).order('order_index', { ascending: true })

  if (!course) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold hover:underline">
        <ArrowLeft size={14} /> RETURN TO DASHBOARD
      </Link>

      <header className="border-b-4 border-black pb-6">
        <h1 className="text-5xl font-black uppercase tracking-tighter">{course.title}</h1>
        <p className="text-zinc-500 italic mt-2">{course.description}</p>
      </header>

      <div className="space-y-4">
        <h3 className="font-black uppercase tracking-widest text-sm">Available Modules</h3>
        <div className="border-2 border-black divide-y-2 divide-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {lessons?.map((lesson, idx) => (
            <Link 
              key={lesson.id} 
              href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
              className="p-6 flex justify-between items-center hover:bg-zinc-50 group transition-colors"
            >
              <div className="flex items-center gap-6">
                <span className="text-2xl font-black text-zinc-300 group-hover:text-black">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span className="font-bold uppercase text-lg group-hover:underline">{lesson.title}</span>
              </div>
              <PlayCircle className="text-zinc-400 group-hover:text-black" />
            </Link>
          ))}
          {lessons?.length === 0 && (
            <div className="p-10 text-center text-zinc-400 italic">Modules pending deployment...</div>
          )}
        </div>
      </div>
    </div>
  )
}
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Lock, BookOpen } from "lucide-react";

export default async function CourseDirectory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", id).order("order_index", { ascending: true });
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: progress } = await supabase.from("user_progress").select("lesson_id").eq("user_id", user?.id);

  const completedIds = new Set(progress?.map((p) => p.lesson_id));
  if (!course) notFound();

  return (
    /* Removed max-w-4xl and mx-auto to let the layout handle width */
    <div className="w-full py-8 px-6 md:px-10 space-y-10 select-none overflow-x-hidden">
      
      {/* 1. Navigation Header */}
      <div className="space-y-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[10px] font-black text-[#00ADEF] hover:opacity-70 transition-all tracking-[0.2em] uppercase"
        >
          <ArrowLeft size={14} strokeWidth={3} /> Return to Dashboard
        </Link>

        <header className="max-w-4xl space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            {course.title}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            {course.description}
          </p>
        </header>
      </div>

      {/* 2. Lessons Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">
            Available Modules
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {completedIds.size} / {lessons?.length || 0} Complete
          </span>
        </div>

        {/* The Lesson Stack */}
        <div className="grid gap-4 max-w-5xl">
          {lessons?.map((lesson, idx) => {
            const isCompleted = completedIds.has(lesson.id);
            const isUnlocked = idx === 0 || completedIds.has(lessons[idx - 1].id);
            
            // Base Card Container
            const cardBase = "group flex items-center justify-between p-5 md:p-7 bg-white border rounded-[24px] transition-all duration-300";

            if (!isUnlocked) {
              return (
                <div key={lesson.id} className={`${cardBase} border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed`}>
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-xl">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Section {idx + 1}</p>
                      <h4 className="text-xl font-bold text-slate-300 truncate">{lesson.title}</h4>
                    </div>
                  </div>
                  <Lock size={20} className="text-slate-200 flex-shrink-0 mr-4" />
                </div>
              );
            }

            return (
              <Link 
                key={lesson.id} 
                href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                className={`${cardBase} border-slate-200 hover:border-[#00ADEF] hover:shadow-xl hover:shadow-blue-500/5`}
              >
                <div className="flex items-center gap-6 min-w-0">
                  {/* Lesson Number Box */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all shadow-sm ${
                    isCompleted 
                      ? 'bg-emerald-50 text-emerald-500' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-[#00ADEF]'
                  }`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>

                  {/* Title and Badge */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section {idx + 1}</p>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded tracking-tighter">
                          Completed
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#00ADEF] transition-colors truncate">
                      {lesson.title}
                    </h4>
                  </div>
                </div>

                {/* Right Side Action */}
                <div className="flex items-center gap-4 text-slate-200 group-hover:text-[#00ADEF] transition-all flex-shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    {isCompleted ? "Review" : "Start"}
                  </span>
                  <PlayCircle size={32} strokeWidth={1.2} className="transition-transform group-hover:scale-110" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Lock } from "lucide-react";

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
    <div className="w-full py-6 md:py-10 px-4 sm:px-6 md:px-10 space-y-8 md:space-y-12 select-none">
      
      {/* 1. Navigation Header */}
      <div className="space-y-4 md:space-y-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[10px] font-bold text-[#00ADEF] hover:opacity-70 transition-all tracking-wide uppercase"
        >
          <ArrowLeft size={14} strokeWidth={3} /> Return to Dashboard
        </Link>

        <header className="max-w-4xl space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight md:leading-[1.1]">
            {course.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-medium">
            {course.description}
          </p>
        </header>
      </div>

      {/* 2. Lessons Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
          <h3 className="text-[10px] md:text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Available Modules
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 sm:bg-transparent px-2 py-1 rounded sm:p-0 w-fit">
            {completedIds.size} / {lessons?.length || 0} Complete
          </span>
        </div>

        {/* The Lesson Stack */}
        <div className="grid gap-3 md:gap-4 max-w-5xl">
          {lessons?.map((lesson, idx) => {
            const isCompleted = completedIds.has(lesson.id);
            const isUnlocked = idx === 0 || completedIds.has(lessons[idx - 1].id);
            
            const cardBase = "group flex items-center justify-between p-4 sm:p-5 md:p-7 bg-white border rounded-[20px] md:rounded-[24px] transition-all duration-300";

            if (!isUnlocked) {
              return (
                <div key={lesson.id} className={`${cardBase} border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed`}>
                  <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-base md:text-xl">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Section {idx + 1}</p>
                      <h4 className="text-base md:text-xl font-bold text-slate-300 line-clamp-1">{lesson.title}</h4>
                    </div>
                  </div>
                  <Lock size={18} className="text-slate-200 flex-shrink-0 ml-4" />
                </div>
              );
            }

            return (
              <Link 
                key={lesson.id} 
                href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                className={`${cardBase} border-slate-200 hover:border-[#00ADEF] hover:shadow-xl hover:shadow-blue-500/5 active:scale-[0.98] md:active:scale-[0.99]`}
              >
                <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                  {/* Lesson Number Box */}
                  <div className={`flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-base md:text-xl transition-all shadow-sm ${
                    isCompleted 
                      ? 'bg-emerald-50 text-emerald-500' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-[#00ADEF]'
                  }`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>

                  {/* Title and Badge Container */}
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section {idx + 1}</p>
                      {isCompleted && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] md:text-[9px] font-black uppercase rounded tracking-tighter">
                          Completed
                        </span>
                      )}
                    </div>
                    {/* Removed truncate here to allow titles to wrap on mobile */}
                    <h4 className="text-base md:text-xl font-bold text-slate-900 group-hover:text-[#00ADEF] transition-colors leading-tight">
                      {lesson.title}
                    </h4>
                  </div>
                </div>

                {/* Right Side Action */}
                <div className="flex items-center gap-2 md:gap-4 text-slate-200 group-hover:text-[#00ADEF] transition-all flex-shrink-0">
                  <span className="text-sm font-bold tracking-wide hidden lg:block opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    {isCompleted ? "Review" : "Start"}
                  </span>
                  <PlayCircle 
                    size={28} 
                    strokeWidth={1.5} 
                    className="transition-transform group-hover:scale-110 md:w-8 md:h-8" 
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
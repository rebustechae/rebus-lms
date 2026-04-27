import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { getLessonsForCourse, getUserProgressForCourse } from "@/lib/queries";

export const revalidate = 30;

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessons = await getLessonsForCourse(id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let completedIds = new Set<string>();
  if (user) {
    const progress = await getUserProgressForCourse(user.id, id);
    completedIds = new Set(progress.map((p) => p.lesson_id));
  }

  return (
    /* 1. Use flex-col-reverse on mobile so content appears first, then syllabus below */
    <div className="flex flex-col-reverse md:flex-row min-h-screen gap-6 md:gap-10 bg-white p-4 md:p-8">
      
      {/* Sidebar: Full width on mobile, 320px on desktop */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden md:sticky md:top-24 shadow-sm">
          <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-xs uppercase">Course Syllabus</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
               {completedIds.size} / {lessons?.length || 0} MODULES CLEARED
            </p>
          </div>

          <nav className="p-2 md:p-3 space-y-1">
            {lessons?.map((lesson, idx) => {
              const isCompleted = completedIds.has(lesson.id);
              const isFirstLesson = idx === 0;
              const isUnlocked = isFirstLesson || completedIds.has(lessons[idx - 1]?.id);

              return (
                <Link
                  key={lesson.id}
                  href={isUnlocked ? `/dashboard/courses/${id}/lessons/${lesson.id}` : "#"}
                  className={`flex items-center gap-3 p-3 md:p-4 rounded-2xl transition-all ${
                    !isUnlocked 
                      ? "opacity-30 cursor-not-allowed" 
                      : "hover:bg-slate-50 group active:scale-[0.98]"
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="p-0.5 rounded-full text-emerald-500 bg-emerald-50">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    ) : !isUnlocked ? (
                      <Lock size={12} className="text-slate-400" />
                    ) : (
                      <Circle size={14} className="text-slate-300 group-hover:text-[#00adef]" />
                    )}
                  </div>
                  <span className={`text-[10px] md:text-[11px] font-medium uppercase tracking-tight leading-tight ${
                    isCompleted ? "text-slate-400" : "text-slate-700"
                  }`}>
                    {lesson.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
        </div>
      </main>
    </div>
  );
}
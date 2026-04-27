import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, LayoutGrid } from "lucide-react";
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <aside className="w-full md:w-80 border-r border-slate-100 flex flex-col h-auto md:h-screen sticky top-0 bg-slate-50/30">
        
        {/* Course Header Info */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-[10px] font-bold text-[#00ADEF] mb-4 uppercase tracking-widest hover:underline"
          >
            <LayoutGrid size={14} /> Back to Courses
          </Link>
          
          <h3 className="font-semibold text-slate-900 text-sm uppercase mb-1 tracking-tighter">
            Course Syllabus
          </h3>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(completedIds.size / (lessons?.length || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-2 uppercase">
            {completedIds.size} / {lessons?.length || 0} Modules Complete
          </p>
        </div>

        {/* Scrollable Lesson List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {lessons?.map((lesson, idx) => {
            const isCompleted = completedIds.has(lesson.id);
            const isFirstLesson = idx === 0;
            const isUnlocked = isFirstLesson || completedIds.has(lessons[idx - 1]?.id);

            return (
              <Link
                key={lesson.id}
                href={isUnlocked ? `/dashboard/courses/${id}/lessons/${lesson.id}` : "#"}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  !isUnlocked 
                    ? "opacity-40 cursor-not-allowed" 
                    : "hover:bg-white hover:shadow-sm group active:scale-[0.98]"
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="p-1 rounded-full text-emerald-600 bg-emerald-100/50">
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                  ) : !isUnlocked ? (
                    <Lock size={14} className="text-slate-400" />
                  ) : (
                    <Circle size={16} className="text-slate-300 group-hover:text-[#00adef] transition-colors" />
                  )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                        Module {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className={`text-[11px] font-medium leading-tight ${
                        isCompleted ? "text-slate-400" : "text-slate-700"
                    }`}>
                        {lesson.title}
                    </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer info for sidebar */}
        <div className="p-6 border-t border-slate-100 bg-white/50 hidden md:block">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                &copy; 2026 Rebus Holdings
            </p>
        </div>
      </aside>

      {/* MAIN LESSON CONTENT */}
      <main className="flex-1 bg-white min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
        </div>
      </main>
    </div>
  );
}
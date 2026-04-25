import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Circle, BookOpen, Lock } from "lucide-react";
import { getLessonsForCourse, getUserProgressForCourse } from "@/lib/queries";

/**
 * ISR (Incremental Static Regeneration) - Revalidate every 30 seconds
 * This caches the layout and only rebuilds when:
 * 1. 30 seconds have passed, OR
 * 2. revalidatePath() is called after lesson completion
 * 
 * Much more scalable than force-dynamic which queries DB on every request
 */
export const revalidate = 30;

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Use optimized queries (they only select needed columns)
  const lessons = await getLessonsForCourse(id);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user progress for this specific course (not all progress)
  let completedIds = new Set<string>();
  
  if (user) {
    const progress = await getUserProgressForCourse(user.id, id);
    completedIds = new Set(progress.map((p) => p.lesson_id));
  }

  const allLessonsCompleted = 
    lessons?.length ? lessons.every((l) => completedIds.has(l.id)) : false;

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-8 bg-white p-4">
      <aside className="w-full md:w-80">
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden sticky top-24 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Course Syllabus</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-1">
               {completedIds.size} / {lessons?.length || 0} MODULES CLEARED
            </p>
          </div>

          <nav className="p-3 space-y-1">
            {lessons?.map((lesson, idx) => {
              const isCompleted = completedIds.has(lesson.id);
              const isFirstLesson = idx === 0;
              const isUnlocked = isFirstLesson || completedIds.has(lessons[idx - 1]?.id);

              return (
                <Link
                  key={lesson.id}
                  href={isUnlocked ? `/dashboard/courses/${id}/lessons/${lesson.id}` : "#"}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    !isUnlocked ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 group"
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
                  <span className={`text-[11px] font-bold uppercase tracking-tight ${
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

      <main className="flex-1">{children}</main>
    </div>
  );
}
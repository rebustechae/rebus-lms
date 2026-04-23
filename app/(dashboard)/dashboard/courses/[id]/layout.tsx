import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Circle, BookOpen, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user?.id);

  const completedIds = new Set(progress?.map((p) => p.lesson_id));

  const allLessonsCompleted =
    lessons && lessons.length > 0
      ? lessons.every((l) => completedIds.has(l.id))
      : false;

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-80 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-24 shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 text-sm tracking-tight">
              Course Syllabus
            </h3>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1">
              {completedIds.size} / {lessons?.length || 0} Lessons Complete
            </p>
          </div>

          <nav className="p-2">
            {lessons?.map((lesson, idx) => {
              const isCompleted = completedIds.has(lesson.id);
              
              // LOCK LOGIC: 
              // Unlocked if it's the first lesson OR if the previous lesson is completed
              const isFirstLesson = idx === 0;
              const previousLessonCompleted = idx > 0 && completedIds.has(lessons[idx - 1].id);
              const isUnlocked = isFirstLesson || previousLessonCompleted;

              if (!isUnlocked) {
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 rounded-lg opacity-50 cursor-not-allowed select-none group"
                  >
                    <div className="shrink-0 text-slate-300">
                      <Lock size={14} />
                    </div>
                    <span className="text-sm font-medium text-slate-400 leading-tight">
                      {lesson.title}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={lesson.id}
                  href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all group relative"
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="bg-emerald-100 p-1 rounded-full text-emerald-600">
                        <CheckCircle2 size={14} />
                      </div>
                    ) : (
                      <Circle
                        size={16}
                        className="text-slate-300 group-hover:text-[#00adef] transition-colors"
                      />
                    )}
                  </div>

                  <span
                    className={`text-sm font-medium leading-tight ${
                      isCompleted 
                        ? "text-slate-400 line-through decoration-slate-200" 
                        : "text-slate-700 group-hover:text-[#00adef]"}`}
                  >
                    {lesson.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          {allLessonsCompleted && (
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <Link
                href={`/dashboard/courses/${id}/final-quiz`}
                className="flex items-center gap-3 p-4 bg-[#00adef] text-white rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-[#0096d1] transition-all group relative"
              >
                <BookOpen size={20} className="shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none">
                    Assessment
                  </span>
                  <span className="text-sm font-bold leading-tight">
                    Final Course Quiz
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
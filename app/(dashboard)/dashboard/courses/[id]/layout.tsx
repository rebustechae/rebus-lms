import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, LayoutGrid, Award } from "lucide-react";
import { getModulesWithLessonsForCourse, getUserProgressForCourse } from "@/lib/queries";

export const revalidate = 30;

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modules = await getModulesWithLessonsForCourse(id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let completedIds = new Set<string>();
  if (user) {
    const progress = await getUserProgressForCourse(user.id, id);
    completedIds = new Set(progress.map((p) => p.lesson_id));
  }

  const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  const isAllComplete = completedIds.size === totalLessons && totalLessons > 0;

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
              style={{ width: `${(completedIds.size / (totalLessons || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-2 uppercase">
            {completedIds.size} / {totalLessons || 0} Lessons Complete
          </p>
        </div>

        {/* Scrollable Module and Lesson List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {!modules || modules.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-600">No modules found</p>
            </div>
          ) : (
            modules.map((module: any, moduleIdx: number) => {
              const moduleLessons = (module.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index);
              
              return (
                <div key={module.id} className="space-y-1">
                  {/* Module Header */}
                  <div className="px-4 py-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Module {module.order_index.toString().padStart(2, '0')}
                    </span>
                    <p className="text-[10px] font-semibold text-slate-700">{module.title}</p>
                  </div>

                  {/* Lessons in Module */}
                  {moduleLessons.map((lesson: any, lessonIdx: number) => {
                    const isCompleted = completedIds.has(lesson.id);
                    
                    let isUnlocked = false;

                    if (moduleIdx === 0 && lessonIdx === 0) {
                      isUnlocked = true;
                    } else if (lessonIdx > 0) {
                      isUnlocked = completedIds.has(moduleLessons[lessonIdx - 1]?.id);
                    } else if (moduleIdx > 0 && lessonIdx === 0) {
                      const prevModule = modules[moduleIdx - 1];
                      const prevModuleLessons = (prevModule.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index);
                      const lastLessonOfPrevModule = prevModuleLessons[prevModuleLessons.length - 1];
                      isUnlocked = completedIds.has(lastLessonOfPrevModule?.id);
                    }

                    return (
                      <Link
                        key={lesson.id}
                        href={isUnlocked ? `/dashboard/courses/${id}/lessons/${lesson.id}` : "#"}
                        className={`flex items-center gap-3 p-3 ml-2 rounded-lg transition-all border-l-2 ${
                          !isUnlocked 
                            ? "opacity-40 cursor-not-allowed border-slate-100" 
                            : "hover:bg-white hover:shadow-sm group active:scale-[0.98] border-slate-200 hover:border-[#00ADEF]"
                        }`}
                      >
                        <div className="shrink-0">
                          {isCompleted ? (
                            <div className="p-1 rounded-full text-emerald-600 bg-emerald-100/50">
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                          ) : !isUnlocked ? (
                            <Lock size={12} className="text-slate-400" />
                          ) : (
                            <Circle size={14} className="text-slate-300 group-hover:text-[#00adef] transition-colors" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
                                Lesson {lesson.order_index.toString().padStart(2, '0')}
                            </span>
                            <span className={`text-[10px] font-medium leading-tight truncate ${
                                isCompleted ? "text-slate-400" : "text-slate-700"
                            }`}>
                                {lesson.title}
                            </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* Final Assessment Shortcut Link */}
          <div className="pt-4 mt-4 border-t border-slate-100">
             <Link
                href={isAllComplete ? `/dashboard/courses/${id}/final-quiz` : "#"}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    isAllComplete 
                    ? "bg-purple-50 text-purple-700 hover:bg-purple-100" 
                    : "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
             >
                <Award size={16} className={isAllComplete ? "text-purple-600" : ""} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Final Assessment</span>
                {!isAllComplete && <Lock size={12} className="ml-auto" />}
             </Link>
          </div>
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
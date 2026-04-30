import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Lock, LayoutGrid, Award } from "lucide-react";
import { getModulesWithLessonsForCourse, getUserProgressForCourse } from "@/lib/queries";
import { CourseSidebarNav } from "../../_components/CourseSidebarNav";

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
        
        <div className="p-6 border-b border-slate-100 bg-white">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-[10px] font-bold text-[#00ADEF] mb-4 uppercase tracking-widest group"
          >
            <LayoutGrid size={14} className="group-hover:rotate-90 transition-transform duration-300" /> 
            Back to Courses
          </Link>
          
          <h3 className="font-semibold text-slate-900 text-sm uppercase mb-1 tracking-tighter">
            Course Syllabus
          </h3>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${(completedIds.size / (totalLessons || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-2 uppercase flex justify-between">
            <span>Progress</span>
            <span>{completedIds.size} / {totalLessons || 0} Complete</span>
          </p>
        </div>

        <CourseSidebarNav 
            modules={modules} 
            completedIds={completedIds} 
            courseId={id} 
        />

        <div className="p-4 border-t border-slate-100 bg-white">
           <Link
              href={isAllComplete ? `/dashboard/courses/${id}/final-quiz` : "#"}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all border ${
                  isAllComplete 
                  ? "bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100" 
                  : "opacity-40 cursor-not-allowed bg-slate-50 border-transparent text-slate-400"
              }`}
           >
              <Award size={16} className={isAllComplete ? "text-purple-600" : ""} />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider">Final Assessment</span>
                {!isAllComplete && <span className="text-[8px] font-medium text-slate-400">Locked until all lessons are completed</span>}
              </div>
              {!isAllComplete && <Lock size={12} className="ml-auto" />}
           </Link>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 hidden md:block">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">
                &copy; 2026 Rebus Holdings
            </p>
        </div>
      </aside>

      <main className="flex-1 bg-white min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
        </div>
      </main>
    </div>
  );
}
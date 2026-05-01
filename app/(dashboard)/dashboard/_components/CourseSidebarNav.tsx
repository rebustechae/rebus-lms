"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronRight } from "lucide-react";

export function CourseSidebarNav({ 
  modules, 
  completedIds, 
  courseId 
}: { 
  modules: any[], 
  completedIds: Set<string>, 
  courseId: string 
}) {
  const pathname = usePathname();
  
  // Initialize state: find which module contains the current lesson and open it
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach(m => {
      const hasActiveLesson = m.lessons?.some((l: any) => pathname.includes(l.id));
      if (hasActiveLesson || m.order_index === 1) initial[m.id] = true;
    });
    return initial;
  });

  const toggleModule = (id: string) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-2">
      {modules.map((module: any, moduleIdx: number) => {
        const isOpen = openModules[module.id];
        const moduleLessons = (module.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index);
        
        const isModuleComplete = moduleLessons.length > 0 && 
          moduleLessons.every((l: any) => completedIds.has(l.id));

        return (
          <div key={module.id} className="space-y-1">
            <button 
              onClick={() => toggleModule(module.id)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-all rounded-md group border ${
                isModuleComplete 
                  ? "bg-emerald-50/50 border-emerald-100" 
                  : "bg-slate-100/50 border-transparent hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {isModuleComplete && (
                  <CheckCircle2 size={14} className="text-emerald-600" strokeWidth={3} />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className={`text-[9px] font-medium uppercase tracking-widest ${
                    isModuleComplete ? "text-emerald-600/70" : "text-slate-400"
                  }`}>
                    Module {module.order_index.toString().padStart(2, '0')}
                  </span>
                  <p className={`text-[12px] font-semibold leading-tight${
                    isModuleComplete ? "text-emerald-600/70" : "text-slate-700"
                  }`}>{module.title}</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-[#00ADEF]">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            </button>

            {isOpen && (
              <div className="space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
                {moduleLessons.map((lesson: any, lessonIdx: number) => {
                  const isCompleted = completedIds.has(lesson.id);
                  const isActive = pathname.includes(lesson.id);
                  
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
                      href={isUnlocked ? `/dashboard/courses/${courseId}/lessons/${lesson.id}` : "#"}
                      className={`flex items-center gap-3 p-3 ml-2 rounded-sm transition-all border-l-4 ${
                        isActive 
                          ? "bg-white shadow-sm border-[#00ADEF] ring-1 ring-slate-200/50" 
                          : !isUnlocked 
                            ? "opacity-40 cursor-not-allowed border-transparent" 
                            : "hover:bg-white hover:border-[#00ADEF] border-transparent"
                      }`}
                    >
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="p-1 rounded-full text-emerald-600 bg-emerald-100/50">
                            <CheckCircle2 size={10} strokeWidth={3} />
                          </div>
                        ) : !isUnlocked ? (
                          <Lock size={10} className="text-slate-400" />
                        ) : (
                          <Circle size={12} className={`${isActive ? "text-[#00ADEF] fill-[#00ADEF]/10" : "text-slate-300"}`} />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[8px] font-semibold uppercase tracking-widest ${
                          isActive ? "text-[#00ADEF]" : "text-slate-400"
                        }`}>
                          Lesson {lesson.order_index.toString().padStart(2, '0')}
                        </span>
                        <span className={`text-[10px] font-medium leading-tight truncate ${
                          isActive ? "text-[#00ADEF] font-bold" : isCompleted ? "text-slate-400" : "text-slate-700"
                        }`}>
                          {lesson.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
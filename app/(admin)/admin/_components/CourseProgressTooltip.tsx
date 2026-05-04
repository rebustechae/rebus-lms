'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function CourseProgressTooltip({
  courseProgress = [],
  courseProgressByUser = [],
  courseLessonsMap = {}, // Fallback to empty object fixes the Type error
  userId,
}: {
  courseProgress?: any[];
  courseProgressByUser?: any[];
  courseLessonsMap?: Record<string, string[]>; // Added '?' to make it optional
  userId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Get unique course IDs this specific user has touched
  const userCoursesIds = Array.from(new Set(
    courseProgressByUser
      ?.filter((p: any) => p.user_id === userId)
      .map((p: any) => p.course_id)
      .filter(Boolean) || []
  ));

  // Map progress to course details
  const coursesWithProgress = userCoursesIds.map((courseId: any) => {
    // 1. Get total lessons from the map
    const totalLessons = courseLessonsMap[courseId]?.length || 0;
    
    // 2. Get count of completed lessons for this specific user and course
    const completedLessons = courseProgressByUser
      ?.filter((p: any) => p.user_id === userId && p.course_id === courseId)
      .length || 0;

    // 3. Find the course title (Look inside the 'courses' object if it exists)
    const courseData = courseProgress.find((c: any) => c.course_id === courseId);
    const title = courseData?.courses?.title || courseData?.title || 'Unknown Course';

    return {
      id: courseId,
      title: title,
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  });

  if (coursesWithProgress.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-zinc-400 text-xs italic">No progress.</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer group"
      >
        <span className="text-xs font-bold text-slate-700">{coursesWithProgress.length} Courses</span>
        <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-8 w-[400px] z-50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#662D91]">
                Personnel Certification
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {coursesWithProgress.map((course) => (
                <div key={course.id} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 uppercase leading-tight">{course.title}</span>
                        <span className="text-[10px] font-bold text-[#00ADEF]">{course.percentage}% Complete</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {course.completed} / {course.total} LESSONS
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#662D91] transition-all duration-500 ease-out"
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function CourseProgressTooltip({
  courseProgress,
  courseProgressByUser,
  courseLessonsMap,
  userId,
}: {
  courseProgress: any[];
  courseProgressByUser: any[];
  courseLessonsMap: Record<string, string[]>;
  userId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Get unique courses this user has progress in
  const userCoursesSet = new Set(
    courseProgressByUser
      ?.filter((p: any) => p.user_id === userId)
      .map((p: any) => p.course_id)
      .filter(Boolean) || [],
  );

  // Get courses with their lesson counts
  const coursesWithProgress = Array.from(userCoursesSet).map((courseId: any) => {
    const totalLessons = courseLessonsMap[courseId]?.length || 0;
    const completedLessons = courseProgressByUser
      ?.filter(
        (p: any) => p.user_id === userId && p.course_id === courseId,
      )
      .length || 0;

    return {
      id: courseId,
      title: courseProgress.find((c: any) => c.id === courseId)?.title || 'Unknown Course',
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  });

  if (coursesWithProgress.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-zinc-300">No courses started.</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 transition-all cursor-pointer"
      >
        <span>{coursesWithProgress.length}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black rounded shadow-lg p-6 w-96 z-50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-black uppercase tracking-widest text-zinc-600">
                Course Progress
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-100 rounded transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
            {coursesWithProgress.map((course) => (
              <div key={course.id} className="text-sm border-b border-zinc-200 pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-zinc-900">{course.title}</span>
                  <span className="text-zinc-600 font-mono text-xs">
                    {course.total > 0 ? `${course.completed}/${course.total}` : `${course.completed}/—`}
                  </span>
                </div>
                <div className="w-full bg-zinc-200 border border-zinc-300 h-3 rounded overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-zinc-500 mt-2">{course.percentage}% complete</div>
              </div>
            ))}
          </div>
          </div>
        </>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

  // Get unique courses this user is taking
  const userCoursesSet = new Set(
    courseProgressByUser
      ?.filter((p: any) => p.user_id === userId)
      .map((p: any) => p.course_id) || []
  );

  // Get courses with their lesson counts
  const coursesWithProgress = Array.from(userCoursesSet).map((courseId: any) => {
    const totalLessons = courseLessonsMap[courseId]?.length || 0;
    const completedLessons = courseProgressByUser
      ?.filter((p: any) => p.user_id === userId && p.course_id === courseId)
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
        <span className="text-zinc-300">No courses</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 transition-all"
      >
        <span>{coursesWithProgress.length}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute bottom-full right-0 mb-2 bg-white border-2 border-black rounded shadow-lg p-3 w-56 z-50"
        >
          <div className="text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-600">
            Course Progress
          </div>
          <div className="space-y-2">
            {coursesWithProgress.map((course) => (
              <div key={course.id} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{course.title}</span>
                  <span className="text-zinc-500 font-mono">
                    {course.completed}/{course.total}
                  </span>
                </div>
                <div className="w-full bg-zinc-200 border border-zinc-300 h-2 rounded overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
                <div className="text-[9px] text-zinc-500 mt-1">{course.percentage}% complete</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRight, Activity, Clock, CheckCircle, Lock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Rebus LMS",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase();

  const { data: courses } = await supabase
    .from("courses")
    .select(`*, lessons (id), course_completions (passed), course_access (user_email)`)
    .order("created_at", { ascending: false });

  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("lesson_id, lessons!inner(course_id)")
    .eq("user_id", user?.id);

  const visibleCourses = courses?.filter((course) => {
    if (!course.is_private) return true;
    return course.course_access?.some(
      (access: any) => access.user_email.toLowerCase() === userEmail,
    );
  }) || [];

  const processedCourses = visibleCourses.map((course) => {
    const totalLessons = course.lessons?.length || 0;
    const completedInThisCourse = userProgress?.filter((p: any) => p.lessons?.course_id === course.id).length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedInThisCourse / totalLessons) * 100) : 0;
    const isFulllyCompleted = course.course_completions?.[0]?.passed || false;

    return {
      ...course,
      totalLessons,
      progressPercent,
      isFulllyCompleted,
      estimatedTime: course.estimated_time || totalLessons * 10,
    };
  });

  const activeCourses = processedCourses.filter((c) => !c.isFulllyCompleted);
  const completedCourses = processedCourses.filter((c) => c.isFulllyCompleted);

  const CourseCard = ({ course }: { course: any }) => (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      {course.is_private && (
        <div className="absolute top-4 right-4 text-slate-400" title="Private Access">
          <Lock size={14} />
        </div>
      )}

      <div className="space-y-4 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            course.isFulllyCompleted ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
          }`}>
            {course.isFulllyCompleted ? "Status: Completed" : `Progress: ${course.progressPercent}%`}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock size={12} />
            <span className="text-[10px] md:text-[11px] font-semibold uppercase">{course.estimatedTime} MIN</span>
          </div>
        </div>

        <div className="flex-1">
            <h4 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-rebus-blue transition-colors leading-tight">
            {course.title}
            </h4>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed line-clamp-2">
            {course.description || "Module description is not available."}
            </p>
        </div>

        {!course.isFulllyCompleted && (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-rebus-blue transition-all duration-700 ease-out" 
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        )}

        <Link
          href={`/dashboard/courses/${course.id}`}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm transition-all ${
            course.isFulllyCompleted
              ? "bg-slate-50 text-slate-600 hover:bg-slate-100"
              : "bg-rebus-blue text-white hover:bg-[#0096d1] shadow-sm shadow-rebus-blue/20 active:scale-95"
          }`}
        >
          {course.isFulllyCompleted ? "Review Content" : "Continue Course"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );

  return (
    /* Added responsive horizontal padding and reduced vertical gap on mobile */
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-8 md:space-y-12">
      
      {/* HEADER: Adjusted for mobile stacking */}
      <header className="space-y-4 border-b border-slate-200 pb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">
            My Learning
          </h2>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs md:text-sm text-slate-500 font-medium">
            <span className="truncate max-w-[150px] md:max-w-none">{user?.email}</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="bg-blue-50 text-rebus-blue px-2 py-0.5 rounded md:bg-transparent md:p-0 md:text-slate-900">
                {activeCourses.length} Active
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded md:bg-transparent md:p-0 md:text-slate-500">
                {completedCourses.length} Completed
            </span>
          </div>
      </header>

      {/* ACTIVE COURSES: 1 col on mobile, 2 cols on tablet/desktop */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Activity size={18} className="text-rebus-blue" />
          <h3 className="font-bold text-base uppercase tracking-wider text-slate-700">
            In-Progress
          </h3>
        </div>

        {activeCourses.length === 0 ? (
          <div className='rounded-2xl border-2 border-dashed border-slate-200 p-8 md:p-16 text-center bg-slate-50/50'>
            <p className="text-slate-400 text-sm font-medium">No active training detected.</p>
            <Link href="/dashboard/courses" className='text-rebus-blue text-sm font-bold hover:underline mt-2 inline-block'>
              Browse Courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED COURSES */}
      {completedCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle size={18} />
            <h3 className="font-bold text-base uppercase tracking-wider">
              Completed
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 opacity-90">
            {completedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <footer className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
          © 2026 REBUS HOLDINGS
        </p>
      </footer>
    </div>
  );
}
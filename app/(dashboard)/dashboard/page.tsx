import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRight, Activity, Clock, CheckCircle, Lock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Rebus LMS",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase();

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      lessons (id),
      course_completions (passed),
      course_access (user_email)
    `,
    )
    .order("created_at", { ascending: false });

  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("lesson_id, lessons!inner(course_id)")
    .eq("user_id", user?.id);

  const visibleCourses =
    courses?.filter((course) => {
      if (!course.is_private) return true;

      return course.course_access?.some(
        (access: any) => access.user_email.toLowerCase() === userEmail,
      );
    }) || [];

  const processedCourses = visibleCourses.map((course) => {
    const totalLessons = course.lessons?.length || 0;

    const completedInThisCourse =
      userProgress?.filter((p: any) => p.lessons?.course_id === course.id)
        .length || 0;

    const progressPercent =
      totalLessons > 0
        ? Math.round((completedInThisCourse / totalLessons) * 100)
        : 0;

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
    <div className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      {course.is_private && (
        <div
          className="absolute top-4 right-4 text-slate-400"
          title="Private Access"
        >
          <Lock size={14} />
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              course.isFullyCompleted
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {course.isFulllyCompleted
              ? "Status: Completed"
              : `Progress: ${course.progressPercent}%`}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock size={12} />
            <span className="text-[11px] font-semibold">
              {course.estimatedTime} MIN
            </span>
          </div>
        </div>

        <h4 className="text-xl font-semibold text-slate-900 group-hover:text-rebus-blue transition-colors leading-tight">
          {course.title}
        </h4>

        <p className="mt-2 text-slate-500 text-sm leading-relaxed line-clamp-2">
          {course.description || "Module description is not available."}
        </p>

        {!course.isFulllyCompleted && (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rebus-blue transition-all duration-700 ease-out" 
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        )}

        <Link
          href={`/dashboard/courses/${course.id}`}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
            course.isFulllyCompleted
              ? "bg-slate-50 text-slate-600 hover:bg-slate-100"
              : "bg-rebus-blue text-white hover:bg-[#0096d1] shadow-sm shadow-rebus-blue/20"
          }`}
        >
          {course.isFulllyCompleted ? "Review Content" : "Continue Course"}{" "}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="space-y-2 border-b border-slate-200 pb-8">
          <h2 className="text-3xl font-bold sentence-case tracking-tighter text-black">
            My Learning
          </h2>
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
            <span>{user?.email}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-900">{activeCourses.length} Active</span>
            <span className="text-slate-300">•</span>
            <span>{completedCourses.length} Completed</span>
          </div>
      </header>

      {/* ACTIVE COURSES */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Activity size={18} className="text-rebus-blue" />
          <h3 className="font-semibold text-base">
            In-Progress Courses
          </h3>
        </div>

        {activeCourses.length === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-200 p-16 text-center'>
            <p className="text-slate-400 text-sm font-medium">No active training detected.</p>
            <Link href="/dashboard/courses" className='text-rebus-blue text-sm font-bold hover:underline mt-2 inline-block'>
              Browse Courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED COURSES */}
      {completedCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-green-900">
            <CheckCircle size={18} />
            <h3 className="font-semibold text-base">
              COMPLETED COURSES
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-80">
            {completedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <footer className="pt-12 border-t border-slate-200 flex justify-between items-center opacity-50">
        <p className="text-[11px] font-medium text-slate-400 tracking-wider">
          © 2026 REBUS HOLDINGS
        </p>
      </footer>
    </div>
  );
}

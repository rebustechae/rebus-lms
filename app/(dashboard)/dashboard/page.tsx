import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Clock,
  CheckCircle,
  Lock,
  Trophy,
  BookOpen,
  Flame,
} from "lucide-react";
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
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0];

  // Random Greeting Logic
  const greetings = [
    "Welcome back",
    "Ready to learn",
    "Great to see you",
    "Hello",
  ];
  const randomGreeting =
    greetings[Math.floor(Math.random() * greetings.length)];

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
    .eq("course_completions.user_id", user?.id)
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
    const hasStarted = completedInThisCourse > 0;
    const isFulllyCompleted =
      course.course_completions && course.course_completions.length > 0
        ? course.course_completions[0].passed
        : false;

    return {
      ...course,
      totalLessons,
      progressPercent,
      hasStarted,
      isFulllyCompleted,
      estimatedTime: course.estimated_time || totalLessons * 10,
    };
  });

  const activeCourses = processedCourses.filter((c) => !c.isFulllyCompleted);
  const completedCourses = processedCourses.filter((c) => c.isFulllyCompleted);

  const CourseCard = ({ course }: { course: any }) => (
    <div
      className={`group relative bg-white border border-slate-200 rounded-md p-6 shadow-sm hover:shadow-xl hover:border-[#00ADEF]/30 transition-all duration-300 flex flex-col h-full ${course.is_locked ? "border-rose-100" : ""}`}
    >
      <div
        className={`space-y-4 flex flex-col h-full ${course.is_locked ? "opacity-60" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
              course.is_locked
                ? "bg-rose-50 text-rose-600"
                : course.isFulllyCompleted
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {course.is_locked
              ? "Locked"
              : course.isFulllyCompleted
                ? "Completed"
                : `${course.progressPercent}% Progress`}
          </span>

          {/* 2. Unified the Right Side Icons */}
          <div className="flex items-center gap-3">
            {course.is_locked ? (
              <div className="text-rose-500 bg-rose-50 p-1 rounded-full">
                <Lock size={16} />
              </div>
            ) : course.is_private &&
              !course.hasStarted &&
              !course.isFulllyCompleted ? (
              <div className="text-slate-300">
                <Lock size={16} />
              </div>
            ) : course.isFulllyCompleted ? (
              <div className="text-emerald-500 bg-emerald-50 p-1 rounded-full animate-in zoom-in duration-300">
                <CheckCircle size={16} />
              </div>
            ) : null}

            {/* Time Indicator */}
            <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-100 pl-3">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {course.estimatedTime}m
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 pt-2">
          <h4
            className={`text-xl font-bold text-slate-900 transition-colors leading-tight ${course.is_locked ? "" : "group-hover:text-[#00ADEF]"}`}
          >
            {course.title}
          </h4>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed line-clamp-2">
            {course.description || "Module description is not available."}
          </p>
        </div>

        {!course.isFulllyCompleted && (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${course.is_locked ? "bg-rose-400" : "bg-00ADEF"}`}
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        {course.is_locked ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm bg-rose-50/50 border border-rose-100 text-rose-500 cursor-not-allowed uppercase tracking-wider"
          >
            Course Locked
            <Lock size={16} />
          </button>
        ) : (
          <Link
            href={`/dashboard/courses/${course.id}`}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition-all ${
              course.isFulllyCompleted
                ? "bg-slate-50 text-slate-600 hover:bg-slate-100"
                : "bg-[#00ADEF] text-white hover:bg-[#00ADEF]/80 shadow-lg shadow-slate-200 active:scale-95"
            }`}
          >
            {course.isFulllyCompleted
              ? "Review"
              : course.hasStarted
                ? "Resume"
                : "Start"}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
      {/* --- GREETING HEADER --- */}
      <header className="relative overflow-hidden rounded-sm bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {randomGreeting},{" "}
            <span className="text-rebus-blue">{displayName}!</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl font-medium">
            You've completed {completedCourses.length}{" "}
            {completedCourses.length === 1 ? "course" : "courses"} so far. Keep
            pushing toward your next certificate.
          </p>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#00ADEF] opacity-10 blur-[120px] rounded-full" />
      </header>

      {/* --- KPI STATS ROW --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-md shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-sm bg-blue-50 flex items-center justify-center text-[#00ADEF]">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Enrolled
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {processedCourses.length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-md shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-sm bg-purple-50 flex items-center justify-center text-purple-500">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Completed
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {completedCourses.length}
            </p>
          </div>
        </div>
      </section>

      {/* --- IN PROGRESS --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#00ADEF]" />
            <h3 className="font-bold text-lg uppercase tracking-wider text-slate-800">
              In-Progress
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {activeCourses.length} Courses
          </span>
        </div>

        {activeCourses.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
            <p className="text-slate-400 text-sm font-medium italic">
              You have no courses in progress. Browse the course library to
              start learning!
            </p>
            <Link
              href="/dashboard/courses"
              className="text-[#00ADEF] text-sm font-bold hover:underline mt-4 inline-flex items-center gap-2"
            >
              Explore Courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* --- COMPLETED --- */}
      {completedCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-emerald-500" />
            <h3 className="font-bold text-lg uppercase tracking-wider text-slate-800">
              Completed Courses
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 opacity-85 hover:opacity-100 transition-opacity">
            {completedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <footer className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-semibold text-slate-300 tracking-wide uppercase">
          © 2026 REBUS HOLDINGS
        </p>
      </footer>
    </div>
  );
}

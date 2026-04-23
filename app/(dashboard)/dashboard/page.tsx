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

  const visibleCourses = courses?.filter((course) => {
    if (!course.is_private) return true;

    return course.course_access?.some(
      (access: any) => access.user_email.toLowerCase() === userEmail
    );
  }) || [];

  const processedCourses = visibleCourses.map((course) => {
    const totalLessons = course.lessons?.length || 0;

    const completedInThisCourse =
      userProgress?.filter((p: any) => p.lessons?.course_id === course.id).length || 0;

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
    <div className="group relative border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
      {course.is_private && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10" title="Private Access Granted">
          <Lock size={14} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono bg-rebus-purple text-white px-2 py-0.5 uppercase">
            {course.isFulllyCompleted
              ? "Status: Completed"
              : `Progress: ${course.progressPercent}%`}
          </span>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={12} />
            <span className="text-[10px] font-black uppercase">
              {course.estimatedTime} MIN
            </span>
          </div>
        </div>

        <h4 className="text-2xl font-black uppercase tracking-tight group-hover:underline leading-none">
          {course.title}
        </h4>

        {!course.isFulllyCompleted && (
          <div className="h-2 w-full bg-rebus-purple border border-rebus-purple overflow-hidden">
            <div
              className="h-full bg-rebus-purple transition-all duration-500"
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        )}

        <p className="text-zinc-500 text-sm italic line-clamp-2">
          {course.description || "System initialization complete."}
        </p>

        <Link
          href={`/dashboard/courses/${course.id}`}
          className={`flex items-center justify-center gap-2 w-full py-4 font-black uppercase text-xs tracking-widest transition-all border-2 border-rebus-blue shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
            course.isFulllyCompleted
              ? "bg-white text-black hover:bg-zinc-50"
              : "bg-rebus-blue text-white hover:bg-white hover:text-black"
          }`}
        >
          {course.isFulllyCompleted ? "Review Content" : "Continue Course"}{" "}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b-4 border-black pb-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-black">
            MY LEARNING
          </h2>
          <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase">
            {user?.email} // {activeCourses.length} ACTIVE //{" "}
            {completedCourses.length} COMPLETED
          </p>
        </div>
      </header>

      {/* ACTIVE COURSES */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity size={16} />
          <h3 className="text-sm font-black uppercase tracking-widest italic">
            In-Progress Courses
          </h3>
        </div>

        {activeCourses.length === 0 ? (
          <div className="border-2 border-dashed border-black p-12 text-center text-zinc-400 font-bold uppercase italic bg-zinc-50">
            No active training detected. Select a course below to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED COURSES */}
      {completedCourses.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <h3 className="text-sm font-black uppercase tracking-widest italic">
              COMPLETED COURSES
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
            {completedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <footer className="pt-10 border-t-2 border-black flex justify-between items-center opacity-30">
        <p className="text-[9px] font-mono uppercase">
          REBUS LMS // 2026
        </p>
      </footer>
    </div>
  );
}
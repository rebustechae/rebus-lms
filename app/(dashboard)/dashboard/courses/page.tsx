import { createClient } from "@/utils/supabase/server";
import { BookOpen, Play, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CourseCatalogPage() {
  const supabase = await createClient();

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email?.toLowerCase();

  // 2. Fetch courses with completions, access whitelist, AND user progress
  const { data: allCourses, error } = await supabase
    .from("courses")
    .select(`
      *,
      lessons (id),
      course_completions(passed),
      course_access(user_email)
    `)
    .eq('course_completions.user_id', user?.id)
    .order("created_at", { ascending: true });

  // 3. Fetch the specific lesson progress for the user to determine "In Progress" status
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("lesson_id, lessons!inner(course_id)")
    .eq("user_id", user?.id);

  if (error) {
    return (
      <div className="m-4 md:m-10 p-6 border-2 border-red-200 bg-red-50 text-red-600 rounded-xl font-bold">
        <p className="text-xs uppercase tracking-widest mb-1">Error Fetching Catalog</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // 4. FILTER: Only show courses the user is allowed to see
  const visibleCourses = allCourses?.filter(course => {
    if (!course.is_private) return true;
    return course.course_access?.some(
      (access: any) => access.user_email.toLowerCase() === userEmail
    );
  }) || [];

  return (
    <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      
      <header className="space-y-3 border-b border-slate-200 pb-8">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
          Explore Courses
        </h2>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-2xl">
          Explore the courses we offer to enhance your skills. Click on a course to start learning or continue where you left off.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {visibleCourses.map((course) => {
          // Calculate if completed
          const isCompleted = course.course_completions && course.course_completions.length > 0 
            ? course.course_completions[0].passed 
            : false;

          // Calculate if in progress
          const completedLessonsCount = userProgress?.filter(
            (p: any) => p.lessons?.course_id === course.id
          ).length || 0;
          
          const hasStarted = completedLessonsCount > 0;

          return (
            <div 
              key={course.id}
              className="group relative bg-white border border-slate-200 rounded-md p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {isCompleted && (
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-green-500 rounded-full p-1 shadow-lg shadow-green-200 animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} className="text-white md:w-6 md:h-6" />
                </div>
              )}

              {/* Lock logic consistent with Dashboard */}
              {course.is_private && !hasStarted && !isCompleted && (
                <div className="absolute top-4 right-4 text-slate-400">
                  <Lock size={14} />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start text-slate-300 group-hover:text-[#00ADEF] transition-colors">
                  <BookOpen size={18} />
                  {hasStarted && !isCompleted && (
                    <span className="text-[10px] font-bold bg-blue-50 text-[#00ADEF] px-2 py-0.5 rounded uppercase">
                      In Progress
                    </span>
                  )}
                </div>

                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#00ADEF] transition-colors leading-tight">
                  {course.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                  {course.description || "Module description is not available."}
                </p>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    isCompleted 
                    ? "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200" 
                    : "bg-[#00ADEF] text-white hover:bg-[#0096d1] shadow-lg shadow-[#00ADEF]/10"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Review Content</span>
                    </>
                  ) : hasStarted ? (
                    <>
                      <ArrowRight size={16} />
                      <span>Continue Course</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      <span>Start Course</span>
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCourses.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-slate-200 p-12 md:p-20 text-center bg-slate-50/50">
          <p className="text-sm md:text-base text-slate-400 font-semibold uppercase tracking-widest">
            No authorized courses available.
          </p>
        </div>
      )}
    </div>
  );
}
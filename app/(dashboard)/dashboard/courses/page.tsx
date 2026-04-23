import { createClient } from "@/utils/supabase/server";
import { BookOpen, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function CourseCatalogPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      *,
      course_completions(id)
    `)
    .order("created_at", { ascending: true });

  if (error) {
    return <div className="p-10 border-4 border-red-600 bg-red-50 text-red-600 font-black">ERROR_FETCHING_CATALOG: {error.message}</div>;
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-bold senteence-case tracking-tighter text-black">
          Explore Courses
        </h2>
        <p className="text-sm text-slate-500 font-meedium">
          Explore the courses we offer to enhance your skills. Click on a course to start learning or continue where you left off.
        </p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses?.map((course) => {
          const isCompleted = course.course_completions?.length > 0;

          return (
            <div 
              key={course.id}
              className="group relative bg-white border border-slatee-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              {isCompleted && (
                <div className="absolute -top-4 -right-4 bg-green-500 rounded-full p-1">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <BookOpen size={16} />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-rebus-blue transition-colors leading-tight">
                  {course.title}
                </h3>

                <p className="text-zinc-500 text-xs font-medium line-clamp-2 min-h-[32px]">
                  {course.description || "Module description is not available."}
                </p>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    isCompleted 
                    ? "bg-slate-50 text-slate-600 hover:bg-slate-100" 
                    : "bg-rebus-blue text-white hover:bg-[#0096d1] shadow-sm shadow-rebus-blue/20"
                  }`}
                >
                  <Play size={16} fill="currentColor" />
                  {isCompleted ? "Course Complete" : "Start Course"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {courses?.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-16 text-center">
          <p className="text-sm text-slate-400 font-medium">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}
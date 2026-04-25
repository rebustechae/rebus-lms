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
    return (
      <div className="m-4 md:m-10 p-6 border-2 border-red-200 bg-red-50 text-red-600 rounded-xl font-bold">
        <p className="text-xs uppercase tracking-widest mb-1">Error Fetching Catalog</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    /* Added horizontal padding for mobile (px-4) */
    <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      
      {/* Header: Responsive text alignment and sizing */}
      <header className="space-y-3 border-b border-slate-200 pb-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Explore Courses
        </h2>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-2xl">
          Explore the courses we offer to enhance your skills. Click on a course to start learning or continue where you left off.
        </p>
      </header>

      {/* Grid: 1 col on mobile, 2 on tablet (md), 3 on desktop (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {courses?.map((course) => {
          const isCompleted = course.course_completions?.length > 0;

          return (
            <div 
              key={course.id}
              className="group relative bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Responsive Badge: Smaller on mobile */}
              {isCompleted && (
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-green-500 rounded-full p-1 shadow-lg shadow-green-200 animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} className="text-white md:w-6 md:h-6" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start text-slate-300 group-hover:text-rebus-blue transition-colors">
                  <BookOpen size={18} />
                </div>

                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-rebus-blue transition-colors leading-tight">
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
                    : "bg-rebus-blue text-white hover:bg-[#0096d1] shadow-lg shadow-rebus-blue/10"
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

      {/* Empty State */}
      {courses?.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 md:p-20 text-center bg-slate-50/50">
          <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-widest">
            No courses available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
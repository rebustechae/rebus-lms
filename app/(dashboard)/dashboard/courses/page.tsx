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
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="border-b-8 border-black pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          Explore Courses
        </h1>
        <p className="font-mono text-zinc-500 mt-2 uppercase tracking-widest text-xs">
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
              className="group relative bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              {isCompleted && (
                <div className="absolute -top-4 -right-4 bg-green-500 border-4 border-black p-1 rotate-12">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <BookOpen size={20} />
                </div>

                <h3 className="text-2xl font-black uppercase leading-none break-words">
                  {course.title}
                </h3>

                <p className="text-zinc-500 text-xs font-medium line-clamp-2 min-h-[32px]">
                  {course.description || "No briefing available for this module."}
                </p>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className={`flex items-center justify-center gap-2 w-full border-4 border-black py-3 font-black uppercase tracking-tighter transition-colors ${
                    isCompleted 
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                    : "bg-white hover:bg-black hover:text-white"
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
        <div className="p-20 text-center border-4 border-dashed border-zinc-300">
          <p className="font-mono text-zinc-400 uppercase font-bold">No modules currently deployed to registry.</p>
        </div>
      )}
    </div>
  );
}
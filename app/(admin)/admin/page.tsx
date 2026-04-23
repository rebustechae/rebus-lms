import { createClient } from "@/utils/supabase/server";
import { Plus, Users, GraduationCap, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import DeleteCourseButton from "./_components/DeleteCourseButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview | Rebus LMS Admin Dashboard",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      course_completions(count),
      lessons(id)
    `)
    .order("created_at", { ascending: false });

  const { data: globalProgress } = await supabase
    .from("user_progress")
    .select("user_id");
  const uniqueStudentCount = new Set(globalProgress?.map(u => u.user_id)).size;

  const { count: totalCertifications } = await supabase
    .from("course_completions")
    .select("*", { count: 'exact', head: true })
    .eq("passed", true);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black uppercase tracking-tighter">OVERVIEW</h2>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-black text-white px-6 py-3 font-bold text-xs hover:bg-zinc-800 transition-all border-2 border-black flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Plus size={16} /> NEW COURSE
        </Link>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black divide-y-2 md:divide-y-0 md:divide-x-2 divide-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
        <div className="p-8 flex items-center gap-6">
          <div className="bg-zinc-100 p-4 border-2 border-black"><Layers size={24} /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Courses</p>
            <p className="text-4xl font-black mt-1">{courses?.length || 0}</p>
          </div>
        </div>
        <div className="p-8 flex items-center gap-6">
          <div className="bg-zinc-100 p-4 border-2 border-black"><GraduationCap size={24} /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Completed</p>
            <p className="text-4xl font-black mt-1">{totalCertifications || 0}</p>
          </div>
        </div>
        <div className="p-8 flex items-center gap-6">
          <div className="bg-zinc-100 p-4 border-2 border-black"><Users size={24} /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Active Users</p>
            <p className="text-4xl font-black mt-1">{uniqueStudentCount}</p>
          </div>
        </div>
      </div>

      {/* COURSE REGISTRY */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-black pl-3 italic">Courses</h3>

        <div className="border-2 border-black bg-white">
          {!courses || courses.length === 0 ? (
            <div className="p-20 text-center text-zinc-400 italic font-bold uppercase">No courses found.</div>
          ) : (
            <div className="divide-y-2 divide-black">
              {courses.map((course: any) => {
                const certs = course.course_completions?.[0]?.count || 0;
                
                return (
                  <div key={course.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between group hover:bg-zinc-50 transition-colors gap-8">
                    <div className="space-y-3 flex-1">
                      <div className="space-y-1">
                        <Link href={`/admin/courses/${course.id}`}>
                          <h4 className="text-2xl font-black uppercase hover:underline cursor-pointer tracking-tight leading-none">
                            {course.title}
                          </h4>
                        </Link>
                        <p className="text-sm text-zinc-500 max-w-xl italic line-clamp-1">{course.description}</p>
                      </div>

                      {/* COURSE SPECIFIC STATS */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 bg-zinc-100 border border-black/10 px-3 py-1">
                          <Users size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            {/* Note: Enrollment per course requires a count on user_progress where lesson.course_id matches */}
                            {course.lessons?.length || 0} Modules
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-600/20 px-3 py-1">
                          <GraduationCap size={12} className="text-yellow-600" />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-yellow-700">
                            {certs} Completions
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-zinc-100 border border-black/10 px-3 py-1">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">ID: {course.id.split("-")[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="border-2 border-black bg-black text-white px-6 py-3 text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                      >
                        Manage Content
                      </Link>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
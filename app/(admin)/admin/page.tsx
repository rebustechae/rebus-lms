import { createClient } from "@/utils/supabase/server";
import { Plus, Users, GraduationCap, Layers, BarChart3, Settings2, MoreHorizontal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import DeleteCourseButton from "./_components/DeleteCourseButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | Rebus Holdings",
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Overview</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage corporate training protocols and track personnel progress.</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-[#00ADEF] hover:bg-[#0096d1] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-sm shadow-cyan-500/20"
        >
          <Plus size={18} /> New Course
        </Link>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Courses", val: courses?.length || 0, icon: <Layers className="text-blue-600" />, bg: "bg-blue-50" },
          { label: "Course Completions", val: totalCertifications || 0, icon: <ShieldCheck className="text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Active Personnel", val: uniqueStudentCount, icon: <Users className="text-slate-600" />, bg: "bg-slate-100" }
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
              <BarChart3 size={16} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.val.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DATA TABLE SECTION */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">Course Registry</h3>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">System Operational</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {!courses || courses.length === 0 ? (
            <div className="p-20 text-center text-slate-400 font-medium">No courses available in the registry.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Course Info</th>
                  <th className="px-6 py-4">Modules</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((course: any) => {
                  const certs = course.course_completions?.[0]?.count || 0;
                  
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <Link href={`/admin/courses/${course.id}`} className="font-bold text-slate-900 hover:text-[#00ADEF] transition-colors">
                            {course.title}
                          </Link>
                          <span className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xs">{course.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {course.lessons?.length || 0} units
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                          {certs} Completed
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Course"
                          >
                            <Settings2 size={18} />
                          </Link>
                          <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 pt-4">
        <p>© 2026 REBUS HOLDINGS • INTERNAL SYSTEMS</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-slate-600 transition-colors uppercase tracking-widest">Documentation</Link>
          <Link href="#" className="hover:text-slate-600 transition-colors uppercase tracking-widest">Audit Logs</Link>
        </div>
      </div>
    </div>
  );
}
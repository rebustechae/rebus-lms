import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Plus,
  Users,
  Layers,
  BarChart3,
  ShieldCheck,
  Edit,
  Activity, // Added for new KPI
} from "lucide-react";
import Link from "next/link";
import DeleteCourseButton from "./_components/DeleteCourseButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. SESSION CHECK
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin-login");
  }

  // 2. DATA FETCHING
  // Added 'profiles' to the fetch to get the actual registered user count
  const [coursesRes, progressRes, certsRes, profilesRes] = await Promise.all([
    supabase
      .from("courses")
      .select(`*, course_completions(count), lessons(id)`)
      .order("created_at", { ascending: false }),
    supabase.from("user_progress").select("user_id"),
    supabase
      .from("course_completions")
      .select("*", { count: "exact", head: true })
      .eq("passed", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
  ]);

  const courses = coursesRes.data || [];
  const globalProgress = progressRes.data || [];
  const totalCertifications = certsRes.count || 0;
  
  // FIX: Dashboard now reflects total profiles (matches Manage Users table)
  const totalRegisteredUsers = profilesRes.count || 0;
  
  // OPTIONAL: Keep track of "Active Learners" (those who actually started a lesson)
  const activeLearnersCount = new Set(globalProgress.map((u) => u.user_id)).size;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Executive Overview
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            Connected as: <span className="text-[#00ADEF]">{user?.email}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/users" // Assuming this is your Manage Users path
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Users size={18} /> Manage Users
          </Link>
          <Link
            href="/admin/courses/new"
            className="bg-[#00ADEF] hover:bg-[#0096d1] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> New Course
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> {/* Changed to 4 columns to include Activity */}
        {[
          {
            label: "Active Courses",
            val: courses.length,
            icon: <Layers className="text-[#00ADEF]" />,
            bg: "bg-blue-50",
          },
          {
            label: "Certifications",
            val: totalCertifications,
            icon: <ShieldCheck className="text-purple-600" />,
            bg: "bg-purple-50",
          },
          {
            label: "Registered Users",
            val: totalRegisteredUsers, // Now matches Manage Users exactly
            icon: <Users className="text-slate-600" />,
            bg: "bg-slate-100",
          },
          {
            label: "Active Learners",
            val: activeLearnersCount, // Insight into how many are actually studying
            icon: <Activity className="text-emerald-600" />,
            bg: "bg-emerald-50",
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
              <BarChart3 size={16} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {kpi.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {kpi.val.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ... rest of your course table code ... */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 text-sm">Courses</h3>
        </div>
        <div className="overflow-x-auto">
          {courses.length === 0 ? (
            <div className="p-20 text-center text-slate-400 font-medium italic">
              No courses found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 text-[11px] font-bold uppercase border-b border-slate-100">
                  <th className="px-6 py-4">Course Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((course: any) => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="font-bold text-slate-900 hover:text-[#00ADEF]"
                      >
                        {course.title}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/courses/${course.id}/results`}
                        className="inline-flex items-center gap-2 group cursor-pointer"
                      >
                        <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          {course.course_completions?.[0]?.count || 0} PASS
                        </span>
                        <span className="text-slate-300 group-hover:text-[#00ADEF] transition-colors">
                          <BarChart3 size={14} />
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit size={18} />
                      </Link>
                      <DeleteCourseButton
                        courseId={course.id}
                        courseTitle={course.title}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
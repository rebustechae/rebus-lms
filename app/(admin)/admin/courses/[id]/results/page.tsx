import { createClient } from "@/utils/supabase/server";
import { ChevronLeft, Award, BarChart3, Calendar } from "lucide-react";
import Link from "next/link";
import DownloadResultsPDF from "../../../_components/DownloadResultsPDF";

export default async function CourseResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Course Title
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single();

  // 2. Fetch Attempts with synchronized Profile data
  const { data: rawAttempts, error: attemptError } = await supabase
    .from("course_completions")
    .select(`
      id,
      score,
      passed,
      completed_at,
      profiles!user_id (
        email,
        full_name,
        designation
      )
    `)
    .eq("course_id", id)
    .order("completed_at", { ascending: false });

  if (attemptError) console.error("ADMIN_RESULTS: Fetch Error:", attemptError.message);

  // 3. Map results using your synchronized columns
  const attempts = rawAttempts?.map((attempt: any) => {
    const profile = attempt.profiles;
    const email = profile?.email || "unknown@user";
    
    // Logic: Use DB column -> Fallback to email prefix -> "Unknown"
    const displayName = 
      profile?.full_name || 
      email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) || 
      "Unknown Personnel";

    const designation = profile?.designation || "Personnel";

    return {
      id: attempt.id,
      score: attempt.score,
      passed: attempt.passed,
      completed_at: attempt.completed_at,
      email,
      displayName,
      designation
    };
  }) || [];

  const courseTitle = course?.title || "Course Results";

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-slate-500 hover:text-[#00ADEF] transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-[#662D91] uppercase tracking-tighter">
            {courseTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {attempts.length > 0 && (
            <DownloadResultsPDF attempts={attempts} courseTitle={courseTitle} />
          )}

          <div className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Attempts</p>
              <p className="text-xl font-black text-[#662D91]">{attempts.length}</p>
            </div>
            <BarChart3 className="text-slate-300" size={24} />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
              <th className="px-8 py-5">Personnel</th>
              <th className="px-6 py-5 text-center">Score</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Completed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attempts.length > 0 ? (
              attempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {/* Avatar with the Purple Brand Color */}
                      <div className="w-10 h-10 rounded-full bg-[#662D91] text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 shrink-0">
                        {attempt.displayName[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {attempt.displayName}
                        </span>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[10px] font-bold text-[#00ADEF] uppercase tracking-wider">
                             {attempt.designation}
                           </span>
                           <span className="text-slate-300">•</span>
                           <span className="text-[10px] text-slate-400 font-medium truncate">
                             {attempt.email}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <span className={`text-lg font-bold ${attempt.passed ? "text-emerald-600" : "text-red-500"}`}>
                      {attempt.score}%
                    </span>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      attempt.passed 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      <Award size={12} />
                      {attempt.passed ? "Passed" : "Unsuccessful"}
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(attempt.completed_at).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {new Date(attempt.completed_at).toLocaleTimeString([], { 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                   <div className="flex flex-col items-center gap-2">
                    <BarChart3 className="text-slate-200" size={48} />
                    <p className="text-slate-400 font-medium italic">No quiz results found for this course.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
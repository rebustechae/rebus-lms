import { createClient } from "@/utils/supabase/server";
import { ChevronLeft, User, Calendar, Award, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function CourseResultsPage({
  params,
}: {
  params: Promise<{ id: string }>; // 1. Update type to Promise
}) {
  // 2. Await the params before using them
  const { id } = await params;

  const supabase = await createClient();

  // 3. Use the unwrapped 'id' variable in your queries
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single();

  if (courseError) {
    console.error(
      "ADMIN_RESULTS: Course Title Fetch Error:",
      courseError.message,
    );
  }

  const { data: attempts, error: attemptError } = await supabase
    .from("course_completions")
    .select(
      `
      id,
      score,
      passed,
      completed_at,
      profiles!user_id (
        email,
        role
      )
    `,
    )
    .eq("course_id", id) // 4. Use 'id' here as well
    .order("completed_at", { ascending: false });

  if (attemptError) {
    console.error("ADMIN_RESULTS: Attempts Fetch Error:", attemptError.message);
  }

  const courseTitle = course?.title || "Course Results";

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-slate-500 hover:text-[#00ADEF] transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Admin
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-rebus-purple uppercase tracking-tighter">
              {courseTitle}
            </h1>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Total Attempts
            </p>
            <p className="text-xl font-black text-[#662D91]">
              {attempts?.length || 0}
            </p>
          </div>
          <BarChart3 className="text-slate-300" size={24} />
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
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
            {attempts && attempts.length > 0 ? (
              attempts.map((attempt: any) => {
                // Formatting display name from email since full_name doesn't exist
                const email = attempt.profiles?.email || "unknown@user";
                const emailPrefix = email.split("@")[0];
                const displayName =
                  emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

                return (
                  <tr
                    key={attempt.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    {/* User Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#662D91] text-white flex items-center justify-center font-bold text-sm">
                          {displayName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-tight">
                            {displayName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-6 text-center">
                      <span
                        className={`text-lg font-medium ${
                          attempt.passed ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {attempt.score}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-6 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          attempt.passed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        <Award size={12} />
                        {attempt.passed ? "Passed" : "Unsuccessful"}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(attempt.completed_at).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          {new Date(attempt.completed_at).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                      <BarChart3 size={40} />
                    </div>
                    <p className="text-slate-400 italic font-medium">
                      No quiz attempts have been recorded for this course.
                    </p>
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

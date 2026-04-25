import { Search, UserCog, Mail, Calendar, ShieldCheck, Filter } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import UserRow from "./UserRow";
import SearchInput from "@/app/(admin)/admin/_components/SearchInput";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Directory | Rebus Admin",
};

/**
 * SCALABILITY: Revalidate every 60 seconds
 * Admin dashboard doesn't need real-time updates
 * Reduces DB load significantly
 */
export const revalidate = 60;

// 1. Add searchParams and pagination to the function arguments
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  // 2. Resolve the query string and page number
  const params = await searchParams;
  const query = params.query?.toLowerCase() || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20; // Show 20 users per page

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  // OPTIMIZATION: Use database-level filtering instead of JS filtering
  const offset = (page - 1) * pageSize;
  let userQuery = supabaseAdmin
    .from("profiles")
    .select("id, email, role, created_at", { count: "exact" });

  // Apply search filter at database level
  if (query) {
    userQuery = userQuery.or(
      `email.ilike.%${query}%,role.ilike.%${query}%`
    );
  }

  const { data: users, count: totalUsers } = await userQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  // OPTIMIZATION: Only fetch progress for users on current page
  const userIds = users?.map((u) => u.id) || [];

  // Get course progress ONLY for users on this page
  const { data: courseProgress } = userIds.length > 0
    ? await supabaseAdmin
        .from("user_progress")
        .select(
          `
          user_id,
          course_id,
          lesson_id,
          courses:course_id(id, title)
        `,
          { count: "exact" }
        )
        .in("user_id", userIds)
    : { data: [] };

  // Build optimized maps
  const userProgressMap = new Map<string, any[]>();
  const courseProgressByUserId = new Map<string, Set<string>>();

  courseProgress?.forEach((progress: any) => {
    const { user_id, course_id, courses } = progress;

    if (!courseProgressByUserId.has(user_id)) {
      courseProgressByUserId.set(user_id, new Set());
    }

    if (!userProgressMap.has(user_id)) {
      userProgressMap.set(user_id, []);
    }

    const coursesArray = userProgressMap.get(user_id)!;
    if (!coursesArray.find((c) => c.id === course_id) && courses) {
      coursesArray.push({ id: course_id, title: courses.title });
    }
  });

  // Get lesson counts per course (cached for 1 hour)
  const { data: allLessons } = await supabaseAdmin
    .from("lessons")
    .select("id, course_id");

  const courseLessonsMap: Record<string, string[]> = {};
  allLessons?.forEach((lesson: any) => {
    if (!courseLessonsMap[lesson.course_id]) {
      courseLessonsMap[lesson.course_id] = [];
    }
    courseLessonsMap[lesson.course_id].push(lesson.id);
  });

  const totalPages = Math.ceil((totalUsers || 0) / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Personnel Directory</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Review employee engagement, modify access levels, and track completions.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200">
                {totalUsers || 0} Total Users
            </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <SearchInput />
      </div>

      {/* USER TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2"><Mail size={14} /> Employee</div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2"><UserCog size={14} /> Authority</div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center gap-2"><ShieldCheck size={14} /> Progress</div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-2"><Calendar size={14} /> Actions</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!users || users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">
                  {query ? `No records matching "${query}"` : "No active personnel records found."}
                </td>
              </tr>
            ) : (
              users.map((user: any) => {
                const userCourses = userProgressMap.get(user.id) || [];
                return (
                  <UserRow 
                    key={user.id} 
                    user={user} 
                    courseProgress={userCourses}
                    courseLessonsMap={courseLessonsMap}
                    courseProgressByUser={courseProgress || []}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-slate-500 font-medium">
          Showing {users?.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalUsers || 0)} of {totalUsers || 0} users
        </div>
        <div className="flex gap-2">
          <a
            href={hasPrevPage ? `/admin/users?${new URLSearchParams({
              query,
              page: String(Math.max(1, page - 1)),
            }).toString()}` : "#"}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              !hasPrevPage
                ? "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ← Previous
          </a>
          <div className="px-3 py-2 text-xs font-bold text-slate-600">
            Page {page} of {totalPages}
          </div>
          <a
            href={hasNextPage ? `/admin/users?${new URLSearchParams({
              query,
              page: String(Math.min(totalPages, page + 1)),
            }).toString()}` : "#"}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              !hasNextPage
                ? "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Next →
          </a>
        </div>
      </div>

      <footer className="flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">
          Notice: Role elevation requires administrative override.
        </p>
      </footer>
    </div>
  );
}
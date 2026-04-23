import { Search, UserCog, Mail, Calendar, ShieldCheck, Filter } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import UserRow from "./UserRow";
import SearchInput from "@/app/(admin)/admin/_components/SearchInput";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Directory | Rebus Admin",
};

// 1. Add searchParams to the function arguments
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  // 2. Resolve the query string
  const query = (await searchParams).query?.toLowerCase() || "";

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

  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select(`
      id,
      email,
      role,
      created_at,
      course_completions(count)
    `)
    .order("created_at", { ascending: false });

  // 3. FILTER LOGIC: Filter the users list based on the search query
  const filteredUsers = users?.filter((user: any) => {
    return (
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const { data: courseProgress } = await supabaseAdmin
    .from("user_progress")
    .select(`
      user_id,
      course_id,
      courses(id, title),
      lessons(id, course_id)
    `);

  const userProgressMap = new Map();
  courseProgress?.forEach((progress: any) => {
    if (!userProgressMap.has(progress.user_id)) {
      userProgressMap.set(progress.user_id, []);
    }
    const coursesArray = userProgressMap.get(progress.user_id);
    const existingCourse = coursesArray.find((c: any) => c.id === progress.course_id);
    if (!existingCourse && progress.courses) {
      coursesArray.push({
        id: progress.courses.id,
        title: progress.courses.title,
      });
    }
  });

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
                {users?.length || 0} Registered Users
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
            {/* 5. Map over filteredUsers instead of users */}
            {!filteredUsers || filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">
                  {query ? `No records matching "${query}"` : "No active personnel records found."}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => {
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

      <footer className="flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">
          Notice: Role elevation requires administrative override.
        </p>
      </footer>
    </div>
  );
}
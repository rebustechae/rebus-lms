// page.tsx
import { createClient } from "@supabase/supabase-js";
import UsersTable from "../_components/UserTable";

export default async function AdminUsersPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch all Auth Users (to get metadata like full_name/designation)
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  // 2. Fetch all Profiles (to get roles)
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("*, course_completions(count)");

  // 3. Fetch Progress and Lessons
  const { data: allProgress } = await supabaseAdmin
    .from("user_progress")
    .select("user_id, course_id, lesson_id, courses:course_id(title)");

  const { data: allLessons } = await supabaseAdmin.from("lessons").select("id, course_id");

  // 4. MERGE DATA: Combine Auth metadata with Profile roles
  const combinedUsers = profiles?.map(profile => {
    const authUser = authUsers.find(au => au.id === profile.id);
    return {
      ...profile,
      // Priority: use metadata from Auth if it exists
      full_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0],
      designation: authUser?.user_metadata?.designation || "Personnel",
    };
  }) || [];

  const courseLessonsMap: Record<string, string[]> = {};
  allLessons?.forEach((l: any) => {
    if (!courseLessonsMap[l.course_id]) courseLessonsMap[l.course_id] = [];
    courseLessonsMap[l.course_id].push(l.id);
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
       <UsersTable 
         users={combinedUsers} 
         allProgress={allProgress || []} 
         courseLessonsMap={courseLessonsMap} 
       />
    </div>
  );
}
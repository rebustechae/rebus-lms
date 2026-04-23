import { Search } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import UserRow from "./UserRow";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users | Rebus LMS Admin Dashboard",
};

export default async function AdminUsersPage() {
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

  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select(
      `
      id,
      email,
      role,
      created_at,
      course_completions(count)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex justify-between items-end border-b-4 border-black pb-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            Manage Users
          </h2>
          <p className="text-xs font-mono text-zinc-400">
            {users?.length || 0} TOTAL USERS
          </p>
        </div>
      </header>

      {/* Search/Filter Bar (Visual Placeholder) */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Filter by email or role..."
          className="w-full border-2 border-black p-4 pl-12 font-bold uppercase text-xs tracking-widest outline-none focus:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
        />
      </div>

      {/* User Table */}
      <div className="border-2 border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-zinc-50">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest border-r-2 border-black">
                Employee
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest border-r-2 border-black">
                Access Level
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center border-r-2 border-black">
                Completions
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {!users || users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center text-zinc-400 italic font-bold uppercase"
                >
                  No users found in the system.
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <UserRow key={user.id} user={user} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="opacity-30 text-[9px] font-mono uppercase italic">
        Caution: Role modifications impact system-wide visibility.
      </footer>
    </div>
  );
}

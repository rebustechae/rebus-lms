"use client";

import { useState, useEffect } from "react";
import UserRow from "../users/UserRow";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersTable({
  users = [],
  allProgress = [],
  courseLessonsMap = {},
}: any) {
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // DEBUG: Check your console in the browser to see if 'users' is empty
  useEffect(() => {
    console.log("Admin Panel Users Data:", users);
  }, [users]);

  const filteredData = users.filter((u: any) => {
    const completionCount = u.course_completions?.[0]?.count || 0;
    const hasCompleted = completionCount > 0;

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "completed"
          ? hasCompleted
          : !hasCompleted;

    const name = (u.full_name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const desig = (u.designation || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      matchesFilter &&
      (name.includes(query) || email.includes(query) || desig.includes(query))
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedUsers = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6">
      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-sm border border-slate-100">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          {["all", "completed", "pending"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilter(t as any);
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === t
                  ? "bg-white shadow-sm text-[#662D91]"
                  : "text-slate-500"
              }`}
            >
              {t === "pending" ? "In Progress" : t}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#00ADEF]"
            placeholder="Search personnel..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white  border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <th className="px-8 py-5">Employee</th>
              <th className="px-6 py-5">Authorization</th>
              <th className="px-6 py-5 text-center">Certification</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u: any) => (
                <UserRow
                  key={u.id || u.email} // Fallback key
                  user={u}
                  courseProgress={allProgress.filter(
                    (p: any) => p.user_id === u.id,
                  )}
                  courseLessonsMap={courseLessonsMap}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-24 text-center text-slate-400 italic"
                >
                  {users.length === 0
                    ? "Database returned no records. Check your Supabase connection."
                    : "No users match your current filter/search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6">
          <p className="text-[11px] text-slate-400 font-bold uppercase">
            Showing {paginatedUsers.length} of {filteredData.length} Personnel
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import UserRow from "../users/UserRow";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function UsersTable({
  users = [],
  allProgress = [],
  courseLessonsMap = {},
}: any) {
  // Filters changed to represent Engagement rather than specific course completion
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = users.filter((u: any) => {
    // A user is 'active' if they appear in the user_progress table at all
    const hasProgress = allProgress.some((p: any) => p.user_id === u.id);

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "active"
          ? hasProgress
          : !hasProgress;

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
      {/* FILTER BAR - Professional & Neutral */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
          {[
            { id: "all", label: "All Employees" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setFilter(t.id as any);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                filter === t.id
                  ? "bg-white shadow-sm text-slate-900 border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
              <th className="px-8 py-5">Employee Name</th>
              <th className="px-6 py-5">Role/Access</th>
              <th className="px-6 py-5 text-center">Engagement</th>
              <th className="px-8 py-5 text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u: any) => (
                <UserRow
                  key={u.id || u.email}
                  user={u}
                  courseProgress={allProgress.filter(
                    (p: any) => p.user_id === u.id,
                  )}
                  courseLessonsMap={courseLessonsMap}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                   <div className="flex flex-col items-center gap-2">
                    <Users className="text-slate-200" size={40} />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No matching records found</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION - Minimalist */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredData.length} Total Records
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
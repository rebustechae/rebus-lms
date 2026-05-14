"use client";

import { Trash2, MoreVertical, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateRole, deleteUser } from "./actions";
import CourseProgressTooltip from "../_components/CourseProgressTooltip";

export default function UserRow({
  user,
  courseProgress,
  courseLessonsMap,
}: {
  user: any;
  courseProgress?: any[];
  courseLessonsMap?: Record<string, string[]>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const fullName = user.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown";
  const designation = user.designation || user.user_metadata?.designation || "Personnel";
  const userRole = user.role || "student";

  const handleRoleChange = async (newRole: string) => {
    setIsUpdating(true);
    try {
      await updateRole(user.id, newRole);
    } catch (e) {
      alert("Error: Failed to update authorization level.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Archive ${fullName}? User will lose access to all certifications.`)) {
      await deleteUser(user.id);
    }
  };

  const getRoleStyles = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "manager":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#662D91] text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 shrink-0">
            {fullName[0].toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 text-sm truncate">
              {fullName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#00ADEF] uppercase tracking-wider truncate">
                {designation}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="relative inline-block">
          <select
            disabled={isUpdating}
            defaultValue={userRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest outline-none transition-all cursor-pointer disabled:opacity-50 ${getRoleStyles(userRole)}`}
          >
            <option value="student">Student</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            {isUpdating ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <MoreVertical size={10} />
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col items-center">
          <CourseProgressTooltip
            courseProgress={courseProgress || []}
            courseProgressByUser={courseProgress || []}
            courseLessonsMap={courseLessonsMap}
            userId={user.id}
          />
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <button
          onClick={handleDelete}
          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
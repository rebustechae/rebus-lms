'use client'

import { Trash2, Award, MoreVertical, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateRole, deleteUser } from "./actions";
import CourseProgressTooltip from "../_components/CourseProgressTooltip";

export default function UserRow({ 
  user, 
  courseProgress,
  courseLessonsMap,
  courseProgressByUser,
}: { 
  user: any;
  courseProgress?: any[];
  courseLessonsMap?: Record<string, string[]>;
  courseProgressByUser?: any[];
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setIsUpdating(true);
    try {
      await updateRole(user.id, newRole);
    } catch (e) {
      alert("System Error: Failed to update personnel authorization.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Confirm Deletion: Are you sure you want to remove ${user.email} from the directory? All records will be archived.`)) {
      await deleteUser(user.id);
    }
  };

  // Helper for role badge styling
  const getRoleStyles = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 group">
      {/* EMPLOYEE INFO */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100">
            {user.email[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm">{user.email.split("@")[0]}</span>
            <span className="text-xs text-slate-500 font-medium">{user.email}</span>
          </div>
        </div>
      </td>
      
      {/* AUTHORITY / ROLE */}
      <td className="px-6 py-4">
        <div className="relative inline-block">
          <select 
            disabled={isUpdating}
            defaultValue={user.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1 rounded-md border text-[11px] font-bold uppercase tracking-tight outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 ${getRoleStyles(user.role)}`}
          >
            <option value="student">Student</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            {isUpdating ? <Loader2 size={10} className="animate-spin" /> : <MoreVertical size={10} />}
          </div>
        </div>
      </td>

      {/* PROGRESS / COMPLETIONS */}
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className={`p-1.5 rounded-md ${ (user.course_completions?.[0]?.count ?? 0) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
            <Award size={14} />
          </div>
          <div className="text-sm font-bold text-slate-700">
            {courseProgress && courseLessonsMap && courseProgressByUser ? (
              <CourseProgressTooltip 
                courseProgress={courseProgress}
                courseProgressByUser={courseProgressByUser}
                courseLessonsMap={courseLessonsMap}
                userId={user.id}
              />
            ) : (
              <span>{user.course_completions?.[0]?.count ?? 0}</span>
            )}
          </div>
        </div>
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-4 text-right">
        <button 
          onClick={handleDelete} 
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          title="Archive User"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
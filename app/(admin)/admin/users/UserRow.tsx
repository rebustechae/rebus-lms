'use client'

import { Trash2, Award } from "lucide-react";
import { updateRole, deleteUser } from "./actions";

export default function UserRow({ user }: { user: any }) {
  const handleRoleChange = async (newRole: string) => {
    try {
      await updateRole(user.id, newRole);
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const handleDelete = async () => {
    if (confirm(`TERMINATE OPERATIVE ${user.email}?`)) {
      await deleteUser(user.id);
    }
  };

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="p-4 border-r-2 border-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black border-2 border-black">
            {user.email[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase">{user.email.split("@")[0]}</span>
            <span className="text-[10px] font-mono text-zinc-400">{user.email}</span>
          </div>
        </div>
      </td>
      
      <td className="p-4 border-r-2 border-black">
        <select 
          defaultValue={user.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="bg-white border-2 border-black text-[10px] font-black p-1 uppercase outline-none focus:bg-zinc-100"
        >
          <option value="student">student</option>
          <option value="manager">manager</option>
          <option value="admin">admin</option>
        </select>
      </td>

      <td className="p-4 text-center border-r-2 border-black font-mono font-black text-xl">
        <div className="flex items-center justify-center gap-2">
          <Award size={14} className={(user.course_completions?.[0]?.count ?? 0) > 0 ? 'text-black' : 'text-zinc-200'} />
          {user.course_completions?.[0]?.count ?? 0}
        </div>
      </td>

      <td className="p-4 text-right">
        <button onClick={handleDelete} className="p-2 border-2 border-black hover:bg-red-600 hover:text-white transition-all">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
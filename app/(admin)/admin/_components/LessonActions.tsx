"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Trash2, Loader2 } from "lucide-react";

export default function LessonActions({
  lessonId,
  courseId,
  lessonTitle,
}: {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm(`Confirm Deletion: Are you sure you want to permanently remove the module "${lessonTitle}"?`)) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      alert(`System Error: ${error.message}`);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  }

  // Consistent button style for a clean professional look
  const btnClass = "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all border";

  return (
    <div className="flex items-center gap-2">
      {/* PREVIEW BUTTON */}
      <button
        onClick={() =>
          router.push(`/dashboard/courses/${courseId}/lessons/${lessonId}`)
        }
        className={`${btnClass} bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm`}
      >
        <Eye size={14} className="text-slate-400" /> 
        Preview
      </button>

      {/* EDIT BUTTON */}
      <button
        onClick={() =>
          router.push(`/admin/courses/${courseId}/lessons/${lessonId}/edit`)
        }
        className={`${btnClass} bg-white border-slate-200 text-slate-600 hover:bg-[#00ADEF]/5 hover:text-[#00ADEF] hover:border-[#00ADEF]/30 shadow-sm`}
      >
        <Edit3 size={14} className="text-slate-400 group-hover:text-[#00ADEF]" /> 
        Edit
      </button>

      {/* DELETE BUTTON */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`${btnClass} bg-white border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm disabled:opacity-50`}
        title="Delete Lesson"
      >
        {isDeleting ? (
          <Loader2 size={14} className="animate-spin text-slate-400" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    </div>
  );
}
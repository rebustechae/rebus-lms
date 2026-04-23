"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Trash2 } from "lucide-react";

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
    if (!confirm(`Are you sure you want to delete "${lessonTitle}"?`)) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      alert(error.message);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          router.push(`/dashboard/courses/${courseId}/lessons/${lessonId}`)
        }
        className="flex items-center gap-1 text-[10px] font-black uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-all"
      >
        <Eye size={12} /> Preview
      </button>

      {/* NEW EDIT BUTTON */}
      <button
        onClick={() =>
          router.push(`/admin/courses/${courseId}/lessons/${lessonId}/edit`)
        }
        className="flex items-center gap-1 text-[10px] font-black uppercase border border-black px-3 py-1 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
      >
        <Edit3 size={12} /> Edit
      </button>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-1 text-[10px] font-black uppercase border border-red-600 text-red-600 px-3 py-1 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
      >
        <Trash2 size={12} /> {isDeleting ? "..." : "Delete"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CourseLockToggleProps {
  courseId: string;
  isLocked: boolean;
}

export default function CourseLockToggle({ courseId, isLocked }: CourseLockToggleProps) {
  const [locked, setLocked] = useState(isLocked);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !locked;

    const { error } = await supabase
      .from("courses")
      .update({ is_locked: nextState })
      .eq("id", courseId);

    if (!error) {
      setLocked(nextState);
      router.refresh(); // Refresh server component data
    } else {
      alert("Failed to modify operational lock parameters.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full flex items-center justify-between p-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
        locked
          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : locked ? (
          <Lock size={16} className="text-rose-600" />
        ) : (
          <Unlock size={16} className="text-slate-500" />
        )}
        <span>{locked ? "Course is Locked" : "Course is Unlocked"}</span>
      </div>
      <span className="text-[10px] text-slate-400 font-bold">
        {locked ? "Unlock" : "Lock"}
      </span>
    </button>
  );
}
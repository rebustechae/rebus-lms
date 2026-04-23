"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowLeft, Clock } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("courses").insert({
      title: formData.get("title"),
      description: formData.get("description"),
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold hover:underline"
      >
        <ArrowLeft size={14} /> BACK TO CONTROL
      </button>

      <header>
        <h2 className="text-4xl font-black uppercase tracking-tighter">
          Create Course
        </h2>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border-2 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest">
            Course Title
          </label>
          <input
            name="title"
            required
            className="w-full border-2 border-black p-4 focus:bg-zinc-50 outline-none transition-colors font-bold text-lg placeholder:text-zinc-300"
            placeholder="Enter course title..."
          />
        </div>

        {/* Estimated Time Input */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} /> Estimated Duration (Minutes)
          </label>
          <input
            type="number"
            name="estimated_time"
            defaultValue={30}
            className="w-full border-2 border-black p-3 font-bold outline-none focus:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
            placeholder="e.g. 60"
            required
          />
          <p className="text-[10px] text-zinc-400 italic">
            Total time for a student to complete modules and the assessment.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest">
            Description
          </label>
          <textarea
            name="description"
            rows={6}
            className="w-full border-2 border-black p-4 focus:bg-zinc-50 outline-none resize-none placeholder:text-zinc-300"
            placeholder="Enter course overview and objectives..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-5 font-black uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "DEPLOY COURSE →"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ChevronLeft, Clock, BookOpen, AlignLeft, Sparkles } from "lucide-react";

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
      estimated_time: parseInt(formData.get("estimated_time") as string),
    });

    if (error) {
      alert(`System Error: ${error.message}`);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 px-4">
      {/* NAVIGATION */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Control Center
      </button>

      {/* HEADER */}
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#00ADEF]/10 p-2 rounded-lg">
                <Sparkles size={20} className="text-[#00ADEF]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Course Architecture</span>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
          Initialize New Protocol
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Define the parameters and objectives for the new educational module.</p>
      </header>

      {/* FORM CONTAINER */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8"
      >
        {/* Course Title */}
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <BookOpen size={14} className="text-[#00ADEF]" /> Course Title
          </label>
          <input
            name="title"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all font-bold text-slate-900 text-lg placeholder:text-slate-300"
            placeholder="e.g. Advanced Structural Integrity"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Estimated Time */}
            <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock size={14} className="text-[#00ADEF]" /> Estimated Duration
            </label>
            <div className="relative group">
                <input
                    type="number"
                    name="estimated_time"
                    defaultValue={30}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:bg-white focus:border-[#00ADEF] transition-all pr-16"
                    placeholder="60"
                    required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MINS</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">
                Approximate completion time for personnel review.
            </p>
            </div>

            {/* Visual Placeholder for layout balance */}
            <div className="hidden md:flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-4">
                <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-tighter leading-tight">
                    Course will be marked as <br /> <span className="text-[#00ADEF]">"Draft"</span> upon initialization
                </p>
            </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <AlignLeft size={14} className="text-[#00ADEF]" /> Executive Summary
          </label>
          <textarea
            name="description"
            rows={5}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:bg-white outline-none focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all text-slate-700 font-medium leading-relaxed resize-none placeholder:text-slate-300"
            placeholder="Define the primary learning outcomes and target audience..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex justify-center items-center gap-3 shadow-lg shadow-slate-200 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Deploy Course
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
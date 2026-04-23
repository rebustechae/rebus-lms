import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, ChevronLeft, Lock, Unlock, ShieldCheck, Mail, BookOpen, Layout } from "lucide-react";
import LessonActions from "../../_components/LessonActions";
import QuizManager from "../../_components/QuizManager";
import PrivacyToggle from "../../_components/PrivacyToggle"; 
import WhitelistManager from "../../_components/WhitelistManager"; 

export default async function CourseDetailAdmin({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await paramsPromise;

  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      course_access (
        id,
        user_email
      )
    `)
    .eq("id", id)
    .single();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4">
      {/* --- NAVIGATION & HEADER --- */}
      <div className="space-y-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Overview
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                Course Protocol
              </span>
              {course?.is_private ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                  <Lock size={12} /> Private
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  <Unlock size={12} /> Public
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
              {course?.title || "Course Registry"}
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-3xl">
              {course?.description || "No description available."}
            </p>
          </div>
          
          <Link
            href={`/admin/courses/${id}/lessons/new`}
            className="bg-[#00ADEF] hover:bg-[#0096d1] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm shadow-cyan-500/20 whitespace-nowrap"
          >
            <Plus size={18} /> Add New Lesson
          </Link>
        </div>
      </div>

      {/* --- ACCESS CONTROL SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-6">
                    <ShieldCheck size={18} className="text-[#00ADEF]" /> 
                    Access Configuration
                </h3>
                <PrivacyToggle courseId={id} isPrivate={course?.is_private || false} />
                <p className="text-[11px] text-slate-400 mt-4 leading-relaxed font-medium uppercase tracking-tight">
                    Switching to private restricts access only to whitelisted personnel below.
                </p>
            </div>
        </div>

        <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-6">
                    <Mail size={18} className="text-[#00ADEF]" /> 
                    Personnel Whitelist
                </h3>
                <WhitelistManager 
                    courseId={id} 
                    initialWhitelist={course?.course_access || []} 
                    isPrivate={course?.is_private || false}
                />
            </div>
        </div>
      </div>

      {/* --- LESSONS LIST --- */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-l-4 border-[#00ADEF] pl-4">
            <div>
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">Syllabus Structure</h3>
                <p className="text-slate-500 text-xs font-medium">Manage module order and content delivery.</p>
            </div>
        </div>

        {lessons?.length === 0 ? (
          <div className="border border-slate-200 border-dashed rounded-2xl p-20 text-center bg-slate-50/50">
            <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Protocol is currently empty</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {lessons?.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-[#00ADEF]/5 group-hover:border-[#00ADEF]/20 group-hover:text-[#00ADEF] transition-all">
                        <span className="text-[10px] font-black leading-none">MOD</span>
                        <span className="text-sm font-bold leading-none mt-1">
                            {lesson.order_index.toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div>
                        <span className="block font-bold text-slate-900 text-lg tracking-tight group-hover:text-[#00ADEF] transition-colors">
                            {lesson.title}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource ID: {lesson.id.split('-')[0]}</span>
                    </div>
                  </div>

                  <LessonActions
                    lessonId={lesson.id}
                    courseId={id}
                    lessonTitle={lesson.title}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* --- FINAL ASSESSMENT SECTION --- */}
      <div className="pt-8">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative shadow-xl shadow-slate-200">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Layout size={18} className="text-[#00ADEF]" />
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-400">Final Assessment</span>
                </div>
                <h3 className="text-3xl font-bold mb-8 tracking-tight">Quiz Management</h3>
                <div className="bg-white/5 p-1 rounded-2xl border border-white/10">
                    <QuizManager courseId={id} />
                </div>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ADEF] opacity-5 blur-[120px] -mr-32 -mt-32" />
        </div>
      </div>
    </div>
  );
}
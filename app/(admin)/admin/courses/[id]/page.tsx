import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, MoveLeft, Lock, Unlock, ShieldCheck, Mail } from "lucide-react";
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

  // Fetch Course with its whitelist (course_access)
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
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="space-y-8">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-xs font-bold hover:underline"
        >
          <MoveLeft size={14} /> BACK TO OVERVIEW
        </Link>

        {/* --- COURSE HEADER --- */}
        <div className="flex justify-between items-start border-b-4 border-black pb-6">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
                {course?.title || "Course Registry"}
              </h1>
              {course?.is_private ? (
                <div className="bg-red-600 text-white p-2 border-2 border-black">
                  <Lock size={20} />
                </div>
              ) : (
                <div className="bg-green-500 text-white p-2 border-2 border-black">
                  <Unlock size={20} />
                </div>
              )}
            </div>
            <p className="text-zinc-500 italic text-lg">
              {course?.description || "No description available."}
            </p>
          </div>
          
          <Link
            href={`/admin/courses/${id}/lessons/new`}
            className="bg-black text-white px-6 py-4 font-black text-xs hover:invert transition-all border-2 border-black flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus size={16} /> ADD LESSON
          </Link>
        </div>

        {/* --- ACCESS CONTROL SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
             <h3 className="font-black uppercase tracking-widest text-sm border-l-4 border-black pl-3 flex items-center gap-2">
               <ShieldCheck size={18} /> Visibility
             </h3>
             <PrivacyToggle courseId={id} isPrivate={course?.is_private || false} />
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-widest text-sm border-l-4 border-black pl-3 flex items-center gap-2">
              <Mail size={18} /> Whitelist Access
            </h3>
            {/* WhitelistManager will handle adding/removing emails */}
            <WhitelistManager 
              courseId={id} 
              initialWhitelist={course?.course_access || []} 
              isPrivate={course?.is_private || false}
            />
          </div>
        </div>

        <hr className="border-t-2 border-black border-dashed" />

        {/* --- LESSONS LIST --- */}
        <div className="grid gap-4">
          <h3 className="font-black uppercase tracking-widest text-sm border-l-4 border-black pl-3">
            Course Syllabus
          </h3>
          {lessons?.length === 0 ? (
            <div className="border-2 border-dashed border-black p-12 text-center text-zinc-400 font-bold uppercase italic bg-zinc-50">
              Course is empty. Initialize first lesson.
            </div>
          ) : (
            <div className="border-2 border-black divide-y-2 divide-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {lessons?.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-6 flex justify-between items-center hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs bg-black text-white px-3 py-1">
                      MOD_{lesson.order_index.toString().padStart(2, '0')}
                    </span>
                    <span className="font-black uppercase text-xl tracking-tight">{lesson.title}</span>
                  </div>

                  <LessonActions
                    lessonId={lesson.id}
                    courseId={id}
                    lessonTitle={lesson.title}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- FINAL ASSESSMENT SECTION --- */}
      <div className="pt-10 border-t-4 border-black">
        <h3 className="font-black uppercase tracking-[0.2em] text-sm mb-6 bg-black text-white inline-block px-4 py-1">
          Quiz
        </h3>
        <QuizManager courseId={id} />
      </div>
    </div>
  );
}
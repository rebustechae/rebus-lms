"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect, use, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  ChevronLeft,
  BookOpen,
  Loader2,
} from "lucide-react";

import VideoPlayer from "@/app/(dashboard)/dashboard/_components/VideoPlayer";
import { markLessonComplete } from "../../actions";

export default function LessonContentPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const footerRef = useRef<HTMLDivElement>(null);

  const [lesson, setLesson] = useState<any>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isFirstViewing, setIsFirstViewing] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const supabase = createClient();

  // FEATURE: Auto-scroll to footer when video finishes
  useEffect(() => {
    if (videoCompleted && !loading && isFirstViewing) {
      setTimeout(() => {
        footerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }
  }, [videoCompleted, loading, isFirstViewing]);

  useEffect(() => {
    async function getLessonData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/");

      // 1. Fetch current lesson AND join the module to get its order_index
      const { data: lessonData } = await supabase
        .from("lessons")
        .select(`
          *,
          modules!inner (
            id,
            order_index
          )
        `)
        .eq("id", params.lessonId)
        .single();

      if (!lessonData) return router.push(`/dashboard/courses/${params.id}`);

      // 2. FIXED GATEKEEPER LOGIC
      // We look for lessons where (Module Index is lower) OR (Same Module AND Lesson Index is lower)
      const { data: previousLessons } = await supabase
        .from("lessons")
        .select(`
          id,
          modules!inner ( order_index )
        `)
        .eq("course_id", params.id)
        .or(`modules.order_index.lt.${lessonData.modules.order_index},and(module_id.eq.${lessonData.module_id},order_index.lt.${lessonData.order_index})`);

      if (previousLessons && previousLessons.length > 0) {
        const previousIds = previousLessons.map((l) => l.id);
        const { data: completedProgress } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .in("lesson_id", previousIds);

        // If you haven't finished every single previous lesson, boot to directory
        if ((completedProgress?.length || 0) < previousIds.length) {
          return router.push(`/dashboard/courses/${params.id}?error=sequential`);
        }
      }

      setLesson(lessonData);

      // 3. Handle PDF Fetching
      if (lessonData.format === "reading" && lessonData.pdf_url) {
        try {
          const response = await fetch(lessonData.pdf_url);
          const blob = await response.blob();
          const localUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(localUrl);
        } catch (e) { console.error(e); }
      }

      // 4. Progress Check
      const { data: progress } = await supabase
        .from("user_progress")
        .select("id")
        .eq("lesson_id", params.lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsFirstViewing(!progress);
      if (progress) setVideoCompleted(true);

      // 5. Navigation Logic (Finding the next ID)
      const { data: sameModuleLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("module_id", lessonData.module_id)
        .order("order_index", { ascending: true });

      const currentIndex = sameModuleLessons?.findIndex((l) => l.id === params.lessonId) ?? -1;

      if (currentIndex !== -1 && currentIndex < (sameModuleLessons?.length ?? 0) - 1) {
        setNextLessonId(sameModuleLessons![currentIndex + 1].id);
      } else {
        const { data: nextModule } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", params.id)
          .gt("order_index", lessonData.modules.order_index)
          .order("order_index", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextModule) {
          const { data: firstLesson } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", nextModule.id)
            .order("order_index", { ascending: true })
            .limit(1)
            .maybeSingle();
          setNextLessonId(firstLesson?.id || null);
        } else {
          setNextLessonId(null);
        }
      }
      setLoading(false);
    }
    getLessonData();
  }, [params.lessonId, params.id, router, supabase]);

  // Cleanup
  useEffect(() => {
    return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); };
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (lesson?.format === "reading") setVideoCompleted(true);
  }, [lesson]);

  // Save Progress Action
  useEffect(() => {
    if (loading || completionSaved || !videoCompleted || !isFirstViewing) return;
    const save = async () => {
      setCompletionSaved(true);
      await markLessonComplete(params.id, params.lessonId);
      router.refresh();
    };
    save();
  }, [videoCompleted, loading, completionSaved, isFirstViewing, params.id, params.lessonId, router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
      <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
      <p className="font-bold text-sm uppercase tracking-widest">Loading Lesson...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto pt-16 md:pt-32 pb-24 px-4">
        <button onClick={() => router.push(`/dashboard/courses/${params.id}`)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#00ADEF] mb-10 uppercase tracking-widest group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </button>

        <header className="mb-10 md:mb-16">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${lesson.format === "reading" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
            {lesson.format === "reading" ? "Reading Material" : `Module Sequence ${lesson.order_index}`}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-slate-900 mt-8 mb-12">{lesson.title}</h1>

          {lesson.format === "video" && lesson.video_url ? (
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <VideoPlayer videoUrl={lesson.video_url} captionsUrl={lesson.captions_url} isFirstViewing={isFirstViewing} onVideoComplete={() => setVideoCompleted(true)} />
            </div>
          ) : lesson.format === "reading" && lesson.pdf_url ? (
            <div className="w-full h-[600px] md:h-[900px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative">
              {!pdfBlobUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white">
                  <Loader2 className="animate-spin mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">Generating Preview...</span>
                </div>
              ) : (
                <iframe src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`} className="w-full h-full" style={{ border: "none" }} />
              )}
            </div>
          ) : null}
        </header>

        <article className="prose prose-slate max-w-none text-base md:text-lg select-none leading-relaxed text-slate-700 
          [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-4 
          [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-4 
          [&>li]:pl-2 [&>p]:mb-6 
          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
          [&>p>a]:text-[#00ADEF] [&>p>a]:font-bold [&>p>a]:underline">
          <ReactMarkdown key={params.lessonId}>{lesson.content}</ReactMarkdown>
        </article>

        <footer ref={footerRef} className="mt-16 pt-10 border-t border-slate-100 pb-20 scroll-mt-24">
          <div className="flex flex-col items-center gap-8">
            <button
              disabled={!videoCompleted}
              onClick={() => {
                router.push(nextLessonId ? `/dashboard/courses/${params.id}/lessons/${nextLessonId}` : `/dashboard/courses/${params.id}/final-quiz`);
              }}
              className={`w-full py-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 text-white
                ${videoCompleted ? (nextLessonId ? "bg-[#00ADEF] hover:bg-[#0098D4] shadow-xl shadow-blue-200" : "bg-[#662D91] shadow-xl shadow-purple-200") : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
            >
              {videoCompleted && <CheckCircle2 size={18} />}
              {!videoCompleted ? "Finish Video to Unlock" : nextLessonId ? "Next Lesson" : "Final Assessment"}
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect, use, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  FileText,
  ExternalLink,
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
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const [lesson, setLesson] = useState<any>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [videoCompleted, setVideoCompleted] = useState(false);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [isFirstViewing, setIsFirstViewing] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);

  const supabase = createClient();

  // Unified unlock logic: Checks if required components (Video/PDF) are finished
  const canContinue =
    (!lesson?.video_url || videoCompleted) &&
    (!lesson?.pdf_url || readingCompleted);

  useEffect(() => {
    if (!loading && lesson) {
      const scrollTimeout = setTimeout(() => {
        videoSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [loading, params.lessonId]);

  useEffect(() => {
    if (canContinue && !loading) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      const scrollTimeout = setTimeout(() => {
        footerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 600);
      return () => clearTimeout(scrollTimeout);
    }
  }, [canContinue, loading]);

  useEffect(() => {
    async function getLessonData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/");

      const { data: lessonData } = await supabase
        .from("lessons")
        .select(`*, modules!inner (id, order_index)`)
        .eq("id", params.lessonId)
        .single();

      if (!lessonData) return router.push(`/dashboard/courses/${params.id}`);

      const { data: previousLessons } = await supabase
        .from("lessons")
        .select(`id, modules!inner ( order_index )`)
        .eq("course_id", params.id)
        .or(
          `modules.order_index.lt.${lessonData.modules.order_index},and(module_id.eq.${lessonData.module_id},order_index.lt.${lessonData.order_index})`,
        );

      if (previousLessons && previousLessons.length > 0) {
        const previousIds = previousLessons.map((l) => l.id);
        const { data: completedProgress } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .in("lesson_id", previousIds);

        if ((completedProgress?.length || 0) < previousIds.length) {
          return router.push(
            `/dashboard/courses/${params.id}?error=sequential`,
          );
        }
      }

      setLesson(lessonData);

      const { data: progress } = await supabase
        .from("user_progress")
        .select("id")
        .eq("lesson_id", params.lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsFirstViewing(!progress);

      if (progress) {
        setVideoCompleted(true);
        setReadingCompleted(true);
      }

      const { data: sameModuleLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("module_id", lessonData.module_id)
        .order("order_index", { ascending: true });

      const currentIndex =
        sameModuleLessons?.findIndex((l) => l.id === params.lessonId) ?? -1;

      if (
        currentIndex !== -1 &&
        currentIndex < (sameModuleLessons?.length ?? 0) - 1
      ) {
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
        }
      }
      setLoading(false);
    }
    getLessonData();
    setVideoCompleted(false);
    setReadingCompleted(false);
    setCompletionSaved(false);
  }, [params.lessonId, params.id, router, supabase]);

  useEffect(() => {
    if (loading || completionSaved || !canContinue || !isFirstViewing) return;
    const save = async () => {
      setCompletionSaved(true);
      await markLessonComplete(params.id, params.lessonId);
      router.refresh();
    };
    save();
  }, [
    canContinue,
    loading,
    completionSaved,
    isFirstViewing,
    params.id,
    params.lessonId,
    router,
  ]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
        <p className="font-bold text-xs uppercase tracking-widest">
          Loading Module...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto pt-16 md:pt-32 pb-24 px-4">
        <button
          onClick={() => router.push(`/dashboard/courses/${params.id}`)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#00ADEF] mb-10 uppercase tracking-widest group transition-colors"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Directory
        </button>

        <header className="mb-10 md:mb-16 relative">
          {/* LOGO IN TOP RIGHT */}
          <div className="absolute top-0 right-0">
            <img
              src="/logo.png"
              alt="Rebus Holdings Logo"
              className="h-10 md:h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          <span className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest bg-slate-100 text-slate-500">
            Lesson {lesson.order_index}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-slate-900 mt-8 mb-12 leading-tight pr-24">
            {lesson.title}
          </h1>

          {lesson.format === "video" && lesson.video_url && (
            <div
              ref={videoSectionRef}
              className="rounded-xl overflow-hidden shadow-2xl bg-black scroll-mt-24 mb-12"
            >
              <VideoPlayer
                videoUrl={lesson.video_url}
                captionsUrl={lesson.captions_url}
                isFirstViewing={isFirstViewing}
                muted={false}
                onVideoComplete={() => setVideoCompleted(true)}
              />
            </div>
          )}
        </header>

        {/* READING MATERIAL SECTION */}
        {lesson.pdf_url && (
          <section className="mb-16 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-900">
                  <FileText size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Learning Material
                  </h3>
                  {readingCompleted && (
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                      Read
                    </span>
                  )}
                </div>
              </div>
              <a
                href={lesson.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-[#00ADEF] hover:underline"
              >
                Open in New Tab <ExternalLink size={14} />
              </a>
            </div>

            <div className="w-full h-[600px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
              <iframe
                // split('?')[0] takes "https://site.com/file.pdf?download=false"
                // and turns it into "https://site.com/file.pdf"
                src={`${lesson.pdf_url.split("?")[0]}#toolbar=0&navpanes=0`}
                className="w-full h-full"
                title="Reading Material"
                onLoad={() => setReadingCompleted(true)}
              />
            </div>
          </section>
        )}

        <article
          className="prose prose-slate max-w-none text-base md:text-lg select-none leading-relaxed text-slate-700
          [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-4
          [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-4
          [&>li]:pl-2 [&>p]:mb-6
          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
          [&>p>a]:text-[#00ADEF] [&>p>a]:font-bold [&>p>a]:underline"
        >
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </article>

        <footer
          ref={footerRef}
          className="mt-16 pt-10 border-t border-slate-100 pb-20 scroll-mt-32"
        >
          <div className="flex flex-col items-center gap-8">
            <button
              disabled={!canContinue}
              onClick={() => {
                router.push(
                  nextLessonId
                    ? `/dashboard/courses/${params.id}/lessons/${nextLessonId}`
                    : `/dashboard/courses/${params.id}/final-quiz`,
                );
              }}
              className={`w-full py-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 text-white
                ${
                  canContinue
                    ? nextLessonId
                      ? "bg-[#00ADEF] hover:bg-[#0098D4] shadow-xl shadow-blue-200"
                      : "bg-[#662D91] shadow-xl shadow-purple-200"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
            >
              {canContinue && <CheckCircle2 size={18} />}
              {!canContinue
                ? lesson.video_url && !videoCompleted
                  ? "Complete video to continue"
                  : "Loading reading material..."
                : nextLessonId
                  ? "Next Lesson"
                  : "Final Assessment"}
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

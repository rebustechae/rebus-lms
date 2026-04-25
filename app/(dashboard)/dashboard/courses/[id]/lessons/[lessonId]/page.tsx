"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, ChevronLeft } from "lucide-react";

import LessonQuiz from "@/app/(dashboard)/dashboard/_components/LessonQuiz";
import VideoPlayer from "@/app/(dashboard)/dashboard/_components/VideoPlayer";
import { markLessonComplete } from "../../actions";

export default function LessonContentPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isFirstViewing, setIsFirstViewing] = useState(false);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function getLessonData() {
      setVideoCompleted(false);
      setQuizPassed(false);
      setCompletionSaved(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessonData, error: lError } = await supabase
        .from("lessons")
        .select("id, title, content, order_index, video_url")
        .eq("id", params.lessonId)
        .maybeSingle();

      if (!lessonData || lError) return;

      const { data: quizData } = await supabase
        .from("quizzes")
        .select("id, question, options, correct_answer")
        .eq("lesson_id", params.lessonId);

      setQuiz(quizData || []);

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("lesson_id", params.lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      const isFirstView = !progressData;
      setIsFirstViewing(isFirstView);

      if (progressData) {
        setVideoCompleted(true);
        setQuizPassed(true);
      }

      const { data: allLessons } = await supabase
        .from("lessons")
        .select("id, order_index")
        .eq("course_id", params.id)
        .order("order_index", { ascending: true });

      if (allLessons) {
        const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId);
        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
          setNextLessonId(allLessons[currentIndex + 1].id);
        }
      }

      setLesson(lessonData);
      setLoading(false);
    }
    getLessonData();
  }, [params.lessonId, params.id, supabase]);

  useEffect(() => {
    if (loading || completionSaved || !videoCompleted || (quiz.length > 0 && !quizPassed) || !isFirstViewing) return;

    (async () => {
      try {
        setCompletionSaved(true);
        await markLessonComplete(params.id, params.lessonId);
        router.refresh();
      } catch (error) {
        setCompletionSaved(false);
        console.error(error);
      }
    })();
  }, [videoCompleted, completionSaved, loading, params.id, params.lessonId, quiz.length, quizPassed, router, isFirstViewing]);

  const handleQuizPass = async () => {
    setQuizPassed(true);
    try {
      setCompletionSaved(true);
      await markLessonComplete(params.id, params.lessonId);
      router.refresh();
    } catch (error) {
      setCompletionSaved(false);
      console.error(error);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Loading lesson...</div>;
  if (isLocked) return <div className="p-20 text-center font-bold">Locked Section...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Logo - Adjusted for mobile visibility (hidden on very small screens or moved) */}
      <div className="fixed top-4 right-4 md:top-12 md:right-12 z-50 pointer-events-none">
        <img
          src="/logo.png"
          alt="Rebus LMS"
          className="h-8 md:h-16 w-auto object-contain opacity-50 md:opacity-100"
        />
      </div>

      <main className="max-w-4xl mx-auto pt-16 md:pt-32 pb-24 px-4 sm:px-6 md:px-8">
        {/* 2. Back Button */}
        <button
          onClick={() => router.push(`/dashboard/courses/${params.id}`)}
          className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-400 hover:text-[#00ADEF] transition-colors mb-6 md:mb-10 group uppercase tracking-widest"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </button>

        <header className="mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <span className="bg-slate-100 text-slate-500 text-[9px] md:text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
              Module {lesson.order_index}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 md:mb-12">
            {lesson.title}
          </h1>

          {/* Video Player Container - Ensure responsive aspect ratio via CSS if component doesn't */}
          {lesson.video_url && (
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
              <VideoPlayer
                videoUrl={lesson.video_url}
                isFirstViewing={isFirstViewing}
                onVideoProgress={(progress) => {}}
                onVideoComplete={() => setVideoCompleted(true)}
              />
            </div>
          )}
        </header>

        {/* 3. Content Section - Typography scaling for mobile */}
        <article className="prose prose-slate max-w-none text-base md:text-lg select-none leading-relaxed text-slate-700 
          [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-4 
          [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-4 
          [&>li]:pl-2 [&>p]:mb-6 
          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
          [&>p>a]:text-[#00ADEF] [&>p>a]:font-bold [&>p>a]:underline">
          <ReactMarkdown key={params.lessonId}>{lesson.content}</ReactMarkdown>
        </article>

        {/* QUIZ SECTION */}
        {quiz.length > 0 && (
          <div className="mt-16 md:mt-24 pt-12 border-t border-slate-100">
            <LessonQuiz questions={quiz} onPass={handleQuizPass} />
          </div>
        )}

        <footer className="mt-16 md:mt-24 pt-10 border-t border-slate-100">
          <div className="flex flex-col items-center gap-8">
            <button
              disabled={!videoCompleted || (quiz.length > 0 && !quizPassed)}
              onClick={() =>
                router.push(
                  nextLessonId
                    ? `/dashboard/courses/${params.id}/lessons/${nextLessonId}`
                    : `/dashboard/courses/${params.id}/final-quiz`,
                )
              }
              className={`w-full py-4 md:py-6 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-white uppercase tracking-widest text-xs md:text-sm
                ${
                  videoCompleted && (quiz.length === 0 || quizPassed)
                    ? nextLessonId
                      ? "bg-[#00ADEF] hover:bg-[#0098D4] active:scale-95 shadow-xl shadow-blue-200"
                      : "bg-[#662D91] hover:bg-[#581F7D] active:scale-95 shadow-xl shadow-purple-200"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
            >
              {videoCompleted ? <CheckCircle2 size={18} /> : null}
              {videoCompleted
                ? nextLessonId
                  ? "Next Module"
                  : "Final Assessment"
                : "Finish Video to Unlock"}
              <ChevronRight size={18} />
            </button>

            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
              &copy; 2026 Rebus Holdings
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
"use client";

import ReactMarkdown from "react-markdown";

import { useState, useEffect, use } from "react";

import { createClient } from "@/utils/supabase/client";

import { notFound, useRouter } from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  Lock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import LessonQuiz from "@/app/(dashboard)/dashboard/_components/LessonQuiz";
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

  const [scrollProgress, setScrollProgress] = useState(0);

  const [isFinished, setIsFinished] = useState(false);

  const [loading, setLoading] = useState(true);

  const [isLocked, setIsLocked] = useState(false);

  const [quiz, setQuiz] = useState<any[]>([]);

  const [quizPassed, setQuizPassed] = useState(false);

  const supabase = createClient();

  // EFFECT 1: FETCH DATA & LOCK LOGIC

  useEffect(() => {
    async function getLessonData() {
      // Reset states on module change to prevent carry-over bugs

      setIsFinished(false);

      setQuizPassed(false);

      setScrollProgress(0);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: lessonData } = await supabase

        .from("lessons")

        .select("*")

        .eq("id", params.lessonId)

        .single();

      if (!lessonData) notFound();

      // Lock Logic: Check if previous lesson is completed
      if (lessonData.order_index > 1) {
        const { data: prevLesson } = await supabase
          .from("lessons")
          .select("id")
          .eq("course_id", params.id)
          .eq("order_index", lessonData.order_index - 1)
          .maybeSingle();

        if (prevLesson) {
          const { data: prevProgress, error } = await supabase
            .from("user_progress")
            .select("*")
            .eq("lesson_id", prevLesson.id)
            .eq("user_id", user.id)
            .maybeSingle();

          // If no progress found for previous lesson, this lesson is locked
          if (!prevProgress) {
            setIsLocked(true);
          }
        }
      }

      const { data: quizData } = await supabase

        .from("quizzes")

        .select("*")

        .eq("lesson_id", params.lessonId);

      setQuiz(quizData || []);

      const { data: progressData } = await supabase

        .from("user_progress")

        .select("*")

        .eq("lesson_id", params.lessonId)

        .eq("user_id", user.id)

        .single();

      if (progressData) {
        setIsFinished(true);

        setQuizPassed(true);
      }

      const { data: allLessons } = await supabase

        .from("lessons")

        .select("id, order_index")

        .eq("course_id", params.id)

        .order("order_index", { ascending: true });

      if (allLessons) {
        const currentIndex = allLessons.findIndex(
          (l) => l.id === params.lessonId,
        );

        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
          setNextLessonId(allLessons[currentIndex + 1].id);
        }
      }

      setLesson(lessonData);

      setLoading(false);
    }

    getLessonData();
  }, [params.lessonId, params.id, supabase]);

  // EFFECT 2: SCROLL PROGRESS & AUTO-COMPLETE (ONLY IF NO QUIZ)
  useEffect(() => {
    if (isLocked || loading) return;

    const handleScroll = async () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (totalScroll <= 0) return;

      const currentScroll = window.scrollY;

      const progress = (currentScroll / totalScroll) * 100;

      setScrollProgress(progress);

      if (progress > 95 && !isFinished && quiz.length === 0) {
        setIsFinished(true);

        try {
          await markLessonComplete(params.id, params.lessonId);
          router.refresh();
        } catch (error) {
          console.error("Failed to mark lesson complete:", error);
          setIsFinished(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [params.lessonId, params.id, isFinished, isLocked, quiz.length, loading]);

  const handleQuizPass = async () => {
    setQuizPassed(true);

    setIsFinished(true); // Manually set finished when quiz passes

    try {
      await markLessonComplete(params.id, params.lessonId);
      router.refresh();
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
      setQuizPassed(false);
      setIsFinished(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 font-medium animate-pulse gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#00ADEF] animate-spin" />
        Syncing Module Data...
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center px-6">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Lock size={32} className="text-slate-300" />
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Module Locked
        </h2>

        <p className="text-slate-500 mb-10 leading-relaxed">
          To maintain protocol integrity, you must complete all preceding
          modules in the course sequence before accessing this section.
        </p>

        <Link
          href={`/dashboard/courses/${params.id}`}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={18} /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-100 z-40 flex items-center px-6 justify-between">
        <Link
          href={`/dashboard/courses/${params.id}`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] transition-colors"
        >
          <ArrowLeft size={16} /> <span>Back to Overview</span>
        </Link>

        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Current Section
          </span>

          <span className="text-sm font-bold text-slate-900">
            {lesson.title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {quizPassed && (
            <CheckCircle2 size={18} className="text-emerald-500" />
          )}

          <div className="text-xs font-bold text-slate-400 tabular-nums">
            {Math.round(scrollProgress)}%
          </div>
        </div>

        <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-100">
          <div
            className="h-full bg-[#00ADEF] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto pt-32 pb-24 px-6">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Module {lesson.order_index}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
            {lesson.title}
          </h1>
        </header>

        <article className="text-lg select-none leading-relaxed text-zinc-800 [&>ul]:list-disc [&>ul]:ml-8 [&>ul]:my-4 [&>ol]:list-decimal [&>ol]:ml-8 [&>ol]:my-4 [&>li]:pl-2 [&>p]:mb-4 [&>p>a]:text-black [&>p>a]:underline min-h-[70vh]">
          <ReactMarkdown key={params.lessonId}>{lesson.content}</ReactMarkdown>
        </article>

        {quiz.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Knowledge Check
              </h2>

              <p className="text-slate-500 text-sm">
                Verify your understanding to complete this module.
              </p>
            </div>

            <LessonQuiz questions={quiz} onPass={handleQuizPass} />
          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-slate-100">
          <div className="flex flex-col items-center gap-6">
            <button
              disabled={!isFinished || (quiz.length > 0 && !quizPassed)}
              onClick={() =>
                router.push(
                  nextLessonId
                    ? `/dashboard/courses/${params.id}/lessons/${nextLessonId}`
                    : `/dashboard/courses/${params.id}/final-quiz`,
                )
              }
              className={`w-full py-5 rounded-xl font-bold transition-all flex items-center justify-center gap-2

                ${
                  isFinished && (quiz.length === 0 || quizPassed)
                    ? (nextLessonId ? "bg-[#00ADEF]" : "bg-[#662D91]") +
                      " text-white shadow-lg"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              {nextLessonId
                ? "Continue to Next Module"
                : "Take Final Assessment"}

              <ChevronRight size={18} />
            </button>

            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em]">
              &copy; 2026 Rebus Holdings
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Unlock, ChevronRight, AlertCircle } from "lucide-react";
import LessonQuiz from "@/app/(dashboard)/dashboard/_components/LessonQuiz";

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
  const [isLocked, setIsLocked] = useState(false); // New lock state
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function getLessonData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", params.lessonId)
        .single();

      if (!lessonData) notFound();

      if (lessonData.order_index > 1) {
        const { data: prevLesson } = await supabase
          .from("lessons")
          .select("id")
          .eq("course_id", params.id)
          .eq("order_index", lessonData.order_index - 1)
          .single();

        if (prevLesson) {
          const { data: prevProgress } = await supabase
            .from("user_progress")
            .select("*")
            .eq("lesson_id", prevLesson.id)
            .eq("user_id", user.id)
            .single();

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
        const currentIndex = allLessons.findIndex(l => l.id === params.lessonId);
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
    if (isLocked) return;

    const handleScroll = async () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalScroll <= 0 ? 100 : (currentScroll / totalScroll) * 100;
      setScrollProgress(progress);

      if (progress > 95 && !isFinished) {
        setIsFinished(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user && quiz.length === 0) { 
          await supabase.from("user_progress").upsert({
            user_id: user.id,
            lesson_id: params.lessonId,
          });
          router.refresh();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [params.lessonId, isFinished, isLocked, quiz.length, supabase, router]);

  const handleQuizPass = async () => {
    setQuizPassed(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_progress").upsert({
        user_id: user.id,
        lesson_id: params.lessonId,
      });
      router.refresh();
    }
  };

  if (loading) return <div className="p-20 font-black animate-pulse uppercase">Syncing data...</div>;

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
        <div className="flex justify-center"><Lock size={64} className="text-zinc-200" /></div>
        <h2 className="text-4xl font-black uppercase italic">Module Locked</h2>
        <p className="text-zinc-500 font-bold">You must complete the previous section before accessing this content.</p>
        <Link href={`/dashboard/courses/${params.id}`} className="inline-block border-2 border-black px-8 py-4 font-black uppercase hover:bg-black hover:text-white transition-all">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-10 relative">
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-100 z-50">
        <div className="h-full bg-black transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <Link href={`/dashboard/courses/${params.id}`} className="flex items-center gap-2 text-xs font-bold hover:underline">
        <ArrowLeft size={14} /> BACK TO COURSE SYLLABUS
      </Link>

      <article className="min-h-[110vh] pb-20 border-b-2 border-black border-dashed">
        <header className="space-y-2 mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Section {lesson.order_index}</p>
          <h1 className="text-5xl font-black uppercase tracking-tighter border-b-2 border-black pb-4">{lesson.title}</h1>
        </header>

        <div className="text-lg leading-relaxed text-zinc-800 [&>ul]:list-disc [&>ul]:ml-8 [&>ul]:my-4 [&>ol]:list-decimal [&>ol]:ml-8 [&>ol]:my-4 [&>li]:pl-2 [&>p]:mb-4 [&>p>a]:text-black [&>p>a]:underline">
          <ReactMarkdown key={params.lessonId}>{lesson.content}</ReactMarkdown>
        </div>
      </article>

      {/* QUIZ SECTION */}
      {quiz.length > 0 && (
        <div className="py-10">
          <LessonQuiz questions={quiz} onPass={handleQuizPass} />
        </div>
      )}

      {/* Completion Section */}
      <div className="flex flex-col items-center gap-6 pb-20">
        <button
          disabled={!isFinished || (quiz.length > 0 && !quizPassed)}
          onClick={() => {
            if (nextLessonId) router.push(`/dashboard/courses/${params.id}/lessons/${nextLessonId}`);
            else router.push(`/dashboard/courses/${params.id}`);
          }}
          className={`w-full py-6 font-black uppercase tracking-[0.2em] transition-all border-2 border-black flex items-center justify-center gap-2
            ${isFinished && (quiz.length === 0 || quizPassed)
                ? "bg-black text-white hover:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"}`}
        >
          {nextLessonId ? "Continue to Next Module" : "Return to Course Directory"} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
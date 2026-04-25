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

  // Lesson States
  const [lesson, setLesson] = useState<any>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Video/Completion States
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isFirstViewing, setIsFirstViewing] = useState(false);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);

  const supabase = createClient();

  // EFFECT 1: FETCH DATA
  useEffect(() => {
    async function getLessonData() {
      setVideoCompleted(false);
      setQuizPassed(false);
      setCompletionSaved(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Lesson Data
      const { data: lessonData, error: lError } = await supabase
        .from("lessons")
        .select("id, title, content, order_index, video_url")
        .eq("id", params.lessonId)
        .maybeSingle();

      if (!lessonData || lError) {
        console.error("Lesson fetch error:", lError);
        return;
      }

      // 2. Fetch Quiz
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("id, question, options, correct_answer")
        .eq("lesson_id", params.lessonId);

      setQuiz(quizData || []);

      // 3. Fetch Progress to determine if first viewing
      const { data: progressData, error: pError } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("lesson_id", params.lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (pError) {
        console.error("Progress fetch error:", pError.message);
      }

      // If no progress record exists, this is first viewing
      const isFirstView = !progressData;
      setIsFirstViewing(isFirstView);

      // If already completed, mark video as done
      if (progressData) {
        setVideoCompleted(true);
        setQuizPassed(true);
      }

      // 4. Fetch Next Lesson ID for the button
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

  // EFFECT 2: PERSIST COMPLETION ONCE VIDEO COMPLETES (first viewing only)
  useEffect(() => {
    if (loading) return;
    if (completionSaved) return;
    if (!videoCompleted) return;
    if (quiz.length > 0 && !quizPassed) return;
    if (!isFirstViewing) return; // Only auto-save on first viewing

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
  }, [
    videoCompleted,
    completionSaved,
    loading,
    params.id,
    params.lessonId,
    quiz.length,
    quizPassed,
    router,
    isFirstViewing,
  ]);

  // Quiz Pass Handler
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

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse">Loading lesson...</div>
    );
  if (isLocked)
    return <div className="p-20 text-center">Locked Section...</div>;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto pt-32 pb-24 px-6">
        <button
          onClick={() => router.push(`/dashboard/courses/${params.id}`)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] transition-colors mb-8 group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Course
        </button>

        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Module {lesson.order_index}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
            {lesson.title}
          </h1>

          {/* Video Player */}
          {lesson.video_url && (
            <VideoPlayer
              videoUrl={lesson.video_url}
              isFirstViewing={isFirstViewing}
              onVideoProgress={(progress) => {
                // Optional: track video progress for analytics
              }}
              onVideoComplete={() => setVideoCompleted(true)}
            />
          )}
        </header>

        {/* Content Section */}
        <article className="text-lg select-none leading-relaxed text-zinc-800 [&>ul]:list-disc [&>ul]:ml-8 [&>ul]:my-4 [&>ol]:list-decimal [&>ol]:ml-8 [&>ol]:my-4 [&>li]:pl-2 [&>p]:mb-4 [&>p>a]:text-black [&>p>a]:underline">
          <ReactMarkdown key={params.lessonId}>{lesson.content}</ReactMarkdown>
        </article>

        {/* QUIZ SECTION */}
        {quiz.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-100">
            <LessonQuiz questions={quiz} onPass={handleQuizPass} />
          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-slate-100">
          <div className="flex flex-col items-center gap-6">
            {/* GATEKEEPER LOGIC ON NEXT BUTTON */}
            <button
              disabled={!videoCompleted || (quiz.length > 0 && !quizPassed)}
              onClick={() =>
                router.push(
                  nextLessonId
                    ? `/dashboard/courses/${params.id}/lessons/${nextLessonId}`
                    : `/dashboard/courses/${params.id}/final-quiz`,
                )
              }
              className={`w-full py-5 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-white
                ${
                  videoCompleted && (quiz.length === 0 || quizPassed)
                    ? nextLessonId
                      ? "bg-[#00ADEF] hover:bg-[#0098D4] active:bg-[#0085BD] shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-95"
                      : "bg-[#662D91] hover:bg-[#581F7D] active:bg-[#4A186E] shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              {videoCompleted ? <CheckCircle2 size={20} /> : <span>▶</span>}
              {videoCompleted
                ? nextLessonId
                  ? "Continue to Next Module"
                  : "Take Final Assessment"
                : "Complete the video to continue"}
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

"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { RefreshCcw, Award, ChevronRight, ArrowLeft, Lock, Loader2, Timer, AlertCircle } from "lucide-react";
import Link from "next/link";
import CertificateGenerator from "../../../_components/CertificateGenerator";

export default function FinalCourseQuiz({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  
  const [isLocked, setIsLocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  // --- DYNAMIC TITLE & USER DATA ---
  const [courseTitle, setCourseTitle] = useState("");
  const [userMetadata, setUserMetadata] = useState<any>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const QUIZ_DURATION = 30 * 60;

  const supabase = createClient();

  useEffect(() => {
    const savedAnswers = sessionStorage.getItem(`quiz_answers_${params.id}`);
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

    const startTime = sessionStorage.getItem(`quiz_start_time_${params.id}`);
    if (startTime) {
      setHasStarted(true); 
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      const remaining = QUIZ_DURATION - elapsed;
      if (remaining <= 0) {
        handleReset();
      } else {
        setTimeLeft(remaining);
      }
    }
  }, [params.id]);

  const startQuiz = () => {
    const now = Date.now().toString();
    sessionStorage.setItem(`quiz_start_time_${params.id}`, now);
    setTimeLeft(QUIZ_DURATION);
    setHasStarted(true);
  };

  useEffect(() => {
    if (timeLeft === null || submitted || isLocked || !hasStarted) return;
    if (timeLeft <= 0) {
      alert("Time is up! The quiz will now reset.");
      handleReset();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, isLocked, hasStarted]);

  const handleReset = () => {
    sessionStorage.removeItem(`quiz_answers_${params.id}`);
    sessionStorage.removeItem(`quiz_start_time_${params.id}`);
    sessionStorage.removeItem(`quiz_order_${params.id}`);
    window.location.reload();
  };

  const handleAnswerChange = (idx: number, opt: string) => {
    const newAnswers = { ...answers, [idx]: opt };
    setAnswers(newAnswers);
    sessionStorage.setItem(`quiz_answers_${params.id}`, JSON.stringify(newAnswers));
  };

  useEffect(() => {
    async function validateAndFetch() {
      setCheckingAccess(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/");

      // --- LOGIC: FETCH USER DATA & COURSE TITLE ---
      setUserMetadata(user.user_metadata);

      const { data: courseData } = await supabase
        .from("courses")
        .select("title")
        .eq("id", params.id)
        .single();
      
      if (courseData) setCourseTitle(courseData.title);

      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("course_id", params.id);

      const { data: progress } = await supabase
        .from("user_progress")
        .select(`lesson_id, lessons!inner(course_id)`)
        .eq("user_id", user.id)
        .eq("lessons.course_id", params.id);

      const completedCount = progress?.length || 0;

      if (totalLessons && completedCount < totalLessons) {
        setIsLocked(true);
        setCheckingAccess(false);
        return;
      }

      const sessionKey = `quiz_order_${params.id}`;
      const savedOrder = sessionStorage.getItem(sessionKey);

      if (savedOrder) {
        setQuestions(JSON.parse(savedOrder));
      } else {
        const { data } = await supabase.from("quizzes").select("*").eq("course_id", params.id);
        if (data) {
          const randomizedData = data
            .map((q) => ({
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5),
            }))
            .sort(() => Math.random() - 0.5);
          sessionStorage.setItem(sessionKey, JSON.stringify(randomizedData));
          setQuestions(randomizedData);
        }
      }
      setCheckingAccess(false);
    }
    validateAndFetch();
  }, [params.id, supabase, router]);

  const calculateResults = async () => {
    if (questions.length === 0 || Object.keys(answers).length < questions.length) return;

    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correct++;
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    setFinalScore(scorePercent);
    setSubmitted(true);

    if (scorePercent >= 90) {
      sessionStorage.removeItem(`quiz_answers_${params.id}`);
      sessionStorage.removeItem(`quiz_start_time_${params.id}`);
      sessionStorage.removeItem(`quiz_order_${params.id}`);
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#00ADEF", "#662D91", "#FFFFFF"] });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("course_completions").upsert({
          user_id: user.id,
          course_id: params.id,
          score: scorePercent,
          passed: true,
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ScoreRing = ({ score }: { score: number }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const isPass = score >= 90;

    return (
      <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
          <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`transition-all duration-1000 ${isPass ? "text-[#662D91]" : "text-rose-500"}`} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-3xl md:text-4xl font-semibold tracking-tighter ${isPass ? "text-[#662D91]" : "text-rose-600"}`}>{score}%</span>
          <span className="text-[8px] md:text-[10px] font-medium uppercase tracking-widest text-slate-400 mt-1">Score</span>
        </div>
      </div>
    );
  };

  if (checkingAccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
      <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Verifying Completion...</p>
    </div>
  );

  if (isLocked) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-6">
        <div className="w-20 h-20 bg-purple-50 text-rebus-purple rounded-3xl flex items-center justify-center mx-auto mb-4"><Lock size={40} /></div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Locked</h2>
        <p className="text-slate-500 text-sm leading-relaxed">Please complete all course modules before attempting the final assessment.</p>
        <button onClick={() => router.push(`/dashboard/courses/${params.id}`)} className="w-full bg-[#00ADEF] text-white py-4 rounded-md font-bold hover:bg-[#0096d1] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-100">
          <ArrowLeft size={18} /> Back to Course
        </button>
      </div>
    </div>
  );

  if (!hasStarted && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-xl w-full bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-rebus-purple text-white rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Final Assessment</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              You are about to begin the final quiz for this course. Once started, you cannot pause the timer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-md border border-slate-100">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-xl font-semibold text-slate-900">30 Minutes</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-md border border-slate-100">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Passing Score</p>
              <p className="text-xl font-semibold text-slate-900">90% or higher</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={startQuiz}
              className="w-full py-5 bg-rebus-purple text-white rounded-md font-bold text-lg hover:bg-rebus-purple/90 transition-all shadow-xl shadow-rebus-purple/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Start Assessment <ChevronRight size={20} />
            </button>
            <Link 
              href={`/dashboard/courses/${params.id}`}
              className="w-full py-4 text-slate-400 font-medium text-sm flex items-center justify-center hover:text-rebus-blue transition-colors"
            >
              Cancel and go back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-16 px-4 sm:px-6 space-y-10 md:space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-100 pb-6 md:pb-8 gap-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 pt-4">
        <div className="space-y-1">
          <Link href={`/dashboard/courses/${params.id}`} className="inline-flex items-center gap-2 text-[10px] font-medium text-[#00ADEF] mb-2 hover:opacity-70 transition-all uppercase tracking-widest">
            <ArrowLeft size={14} strokeWidth={3} /> Exit to Syllabus
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">Final Assessment</h1>
        </div>
        
        {!submitted && timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold transition-all ${timeLeft < 300 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
            <Timer size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </header>

      {submitted ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-12 shadow-sm text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <ScoreRing score={finalScore} />
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                {finalScore >= 90 ? "Success!" : "Assessment Incomplete"}
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                {finalScore >= 90
                  ? "You have passed the final assessment. Your completion record has been updated."
                  : "The passing grade is 90%. Please review the materials and try again."}
              </p>
            </div>

            {/* --- LOGIC: DYNAMIC CERTIFICATE GENERATOR --- */}
            {finalScore >= 90 && (
              <div className="pt-6 border-t border-slate-50">
                <CertificateGenerator 
                  userName={userMetadata?.full_name || "Valued Learner"}
                  designation={userMetadata?.designation || "Dedicated Professional"}
                  courseName={courseTitle}
                  completionDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  baseImageUrl="/certificate-template.jpg"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 pt-6">
              {finalScore < 90 ? (
                <button onClick={handleReset} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-md font-bold hover:bg-slate-800 transition-all active:scale-95">
                  <RefreshCcw size={18} /> Restart Assessment
                </button>
              ) : (
                <button onClick={() => router.push("/dashboard")} className="flex items-center justify-center gap-2 w-full bg-[#662D91] text-white py-4 rounded-md font-bold hover:bg-[#522475] transition-all active:scale-95 shadow-md shadow-purple-200">
                  <Award size={18} /> Return to Dashboard
                </button>
              )}
            </div>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {questions.map((q, idx) => (
            <div key={q.id} className="group space-y-5 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4 select-none">
                <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] md:text-xs font-semibold text-slate-400 group-focus-within:bg-[#00ADEF] group-focus-within:text-white transition-colors">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-lg md:text-xl font-bold text-slate-800 pt-0.5 leading-snug">{q.question}</p>
              </div>
              
              <div className="grid gap-2 md:gap-3 pl-0 md:pl-12">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswerChange(idx, opt)}
                    className={`p-4 text-left text-sm font-medium rounded-xl md:rounded-2xl border-2 transition-all active:scale-[0.98] ${
                      answers[idx] === opt
                        ? "bg-cyan-50/30 border-[#00ADEF] text-[#00ADEF] font-semibold ring-4 ring-cyan-50/50"
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-10 border-t border-slate-100">
            <button
              disabled={Object.keys(answers).length < questions.length}
              onClick={calculateResults}
              className={`w-full py-4 md:py-5 rounded-2xl font-medium text-base md:text-lg tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95
                ${Object.keys(answers).length === questions.length
                  ? "bg-[#00ADEF] text-white hover:bg-[#0096d1] shadow-xl shadow-cyan-500/20"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
            >
              Submit Assessment <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
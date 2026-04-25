"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCcw, CheckCircle2, Award, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const supabase = createClient();

  useEffect(() => {
    async function fetchQuiz() {
      const sessionKey = `quiz_order_${params.id}`;
      const savedOrder = sessionStorage.getItem(sessionKey);

      if (savedOrder) {
        setQuestions(JSON.parse(savedOrder));
        return; 
      }

      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", params.id);

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
    fetchQuiz();
  }, [params.id, supabase]);

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
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00ADEF", "#662D91", "#FFFFFF"],
        });
      }, 200);

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

  const ScoreRing = ({ score }: { score: number }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const isPass = score >= 90;

    return (
      <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%" cy="50%" r={radius}
            stroke="currentColor" strokeWidth="10"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="50%" cy="50%" r={radius}
            stroke="currentColor" strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isPass ? "text-[#662D91]" : "text-rose-500"}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-3xl md:text-4xl font-black tracking-tighter ${isPass ? "text-[#662D91]" : "text-rose-600"}`}>
            {score}%
          </span>
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Achievement
          </span>
        </div>
      </div>
    );
  };

  if (questions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold px-6 text-center">
        Establishing secure connection to assessment server...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-16 px-4 sm:px-6 space-y-10 md:space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-100 pb-6 md:pb-8 gap-4">
        <div className="space-y-1">
          <Link href={`/dashboard/courses/${params.id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-[#00ADEF] mb-2 hover:opacity-70 transition-all uppercase tracking-widest">
            <ArrowLeft size={14} strokeWidth={3} /> Exit to Syllabus
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Final Assessment
          </h1>
        </div>
        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passing Grade: 90%</span>
        </div>
      </header>

      {submitted ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-12 shadow-sm text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <ScoreRing score={finalScore} />

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {finalScore >= 90 ? "Certification Validated" : "Validation Incomplete"}
            </h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              {finalScore >= 90
                ? "You have successfully demonstrated mastery. Your credentials have been updated."
                : "The passing score for this assessment is 90%. Please review the modules and try again."}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            {finalScore < 90 ? (
              <button
                onClick={() => { setSubmitted(false); setAnswers({}); }}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
              >
                <RefreshCcw size={18} /> Re-attempt Assessment
              </button>
            ) : (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 w-full bg-[#662D91] text-white py-4 rounded-2xl font-bold hover:bg-[#522475] transition-all active:scale-95 shadow-lg shadow-purple-200"
              >
                <Award size={18} /> Return to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {questions.map((q, idx) => (
            <div key={q.id} className="group space-y-5 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] md:text-xs font-black text-slate-400 group-focus-within:bg-[#00ADEF] group-focus-within:text-white transition-colors">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-lg md:text-xl font-bold text-slate-800 pt-0.5 leading-snug">
                  {q.question}
                </p>
              </div>
              
              {/* pl-0 on mobile, pl-12 on desktop to save space */}
              <div className="grid gap-2 md:gap-3 pl-0 md:pl-12">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [idx]: opt })}
                    className={`p-4 text-left text-sm font-bold rounded-xl md:rounded-2xl border-2 transition-all active:scale-[0.98] ${
                      answers[idx] === opt
                        ? "bg-cyan-50/30 border-[#00ADEF] text-[#00ADEF] ring-4 ring-cyan-50/50"
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
              className={`w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-lg tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95
                ${Object.keys(answers).length === questions.length
                  ? "bg-[#00ADEF] text-white hover:bg-[#0096d1] shadow-xl shadow-cyan-500/20"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
            >
              Submit Assessment <ChevronRight size={20} />
            </button>
            <p className="text-center text-[9px] md:text-[11px] text-slate-300 font-bold uppercase tracking-[0.3em] mt-8">
              &copy; 2026 Rebus Holdings
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
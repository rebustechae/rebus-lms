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
      <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96" cy="96" r={radius}
            stroke="currentColor" strokeWidth="10"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="96" cy="96" r={radius}
            stroke="currentColor" strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isPass ? "text-[#662D91]" : "text-rose-500"}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-4xl font-bold tracking-tighter ${isPass ? "text-[#662D91]" : "text-rose-600"}`}>
            {score}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Achievement
          </span>
        </div>
      </div>
    );
  };

  if (questions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">
        Establishing connection to server...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <Link href={`/dashboard/courses/${params.id}`} className="flex items-center gap-2 text-xs font-bold text-[#00ADEF] mb-4 hover:underline">
            <ArrowLeft size={14} /> EXIT TO SYLLABUS
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Final Assessment
          </h1>
        </div>
      </header>

      {submitted ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <ScoreRing score={finalScore} />

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {finalScore >= 90 ? "Certification Validated" : "Incomplete Validation"}
            </h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              {finalScore >= 90
                ? "You have successfully demonstrated mastery of the course."
                : "The passing score for this assessment is 90%. Please review the course materials and attempt the assessment again."}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            {finalScore < 90 ? (
              <button
                onClick={() => { setSubmitted(false); setAnswers({}); }}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                <RefreshCcw size={18} /> Re-attempt Assessment
              </button>
            ) : (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 w-full bg-[#662D91] text-white py-4 rounded-2xl font-bold hover:bg-[#522475] transition-all shadow-lg shadow-purple-200"
              >
                <Award size={18} /> View My Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {questions.map((q, idx) => (
            <div key={q.id} className="group space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 group-focus-within:bg-[#00ADEF] group-focus-within:text-white transition-colors">
                  {idx + 1}
                </span>
                <p className="text-xl font-semibold text-slate-800 pt-1 leading-snug">
                  {q.question}
                </p>
              </div>
              
              <div className="grid gap-3 pl-12">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [idx]: opt })}
                    className={`p-4 text-left text-sm font-semibold rounded-xl border-2 transition-all ${
                      answers[idx] === opt
                        ? "bg-slate-50 border-[#00ADEF] text-[#00ADEF] ring-4 ring-cyan-50"
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
              className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide transition-all flex items-center justify-center gap-2
                ${Object.keys(answers).length === questions.length
                  ? "bg-[#00ADEF] text-white hover:bg-[#0096d1] shadow-xl shadow-cyan-500/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              Submit Final Assessment <ChevronRight size={20} />
            </button>
            <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
              &copy; 2026 Rebus Holdings
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
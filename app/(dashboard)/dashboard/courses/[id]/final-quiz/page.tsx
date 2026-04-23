"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCcw, BookOpen } from "lucide-react";

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

        setQuestions(randomizedData);
      }
    }
    fetchQuiz();
  }, [params.id, supabase]);
  
  const calculateResults = async () => {
    if (questions.length === 0) return;

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
          colors: ["#000000", "#fbbf24", "#ffffff"],
        });
      }, 200);

      const {
        data: { user },
      } = await supabase.auth.getUser();
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

    return (
      <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-zinc-100"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${score >= 90 ? "text-black" : "text-red-500"}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-black">{score}%</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Final Grade
          </span>
        </div>
      </div>
    );
  };

  if (questions.length === 0)
    return (
      <div className="p-20 font-black">No quiz deployed for this course.</div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      <header className="border-b-4 border-black pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Final Assessment
          </h1>
          <p className="text-sm font-bold text-zinc-500 italic">
            90% Score Required to Pass (Open Book)
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Question Count
          </p>
          <p className="text-2xl font-mono font-bold">{questions.length}</p>
        </div>
      </header>

      {submitted ? (
        <div className="p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center space-y-8 bg-white">
          {/* THE NEW RING UI */}
          <ScoreRing score={finalScore} />

          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
              {finalScore >= 90
                ? "Verification Successful"
                : "Verification Failed"}
            </h2>
            <p className="font-bold text-zinc-500 max-w-sm mx-auto">
              {finalScore >= 90
                ? "You have demonstrated mastery of the curriculum and are now certified."
                : "You did not meet the 90% threshold required for certification."}
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {finalScore < 90 ? (
              <button
                onClick={() => setSubmitted(false)}
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 font-black uppercase hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
              >
                <RefreshCcw size={18} /> Retry Assessment
              </button>
            ) : (
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-black text-white py-4 font-black uppercase hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="space-y-4 border-l-4 border-zinc-100 pl-6 focus-within:border-black transition-all"
            >
              <p className="text-xl font-bold uppercase tracking-tight">
                <span className="text-zinc-300 mr-2">#{idx + 1}</span>{" "}
                {q.question}
              </p>
              <div className="grid gap-2">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [idx]: opt })}
                    className={`p-4 text-left font-bold border-2 transition-all ${
                      answers[idx] === opt
                        ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "hover:bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={calculateResults}
            className="w-full bg-black text-white py-6 font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
}

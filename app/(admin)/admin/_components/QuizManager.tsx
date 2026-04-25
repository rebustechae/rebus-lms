"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, CheckCircle2, HelpCircle, Loader2, ListChecks } from "lucide-react";

export default function QuizManager({
  lessonId,
  courseId,
}: {
  lessonId?: string;
  courseId?: string;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchQuestions();
  }, [lessonId, courseId]);

  async function fetchQuestions() {
    let query = supabase.from("quizzes").select("*");
    if (courseId) query = query.eq("course_id", courseId);
    else if (lessonId) query = query.eq("lesson_id", lessonId);

    const { data } = await query;
    setQuestions(data || []);
    setLoading(false);
  }

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.correct_answer) return alert("Please designate a correct response.");

    setIsSubmitting(true);
    const { error } = await supabase.from("quizzes").insert([
      {
        lesson_id: lessonId || null,
        course_id: courseId || null,
        ...newQuestion,
      },
    ]);

    if (!error) {
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
      });
      fetchQuestions();
    }
    setIsSubmitting(false);
  }

  async function deleteQuestion(id: string) {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (!error) fetchQuestions();
  }

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">
              Assessment Registry
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Knowledge Verification Protocols
            </p>
          </div>
        </div>
        <div className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-500">
            {questions.length} Questions Active
        </div>
      </div>

      {/* EXISTING QUESTIONS LIST */}
      <div className="grid gap-4">
        {loading ? (
           <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#00ADEF]/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#00ADEF] bg-cyan-50 px-2 py-0.5 rounded tracking-tighter">Q{idx + 1}</span>
                    <p className="font-bold text-slate-900 text-sm italic">
                      "{q.question}"
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt: string) => (
                      <div 
                        key={opt}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            opt === q.correct_answer 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                            : "bg-slate-50 border-slate-100 text-slate-500"
                        }`}
                      >
                        {opt === q.correct_answer ? <CheckCircle2 size={12} className="shrink-0" /> : <div className="w-3 h-3 border border-slate-300 rounded-full shrink-0" />}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD NEW QUESTION FORM */}
      <div className="bg-slate-50 rounded-3xl p-1 border border-slate-200">
        <form
            onSubmit={addQuestion}
            className="bg-white rounded-[1.4rem] p-6 space-y-6 shadow-inner"
        >
            <input
            placeholder="Type the assessment question here..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all"
            value={newQuestion.question}
            onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
            }
            required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newQuestion.options.map((opt, i) => (
                <div key={i} className="relative group">
                <input
                    placeholder={`Option ${i + 1}`}
                    className="w-full  text-black bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-xs font-medium outline-none focus:bg-white focus:border-slate-300 transition-all"
                    value={opt}
                    onChange={(e) => {
                    const opts = [...newQuestion.options];
                    opts[i] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: opts });
                    }}
                    required
                />

                <button
                    type="button"
                    onClick={() => {
                    if (opt.trim() === "") return;
                    setNewQuestion({ ...newQuestion, correct_answer: opt });
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    newQuestion.correct_answer === opt && opt !== ""
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : "text-slate-200 hover:text-slate-400"
                    }`}
                >
                    <CheckCircle2 size={16} strokeWidth={3} />
                </button>
                </div>
            ))}
            </div>

            <button 
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Add Question
            </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, CheckCircle2, HelpCircle, Circle } from "lucide-react";

export default function QuizManager({
  lessonId,
  courseId,
}: {
  lessonId?: string;
  courseId?: string;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (!newQuestion.correct_answer) return alert("Select a correct answer");

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
  }

  async function deleteQuestion(id: string) {
    await supabase.from("quizzes").delete().eq("id", id);
    fetchQuestions();
  }

  return (
    <div className="space-y-6 ">
      <div className="flex items-center gap-2">
        <HelpCircle size={24} />
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">
          {courseId ? "Quiz Registry" : "Quiz Registry"}
        </h3>
      </div>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
        {courseId
          ? "Questions for this specific module."
          : "Questions for this specific module."}
      </p>

      {/* List Existing Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="border-2 border-black p-4 flex justify-between items-start bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div>
              <p className="font-bold uppercase text-sm">
                Q{idx + 1}: {q.question}
              </p>
              <div className="text-[10px] mt-2 grid grid-cols-2 gap-x-8 gap-y-1">
                {q.options.map((opt: string) => (
                  <span
                    key={opt}
                    className={
                      opt === q.correct_answer
                        ? "text-green-600 font-black"
                        : "text-zinc-400"
                    }
                  >
                    {opt === q.correct_answer ? "✓ " : "• "}
                    {opt}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => deleteQuestion(q.id)}
              className="text-red-600 hover:bg-red-50 p-2 border-2 border-transparent hover:border-black transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Question Form */}
      <form
        onSubmit={addQuestion}
        className="bg-zinc-50 border-2 border-black p-6 space-y-4"
      >
        <input
          placeholder="ENTER ASSESSMENT QUESTION"
          className="w-full border-2 border-black p-3 font-bold outline-none focus:bg-white transition-colors"
          value={newQuestion.question}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, question: e.target.value })
          }
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {newQuestion.options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                placeholder={`OPTION ${i + 1}`}
                className="flex-1 border-2 border-black p-2 text-sm outline-none focus:bg-white"
                value={opt}
                onChange={(e) => {
                  const opts = [...newQuestion.options];
                  opts[i] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: opts });
                }}
                required
              />

              {/* THIS IS THE UPDATED SELECT BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (opt.trim() === "") {
                    alert(
                      "Type the answer first before marking it as correct!",
                    );
                    return;
                  }
                  setNewQuestion({ ...newQuestion, correct_answer: opt });
                }}
                className={`p-2 border-2 border-black transition-all flex items-center justify-center
        ${
          newQuestion.correct_answer === opt && opt !== ""
            ? "bg-green-500 text-white border-green-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            : "bg-white hover:bg-zinc-200"
        }`}
                title="Mark as correct answer"
              >
                {newQuestion.correct_answer === opt && opt !== "" ? (
                  <CheckCircle2 size={18} strokeWidth={3} />
                ) : (
                  <CheckCircle2 size={18} className="text-zinc-300" />
                )}
              </button>
            </div>
          ))}
        </div>

        <button className="w-full bg-black text-white py-4 font-black uppercase flex items-center justify-center gap-2 hover:invert transition-all border-2 border-black">
          <Plus size={18} /> Register Question
        </button>
      </form>
    </div>
  );
}

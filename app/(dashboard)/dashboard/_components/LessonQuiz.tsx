'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import { RefreshCcw, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

interface LessonQuizProps {
  questions: any[]
  onPass: () => Promise<void>
}

export default function LessonQuiz({ questions, onPass }: LessonQuizProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [passed, setPassed] = useState(false)
  const [score, setScore] = useState(0)

  const calculateResults = async () => {
    if (questions.length === 0 || Object.keys(answers).length < questions.length) return

    let correct = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correct++
    })
    
    const scorePercent = Math.round((correct / questions.length) * 100)
    setScore(scorePercent)
    setSubmitted(true)

    if (scorePercent === 100) {
      setPassed(true)
      
      // Professional Brand Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#00ADEF', '#662D91', '#FFFFFF'] // Rebus Cyan & Purple
      })

      await onPass()
    } else {
      setPassed(false)
    }
  }

  const ScoreRing = ({ score }: { score: number }) => {
    const radius = 36
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40" cy="40" r={radius}
            stroke="currentColor" strokeWidth="6"
            fill="transparent" className="text-slate-100" 
          />
          <circle
            cx="40" cy="40" r={radius}
            stroke="currentColor" strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${score === 100 ? 'text-emerald-500' : 'text-rose-500'}`}
          />
        </svg>
        <span className={`absolute text-sm font-bold ${score === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {score}%
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <header className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Knowledge Check</h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">Verify your understanding of this module.</p>
        </div>
        {submitted && <ScoreRing score={score} />}
      </header>

      {submitted ? (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          <div className={`p-6 rounded-xl flex items-center gap-5 ${passed ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
            {passed ? (
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg shadow-emerald-200">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="bg-rose-500 p-2 rounded-full text-white shadow-lg shadow-rose-200">
                <XCircle size={24} />
              </div>
            )}
            <div>
              <p className={`font-bold text-lg ${passed ? 'text-emerald-900' : 'text-rose-900'}`}>
                {passed ? 'Validation Successful' : 'Validation Required'}
              </p>
              <p className={`text-sm font-medium ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                {passed 
                  ? 'Module requirements met. You may proceed to the next section.' 
                  : 'A perfect score is required for corporate compliance. Please review and retry.'}
              </p>
            </div>
          </div>

          {!passed && (
            <button 
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
              }}
              className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all"
            >
              <RefreshCcw size={18} /> Retry Assessment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-5">
              <div className="flex gap-4">
                <span className="text-slate-300 font-bold text-lg leading-none">0{idx + 1}</span>
                <p className="text-lg font-semibold text-slate-800 leading-snug">
                  {q.question}
                </p>
              </div>
              <div className="grid gap-3 pl-9">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [idx]: opt })}
                    className={`p-4 text-left text-sm font-semibold rounded-xl border-2 transition-all ${
                      answers[idx] === opt 
                        ? 'bg-slate-50 border-[#00ADEF] text-[#00ADEF] ring-4 ring-cyan-50' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button 
            disabled={Object.keys(answers).length < questions.length}
            onClick={calculateResults} 
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2
              ${Object.keys(answers).length === questions.length
                ? "bg-[#00ADEF] text-white hover:bg-[#0096d1] shadow-lg shadow-cyan-500/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            Submit for Validation <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
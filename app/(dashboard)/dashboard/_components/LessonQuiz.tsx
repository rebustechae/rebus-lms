'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import { RefreshCcw, CheckCircle2, XCircle } from 'lucide-react'

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
    if (questions.length === 0) return

    let correct = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correct++
    })
    
    const scorePercent = Math.round((correct / questions.length) * 100)
    setScore(scorePercent)
    setSubmitted(true)

    // For lesson-level quizzes, let's say 100% is required to "Pass" 
    // and unlock the next module button.
    if (scorePercent === 100) {
      setPassed(true)
      
      // Brutalist celebration
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#000000', '#fbbf24']
      })

      // Notify the parent page to update progress in Supabase
      await onPass()
    } else {
      setPassed(false)
    }
  }

  // Reuse your ScoreRing logic but smaller for a lesson-level quiz
  const ScoreRing = ({ score }: { score: number }) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48" cy="48" r={radius}
            stroke="currentColor" strokeWidth="8"
            fill="transparent" className="text-zinc-100" 
          />
          <circle
            cx="48" cy="48" r={radius}
            stroke="currentColor" strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${score === 100 ? 'text-black' : 'text-red-500'}`}
          />
        </svg>
        <span className="absolute text-xl font-black">{score}%</span>
      </div>
    )
  }

  return (
    <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8">
      <header className="flex justify-between items-center border-b-2 border-black pb-4">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Knowledge Check</h3>
        {submitted && <ScoreRing score={score} />}
      </header>

      {submitted ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {passed ? (
              <CheckCircle2 className="text-black" size={32} />
            ) : (
              <XCircle className="text-red-500" size={32} />
            )}
            <div>
              <p className="font-black uppercase text-xl">
                {passed ? 'Validation Complete' : 'Validation Failed'}
              </p>
              <p className="text-sm font-bold text-zinc-500 italic">
                {passed 
                  ? 'The next module is now unlocked below.' 
                  : 'A 100% score is required to proceed.'}
              </p>
            </div>
          </div>

          {!passed && (
            <button 
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
              }}
              className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 font-black uppercase hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
            >
              <RefreshCcw size={18} /> Retry Check
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-4">
              <p className="text-lg font-bold uppercase tracking-tight">
                <span className="text-zinc-300 mr-2">Q{idx + 1}</span> {q.question}
              </p>
              <div className="grid gap-2">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [idx]: opt })}
                    className={`p-4 text-left font-bold border-2 transition-all ${
                      answers[idx] === opt 
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                        : 'hover:bg-zinc-50 border-zinc-200'
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
            className="w-full bg-black text-white py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Verify Answers
          </button>
        </div>
      )}
    </div>
  )
}
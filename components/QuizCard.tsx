'use client'

import type { Question } from '@/types/quiz'

type QuizCardProps = {
  question: Question
  selectedIndex: number | null
  isAnswered: boolean
  onSelect: (index: number) => void
}

export const QuizCard = ({ question, selectedIndex, isAnswered, onSelect }: QuizCardProps) => {
  const getButtonStyle = (index: number): string => {
    const base =
      'w-full text-left px-5 py-4 rounded-lg border text-sm leading-relaxed transition-colors'

    if (!isAnswered) {
      return `${base} border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 cursor-pointer`
    }

    if (index === question.answerIndex) {
      return `${base} border-emerald-500 bg-emerald-50 text-emerald-800 cursor-default`
    }

    if (index === selectedIndex) {
      return `${base} border-red-400 bg-red-50 text-red-800 cursor-default`
    }

    return `${base} border-slate-200 bg-white text-slate-400 cursor-default`
  }

  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-slate-800 leading-relaxed">{question.text}</p>
      <ul className="space-y-2 mt-4">
        {question.options.map((option, index) => (
          <li key={index}>
            <button
              className={getButtonStyle(index)}
              onClick={() => !isAnswered && onSelect(index)}
              disabled={isAnswered}
            >
              <span className="font-medium text-slate-500 mr-3">
                {['A', 'B', 'C', 'D'][index]}.
              </span>
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

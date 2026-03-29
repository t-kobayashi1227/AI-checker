'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizCard } from '@/components/QuizCard'
import { FeedbackBanner } from '@/components/FeedbackBanner'
import { questions } from '@/data/questions'
import type { Level, QuizResult } from '@/types/quiz'

const getLevel = (score: number): Level => {
  if (score <= 4) return 'beginner'
  if (score <= 7) return 'user'
  if (score <= 9) return 'advanced'
  return 'expert'
}

const calcScore = (answers: number[]): number => {
  return answers.reduce((score, answerIndex, i) => {
    return answerIndex === questions[i].answerIndex ? score + 1 : score
  }, 0)
}

export default function QuizPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [isAnswered, setIsAnswered] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    setIsAnswered(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selectedIndex as number]

    if (isLast) {
      const score = calcScore(newAnswers)
      const level = getLevel(score)
      const result: QuizResult = { answers: newAnswers, score, level }
      sessionStorage.setItem('quizResult', JSON.stringify(result))
      router.push('/result')
      return
    }

    setAnswers(newAnswers)
    setCurrentIndex((prev) => prev + 1)
    setSelectedIndex(null)
    setIsAnswered(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        {/* ヘッダー */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>問題 {currentIndex + 1} / {questions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-slate-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 問題カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <QuizCard
            question={currentQuestion}
            selectedIndex={selectedIndex}
            isAnswered={isAnswered}
            onSelect={handleSelect}
          />

          {isAnswered && (
            <FeedbackBanner
              isCorrect={selectedIndex === currentQuestion.answerIndex}
              explanation={currentQuestion.explanation}
              onNext={handleNext}
              isLast={isLast}
            />
          )}
        </div>
      </div>
    </main>
  )
}

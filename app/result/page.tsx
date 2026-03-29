'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ResultCard } from '@/components/ResultCard'
import type { QuizResult } from '@/types/quiz'

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('quizResult')
    if (!stored) {
      router.replace('/')
      return
    }
    setResult(JSON.parse(stored) as QuizResult)
  }, [router])

  const handleRetry = () => {
    sessionStorage.removeItem('quizResult')
    router.push('/quiz')
  }

  const handleHome = () => {
    sessionStorage.removeItem('quizResult')
    router.push('/')
  }

  if (!result) return null

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <ResultCard
            score={result.score}
            level={result.level}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        </div>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QuizGame } from '@/components/QuizGame'
import { questions as staticQuestions } from '@/data/questions'
import type { Question } from '@/types/quiz'

type SupabaseQuestion = {
  id: number
  category: string
  question_text: string
  options: string[]
  answer_index: number
  explanation: string
}

const QUESTION_COUNT = 10

async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, category, question_text, options, answer_index, explanation')
    .eq('is_active', true)
    .limit(QUESTION_COUNT)

  if (error || !data || data.length === 0) {
    return staticQuestions
  }

  return (data as SupabaseQuestion[]).map((q) => ({
    id:          q.id,
    category:    q.category as Question['category'],
    text:        q.question_text,
    options:     q.options,
    answerIndex: q.answer_index,
    explanation: q.explanation,
  }))
}

export default async function QuizPage() {
  const questions = await fetchQuestions()

  if (questions.length === 0) {
    redirect('/')
  }

  return <QuizGame questions={questions} />
}

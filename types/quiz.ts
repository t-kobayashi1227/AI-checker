export type Category = 'tool' | 'term' | 'usage' | 'risk'

export type Level = 'beginner' | 'user' | 'advanced' | 'expert'

export type Question = {
  id: number
  category: Category
  text: string
  options: string[]
  answerIndex: number
  explanation: string
}

export type QuizResult = {
  answers: number[]
  score: number
  level: Level
}

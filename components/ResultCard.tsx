'use client'

import type { Level } from '@/types/quiz'

type LevelInfo = {
  label: string
  description: string
  advice: string
  color: string
}

const levelMap: Record<Level, LevelInfo> = {
  beginner: {
    label: 'AI 入門者',
    description: 'AIの基礎知識をこれから身につけていく段階です。',
    advice:
      'まずは ChatGPT や Claude などの AI ツールを実際に触ってみましょう。毎日の業務で「これ AI に聞いてみよう」という習慣づくりが第一歩です。',
    color: 'text-slate-600',
  },
  user: {
    label: 'AI 活用者',
    description: 'AIの基本的な知識を持ち、活用し始めている段階です。',
    advice:
      'プロンプトの書き方を工夫することで、AI の回答の質が大幅に上がります。役割・背景・出力形式を具体的に指定する練習をしてみましょう。',
    color: 'text-blue-600',
  },
  advanced: {
    label: 'AI 上級者',
    description: 'AIを業務で効果的に活用できている段階です。',
    advice:
      'AI の活用事例やリスク管理についても深い理解があります。次のステップとして、チームへの AI 活用推進や、業務フローへの組み込みを検討してみましょう。',
    color: 'text-indigo-600',
  },
  expert: {
    label: 'AI エキスパート',
    description: 'AIに関する知識・活用度が非常に高い段階です。',
    advice:
      '素晴らしい結果です！あなたの AI 知識を周囲に広めることで、組織全体のレベルアップに貢献できます。AI 講師・社内推進リーダーとしての活躍も期待されます。',
    color: 'text-emerald-600',
  },
}

type ResultCardProps = {
  score: number
  level: Level
  onRetry: () => void
  onHome: () => void
}

export const ResultCard = ({ score, level, onRetry, onHome }: ResultCardProps) => {
  const info = levelMap[level]
  const total = 10

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-1">あなたのスコア</p>
        <p className="text-5xl font-bold text-slate-800">
          {score}
          <span className="text-2xl font-normal text-slate-400"> / {total}</span>
        </p>
      </div>

      <div className="border border-slate-200 rounded-lg p-5 space-y-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">レベル判定</p>
        <p className={`text-2xl font-bold ${info.color}`}>{info.label}</p>
        <p className="text-sm text-slate-600">{info.description}</p>
      </div>

      <div className="bg-slate-50 rounded-lg p-5">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">アドバイス</p>
        <p className="text-sm text-slate-700 leading-relaxed">{info.advice}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          もう一度挑戦する
        </button>
        <button
          onClick={onHome}
          className="w-full py-3 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )
}

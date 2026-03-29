'use client'

type FeedbackBannerProps = {
  isCorrect: boolean
  explanation: string
  onNext: () => void
  isLast: boolean
}

export const FeedbackBanner = ({ isCorrect, explanation, onNext, isLast }: FeedbackBannerProps) => {
  return (
    <div
      className={`rounded-lg p-4 border ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <p
        className={`font-semibold text-sm mb-2 ${
          isCorrect ? 'text-emerald-700' : 'text-red-700'
        }`}
      >
        {isCorrect ? '○ 正解！' : '✕ 不正解'}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
      <button
        onClick={onNext}
        className="mt-4 w-full py-3 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
      >
        {isLast ? '結果を見る' : '次の問題へ'}
      </button>
    </div>
  )
}

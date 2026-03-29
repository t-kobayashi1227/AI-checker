import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Quiz
            </p>
            <h1 className="text-2xl font-bold text-slate-800 leading-snug">
              AI レベルチェック
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              AIに関する知識・活用度を10問4択クイズで診断します。
              あなたは今どのレベルですか？
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">問題数</span>
              <span className="font-medium text-slate-700">10問</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">形式</span>
              <span className="font-medium text-slate-700">4択クイズ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">所要時間</span>
              <span className="font-medium text-slate-700">約3分</span>
            </div>
          </div>

          <Link
            href="/quiz"
            className="block w-full text-center py-3 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            クイズを始める
          </Link>
        </div>
      </div>
    </main>
  )
}

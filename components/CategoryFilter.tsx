'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['すべて', '導入ヒント', '実践ガイド'] as const

export const CategoryFilter = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? 'すべて'

  const handleSelect = (category: string) => {
    if (category === 'すべて') {
      router.push('/usecases')
    } else {
      router.push(`/usecases?category=${encodeURIComponent(category)}`)
    }
  }

  return (
    <nav>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
        カテゴリー
      </p>
      <ul className="space-y-1">
        {CATEGORIES.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => handleSelect(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                current === cat
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

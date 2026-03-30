export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { ArticleCard } from '@/components/ArticleCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import type { ArticleSummary } from '@/types/article'

async function fetchArticles(category?: string): Promise<ArticleSummary[]> {
  let query = supabase
    .from('usecases')
    .select('id, title, slug, category, excerpt, thumbnail_url, published_at')
    .eq('is_active', true)
    .order('published_at', { ascending: false })

  if (category && category !== 'すべて') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as ArticleSummary[]
}

export default async function UsecasesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const articles = await fetchArticles(category)

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
            Usecases
          </p>
          <h1 className="text-2xl font-bold text-slate-800">ユースケース</h1>
          <p className="text-sm text-slate-500 mt-1">
            AIのビジネス活用事例・導入ヒントを紹介します
          </p>
        </div>

        <div className="flex gap-8">
          {/* サイドバー（デスクトップのみ） */}
          <aside className="hidden md:block w-44 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-8">
              <Suspense fallback={null}>
                <CategoryFilter />
              </Suspense>
            </div>
          </aside>

          {/* 記事一覧 */}
          <div className="flex-1">
            {/* モバイル用カテゴリフィルタ */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-1">
              <Suspense fallback={null}>
                <CategoryFilter />
              </Suspense>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm text-slate-400">記事はまだありません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

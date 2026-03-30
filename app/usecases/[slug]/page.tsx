export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArticleContent } from '@/components/ArticleContent'
import type { Article } from '@/types/article'

async function fetchArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('usecases')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Article
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await fetchArticle(slug)

  if (!article) notFound()

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* パンくずリスト */}
        <nav className="text-xs text-slate-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            ホーム
          </Link>
          <span>/</span>
          <Link href="/usecases" className="hover:text-slate-600 transition-colors">
            ユースケース
          </Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-xs">{article.title}</span>
        </nav>

        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* アイキャッチ */}
          {article.thumbnail_url && (
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full aspect-video object-cover"
            />
          )}

          <div className="p-8">
            {/* カテゴリ・日付 */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  article.category === '導入ヒント'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {article.category}
              </span>
              {date && <span className="text-xs text-slate-400">{date}</span>}
            </div>

            {/* タイトル */}
            <h1 className="text-xl font-bold text-slate-800 leading-snug mb-6">
              {article.title}
            </h1>

            {/* 本文 */}
            <ArticleContent blocks={article.content} />
          </div>
        </article>

        {/* 戻るリンク */}
        <div className="mt-8">
          <Link
            href="/usecases"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← ユースケース一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import type { ArticleSummary } from '@/types/article'

type ArticleCardProps = {
  article: ArticleSummary
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <Link href={`/usecases/${article.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {article.thumbnail_url ? (
          <div className="aspect-video overflow-hidden flex-shrink-0">
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-video bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="text-slate-300 text-xs">No Image</span>
          </div>
        )}
        <div className="p-5 space-y-2 flex flex-col flex-1">
          <span
            className={`inline-block self-start text-xs font-medium px-2 py-1 rounded-full ${
              article.category === '導入ヒント'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {article.category}
          </span>
          <h3 className="font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-slate-600 transition-colors flex-1">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          {date && <p className="text-xs text-slate-400">{date}</p>}
        </div>
      </div>
    </Link>
  )
}

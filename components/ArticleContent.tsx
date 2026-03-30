import type { Block } from '@/types/article'

type ArticleContentProps = {
  blocks: Block[]
}

export const ArticleContent = ({ blocks }: ArticleContentProps) => {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading_2':
            return (
              <h2 key={i} className="text-xl font-bold text-slate-800 mt-8 mb-2 pt-4 border-t border-slate-100 first:border-none first:pt-0 first:mt-0">
                {block.text}
              </h2>
            )
          case 'heading_3':
            return (
              <h3 key={i} className="text-base font-semibold text-slate-700 mt-6 mb-1">
                {block.text}
              </h3>
            )
          case 'paragraph':
            return (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">
                {block.text}
              </p>
            )
          case 'bulleted_list_item':
            return (
              <div key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-400 flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{block.text}</span>
              </div>
            )
          case 'numbered_list_item':
            return (
              <div key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-400 flex-shrink-0 font-medium min-w-[1.2rem]">{i + 1}.</span>
                <span className="leading-relaxed">{block.text}</span>
              </div>
            )
          case 'image':
            return (
              <figure key={i} className="my-6">
                <img
                  src={block.url}
                  alt={block.caption}
                  className="w-full rounded-lg border border-slate-100"
                />
                {block.caption && (
                  <figcaption className="text-center text-xs text-slate-400 mt-2">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-slate-300 pl-4 text-sm italic text-slate-500 my-4">
                {block.text}
              </blockquote>
            )
          case 'divider':
            return <hr key={i} className="border-slate-200 my-6" />
          default:
            return null
        }
      })}
    </div>
  )
}

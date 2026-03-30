export type ArticleCategory = '導入ヒント' | '実践ガイド'

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading_2'; text: string }
  | { type: 'heading_3'; text: string }
  | { type: 'bulleted_list_item'; text: string }
  | { type: 'numbered_list_item'; text: string }
  | { type: 'image'; url: string; caption: string }
  | { type: 'quote'; text: string }
  | { type: 'divider' }

export type Article = {
  id: number
  notion_id: string
  title: string
  slug: string
  category: ArticleCategory
  excerpt: string | null
  thumbnail_url: string | null
  content: Block[]
  source_url: string | null
  is_active: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ArticleSummary = Pick<
  Article,
  'id' | 'title' | 'slug' | 'category' | 'excerpt' | 'thumbnail_url' | 'published_at'
>

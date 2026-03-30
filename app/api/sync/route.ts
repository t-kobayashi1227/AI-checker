import { NextRequest, NextResponse } from 'next/server'
import { Client as NotionClient } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { supabase } from '@/lib/supabase'

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY })

const ANSWER_MAP: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }

const CATEGORY_MAP: Record<string, string> = {
  'AIツール紹介': 'tool',
  '基礎用語': 'term',
  '使い方・コツ': 'usage',
  'リスク・倫理': 'risk',
}

function extractText(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const p = prop as Record<string, unknown>
  if (Array.isArray(p.title)) {
    return (p.title as Array<{ plain_text: string }>).map((t) => t.plain_text).join('')
  }
  if (Array.isArray(p.rich_text)) {
    return (p.rich_text as Array<{ plain_text: string }>).map((t) => t.plain_text).join('')
  }
  return ''
}

function extractSelect(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const p = prop as Record<string, unknown>
  if (p.select && typeof p.select === 'object') {
    return (p.select as { name: string }).name ?? ''
  }
  return ''
}

export async function POST(request: NextRequest) {
  // Webhook シークレットの検証
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Notion オートメーションから送られてくるページ ID を取得
    const body = await request.json() as Record<string, unknown>
    const data = body.data as Record<string, unknown> | undefined
    const pageId = (data?.id ?? body.id) as string | undefined

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID not found' }, { status: 400 })
    }

    // Notion から最新のページデータを取得
    const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse
    const props = page.properties

    // プロパティを取り出す
    const questionText  = extractText(props['名前'])
    const optionA       = extractText(props['選択肢A'])
    const optionB       = extractText(props['選択肢B'])
    const optionC       = extractText(props['選択肢C'])
    const optionD       = extractText(props['選択肢D'])
    const answerLabel   = extractSelect(props['正答'])
    const explanation   = extractText(props['解説'])
    const categoryLabel = extractSelect(props['カテゴリ'])
    const statusLabel   = extractSelect(props['ステータス'])

    // 必須フィールドの確認
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !answerLabel || !explanation || !categoryLabel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const answerIndex = ANSWER_MAP[answerLabel]
    const category    = CATEGORY_MAP[categoryLabel]

    if (answerIndex === undefined || !category) {
      return NextResponse.json({ error: 'Invalid answer or category value' }, { status: 400 })
    }

    // Supabase へ upsert（notion_id が同じなら更新、なければ新規作成）
    const { error } = await supabase
      .from('questions')
      .upsert(
        {
          notion_id:     pageId,
          question_text: questionText,
          options:       [optionA, optionB, optionC, optionD],
          answer_index:  answerIndex,
          explanation,
          category,
          is_active:     statusLabel === '公開',
          updated_at:    new Date().toISOString(),
        },
        { onConflict: 'notion_id' }
      )

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, pageId })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

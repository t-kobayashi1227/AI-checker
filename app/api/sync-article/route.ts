import { NextRequest, NextResponse } from 'next/server'
import { Client as NotionClient } from '@notionhq/client'
import type {
  PageObjectResponse,
  BlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Block } from '@/types/article'

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY })

// --- ユーティリティ ---

type RichTextItem = { plain_text: string }

function extractRichText(richText: RichTextItem[]): string {
  return richText.map((t) => t.plain_text).join('')
}

function extractText(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const p = prop as Record<string, unknown>
  if (Array.isArray(p.title)) return extractRichText(p.title as RichTextItem[])
  if (Array.isArray(p.rich_text)) return extractRichText(p.rich_text as RichTextItem[])
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

function extractUrlProp(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const p = prop as Record<string, unknown>
  return typeof p.url === 'string' ? p.url : ''
}

// --- 画像処理 ---

async function uploadToStorage(
  imageUrl: string,
  pageId: string,
  filename: string
): Promise<string> {
  const res = await fetch(imageUrl)
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('gif') ? 'gif' : 'jpg'
  const path = `${pageId}/${filename}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from('article-images')
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabaseAdmin.storage.from('article-images').getPublicUrl(path)
  return data.publicUrl
}

async function processImageUrl(
  rawUrl: string,
  isNotionHosted: boolean,
  pageId: string,
  filename: string
): Promise<string> {
  // Notion ホスト画像は一時URLのため Storage に移行
  // 外部URL はそのまま使用
  return isNotionHosted ? await uploadToStorage(rawUrl, pageId, filename) : rawUrl
}

// --- Notion ブロック取得 ---

async function fetchAllBlocks(pageId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = []
  let cursor: string | undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    })
    blocks.push(...(response.results as BlockObjectResponse[]))
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return blocks
}

// --- Notion ブロック → 内部フォーマット変換 ---

async function convertBlocks(
  rawBlocks: BlockObjectResponse[],
  pageId: string
): Promise<Block[]> {
  const blocks: Block[] = []
  let imageIndex = 0

  for (const block of rawBlocks) {
    try {
      switch (block.type) {
        case 'paragraph': {
          const text = extractRichText(block.paragraph.rich_text as RichTextItem[])
          if (text) blocks.push({ type: 'paragraph', text })
          break
        }
        case 'heading_2': {
          const text = extractRichText(block.heading_2.rich_text as RichTextItem[])
          if (text) blocks.push({ type: 'heading_2', text })
          break
        }
        case 'heading_3': {
          const text = extractRichText(block.heading_3.rich_text as RichTextItem[])
          if (text) blocks.push({ type: 'heading_3', text })
          break
        }
        case 'bulleted_list_item': {
          const text = extractRichText(block.bulleted_list_item.rich_text as RichTextItem[])
          if (text) blocks.push({ type: 'bulleted_list_item', text })
          break
        }
        case 'numbered_list_item': {
          const text = extractRichText(block.numbered_list_item.rich_text as RichTextItem[])
          if (text) blocks.push({ type: 'numbered_list_item', text })
          break
        }
        case 'quote': {
          const text = extractRichText(block.quote.rich_text as RichTextItem[])
          if (text) blocks.push({ type: 'quote', text })
          break
        }
        case 'divider': {
          blocks.push({ type: 'divider' })
          break
        }
        case 'image': {
          const img = block.image
          const isNotionHosted = img.type === 'file'
          const rawUrl = isNotionHosted ? img.file.url : img.external.url
          const caption = extractRichText(img.caption as RichTextItem[])
          const url = await processImageUrl(rawUrl, isNotionHosted, pageId, `image-${imageIndex}`)
          blocks.push({ type: 'image', url, caption })
          imageIndex++
          break
        }
      }
    } catch (err) {
      // 1ブロックの失敗で全体を止めない
      console.error(`Block conversion failed (${block.type}):`, err)
    }
  }

  return blocks
}

// --- アイキャッチ画像処理 ---

async function processThumbnail(
  prop: unknown,
  pageId: string
): Promise<string | null> {
  if (!prop || typeof prop !== 'object') return null
  const p = prop as Record<string, unknown>
  const files = p.files as Array<Record<string, unknown>> | undefined
  if (!files || files.length === 0) return null

  const file = files[0]
  const fileData = file.file as Record<string, string> | undefined
  const externalData = file.external as Record<string, string> | undefined
  const rawUrl = fileData?.url ?? externalData?.url
  if (!rawUrl) return null

  const isNotionHosted = !!fileData?.url
  return processImageUrl(rawUrl, isNotionHosted, pageId, 'thumbnail')
}

// --- メインハンドラ ---

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const data = body.data as Record<string, unknown> | undefined
    const pageId = (data?.id ?? body.id) as string | undefined

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID not found' }, { status: 400 })
    }

    const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse
    const props = page.properties
    const statusLabel = extractSelect(props['ステータス'])

    // 下書き・公開停止 → is_active を false に更新のみ
    if (statusLabel === '下書き' || statusLabel === '公開停止') {
      const { error } = await supabaseAdmin
        .from('usecases')
        .upsert(
          { notion_id: pageId, is_active: false, content: [], updated_at: new Date().toISOString() },
          { onConflict: 'notion_id' }
        )
      if (error) throw error
      return NextResponse.json({ success: true, status: statusLabel })
    }

    // 再編集中 → is_active は true のまま・コンテンツは更新しない
    if (statusLabel === '再編集中') {
      const { error } = await supabaseAdmin
        .from('usecases')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('notion_id', pageId)
      if (error) throw error
      return NextResponse.json({ success: true, status: statusLabel })
    }

    // 公開 → 全データを取得・同期
    const title     = extractText(props['名前'])
    const slug      = extractText(props['スラッグ'])
    const excerpt   = extractText(props['概要文'])
    const category  = extractSelect(props['カテゴリ'])
    const sourceUrl = extractUrlProp(props['元記事URL'])

    if (!title || !slug || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: 名前・スラッグ・カテゴリを入力してください' },
        { status: 400 }
      )
    }

    const [thumbnailUrl, rawBlocks] = await Promise.all([
      processThumbnail(props['アイキャッチ'], pageId),
      fetchAllBlocks(pageId),
    ])

    const content = await convertBlocks(rawBlocks, pageId)

    const { error } = await supabaseAdmin
      .from('usecases')
      .upsert(
        {
          notion_id:     pageId,
          title,
          slug,
          category,
          excerpt:       excerpt || null,
          thumbnail_url: thumbnailUrl,
          content,
          source_url:    sourceUrl || null,
          is_active:     true,
          published_at:  new Date().toISOString(),
          updated_at:    new Date().toISOString(),
        },
        { onConflict: 'notion_id' }
      )

    if (error) throw error

    return NextResponse.json({ success: true, pageId, title })
  } catch (err) {
    console.error('Sync article error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

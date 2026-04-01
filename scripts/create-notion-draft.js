#!/usr/bin/env node
/**
 * Notion に記事の下書きページを作成するスクリプト
 * 使用方法: node scripts/create-notion-draft.js <JSONファイルパス>
 *
 * JSON フォーマット:
 * {
 *   "title": "記事タイトル",
 *   "category": "導入ヒント" | "実践ガイド",
 *   "excerpt": "概要文（50〜80字）",
 *   "sourceUrl": "https://... または null",
 *   "blocks": [
 *     { "type": "heading_2", "text": "はじめに" },
 *     { "type": "paragraph", "text": "本文" },
 *     { "type": "bulleted_list_item", "text": "箇条書き" },
 *     { "type": "image_placeholder", "text": "[IMAGE: 説明]" }
 *   ]
 * }
 */

const { Client } = require('@notionhq/client')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const dotenv = require('dotenv')

// .env.local を読み込む
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DATABASE_ID = process.env.NOTION_USECASES_DATABASE_ID

if (!process.env.NOTION_API_KEY || !DATABASE_ID) {
  console.error('Error: NOTION_API_KEY と NOTION_USECASES_DATABASE_ID を .env.local に設定してください')
  process.exit(1)
}

const jsonPath = process.argv[2]
if (!jsonPath) {
  console.error('Usage: node scripts/create-notion-draft.js <JSONファイルパス>')
  process.exit(1)
}

const article = JSON.parse(readFileSync(resolve(process.cwd(), jsonPath), 'utf-8'))

/**
 * 内部ブロック形式 → Notion API ブロック形式に変換
 */
function toNotionBlock(block) {
  switch (block.type) {
    case 'heading_2':
      return {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: block.text } }] },
      }
    case 'heading_3':
      return {
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: block.text } }] },
      }
    case 'bulleted_list_item':
      return {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: block.text } }] },
      }
    case 'numbered_list_item':
      return {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: [{ type: 'text', text: { content: block.text } }] },
      }
    case 'quote':
      return {
        object: 'block',
        type: 'quote',
        quote: { rich_text: [{ type: 'text', text: { content: block.text } }] },
      }
    case 'divider':
      return { object: 'block', type: 'divider', divider: {} }
    case 'image_placeholder':
      // 画像指示はコールアウトブロックで表現
      return {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content: block.text } }],
          icon: { emoji: '🖼️' },
          color: 'gray_background',
        },
      }
    default:
      // paragraph（デフォルト）
      return {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: block.text || '' } }] },
      }
  }
}

async function createDraft() {
  const notionBlocks = article.blocks.map(toNotionBlock)

  // Notion API は一度に100ブロックまでしか追加できないため分割
  const CHUNK_SIZE = 100
  const chunks = []
  for (let i = 0; i < notionBlocks.length; i += CHUNK_SIZE) {
    chunks.push(notionBlocks.slice(i, i + CHUNK_SIZE))
  }

  // ページ作成（本文の最初のチャンクを一緒に送信）
  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      '名前': {
        title: [{ text: { content: article.title } }],
      },
      'カテゴリ': {
        select: { name: article.category },
      },
      '概要文': {
        rich_text: [{ text: { content: article.excerpt || '' } }],
      },
      '元記事URL': {
        url: article.sourceUrl || null,
      },
      'ステータス': {
        select: { name: '下書き' },
      },
    },
    children: chunks[0] || [],
  })

  // 残りのチャンクを追加
  for (let i = 1; i < chunks.length; i++) {
    await notion.blocks.children.append({
      block_id: page.id,
      children: chunks[i],
    })
  }

  const pageUrl = `https://notion.so/${page.id.replace(/-/g, '')}`
  console.log(`✅ Notion に下書きページを作成しました`)
  console.log(`   タイトル: ${article.title}`)
  console.log(`   カテゴリ: ${article.category}`)
  console.log(`   URL: ${pageUrl}`)
}

createDraft().catch((err) => {
  console.error('❌ Notion ページ作成に失敗しました:', err.message)
  process.exit(1)
})

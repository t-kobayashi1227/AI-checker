---
name: draft-article
description: 元記事URLをもとにAI未経験ビジネスパーソン向けの記事を生成し、Notionに下書きとして自動保存するスキル
---

AIに不慣れなビジネスパーソン向けの記事を、元記事URLをもとに生成し、Notion に下書きとして自動保存するスキル。

## 入力形式

```
url: <元記事のURL>（必須）
category: 導入ヒント | 実践ガイド（必須）
points: |
  - 強調したいポイント1
  - 強調したいポイント2
（任意）
```

- `url` のみでも起動可能。`category` が未指定の場合は確認する。

## 実行手順

### Step 1: 入力を確認する

引数から `url`、`category`、`points` を読み取る。
`category` が未指定の場合は「導入ヒント」か「実践ガイド」のどちらかを確認する。

### Step 2: 元記事を取得・読み込む

`url` のコンテンツを WebFetch で取得し、内容を把握する。

### Step 3: 記事本文を生成する

以下の条件で日本語記事を生成する。

**スタイル:**
- ですます調
- 対象読者: AIをまだ使い始めていないビジネスパーソン
- 文字数: 800〜1200字（元記事の分量に応じて柔軟に調整）
- 元記事の内容から大きく逸れない（補足・修正・読みやすく再構成する）
- 専門用語は初出時にカッコ内で簡単な説明を付ける（例: LLM（大規模言語モデル））

**構成（柔軟に調整してよい）:**
```
# タイトル（元記事の主旨を反映した、読者の興味を引くタイトル）

リード文（2〜3文。この記事を読む価値を伝える）

## [見出し1]
...

[IMAGE: ○○のイメージ図]  ← 画像があると理解しやすい箇所に挿入

## [見出し2]
...

## まとめ
- ポイント1
- ポイント2
- ポイント3
```

**画像指示:**
- 本文の理解を助ける箇所に `[IMAGE: 説明]` を挿入する（1〜3箇所）
- 説明は「○○のフロー図」「○○と○○の比較図」など具体的に

**points が指定された場合:**
- 指定されたポイントを記事内で意識して盛り込む

### Step 4: 生成した記事を JSON に変換する

以下の形式で `/tmp/draft-article.json` に保存する。

```json
{
  "title": "記事タイトル",
  "category": "導入ヒント",
  "sourceUrl": "https://...",
  "blocks": [
    { "type": "paragraph", "text": "リード文..." },
    { "type": "heading_2", "text": "見出し1" },
    { "type": "paragraph", "text": "本文..." },
    { "type": "image_placeholder", "text": "[IMAGE: ○○のイメージ図]" },
    { "type": "heading_2", "text": "まとめ" },
    { "type": "bulleted_list_item", "text": "ポイント1" },
    { "type": "bulleted_list_item", "text": "ポイント2" },
    { "type": "bulleted_list_item", "text": "ポイント3" }
  ]
}
```

ブロック種別:
- `paragraph`: 通常の文章
- `heading_2`: 大見出し（##）
- `heading_3`: 小見出し（###）
- `bulleted_list_item`: 箇条書き
- `numbered_list_item`: 番号付きリスト
- `image_placeholder`: 画像挿入指示（`[IMAGE: 説明]`）
- `quote`: 引用
- `divider`: 区切り線

### Step 5: Notion に下書きページを作成する

```bash
node scripts/create-notion-draft.js /tmp/draft-article.json
```

を実行する。

### Step 6: 完了を報告する

- Notion の下書きページ URL を表示する
- ユーザーが Notion で行うべき作業を案内する：
  1. 本文の確認・修正
  2. スラッグの入力（例: `ai-chatgpt-introduction`）
  3. 概要文の入力（50〜80字）
  4. アイキャッチ画像の作成・添付
  5. `[IMAGE: 説明]` を参考に画像を手動で作成・挿入
  6. ステータスを「公開」に変更してサイトに反映
